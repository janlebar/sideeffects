import * as cheerio from "cheerio"; // For parsing HTML
import axios from "axios"; // To make HTTP requests
import { NextRequest, NextResponse } from "next/server"; // Use the new NextRequest and NextResponse from next/server
import { URL } from "url"; // Node.js URL module

// Export the handler for the GET method
export async function GET(req: NextRequest) {
  // Extract the URL parameter using URLSearchParams
  const url = new URL(req.url).searchParams.get("url");

  if (!url) {
    // If no URL is provided in the query parameters
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    // Fetch the HTML from the given URL using axios
    const { data } = await axios.get(url);
    const $ = cheerio.load(data); // Parse the HTML data using cheerio

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
