// Parses the raw side-effect text stored in the scraped SQLite database
// (and the equivalent text from drugs.com) into structured data.
//
// Raw format (as stored in scrape-python/medicine.db):
//   "<Category>: <Frequency>: (<percentage>): <symptoms> | <Frequency>: ... || <Category>: ..."
// e.g.
//   "Hematologic: Common: (1% to 10%): Increased bleeding tendencies | Rare: (0.01% to 0.1%): Aplastic anemia || Renal: Frequency not reported: : Interstitial nephritis"
//
// Categories are separated by "||", frequency entries within a category by "|".
// The percentage is optional ("Frequency not reported" / "Postmarketing reports"
// have none), so entries can look like "Frequency not reported: : symptom, ...".

export interface SideEffectEntry {
  /** e.g. "Very common", "Common", "Rare", "Frequency not reported". */
  frequency: string;
  /** e.g. "1% to 10%", "10% or more", "less than 0.1%". Undefined when not reported. */
  percentage?: string;
  symptoms: string[];
}

export interface SideEffectCategory {
  category: string;
  effects: SideEffectEntry[];
}

// drugs.com repeats a "General adverse events" summary that duplicates the
// per-category sections below it. We drop it to avoid showing everything twice
// (unless it is the only category, in which case we keep it to avoid data loss).
const GENERAL_CATEGORY = /^general adverse events$/i;

function cleanPercentage(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const inner = raw.replace(/^\(/, "").replace(/\)$/, "").trim();
  return inner || undefined;
}

/** Split a symptom string on commas that are NOT inside parentheses/brackets. */
function splitSymptoms(text: string): string[] {
  // Strip trailing reference markers like "[ Ref ]".
  const cleaned = text.replace(/\[\s*Ref\s*\]/gi, " ");

  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const ch of cleaned) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);

    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);

  return parts
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);
}

function parseSegment(segment: string): SideEffectEntry | null {
  const s = segment.trim();
  if (!s) return null;

  // "Frequency: (pct): symptoms" and "Frequency: : symptoms"
  let m = s.match(/^([^:()]+?)\s*:\s*(\([^)]*\))?\s*:\s*([\s\S]*)$/);
  if (m) {
    return {
      frequency: m[1].trim(),
      percentage: cleanPercentage(m[2]),
      symptoms: splitSymptoms(m[3]),
    };
  }

  // "Frequency (pct): symptoms"
  m = s.match(/^([^:()]+?)\s*(\([^)]*\))\s*:\s*([\s\S]*)$/);
  if (m) {
    return {
      frequency: m[1].trim(),
      percentage: cleanPercentage(m[2]),
      symptoms: splitSymptoms(m[3]),
    };
  }

  // "Frequency: symptoms" (no percentage)
  m = s.match(/^([^:]+?)\s*:\s*([\s\S]*)$/);
  if (m) {
    return {
      frequency: m[1].trim(),
      percentage: undefined,
      symptoms: splitSymptoms(m[2]),
    };
  }

  // Last resort: treat the whole thing as symptoms.
  return { frequency: "Other", percentage: undefined, symptoms: splitSymptoms(s) };
}

export function parseSideEffects(
  raw: string | null | undefined
): SideEffectCategory[] {
  if (!raw) return [];

  const categories: SideEffectCategory[] = [];

  for (const chunk of raw.split(/\s*\|\|\s*/)) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;

    const category = trimmed.slice(0, sep).trim();
    if (!category) continue;

    const rest = trimmed.slice(sep + 1);
    const effects: SideEffectEntry[] = [];

    for (const segment of rest.split(/\s*\|\s*/)) {
      const entry = parseSegment(segment);
      if (entry && entry.symptoms.length > 0) effects.push(entry);
    }

    if (effects.length > 0) categories.push({ category, effects });
  }

  const withoutGeneral = categories.filter(
    (c) => !GENERAL_CATEGORY.test(c.category)
  );
  return withoutGeneral.length > 0 ? withoutGeneral : categories;
}
