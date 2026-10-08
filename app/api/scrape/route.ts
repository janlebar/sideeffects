import * as cheerio from "cheerio"; // For parsing HTML
import { NextRequest, NextResponse } from "next/server";
import { chromium, type Browser } from "playwright";

// Playwright launches a real browser process, so this handler must run on Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reuse a single browser instance across requests instead of launching one per
// request (launching Chrome is the slow part).
let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        // Use the full Chromium build in "new" headless mode. The default
        // headless *shell* is easily fingerprinted by Akamai and gets a 403.
        channel: "chromium",
        headless: true,
      })
      .catch((err) => {
        // Reset so the next request retries instead of reusing a rejected promise.
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

// drugs.com is behind Akamai, which blocks non-browser HTTP clients (plain
// axios/curl get a 403). A real headless browser passes and returns the page.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

async function fetchHtml(url: string): Promise<string> {
  const browser = await getBrowser();
  const page = await browser.newPage({
    userAgent: USER_AGENT,
    // Limit what the page can load; we only need the HTML.
    javaScriptEnabled: true,
  });

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    if (!response) {
      throw new Error("No response from upstream");
    }
    if (!response.ok()) {
      throw new Error(`Upstream returned ${response.status()}`);
    }

    return await page.content();
  } finally {
    await page.close().catch(() => {});
  }
}

// Export the handler for the GET method
export async function GET(req: NextRequest) {
  // Extract the URL parameter using URLSearchParams
  const url = new URL(req.url).searchParams.get("url");

  if (!url) {
    // If no URL is provided in the query parameters
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  // Only allow drugs.com URLs (prevents this route from being used as an SSRF proxy).
  try {
    const parsed = new URL(url);
    if (!/(^|\.)drugs\.com$/i.test(parsed.hostname)) {
      return NextResponse.json(
        { error: "Only drugs.com URLs are allowed" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    // Fetch the rendered HTML through a headless browser (Akamai blocks plain HTTP clients).
    const html = await fetchHtml(url);
    const $ = cheerio.load(html); // Parse the HTML data using cheerio

    // Selecting the h3 elements that contain side effect information
    const allTitles = $("#professional-info").nextAll("h3").get();

    // This will hold the results (side effects categorized by occurrence rates)
    const results = [];

    // Regex to match side effect categories and occurrence rates
    const regex =
      /(Rare|Common|Uncommon)\s\((\d+(?:\.\d+)?)%\s(to)\s(\d+(?:\.\d+)?)%\):\s(.+)/;

    let categoryId = 1; // Initialize a counter for categorizing the side effects

    // Iterate over each title (h3) element to extract side effect data
    for (const h3 of allTitles) {
      // Look for content following the h3 element until the next h3
      for (const content of $(h3).nextUntil("h3").get()) {
        const matches = $(content).text().match(regex); // Try to match the side effects pattern
        if (!matches) continue; // If no match, skip this content

        // Add matched data to results
        results.push({
          categoryId: categoryId.toString(), // Assign category id
          category: $(h3).text(), // Category title (e.g., "Common", "Rare")
          occurrence: matches[4], // Occurrence percentage (from the regex)
          symptoms: matches[5].split(", "), // Split symptoms by commas
        });

        categoryId++; // Increment the category id for the next batch
      }
    }

    // Return the scraped data as a JSON response
    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    // Handle errors by sending a 500 status with the error message
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
