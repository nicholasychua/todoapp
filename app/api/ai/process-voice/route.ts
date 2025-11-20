import { NextResponse } from "next/server";

// Helper function to parse a single task
const parseSingleTask = (text: string, globalTags: string[] = []) => {
  // Extract hashtags specific to this task
  const tagMatches = text.match(/#(\w+)/g) || [];
  const tags = [...new Set([...tagMatches.map(tag => tag.substring(1)), ...globalTags])];
  
  // Remove hashtags from the main text
  const cleanText = text.replace(/#\w+/g, '').trim();
  
  // Simple date/time extraction
  let date: string | null = null;
  let time: string | null = null;
  const lowerInput = text.toLowerCase();
  
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
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] || '00';
      const ampm = timeMatch[3]?.toLowerCase();
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }
  
  // Enhanced date parsing - use local time to avoid timezone issues
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Helper to format date as YYYY-MM-DD in local time
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Parse "tomorrow" or "tmr"
  if (lowerInput.includes('tomorrow') || lowerInput.includes('tmr')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = formatLocalDate(tomorrow);
  } 
  // Parse "today"
  else if (lowerInput.includes('today')) {
    date = formatLocalDate(today);
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
        date = formatLocalDate(resultDate);
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
          date = formatLocalDate(resultDate);
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
            date = formatLocalDate(resultDate);
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

// Fallback voice processing function - supports multiple tasks
const fallbackProcessVoiceInput = (rawInput: string) => {
  const input = rawInput.trim();
  
  // Extract global hashtags (tags that apply to all tasks)
  const tagMatches = input.match(/#(\w+)/g) || [];
  const globalTags = tagMatches.map(tag => tag.substring(1));
  
  // Try to detect multiple tasks using common separators
  const separators = [
    /\s+and\s+(?:I\s+)?(?:have\s+|need\s+to\s+)?/gi, // "and I have", "and I need to", "and"
    /\s+then\s+/gi, // "then"
    /\s*,\s*(?:and\s+)?(?:I\s+)?(?:have\s+|need\s+to\s+)?/gi, // ", and", ", and I have"
    /\s*;\s*/gi, // semicolon
  ];
  
  // Split input into potential tasks
  let taskStrings: string[] = [input];
  
  for (const separator of separators) {
    const newTaskStrings: string[] = [];
    for (const taskStr of taskStrings) {
      const parts = taskStr.split(separator);
      newTaskStrings.push(...parts);
    }
    taskStrings = newTaskStrings;
  }
  
  // Filter out empty strings and process each task
  const tasks = taskStrings
    .map(str => str.trim())
    .filter(str => str.length > 0)
    .filter(str => {
      // Filter out strings that are too short to be meaningful tasks
      // But keep them if they have time/date info
      const hasDateTime = /\d{1,2}\s*(am|pm|:)/i.test(str) || 
                          /(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(str);
      return str.length > 5 || hasDateTime;
    })
    .map(taskStr => parseSingleTask(taskStr, globalTags));
  
  // If we couldn't split into multiple tasks, just return the single parsed task
  if (tasks.length === 0) {
    tasks.push(parseSingleTask(input, globalTags));
  }
  
  return tasks;
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
      return NextResponse.json({ tasks: fallbackResult });
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
      return NextResponse.json({ tasks: fallbackResult });
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

**IMPORTANT**: The user may describe MULTIPLE tasks in one input. Detect and extract ALL tasks mentioned.

Return JSON with a "tasks" array:
{
  "tasks": [
    {
      "taskName": "Main task name",
      "description": "Detailed description", 
      "date": "YYYY-MM-DD or null",
      "time": "HH:MM in 24-hour format or null",
      "tags": ["hashtags", "only"]
    }
  ]
}

Multiple Tasks Detection:
- Look for separators: "and", "then", "also", commas, semicolons
- Examples:
  * "Zed concert at 4pm tomorrow and Noc2 concert at 6pm Friday" → 2 tasks
  * "Buy milk, pick up kids, call dentist" → 3 tasks
  * "Meeting at 2pm then coffee at 4pm" → 2 tasks
- Each task should have its own entry in the "tasks" array
- If only ONE task is mentioned, return array with ONE task

Date Intelligence:
- Understand relative dates: "tomorrow", "today", "next Monday", "Friday", etc.
- Understand date formats: "11/25", "Nov 25", "November 25th"
- Calculate from current date (${today})
- Handle different dates for different tasks

Time Intelligence:
- Understand natural language times:
  * "noon" = "12:00"
  * "midnight" = "00:00"
  * "morning" = "09:00"
  * "afternoon" = "14:00"
  * "evening" = "18:00"
  * "night" = "20:00"
- Convert 12-hour to 24-hour: "2pm" = "14:00", "9am" = "09:00", "4 p.m" = "16:00"
- Handle variations: "2:30pm", "two thirty", "half past two"
- If time is ambiguous or unclear, set to null

Tags:
- ONLY extract words with # prefix (e.g., #work, #personal)
- Do NOT create or suggest tags
- Empty array if no hashtags present
- Tags can be global (apply to all tasks) or task-specific

Task Name:
- Concise, descriptive, properly capitalized
- **IMPORTANT**: Remove ALL date/time/temporal information from the task name
- Extract the core action, not the timing
- Examples:
  * "Zed concert at 4pm tomorrow" → taskName: "Zed concert", date: [tomorrow], time: "16:00"
  * "meeting at 3pm" → taskName: "Meeting", time: "15:00"
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
        return NextResponse.json({ tasks: fallbackResult });
      }

      try {
        const result = JSON.parse(content);
        
        // Validate the result structure
        if (!result.tasks || !Array.isArray(result.tasks) || result.tasks.length === 0) {
          console.warn("Invalid AI response structure (expected tasks array), using fallback");
          const fallbackResult = fallbackProcessVoiceInput(rawInput);
          return NextResponse.json({ tasks: fallbackResult });
        }
        
        // Validate each task has at least a taskName
        const validTasks = result.tasks.filter((task: any) => 
          task.taskName && typeof task.taskName === 'string'
        );
        
        if (validTasks.length === 0) {
          console.warn("No valid tasks in AI response, using fallback");
          const fallbackResult = fallbackProcessVoiceInput(rawInput);
          return NextResponse.json({ tasks: fallbackResult });
        }
        
        return NextResponse.json({ tasks: validTasks });
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error("Raw content that failed to parse:", content);
        const fallbackResult = fallbackProcessVoiceInput(rawInput);
        return NextResponse.json({ tasks: fallbackResult });
      }
    } catch (aiError) {
      // Handle any OpenAI errors (including timeout and network errors)
      console.warn("OpenAI API error, using fallback:", aiError);
      const fallbackResult = fallbackProcessVoiceInput(rawInput);
      return NextResponse.json({ tasks: fallbackResult });
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