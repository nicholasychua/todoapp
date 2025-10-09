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

export interface CategoryMetadata {
  name: string;
  description?: string;
  keywords?: string[];
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
    }).catch((fetchError) => {
      console.error('Network error fetching voice processing API:', fetchError);
      throw new Error('Network error');
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

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
    
    // If there's a network error or other issue, use fallback
    console.warn('Using fallback voice processing due to error');
    return getFallbackVoiceProcessing(rawInput);
  }
}

export async function categorizeTask(
  taskText: string, 
  categories: string[] | CategoryMetadata[]
): Promise<CategorizationResult> {
  try {
    const response = await fetch('/api/ai/categorize-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        taskText, 
        categoryMetadata: typeof categories[0] === 'object' ? categories : undefined,
        categories: typeof categories[0] === 'string' ? categories : undefined
      }),
    }).catch((fetchError) => {
      console.error('Network error fetching categorization API:', fetchError);
      throw new Error('Network error');
    });

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

// Simple sentiment analysis function
const analyzeSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['happy', 'great', 'awesome', 'excellent', 'love', 'enjoy', 'excited', 'wonderful', 'amazing', 'fantastic', 'good', 'fun', 'celebrate', 'success', 'win'];
  const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'angry', 'upset', 'frustrated', 'problem', 'issue', 'error', 'fail', 'urgent', 'critical', 'fix', 'bug', 'broken'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

