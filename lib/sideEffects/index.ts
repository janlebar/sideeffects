import { parseSideEffects, type SideEffectCategory } from "./parse";
import { getStoredSideEffects } from "./db";
import { scrapeSideEffectsText, UpstreamNotFoundError } from "./scrape";

export type SideEffectSource = "database" | "scraped" | "none";

export interface SideEffectsResult {
  medicine: string;
  source: SideEffectSource;
  categories: SideEffectCategory[];
}

/**
 * Look up side effects for a medicine: use the read-only SQLite snapshot when
 * available, otherwise scrape drugs.com live.
 */
export async function getSideEffects(
  medicine: string
): Promise<SideEffectsResult> {
  const stored = await getStoredSideEffects(medicine);
  if (stored) {
    const categories = parseSideEffects(stored);
    if (categories.length > 0) {
      return { medicine, source: "database", categories };
    }
  }

  try {
    const scraped = await scrapeSideEffectsText(medicine);
    const categories = parseSideEffects(scraped);
    return {
      medicine,
      source: categories.length > 0 ? "scraped" : "none",
      categories,
    };
  } catch (error) {
    if (error instanceof UpstreamNotFoundError) {
      return { medicine, source: "none", categories: [] };
    }
    throw error;
  }
}

export { parseSideEffects } from "./parse";
export type { SideEffectCategory, SideEffectEntry } from "./parse";
export { extractSideEffectsText, scrapeSideEffectsText } from "./scrape";
