import { NextResponse } from "next/server";

// Fallback voice processing function
const fallbackProcessVoiceInput = (rawInput: string) => {
  console.log('Using built-in fallback voice processing for:', rawInput);
  
  const input = rawInput.trim();
  
  // Extract hashtags
  const tagMatches = input.match(/#(\w+)/g) || [];
  const tags = tagMatches.map(tag => tag.substring(1));
  
  // Remove hashtags from the main text
  const cleanText = input.replace(/#\w+/g, '').trim();
  
  // Simple date/time extraction
  let date: string | null = null;
  let time: string | null = null;
  
  // Check for common time patterns
  const timeMatch = input.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    time = `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Check for date patterns
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (input.toLowerCase().includes('tomorrow')) {
    date = tomorrow.toISOString().split('T')[0];
  } else if (input.toLowerCase().includes('today')) {
    date = today.toISOString().split('T')[0];
  }
  
  return {
    taskName: cleanText.length > 50 ? cleanText.substring(0, 50) + '...' : cleanText,
    description: cleanText,
    date,
    time,
    tags
  };
};

// Check if required environment variables are set
const isAIConfigured = () => {
  return process.env.AZURE_OPENAI_ENDPOINT && 
         process.env.AZURE_OPENAI_API_KEY && 
         process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
};

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

export async function GET() {
  return NextResponse.json({ message: "Process voice API is working" });
}

export async function POST(request: Request) {
  try {
    let rawInput: string;
    
    try {
      const body = await request.json();
      rawInput = body.rawInput;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!rawInput) {
      return NextResponse.json(
        { error: "No input provided" },
        { status: 400 }
      );
    }

    // Check if AI is properly configured - use fallback if not
    if (!isAIConfigured()) {
      console.warn("Azure OpenAI not configured - using fallback voice processing");
      const fallbackResult = fallbackProcessVoiceInput(rawInput);
      return NextResponse.json(fallbackResult);
    }

    // Get current date in Pacific Time
    const today = getCurrentDateInPST();

    console.log("Attempting to process voice input:", rawInput);
    console.log("Current date in PST:", today);
    console.log(
      "Using model:",
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4"
    );

    // Dynamically import OpenAI to avoid bundling issues
    let AzureOpenAI;
    try {
      const openaiModule = await import("openai");
      AzureOpenAI = openaiModule.AzureOpenAI;
    } catch (importError) {
      console.error("Failed to import OpenAI:", importError);
      const fallbackResult = fallbackProcessVoiceInput(rawInput);
      return NextResponse.json(fallbackResult);
    }

    const openai = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      apiVersion: "2024-03-01-preview",
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    });

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
      console.warn("Empty response from AI, using fallback");
      const fallbackResult = fallbackProcessVoiceInput(rawInput);
      return NextResponse.json(fallbackResult);
    }

    try {
      console.log("AI Response content:", content);
      const result = JSON.parse(content);
      
      // Validate the result structure
      if (!result.taskName || typeof result.taskName !== 'string') {
        console.warn("Invalid AI response structure, using fallback");
        const fallbackResult = fallbackProcessVoiceInput(rawInput);
        return NextResponse.json(fallbackResult);
      }
      
      return NextResponse.json(result);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content that failed to parse:", content);
      const fallbackResult = fallbackProcessVoiceInput(rawInput);
      return NextResponse.json(fallbackResult);
    }
  } catch (error) {
    console.error("Error processing voice input:", error);
    
    // Return a generic error response since we can't reliably get the input again
    return NextResponse.json(
      { error: "Failed to process voice input" },
      { status: 500 }
    );
  }
} 