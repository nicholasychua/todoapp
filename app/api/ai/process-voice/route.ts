import { NextResponse } from "next/server";

// Fallback voice processing function
const fallbackProcessVoiceInput = (rawInput: string) => {
  const input = rawInput.trim();
  
  // Extract hashtags
  const tagMatches = input.match(/#(\w+)/g) || [];
  const tags = tagMatches.map(tag => tag.substring(1));
  
  // Remove hashtags from the main text
  const cleanText = input.replace(/#\w+/g, '').trim();
  
  // Simple date/time extraction
  let date: string | null = null;
  let time: string | null = null;
  const lowerInput = input.toLowerCase();
  
  // Natural language time expressions (basic fallback)
  const naturalTimes: Record<string, string> = {
    'noon': '12:00',
    'midnight': '00:00',
    'morning': '09:00',
    'afternoon': '14:00',
    'evening': '18:00',
    'night': '20:00'
  };
  
  // Check for natural language times first
  for (const [word, timeValue] of Object.entries(naturalTimes)) {
    if (lowerInput.includes(word)) {
      time = timeValue;
      break;
    }
  }
  
  // If no natural time found, check for standard time patterns (12pm, 3:30am, etc.)
  if (!time) {
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] || '00';
      const ampm = timeMatch[3]?.toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }
  
  // Enhanced date parsing
  const today = new Date();
  
  // Parse "tomorrow" or "tmr"
  if (lowerInput.includes('tomorrow') || lowerInput.includes('tmr')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
  } 
  // Parse "today"
  else if (lowerInput.includes('today')) {
    date = today.toISOString().split('T')[0];
  } 
  // Parse day names (Monday, Tuesday, etc.)
  else {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayAbbreviations: Record<string, string> = {
      'sun': 'sunday',
      'mon': 'monday',
      'tue': 'tuesday',
      'tues': 'tuesday',
      'wed': 'wednesday',
      'thu': 'thursday',
      'thur': 'thursday',
      'thurs': 'thursday',
      'fri': 'friday',
      'sat': 'saturday'
    };
    
    // Check for "next" + day name (e.g., "next Friday")
    const nextDayMatch = lowerInput.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)/i);
    if (nextDayMatch) {
      let targetDayName = nextDayMatch[1].toLowerCase();
      // Convert abbreviation to full name
      targetDayName = dayAbbreviations[targetDayName] || targetDayName;
      const targetDay = dayNames.indexOf(targetDayName);
      if (targetDay !== -1) {
        const resultDate = new Date(today);
        const currentDay = resultDate.getDay();
        let daysToAdd = targetDay - currentDay;
        // "next" means the following week, so add 7 days
        if (daysToAdd <= 0) {
          daysToAdd += 7;
        }
        daysToAdd += 7; // Add another week for "next"
        resultDate.setDate(resultDate.getDate() + daysToAdd);
        date = resultDate.toISOString().split('T')[0];
      }
    } 
    // Check for day name (e.g., "Friday", "on Friday", "by Friday")
    else {
      for (const dayName of dayNames) {
        const dayRegex = new RegExp(`\\b(on|by|this)?\\s*${dayName}\\b`, 'i');
        if (dayRegex.test(lowerInput)) {
          const targetDay = dayNames.indexOf(dayName);
          const resultDate = new Date(today);
          const currentDay = resultDate.getDay();
          let daysToAdd = targetDay - currentDay;
          // If the day has passed this week, go to next week
          if (daysToAdd <= 0) {
            daysToAdd += 7;
          }
          resultDate.setDate(resultDate.getDate() + daysToAdd);
          date = resultDate.toISOString().split('T')[0];
          break;
        }
      }
      
      // Check abbreviations too
      if (!date) {
        for (const [abbr, fullName] of Object.entries(dayAbbreviations)) {
          const abbrRegex = new RegExp(`\\b(on|by|this)?\\s*${abbr}\\b`, 'i');
          if (abbrRegex.test(lowerInput)) {
            const targetDay = dayNames.indexOf(fullName);
            const resultDate = new Date(today);
            const currentDay = resultDate.getDay();
            let daysToAdd = targetDay - currentDay;
            // If the day has passed this week, go to next week
            if (daysToAdd <= 0) {
              daysToAdd += 7;
            }
            resultDate.setDate(resultDate.getDate() + daysToAdd);
            date = resultDate.toISOString().split('T')[0];
            break;
          }
        }
      }
    }
  }
  
  // Remove temporal information from task name
  let taskNameClean = cleanText;
  
  // Remove time patterns with prepositions (e.g., "at 8pm", "by 5pm", "around noon")
  taskNameClean = taskNameClean.replace(/\s+(at|by|around|@)\s+\d{1,2}(:\d{2})?\s*(am|pm)/gi, '');
  taskNameClean = taskNameClean.replace(/\s+(at|by|around|@)\s+(noon|midnight|morning|afternoon|evening|night)/gi, '');
  
  // Remove standalone time patterns (e.g., "3pm", "8:30am") at the end or with light context
  taskNameClean = taskNameClean.replace(/\s+\d{1,2}(:\d{2})?\s*(am|pm)\b/gi, '');
  taskNameClean = taskNameClean.replace(/\s+(noon|midnight|morning|afternoon|evening|night)\b/gi, '');
  
  // Remove date patterns (e.g., "tomorrow", "today", "on Friday", "next Monday")
  taskNameClean = taskNameClean.replace(/\s+(on|by|this|next)?\s*(tomorrow|tmr|today)/gi, '');
  taskNameClean = taskNameClean.replace(/\s+(on|by|this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/gi, '');
  taskNameClean = taskNameClean.replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
  
  // Remove common temporal prepositions that might be left over
  taskNameClean = taskNameClean.replace(/\s+(at|by|on|around|@)\s*$/gi, '');
  
  // Clean up extra spaces
  taskNameClean = taskNameClean.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter of task name
  const capitalizedTaskName = taskNameClean.length > 0 
    ? taskNameClean.charAt(0).toUpperCase() + taskNameClean.slice(1)
    : taskNameClean;
  
  return {
    taskName: capitalizedTaskName.length > 50 ? capitalizedTaskName.substring(0, 50) + '...' : capitalizedTaskName,
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

    try {
      const openai = new AzureOpenAI({
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        apiVersion: "2024-03-01-preview",
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
        timeout: 5000, // 5 second timeout
      });

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI request timeout')), 5000);
      });

      // Race between the API call and timeout
      const response = await Promise.race([
        openai.chat.completions.create({
          model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an intelligent task processing assistant. Extract task information from natural language input.

Current date: ${today} (Pacific Time)

Return JSON:
{
  "taskName": "Main task name",
  "description": "Detailed description", 
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM in 24-hour format or null",
  "tags": ["hashtags", "only"]
}

Date Intelligence:
- Understand relative dates: "tomorrow", "today", "next Monday", "Friday", etc.
- Understand date formats: "11/25", "Nov 25", "November 25th"
- Calculate from current date (${today})

Time Intelligence:
- Understand natural language times:
  * "noon" = "12:00"
  * "midnight" = "00:00"
  * "morning" = "09:00"
  * "afternoon" = "14:00"
  * "evening" = "18:00"
  * "night" = "20:00"
- Convert 12-hour to 24-hour: "2pm" = "14:00", "9am" = "09:00"
- Handle variations: "2:30pm", "two thirty", "half past two"
- If time is ambiguous or unclear, set to null

Tags:
- ONLY extract words with # prefix (e.g., #work, #personal)
- Do NOT create or suggest tags
- Empty array if no hashtags present

Task Name:
- Concise, descriptive, properly capitalized
- **IMPORTANT**: Remove ALL date/time/temporal information from the task name
- Extract the core action, not the timing
- Examples:
  * "call mom at 8pm" → taskName: "Call mom", time: "20:00"
  * "meeting tomorrow at 3pm" → taskName: "Meeting", date: [tomorrow's date], time: "15:00"
  * "buy groceries on Friday" → taskName: "Buy groceries", date: [Friday's date]
  * "submit report by Monday morning" → taskName: "Submit report", date: [Monday's date], time: "09:00"

If date/time unclear or not mentioned: set to null`,
            },
            {
              role: "user",
              content: rawInput,
            },
          ],
          response_format: { type: "json_object" },
        }),
        timeoutPromise
      ]);

      const content = response.choices[0].message.content;
      if (!content) {
        console.warn("Empty response from AI, using fallback");
        const fallbackResult = fallbackProcessVoiceInput(rawInput);
        return NextResponse.json(fallbackResult);
      }

      try {
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
    } catch (aiError) {
      // Handle any OpenAI errors (including timeout and network errors)
      console.warn("OpenAI API error, using fallback:", aiError);
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