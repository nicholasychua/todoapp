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
    console.log('Starting voice processing for:', rawInput);
    
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('Voice processing request timeout, aborting...');
      controller.abort();
    }, 5000); // 5 second timeout
    
    const requestBody = { rawInput };
    console.log('Making voice processing request with body:', requestBody);
    
    const response = await fetch('/api/ai/process-voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Voice processing response received:', response.status, response.ok);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error processing voice input. Status:', response.status, 'Body:', errorBody);
      
      // If the AI service is not configured or returns error, provide a fallback
      console.warn('AI voice processing service not available, using fallback');
      return getFallbackVoiceProcessing(rawInput);
    }

    const result = await response.json();
    console.log('Voice processing result:', result);
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
    console.log('Starting categorization for:', taskText);
    
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
    
    console.log('Making categorization request with body:', requestBody);

    const response = await fetch('/api/ai/categorize-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('Categorization response received:', response.status, response.ok);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error categorizing task. Status:', response.status, 'Body:', errorBody);
      
      // If the AI service is not configured or fails, provide a fallback
      console.warn('AI categorization service not available, using fallback');
      return getFallbackCategorization(taskText, categories);
    }

    const result = await response.json();
    console.log('Categorization result:', result);
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
}

// Simplified fallback categorization function that uses basic reasoning
function getFallbackCategorization(
  taskText: string, 
  categories: string[]
): CategorizationResult {
  console.log('Using simple fallback categorization for:', taskText, 'with categories:', categories);
  
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
    console.log('Fallback: Low score, using Uncategorized');
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
  
  console.log('Fallback result:', { suggestedCategory: bestMatch, confidence, score: bestScore });
  
  return {
    suggestedCategory: bestMatch,
    confidence
  };
} 