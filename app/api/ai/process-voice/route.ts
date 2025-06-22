import { AzureOpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client with Azure configuration
const openai = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  apiVersion: "2024-03-01-preview",
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
});

// Helper function to get current date in Pacific Time
function getCurrentDateInPST(): string {
  const now = new Date();
  
  // Get the timezone offset for Pacific Time
  // Pacific Time is UTC-8 (PST) or UTC-7 (PDT)
  const pstOffset = -8 * 60; // PST offset in minutes
  const pdtOffset = -7 * 60; // PDT offset in minutes
  
  // Check if we're in daylight saving time (PDT)
  // DST starts second Sunday in March and ends first Sunday in November
  const year = now.getUTCFullYear();
  const march = new Date(Date.UTC(year, 2, 1)); // March 1st
  const november = new Date(Date.UTC(year, 10, 1)); // November 1st
  
  // Find second Sunday in March
  const secondSundayMarch = new Date(march);
  secondSundayMarch.setUTCDate(8 + (7 - march.getUTCDay()) % 7);
  
  // Find first Sunday in November
  const firstSundayNovember = new Date(november);
  firstSundayNovember.setUTCDate(1 + (7 - november.getUTCDay()) % 7);
  
  const isDST = now >= secondSundayMarch && now < firstSundayNovember;
  const offset = isDST ? pdtOffset : pstOffset;
  
  // Apply the offset to get Pacific Time
  const pstTime = new Date(now.getTime() + (offset * 60 * 1000));
  
  return pstTime.toISOString().split('T')[0];
}

export async function POST(request: Request) {
  try {
    const { rawInput } = await request.json();

    if (!rawInput) {
      return NextResponse.json(
        { error: "No input provided" },
        { status: 400 }
      );
    }

    // Get current date in Pacific Time
    const today = getCurrentDateInPST();

    console.log("Attempting to process voice input:", rawInput);
    console.log("Current date in PST:", today);
    console.log(
      "Using model:",
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4"
    );

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a task processing assistant. Extract task information from the user's voice input.
          The current date is ${today} in Pacific Time (PT).
          Return a JSON object with the following structure:
          {
            "taskName": "Main task name",
            "description": "Detailed description",
            "date": "YYYY-MM-DD or null if no date mentioned",
            "time": "HH:MM in 24-hour format or null if no time mentioned",
            "tags": ["array", "of", "relevant", "tags"]
          }
          
          Rules:
          - Use the current date (${today}) in Pacific Time to resolve relative dates like "tomorrow".
          - If a date is mentioned, convert it to YYYY-MM-DD format.
          - If a time is mentioned, convert it to HH:MM (24-hour) format.
          - Extract any hashtags as tags.
          - Keep the taskName concise but descriptive.
          - Include any additional context in the description.
          - If no date is mentioned, set date to null.
          - If no time is mentioned, set time to null.`,
        },
        {
          role: "user",
          content: rawInput,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing voice input:", error);
    return NextResponse.json(
      { error: "Failed to process voice input" },
      { status: 500 }
    );
  }
} 