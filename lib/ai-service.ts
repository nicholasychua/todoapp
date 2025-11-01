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
  confidenceScore?: number; // 0-100 numeric confidence score from AI
  reasoning?: string; // AI's reasoning for the categorization
}

export interface CategoryMetadata {
  name: string;
  description?: string;
  keywords?: string[];
}

export async function processVoiceInput(rawInput: string): Promise<ProcessedTask> {
  try {
    console.log('Starting voice processing for:', rawInput);
    
    // Create an abort controller for timeout (longer for voice processing)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('Voice processing request timeout after 10 seconds, using fallback...');
      controller.abort();
    }, 10000); // 10 second timeout (voice processing can take longer)
    
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
    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Voice processing request timed out, using fallback');
      return getFallbackVoiceProcessing(rawInput);
    } else if (error instanceof Error && (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
      console.warn('Network error during voice processing, using fallback');
      return getFallbackVoiceProcessing(rawInput);
    }
    
    // For any other error, log it and use fallback
    console.error('Error in processVoiceInput:', error);
    console.warn('Using fallback voice processing due to error');
    return getFallbackVoiceProcessing(rawInput);
  }
}

export async function categorizeTask(
  taskText: string, 
  categories: string[] | CategoryMetadata[]
): Promise<CategorizationResult> {
  try {
    console.log('Starting categorization for:', taskText);
    
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn('Categorization request timeout after 8 seconds, using fallback...');
      controller.abort();
    }, 8000); // 8 second timeout

    const requestBody = { 
      taskText, 
      categoryMetadata: typeof categories[0] === 'object' ? categories : undefined,
      categories: typeof categories[0] === 'string' ? categories : undefined
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
    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Categorization request timed out, using fallback');
      return getFallbackCategorization(taskText, categories);
    } else if (error instanceof Error && (error.message === 'Failed to fetch' || error.message.includes('NetworkError'))) {
      console.warn('Network error during categorization, using fallback');
      return getFallbackCategorization(taskText, categories);
    }
    
    // For any other error, log it and use fallback
    console.error('Error in categorizeTask:', error);
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
    'work': ['work', 'job', 'office', 'meeting', 'project', 'client', 'business', 'deadline', 'presentation', 'report', 'email', 'call', 'interview', 'career', 'professional', 'standup', 'sync', 'onboarding', 'resume', 'application', 'position', 'role', 'employment'],
    'personal': ['birthday', 'anniversary', 'family', 'relationship', 'self', 'personal goal'],
    'health': ['health', 'fitness', 'exercise', 'workout', 'gym', 'diet', 'medical', 'doctor', 'appointment', 'therapy', 'wellness'],
    'shopping': ['shopping', 'buy', 'purchase', 'store', 'market', 'groceries', 'order', 'amazon', 'shop'],
    'finance': ['finance', 'money', 'budget', 'bill', 'payment', 'bank', 'investment', 'invoice', 'tax', 'expense'],
    'learning': ['learn', 'study', 'read', 'course', 'education', 'training', 'class', 'homework', 'assignment', 'exam', 'test', 'quiz', 'lecture', 'tutorial', 'practice', 'review', 'midterm', 'final', 'textbook', 'notes', 'research', 'paper', 'essay', 'problem set', 'lab', 'school', 'college', 'university', 'student', 'grade', 'submit', 'due', 'chapter'],
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
    if (/(work|job|office|client|project|business|meeting|career|professional|employment)/.test(lc)) {
      keywords = keywords.concat(['work', 'job', 'office', 'meeting', 'project', 'client', 'business', 'deadline', 'presentation', 'interview', 'career', 'professional', 'standup', 'sync', 'onboarding', 'resume', 'application', 'position', 'role']);
    }
    if (/(school|learn|study|homework|class|course|education|academic)/.test(lc)) {
      keywords = keywords.concat(['learn', 'study', 'homework', 'assignment', 'exam', 'test', 'quiz', 'lecture', 'class', 'course', 'school', 'college', 'university', 'textbook', 'notes', 'research', 'paper', 'essay', 'lab', 'submit', 'due', 'chapter', 'problem', 'practice']);
    }
    if (/(hobby|fun|entertainment|leisure)/.test(lc)) {
      keywords = keywords.concat(['hobby', 'fun', 'entertainment', 'game', 'play', 'watch', 'enjoy']);
    }

    return Array.from(new Set(keywords.map(k => k.toLowerCase())));
  };
  
  // Semantic pattern detection for better context understanding
  
  // HIGHEST PRIORITY: Check for communication/personal interaction patterns
  // Patterns: "text/call/email/message [person name] to/about [something]"
  const communicationPattern = /\b(text|call|email|message|reach out|contact|ping|dm|remind)\s+([a-z]+)\s+(to|about|regarding|for|that|and)/i;
  const hasCommunicationPattern = communicationPattern.test(lowerTaskText);
  
  // Simple person name detection (capitalized word that's not at start, or common names)
  const commonNames = ['sarah', 'john', 'mike', 'emily', 'david', 'lisa', 'chris', 'alex', 'mom', 'dad', 'brother', 'sister', 'friend'];
  const hasPersonName = commonNames.some(name => lowerTaskText.includes(name)) || /\b(text|call|email|message)\s+[A-Z][a-z]+/.test(taskText);
  
  // Communication verbs followed by person indicators
  const isCommunicationTask = /\b(text|call|email|message|reach out|contact|ping|dm|tell|ask|remind|notify)\b/.test(lowerTaskText) && hasPersonName;
  
  // Check for work/professional patterns
  const interviewPattern = /\b(interview|job|career|position|role|application|resume|cv)\b/i;
  const hasInterviewContext = interviewPattern.test(lowerTaskText);
  
  // Common company/tech names that indicate work context
  const companyIndicators = ['google', 'amazon', 'meta', 'microsoft', 'apple', 'netflix', 'datadog', 'stripe', 'uber', 'lyft', 'airbnb', 'facebook', 'twitter', 'linkedin', 'salesforce', 'oracle', 'ibm', 'adobe', 'cisco', 'intel', 'nvidia'];
  const hasCompanyName = companyIndicators.some(company => lowerTaskText.includes(company));
  
  // Work-specific actions
  const workActions = ['meeting', 'presentation', 'deadline', 'client', 'project', 'standup', 'sync', 'onboarding', 'training'];
  const hasWorkAction = workActions.some(action => lowerTaskText.includes(action));
  
  // If task mentions interview OR company name, it's highly likely to be work
  const isLikelyWorkTask = hasInterviewContext || (hasCompanyName && !lowerTaskText.includes('order') && !lowerTaskText.includes('buy'));
  
  // Check for course code patterns (e.g., CS101, ENGIN26, MATH3A)
  const courseCodePattern = /\b[a-z]{2,6}\s*\d{1,4}[a-z]?\b/i;
  const hasCourseCode = courseCodePattern.test(lowerTaskText);
  
  // Check for academic action words
  const academicActions = ['homework', 'assignment', 'exam', 'test', 'quiz', 'midterm', 'final', 'lecture', 'lab', 'textbook'];
  const hasAcademicAction = academicActions.some(action => lowerTaskText.includes(action));
  
  // Academic subjects that indicate learning
  const academicSubjects = ['math', 'science', 'history', 'english', 'biology', 'chemistry', 'physics', 'calculus', 'algebra', 'geometry'];
  const hasAcademicSubject = academicSubjects.some(subject => lowerTaskText.includes(subject));
  
  // Check for food-related patterns (but NOT if it's clearly work/interview related)
  const foodPatterns = ['pizza', 'food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'meal', 'takeout', 'delivery', 'eat', 'sushi', 'burger', 'sandwich', 'groceries', 'grocery'];
  const hasFoodContext = !isLikelyWorkTask && foodPatterns.some(pattern => lowerTaskText.includes(pattern));
  
  // Check for shopping patterns (but context matters)
  const shoppingPatterns = ['buy', 'purchase', 'shop', 'store'];
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
    // HIGHEST PRIORITY: Communication/Personal tasks
    if (isCommunicationTask && /(personal|social|communication|friends?|family|people|contact)/.test(lowerCategory)) {
      score += 60; // Very strong boost for communication tasks
    }
    if (hasCommunicationPattern && /(personal|social|communication)/.test(lowerCategory)) {
      score += 40; // Strong boost for clear communication patterns
    }
    
    // PRIORITY: Work context (high priority to avoid misclassification)
    if (isLikelyWorkTask && /(work|job|career|professional|office|business|employment)/.test(lowerCategory)) {
      score += 50; // Very strong boost for work-related tasks with interview/company context
    }
    if (hasInterviewContext && /(work|job|career|professional)/.test(lowerCategory)) {
      score += 30; // Strong boost for interview mentions
    }
    if (hasCompanyName && /(work|job|career|professional)/.test(lowerCategory)) {
      score += 25; // Strong boost for company names
    }
    if (hasWorkAction && /(work|job|career|professional|office|business)/.test(lowerCategory)) {
      score += 20; // Boost for work-specific actions
    }
    
    // Academic context (high priority)
    if (hasCourseCode && /(learn|school|study|homework|class|course|education|academic)/.test(lowerCategory)) {
      score += 35; // Very strong boost for course codes
    }
    if (hasAcademicAction && /(learn|school|study|homework|class|course|education|academic)/.test(lowerCategory)) {
      score += 20; // Strong boost for academic actions
    }
    if (hasAcademicSubject && /(learn|school|study|homework|class|course|education|academic)/.test(lowerCategory)) {
      score += 15; // Boost for academic subjects
    }
    
    // Food/Shopping context (only if NOT work-related)
    if (hasFoodContext && /(food|shop|grocery|restaurant|dining|meal)/.test(lowerCategory)) {
      score += 20; // Strong boost for food-related tasks
    }
    if (hasShoppingAction && hasFoodContext && /(shop|food|grocery)/.test(lowerCategory)) {
      score += 10; // Additional boost for shopping + food
    }
    
    // Event context
    if (hasEventContext && /(event|entertainment|social|concert|show)/.test(lowerCategory)) {
      score += 15; // Boost for clear event patterns
    }
    
    // PENALTIES: Prevent obvious misclassifications
    
    // Prevent communication tasks from being categorized incorrectly
    if (isCommunicationTask && /(club|event|hobby|food|shop|fitness|health|sport|music|concert|game)/.test(lowerCategory)) {
      score -= 100; // Strong penalty - communication tasks shouldn't go to these categories
    }
    
    // Prevent work tasks from being categorized as food
    if (isLikelyWorkTask && /(food|grocery|restaurant|dining|meal)/.test(lowerCategory)) {
      score -= 100; // Strong penalty to prevent "prep datadog interview" going to food
    }
    
    // Sentiment-based bonus scoring
    if (sentiment === 'positive' && /(hobby|fun|social|event|entertainment|leisure|vacation|travel)/.test(lowerCategory)) {
      score += 3;
    }
    if (sentiment === 'negative' && /(work|problem|issue|urgent|critical|fix|chore)/.test(lowerCategory)) {
      score += 3;
    }
    
    // Smart "personal" category handling
    if (/personal/.test(lowerCategory)) {
      // BOOST personal if it's communication, family, or life admin
      if (isCommunicationTask || /(birthday|anniversary|family|relationship|mom|dad|parent|sibling|friend)/.test(lowerTaskText)) {
        score += 15; // Boost for clear personal tasks
      } else if (!/(birthday|anniversary|family|relationship|text|call|email|message)/.test(lowerTaskText)) {
        // Only penalize if it's clearly NOT personal
        score -= 5;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category.name;
    }
  }
  
  // Smart uncategorized handling - don't force categorization if score is too low
  const uncategorizedCategory = categoryList.find(c => /uncategorized|general|misc|inbox|backlog/.test(c.name.toLowerCase()));
  
  // If score is too low (weak match), prefer uncategorized
  if (bestScore < 15 && uncategorizedCategory) {
    bestMatch = uncategorizedCategory.name;
    console.log('Fallback categorization result (low score, using uncategorized):', { suggestedCategory: bestMatch, confidence: "low", score: bestScore });
    return {
      suggestedCategory: bestMatch,
      confidence: "low"
    };
  }
  
  // On zero score, definitely use uncategorized
  if (bestScore === 0 && uncategorizedCategory) {
    bestMatch = uncategorizedCategory.name;
  }
  
  // Determine confidence based on score
  let confidence = "low";
  if (bestScore >= 50) {
    confidence = "high";
  } else if (bestScore >= 25) {
    confidence = "medium";
  }
  
  console.log('Fallback categorization result:', { suggestedCategory: bestMatch, confidence, score: bestScore });
  
  return {
    suggestedCategory: bestMatch,
    confidence
  };
} 