import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST /api/interactions  { medicines: string[] } -> { response: string }
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const medicines: unknown = body?.medicines;
    if (!Array.isArray(medicines) || medicines.length < 2) {
      return NextResponse.json(
        { error: "Select at least 2 medications" },
        { status: 400 }
      );
    }

    const list = medicines.map((m) => String(m)).join(", ");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt =
      `You are a pharmacology assistant. List the clinically significant drug ` +
      `interactions between: ${list}. For each interaction, briefly state the ` +
      `mechanism, the potential risk, and a practical recommendation. Use a ` +
      `short bulleted format. End with a one-line disclaimer that this is ` +
      `informational only and not a substitute for professional medical advice.`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `API Error: ${response.status}` },
        { status: 500 }
      );
    }
    if (!responseText) {
      return NextResponse.json(
        { error: "Empty response from API" },
        { status: 500 }
      );
    }

    const data = JSON.parse(responseText);
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No interaction information found.";

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
