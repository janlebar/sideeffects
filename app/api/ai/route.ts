import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ API key is missing");
      return NextResponse.json({ error: "API key not found" }, { status: 500 });
    }

    // Extract user medicinename
    const body = await req.json();
    const { medicinename } = body;

    if (!medicinename) {
      console.error("❌ Missing medicinename");
      return NextResponse.json(
        { error: "Missing medicinename" },
        { status: 400 }
      );
    }

    console.log("✅ Received medicinename:", medicinename);

    // Define API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Send request to Gemini API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `What side effects could be problematic using these medicines ${medicinename} at the same time?`,
              },
            ],
          },
        ],
      }),
    });

    // Read the response text
    const responseText = await response.text();
    console.log("🟢 Raw API Response:", responseText); // Debugging

    // Check for API errors
    if (!response.ok) {
      console.error(
        `❌ API Error: ${response.status} - ${response.statusText}`
      );
      return NextResponse.json(
        { error: `API Error: ${response.status}` },
        { status: 500 }
      );
    }

    if (!responseText) {
      console.error("❌ Empty response from API");
      return NextResponse.json(
        { error: "Empty response from API" },
        { status: 500 }
      );
    }

    // Parse API response
    const data = JSON.parse(responseText);
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
