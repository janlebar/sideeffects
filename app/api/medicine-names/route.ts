import { NextResponse } from "next/server";
import { getMedicineNames } from "@/lib/sideEffects/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/medicine-names -> { names: string[] }
export async function GET() {
  try {
    const names = await getMedicineNames();
    return NextResponse.json({ names });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
