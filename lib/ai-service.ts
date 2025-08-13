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

export async function processVoiceInput(rawInput: string): Promise<ProcessedTask> {
  try {
    console.log('Attempting to call AI service with input:', rawInput);
    
    const response = await fetch('/api/ai/process-voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawInput }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error processing voice input. Status:', response.status, 'Body:', errorBody);
      
      // If the AI service is not configured or returns 404/500, provide a fallback
      if (response.status === 404 || response.status === 500) {
        console.warn('AI voice processing service not available, using fallback');
        return getFallbackVoiceProcessing(rawInput);
      }
      
      throw new Error('Failed to process voice input');
    }

    const result = await response.json();
    return result as ProcessedTask;
  } catch (error) {
    console.error('Error in processVoiceInput:', error);
    
    // If there's a network error or other issue, use fallback
    console.warn('Using fallback voice processing due to error');
    return getFallbackVoiceProcessing(rawInput);
  }
}

export async function categorizeTask(taskText: string, categories: string[]): Promise<CategorizationResult> {
  try {
    const response = await fetch('/api/ai/categorize-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskText, categories }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error categorizing task. Status:', response.status, 'Body:', errorBody);
      
      // If the AI service is not configured or fails (any 404/500 error), provide a fallback
      if (response.status === 404 || response.status === 500) {
        console.warn('AI categorization service not available, using fallback');
        return getFallbackCategorization(taskText, categories);
      }
      
      throw new Error('Failed to categorize task');
    }

    const result = await response.json();
    return result as CategorizationResult;
  } catch (error) {
    console.error('Error in categorizeTask:', error);
    
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

// Fallback categorization function that uses simple keyword matching
function getFallbackCategorization(taskText: string, categories: string[]): CategorizationResult {
  console.log('Using fallback categorization for:', taskText, 'with categories:', categories);
  
  const lowerTaskText = taskText.toLowerCase();
  
  // Base keyword map for common task types (expanded per-category below)
  const keywordMap: Record<string, string[]> = {
    'work': ['work', 'job', 'office', 'meeting', 'project', 'client', 'business', 'deadline'],
    'personal': ['personal', 'family', 'home', 'house', 'life'],
    'health': ['health', 'fitness', 'exercise', 'workout', 'gym', 'diet', 'medical', 'doctor', 'appointment'],
    'shopping': ['shopping', 'buy', 'purchase', 'store', 'market', 'groceries', 'order'],
    'finance': ['finance', 'money', 'budget', 'bill', 'payment', 'bank', 'investment', 'invoice', 'tax'],
    'learning': ['learn', 'study', 'read', 'course', 'education', 'training', 'class', 'homework'],
    'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'booking', 'drive', 'commute'],
    'social': ['social', 'friend', 'party', 'event', 'dinner', 'meet', 'hangout'],
    'events': ['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'party', 'meetup', 'ticket', 'tickets', 'venue'],
    'event': ['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'party', 'meetup', 'ticket', 'tickets', 'venue'],
    'chores': ['chore', 'clean', 'laundry', 'dishes', 'organize', 'maintenance', 'repair'],
    'hobby': ['hobby', 'craft', 'art', 'music', 'game', 'fun', 'entertainment', 'movie']
  };

  const expandKeywordsForCategory = (categoryName: string): string[] => {
    const lc = categoryName.toLowerCase();
    let keywords = keywordMap[lc] || [];

    if (/(event|events|concert|show|gig|performance|festival|party|meetup|entertain|social|leisure)/.test(lc)) {
      keywords = keywords.concat(['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'party', 'meetup', 'ticket', 'tickets', 'venue']);
    }
    if (/(music)/.test(lc)) {
      keywords = keywords.concat(['music', 'concert', 'show', 'gig', 'performance']);
    }
    if (/(work|job|office|client|project|business|meeting)/.test(lc)) {
      keywords = keywords.concat(['work', 'job', 'office', 'meeting', 'project', 'client', 'business', 'deadline']);
    }
    if (/(personal|home|family|life)/.test(lc)) {
      keywords = keywords.concat(['personal', 'home', 'family']);
    }

    return Array.from(new Set(keywords));
  };
  
  // Find the best matching category
  let bestMatch = categories[0];
  let bestScore = 0;
  
  for (const category of categories) {
    const lowerCategory = category.toLowerCase();
    let score = 0;
    
    // Check direct category name match
    if (lowerTaskText.includes(lowerCategory)) {
      score += 10;
    }
    
    // Check keyword matches (expanded by category name semantics)
    const keywords = expandKeywordsForCategory(lowerCategory);
    for (const keyword of keywords) {
      if (lowerTaskText.includes(keyword)) {
        score += 5;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }
  
  // On zero score, prefer neutral buckets over "Work" to avoid misclassification
  if (bestScore === 0) {
    const neutral = categories.find(c => /uncategorized|general|misc|inbox|backlog|personal/.test(c.toLowerCase()));
    if (neutral) bestMatch = neutral;
  }
  
  console.log('Fallback categorization result:', { suggestedCategory: bestMatch, confidence: bestScore > 0 ? "medium" : "low" });
  
  return {
    suggestedCategory: bestMatch,
    confidence: bestScore > 0 ? "medium" : "low"
  };
} 