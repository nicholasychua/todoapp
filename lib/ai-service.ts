export interface ProcessedTask {
  taskName: string;
  description: string;
  date: string | null;
  time: string | null;
  tags: string[];
}

export interface CategorizationResult {
  suggestedCategory: string;
  confidence: string;
}

/**
 * Process natural-language task text typed by the user (not spoken).
 *
 * This is intentionally lightweight and *does not* call the voice
 * processing API. It uses the same robust fallback parsing logic that
 * voice input falls back to, but runs entirely on the client for
 * stability and performance.
 */
export async function processTextInput(
  rawInput: string
): Promise<ProcessedTask> {
  return getFallbackVoiceProcessing(rawInput);
}

export async function processVoiceInput(rawInput: string): Promise<ProcessedTask> {
  try {
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('Voice processing request timeout, aborting...');
      controller.abort();
    }, 5000); // 5 second timeout
    
    const requestBody = { rawInput };
    
    const response = await fetch('/api/ai/process-voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error processing voice input. Status:', response.status, 'Body:', errorBody);
      
      // If the AI service is not configured or returns error, provide a fallback
      console.warn('AI voice processing service not available, using fallback');
      return getFallbackVoiceProcessing(rawInput);
    }

    const result = await response.json();
    return result as ProcessedTask;
  } catch (error) {
    console.error('Error in processVoiceInput:', error);
    
    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Voice processing request timed out, using fallback');
    } else if (error instanceof Error && error.message === 'Failed to fetch') {
      console.warn('Network error during voice processing, using fallback');
    } else if (error instanceof Error && error.message.includes('NetworkError')) {
      console.warn('Network error during voice processing, using fallback');
    }
    
    // If there's a network error or other issue, use fallback
    console.warn('Using fallback voice processing due to error');
    return getFallbackVoiceProcessing(rawInput);
  }
}

export async function categorizeTask(
  taskText: string, 
  categories: string[],
  userId: string
): Promise<CategorizationResult> {
  try {
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('Categorization request timeout, aborting...');
      controller.abort();
    }, 5000); // 5 second timeout

    const requestBody = { 
      taskText, 
      categories,
      userId
    };

    const response = await fetch('/api/ai/categorize-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error categorizing task. Status:', response.status, 'Body:', errorBody);
      
      // If the AI service is not configured or fails, provide a fallback
      console.warn('AI categorization service not available, using fallback');
      return getFallbackCategorization(taskText, categories);
    }

    const result = await response.json();
    return result as CategorizationResult;
  } catch (error) {
    console.error('Error in categorizeTask:', error);
    
    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Categorization request timed out, using fallback');
    } else if (error instanceof Error && error.message === 'Failed to fetch') {
      console.warn('Network error during categorization, using fallback');
    } else if (error instanceof Error && error.message.includes('NetworkError')) {
      console.warn('Network error during categorization, using fallback');
    }
    
    // If there's a network error or other issue, use fallback
    console.warn('Using fallback categorization due to error');
    return getFallbackCategorization(taskText, categories);
  }
}

// Fallback voice processing function
function getFallbackVoiceProcessing(rawInput: string): ProcessedTask {
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
}

// Simplified fallback categorization function that uses basic reasoning
function getFallbackCategorization(
  taskText: string, 
  categories: string[]
): CategorizationResult {
  
  const lowerTaskText = taskText.toLowerCase();
  
  // Simple category name matching + basic semantic hints
  let bestMatch = categories[0] || 'Uncategorized';
  let bestScore = 0;
  
  // Basic semantic hints for common category types (minimal keyword matching)
  const categoryHints: Record<string, string[]> = {
    'school': ['homework', 'study', 'class', 'exam', 'assignment', 'lecture'],
    'work': ['meeting', 'project', 'interview', 'deadline', 'client'],
    'career': ['interview', 'resume', 'job', 'application', 'networking'],
    'coffee': ['coffee', 'meet', 'chat', 'catch up'],
    'errands': ['buy', 'pick', 'drop', 'get', 'groceries'],
    'events': ['attend', 'concert', 'show', 'ticket', 'festival'],
    'personal': ['family', 'birthday', 'call', 'text', 'mom', 'dad']
  };
  
  for (const category of categories) {
    const lowerCategory = category.toLowerCase();
    let score = 0;
    
    // Direct category name match
    if (lowerTaskText.includes(lowerCategory)) {
      score += 20;
    }
    
    // Check semantic hints
    for (const [key, hints] of Object.entries(categoryHints)) {
      if (lowerCategory.includes(key)) {
        for (const hint of hints) {
          if (lowerTaskText.includes(hint)) {
            score += 5;
          }
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }
  
  // Find uncategorized category if exists
  const uncategorizedCategory = categories.find(c => 
    /uncategorized|general|misc|inbox|backlog/i.test(c)
  );
  
  // Use uncategorized if score is too low
  if (bestScore < 10 && uncategorizedCategory) {
    return {
      suggestedCategory: uncategorizedCategory,
      confidence: "low"
    };
  }
  
  // Determine confidence
  let confidence: "low" | "medium" | "high" = "low";
  if (bestScore >= 20) {
    confidence = "high";
  } else if (bestScore >= 10) {
    confidence = "medium";
  }
  
  return {
    suggestedCategory: bestMatch,
    confidence
  };
} 