// Fallback categorization function that uses simple keyword matching
function getFallbackCategorization(
  taskText: string, 
  categories: string[] | CategoryMetadata[]
): CategorizationResult {
  console.log('Using fallback categorization for:', taskText, 'with categories:', categories);
  
  const lowerTaskText = taskText.toLowerCase();
  const sentiment = analyzeSentiment(taskText);
  
  // Base keyword map for common task types (expanded per-category below)
  const defaultKeywordMap: Record<string, string[]> = {
    'work': ['work', 'job', 'office', 'meeting', 'project', 'client', 'business', 'deadline', 'presentation', 'report', 'email', 'call', 'interview'],
    'personal': ['birthday', 'anniversary', 'family', 'relationship', 'self', 'personal goal'],
    'health': ['health', 'fitness', 'exercise', 'workout', 'gym', 'diet', 'medical', 'doctor', 'appointment', 'therapy', 'wellness'],
    'shopping': ['shopping', 'buy', 'purchase', 'store', 'market', 'groceries', 'order', 'amazon', 'shop'],
    'finance': ['finance', 'money', 'budget', 'bill', 'payment', 'bank', 'investment', 'invoice', 'tax', 'expense'],
    'learning': ['learn', 'study', 'read', 'course', 'education', 'training', 'class', 'homework', 'assignment', 'exam', 'test', 'quiz', 'lecture', 'tutorial', 'practice', 'review', 'midterm', 'final', 'textbook', 'notes', 'research', 'paper', 'essay', 'problem set', 'lab', 'school', 'college', 'university', 'student', 'grade', 'submit', 'due', 'chapter', 'complete', 'finish'],
    'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'booking', 'airport', 'passport', 'visa'],
    'social': ['social', 'friend', 'hangout', 'coffee', 'lunch', 'dinner', 'catch up'],
    'events': ['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'ticket', 'tickets', 'venue', 'meetup', 'conference'],
    'event': ['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'ticket', 'tickets', 'venue', 'meetup', 'conference'],
    'chores': ['chore', 'clean', 'laundry', 'dishes', 'organize', 'maintenance', 'repair', 'vacuum', 'tidy'],
    'hobby': ['hobby', 'craft', 'art', 'music', 'game', 'fun', 'entertainment', 'movie', 'watch', 'play']
  };

  // Check if we have CategoryMetadata or just string names
  const hasMetadata = categories.length > 0 && typeof categories[0] === 'object';
  const categoryList: CategoryMetadata[] = hasMetadata 
    ? (categories as CategoryMetadata[])
    : (categories as string[]).map(name => ({ name }));

  const expandKeywordsForCategory = (category: CategoryMetadata): string[] => {
    const lc = category.name.toLowerCase();
    
    // Start with user-defined keywords if available
    let keywords: string[] = [...(category.keywords || [])];
    
    // Add keywords from description if available
    if (category.description) {
      const descWords = category.description.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3); // Only meaningful words
      keywords = keywords.concat(descWords);
    }
    
    // Fallback to default keywords if none provided
    if (keywords.length === 0) {
      keywords = defaultKeywordMap[lc] || [];
    }

    // Expand by semantic hints from the category name
    if (/(event|events|concert|show|gig|performance|festival|party|meetup|entertain|social|leisure)/.test(lc)) {
      keywords = keywords.concat(['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'party', 'meetup', 'ticket', 'tickets', 'venue']);
    }
    if (/(music)/.test(lc)) {
      keywords = keywords.concat(['music', 'concert', 'show', 'gig', 'performance']);
    }
    if (/(work|job|office|client|project|business|meeting)/.test(lc)) {
      keywords = keywords.concat(['work', 'job', 'office', 'meeting', 'project', 'client', 'business', 'deadline', 'presentation']);
    }
    if (/(school|learn|study|homework|class|course|education|academic)/.test(lc)) {
      keywords = keywords.concat(['learn', 'study', 'homework', 'assignment', 'exam', 'test', 'quiz', 'lecture', 'class', 'course', 'school', 'college', 'university', 'textbook', 'notes', 'research', 'paper', 'essay', 'lab', 'complete', 'finish', 'submit', 'due', 'chapter', 'problem', 'practice']);
    }
    if (/(hobby|fun|entertainment|leisure)/.test(lc)) {
      keywords = keywords.concat(['hobby', 'fun', 'entertainment', 'game', 'play', 'watch', 'enjoy']);
    }

    return Array.from(new Set(keywords.map(k => k.toLowerCase())));
  };
  
  // Semantic pattern detection for better context understanding
  
  // Check for course code patterns (e.g., CS101, ENGIN26, MATH3A)
  const courseCodePattern = /\b[a-z]{2,6}\s*\d{1,4}[a-z]?\b/i;
  const hasCourseCode = courseCodePattern.test(lowerTaskText);
  
  // Check for academic action words
  const academicActions = ['finish', 'complete', 'submit', 'study', 'review', 'read', 'practice', 'solve', 'write'];
  const hasAcademicAction = academicActions.some(action => lowerTaskText.includes(action));
  
  // Check for food-related patterns
  const foodPatterns = ['pizza', 'food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'meal', 'order', 'pick up', 'pickup', 'takeout', 'delivery', 'eat', 'sushi', 'burger', 'sandwich', 'coffee', 'groceries', 'grocery'];
  const hasFoodContext = foodPatterns.some(pattern => lowerTaskText.includes(pattern));
  
  // Check for shopping patterns
  const shoppingPatterns = ['buy', 'purchase', 'shop', 'store', 'get', 'pick up', 'order'];
  const hasShoppingAction = shoppingPatterns.some(pattern => lowerTaskText.includes(pattern));
  
  // Check for event/entertainment patterns
  const eventPatterns = ['concert', 'show', 'ticket', 'festival', 'performance', 'gig', 'venue'];
  const hasEventContext = eventPatterns.some(pattern => lowerTaskText.includes(pattern));
  
  // Find the best matching category
  let bestMatch = categoryList[0].name;
  let bestScore = 0;
  
  for (const category of categoryList) {
    const lowerCategory = category.name.toLowerCase();
    let score = 0;
    
    // Check direct category name match
    if (lowerTaskText.includes(lowerCategory)) {
      score += 10;
    }
    
    // Check description match (if available)
    if (category.description && lowerTaskText.includes(category.description.toLowerCase())) {
      score += 8;
    }
    
    // Check keyword matches (user-defined + expanded by category name semantics)
    const keywords = expandKeywordsForCategory(category);
    for (const keyword of keywords) {
      if (lowerTaskText.includes(keyword)) {
        score += 5;
      }
    }
    
    // Context-aware boosting based on semantic patterns
    
    // Food/Shopping context
    if (hasFoodContext && /(food|shop|grocery|restaurant|dining|meal)/.test(lowerCategory)) {
      score += 20; // Strong boost for food-related tasks
    }
    if (hasShoppingAction && hasFoodContext && /(shop|food|grocery)/.test(lowerCategory)) {
      score += 10; // Additional boost for shopping + food
    }
    
    // Academic context
    if (hasCourseCode && /(learn|school|study|homework|class|course|education|academic)/.test(lowerCategory)) {
      score += 20; // Strong boost for course codes
    }
    if (hasAcademicAction && hasCourseCode && /(learn|school|study|homework|class|course|education|academic)/.test(lowerCategory)) {
      score += 10; // Additional boost if both present
    }
    
    // Event context
    if (hasEventContext && /(event|entertainment|social|concert|show)/.test(lowerCategory)) {
      score += 15; // Boost for clear event patterns
    }
    
    // Sentiment-based bonus scoring
    if (sentiment === 'positive' && /(hobby|fun|social|event|entertainment|leisure|vacation|travel)/.test(lowerCategory)) {
      score += 3;
    }
    if (sentiment === 'negative' && /(work|problem|issue|urgent|critical|fix|chore)/.test(lowerCategory)) {
      score += 3;
    }
    
    // Penalize "personal" category unless it's a clear personal task
    if (/personal/.test(lowerCategory) && !/(birthday|anniversary|family|relationship)/.test(lowerTaskText)) {
      score -= 8; // Stronger penalty to avoid over-categorizing as personal
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category.name;
    }
  }
  
  // On zero score, prefer neutral buckets
  if (bestScore === 0) {
    const neutral = categoryList.find(c => /uncategorized|general|misc|inbox|backlog/.test(c.name.toLowerCase()));
    if (neutral) bestMatch = neutral.name;
  }
  
  console.log('Fallback categorization result:', { suggestedCategory: bestMatch, confidence: bestScore > 0 ? "medium" : "low" });
  
  return {
    suggestedCategory: bestMatch,
    confidence: bestScore > 0 ? "medium" : "low"
  };
} 