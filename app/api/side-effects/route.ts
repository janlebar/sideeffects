import { NextRequest, NextResponse } from "next/server";
import { getSideEffects } from "@/lib/sideEffects";

// Uses sql.js (WASM) and Playwright, so this must run on Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/side-effects?medicine=aspirin
export async function GET(req: NextRequest) {
  const medicine = new URL(req.url).searchParams.get("medicine")?.trim();

  if (!medicine) {
    return NextResponse.json(
      { error: "Missing 'medicine' query parameter" },
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
