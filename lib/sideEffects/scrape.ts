import * as cheerio from "cheerio";
import { chromium, type Browser } from "playwright";

// Reuse a single browser instance across requests (launching Chrome is the slow part).
let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        // Full Chromium in "new" headless mode. The default headless *shell*
        // is easily fingerprinted by drugs.com's Akamai bot protection (403).
        channel: "chromium",
        headless: true,
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

// Akamai blocks non-browser HTTP clients (plain axios/curl get a 403).
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export function medicineToSlug(medicine: string): string {
  return medicine.trim().toLowerCase().replace(/\s+/g, "-");
}

export function medicineToUrl(medicine: string): string {
  return `https://www.drugs.com/sfx/${medicineToSlug(medicine)}-side-effects.html`;
}

/** Thrown when drugs.com has no page for the medicine (HTTP 404). */
export class UpstreamNotFoundError extends Error {
  constructor(medicine: string) {
    super(`No drugs.com page found for "${medicine}"`);
    this.name = "UpstreamNotFoundError";
  }
}

/** Load the drugs.com page through a real headless browser and return its HTML. */
export async function fetchSideEffectsHtml(medicine: string): Promise<string> {
  const url = medicineToUrl(medicine);
  const browser = await getBrowser();
  const page = await browser.newPage({ userAgent: USER_AGENT });

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    if (!response) throw new Error("No response from upstream");
    if (response.status() === 404) throw new UpstreamNotFoundError(medicine);
    if (!response.ok()) throw new Error(`Upstream returned ${response.status()}`);

    return await page.content();
  } finally {
    await page.close().catch(() => {});
  }
}

/**
 * Extract the side-effect text from drugs.com HTML into the same raw format the
 * database uses: "<Category>: <Frequency>: <symptoms> | ... || <Category>: ...".
 *
 * Handles both drugs.com formats:
 *  - structured: <h3>Category</h3><ul><li><strong>Common (1% to 10%)</strong>: symptoms</li></ul>
 *  - prose:      <h3>Category</h3><p>description...</p>
 */
export function extractSideEffectsText(html: string): string {
  const $ = cheerio.load(html);
  const chunks: string[] = [];

  // Collect the <h3> headings within the professional-info section (stop at the
  // next <h2>, e.g. "Frequently asked questions").
  const start = $("#professional-info");
  const h3s: any[] = [];
  let probe = start.next();
  while (probe.length) {
    const tag = (probe.get(0)?.tagName || "").toLowerCase();
    if (tag === "h2") break;
    if (tag === "h3") h3s.push(probe.get(0));
    probe = probe.next();
  }

  for (const h3 of h3s) {
    const category = $(h3).text().replace(/\s+/g, " ").trim();
    if (!category) continue;

    // Gather the region between this heading and the next heading / reference list.
    const regionNodes: any[] = [];
    let sibling = $(h3).next();
    while (sibling.length) {
      const tag = (sibling.get(0)?.tagName || "").toLowerCase();
      if (/^h[1-6]$/.test(tag)) break;
      if (tag === "div" && /ddc-reference-list/.test(sibling.attr("class") || ""))
        break;
      regionNodes.push(sibling.get(0));
      sibling = sibling.next();
    }

    const regionNodesProc = regionNodes;
    let structuredEntries: string[] = [];
    const proseEntries: string[] = [];

    for (const node of regionNodesProc) {
      const tag = (node.tagName || "").toLowerCase();

      if (tag === "ul" || tag === "ol") {
        // Structured format: <li><strong>Frequency</strong>: symptoms</li>
        $(node)
          .find("li")
          .each((_, li) => {
            const strong = $(li).find("strong").first();
            const frequency = strong.length
              ? strong.text().replace(/\s+/g, " ").trim()
              : "";
            if (!frequency) return;

            let symptoms = $(li)
              .text()
              .replace(/\s+/g, " ")
              .replace(/\[\s*Ref\s*\]/gi, " ")
              .trim();
            symptoms = symptoms.replace(frequency, "").replace(/^:\s*/, "").trim();
            if (!symptoms) return;

            structuredEntries.push(`${frequency}: ${symptoms}`);
          });
      } else if (tag === "p") {
        // Prose format: paragraphs with no frequency markers. Label them "Reported".
        const text = $(node).text().replace(/\s+/g, " ").trim();
        if (text) proseEntries.push(`Reported: ${text}`);
      }
    }

    const entries = structuredEntries.length
      ? structuredEntries
      : proseEntries;

    if (entries.length > 0) {
      chunks.push(`${category}: ${entries.join(" | ")}`);
    }
  }

  return chunks.join(" || ");
}

/** Scrape drugs.com and return the raw side-effect text. */
export async function scrapeSideEffectsText(medicine: string): Promise<string> {
  const html = await fetchSideEffectsHtml(medicine);
  return extractSideEffectsText(html);
}
