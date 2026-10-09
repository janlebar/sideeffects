import { NextRequest, NextResponse } from "next/server";
import { getSideEffects } from "@/lib/sideEffects";

// Uses sql.js (WASM) and Playwright, so this must run on Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Back-compat endpoint. Accepts either:
 *   /api/scrape?medicine=aspirin
 *   /api/scrape?url=https://www.drugs.com/sfx/aspirin-side-effects.html
 * The canonical endpoint is now /api/side-effects.
 */
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  let medicine = params.get("medicine")?.trim() || "";
  const url = params.get("url");

  if (!medicine && url) {
    try {
      const parsed = new URL(url);
      if (!/(^|\.)drugs\.com$/i.test(parsed.hostname)) {
        return NextResponse.json(
          { error: "Only drugs.com URLs are allowed" },
          { status: 400 }
        );
      }
      const match = parsed.pathname.match(/\/sfx\/(.+)-side-effects\.html$/i);
      if (match) {
        medicine = match[1].replace(/-/g, " ");
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
  }

  if (!medicine) {
    return NextResponse.json(
      { error: "Missing 'medicine' or 'url' query parameter" },
      { status: 400 }
    );
  }

  try {
    const result = await getSideEffects(medicine);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
