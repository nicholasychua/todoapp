import { NextResponse } from "next/server";

interface CategoryMetadata {
  name: string;
  description?: string;
  keywords?: string[];
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

// Simple fallback categorization logic with sentiment and user-defined keywords
const fallbackCategorize = (
  taskText: string, 
  categories: string[] | CategoryMetadata[]
) => {
  console.log('Using built-in fallback categorization for:', taskText);
  
  const lowerTaskText = taskText.toLowerCase();
  const sentiment = analyzeSentiment(taskText);
  
  // Base keyword map for common task types (fallback if no user-defined keywords)
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
  
  return {
    suggestedCategory: bestMatch,
    confidence: bestScore > 0 ? "medium" : "low"
  };
};

// Check if required environment variables are set
const isAIConfigured = () => {
  return process.env.AZURE_OPENAI_API_KEY && 
         process.env.AZURE_OPENAI_ENDPOINT && 
         process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
};

export async function POST(request: Request) {
  // Parse once and reuse to avoid re-reading the request body in catch
  let payload: { 
    taskText?: string; 
    categories?: string[] | CategoryMetadata[];
    categoryMetadata?: CategoryMetadata[];
  } = {};
  try {
    payload = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Task text and categories array are required" },
      { status: 400 }
    );
  }

  const taskText = payload.taskText;
  const categories = payload.categoryMetadata || payload.categories;

  if (!taskText || !categories || !Array.isArray(categories)) {
    return NextResponse.json(
      { error: "Task text and categories array are required" },
      { status: 400 }
    );
  }

  try {
    // Check if AI is properly configured - use fallback if not
    if (!isAIConfigured()) {
      console.warn("Azure OpenAI not configured - using fallback categorization");
      const fallbackResult = fallbackCategorize(taskText, categories);
      return NextResponse.json(fallbackResult);
    }

    console.log("Attempting to categorize task:", taskText);
    console.log("Available categories:", categories);

    const sentiment = analyzeSentiment(taskText);
    const hasMetadata = categories.length > 0 && typeof categories[0] === 'object';
    const categoryList: CategoryMetadata[] = hasMetadata 
      ? (categories as CategoryMetadata[])
      : (categories as string[]).map(name => ({ name }));

    // Dynamically import OpenAI to avoid bundling issues
    let OpenAI;
    try {
      OpenAI = (await import("openai")).default;
    } catch (importError) {
      console.error("Failed to import OpenAI:", importError);
      const fallbackResult = fallbackCategorize(taskText, categories);
      return NextResponse.json(fallbackResult);
    }

    const openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: process.env.AZURE_OPENAI_ENDPOINT,
      defaultQuery: { "api-version": "2024-02-15-preview" },
      defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
    });

    // Build comprehensive category context with descriptions and keywords
    const categoryContext = categoryList.map(cat => {
      let ctx = `- ${cat.name}`;
      if (cat.description) ctx += `: ${cat.description}`;
      if (cat.keywords && cat.keywords.length > 0) {
        ctx += ` | Related to: ${cat.keywords.join(', ')}`;
      }
      return ctx;
    }).join('\n');

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an intelligent task categorization assistant. Your goal is to understand the semantic meaning, context, and intent of a task, then match it to the most appropriate category.

Core Principles:
- Understand what the task is ACTUALLY about, not just surface-level keywords
- Consider the real-world context and purpose of the activity
- Think about where this task naturally belongs in someone's life

Category Matching Guidelines:
1. FOOD/SHOPPING: Picking up food, ordering meals, groceries, buying items, restaurant visits
2. SCHOOL/LEARNING: Homework, assignments, studying, courses (detect course codes like CS101, ENGIN26), academic work, classes
3. WORK: Professional tasks, client work, meetings, projects, business activities
4. EVENTS: Concerts, shows, performances, festivals, ticketed events
5. SOCIAL: Meeting friends, hangouts, social gatherings (without formal tickets/events)
6. PERSONAL: Life admin, family matters, personal goals, birthdays, appointments
7. HEALTH: Exercise, medical appointments, wellness, fitness
8. CHORES: Cleaning, household maintenance, organizing
9. HOBBY: Recreational activities, entertainment, games, crafts

Analysis Approach:
- "Pick up pizza" → Food/Shopping (it's about getting food)
- "Finish ENGIN26" → School/Learning (course code + academic action)
- "Meeting with client" → Work (professional context)
- "Concert tickets" → Events (entertainment event)
- "Call mom" → Personal (family relationship)
- "Go to gym" → Health (fitness activity)

Important:
- Focus on the PRIMARY PURPOSE of the task
- Don't over-rely on single words; understand the full context
- Consider what category the user would intuitively expect
- If uncertain between two categories, choose the more specific one`,
        },
        {
          role: "user",
          content: `Task: "${taskText}"

Available categories:
${categoryContext}

Analyze what this task is really about and choose the most appropriate category. Consider:
- What is the main activity or purpose?
- What domain of life does this belong to?
- Where would someone naturally expect to find this task?

Respond with ONLY the category name, nothing else.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 30,
    });

    const suggestedCategory = response.choices[0].message.content?.trim();
    
    if (!suggestedCategory) {
      return NextResponse.json(
        fallbackCategorize(taskText, categories)
      );
    }

    console.log("Suggested category:", suggestedCategory);

    return NextResponse.json({
      suggestedCategory,
      confidence: "high" // You could implement confidence scoring here
    });

  } catch (error) {
    console.error("Error categorizing task:", error);
    // Always use fallback instead of returning error
    const fallbackResult = fallbackCategorize(taskText, categories);
    return NextResponse.json(fallbackResult);
  }
} 