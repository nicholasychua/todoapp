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
  
  return {
    suggestedCategory: bestMatch,
    confidence
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

    // Create a timeout promise (5 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI categorization timeout')), 5000);
    });

    // Create the OpenAI API call promise
    const apiCallPromise = openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert task categorization assistant specializing in semantic understanding and contextual analysis. Your role is to deeply understand the TRUE meaning and intent behind each task by analyzing context, entity types, and real-world scenarios.

## Core Analysis Framework

### 1. Context Understanding
- Look at the ENTIRE phrase, not isolated words
- Identify the primary action and its target
- Consider what domain/life area this activity belongs to
- Understand implied relationships between words

### 2. Entity Recognition
- Person names (Sarah, John, etc.) especially after communication verbs → Personal/Social
- Company names (Google, Amazon, Meta, Datadog, etc.) → Usually Work/Professional
- Course codes (CS101, ENGIN26, MATH 3A, BIO220) → Academic/Learning
- Restaurant names, food items, meal types → Food
- Family members (mom, dad, brother, sister, friend) → Personal
- Venue names, artist names → Events/Entertainment

### 3. Action-Target Analysis
DON'T just match keywords. Instead, analyze what action is being performed on what target:

Examples of CORRECT analysis:
- "text sarah to review app today" → PRIMARY: communication, ENTITY: Sarah (person) → PERSONAL/SOCIAL
- "call mom about dinner plans" → PRIMARY: communication, ENTITY: mom (family) → PERSONAL
- "email john the documents" → PRIMARY: communication, ENTITY: John (person) → PERSONAL
- "prep datadog interview" → PRIMARY: interview (professional), ENTITY: Datadog (company) → WORK
- "prepare dinner" → PRIMARY: meal preparation, ENTITY: dinner (food) → FOOD
- "finish ENGIN26 homework" → PRIMARY: homework, ENTITY: ENGIN26 (course code) → LEARNING
- "prep for gym" → PRIMARY: exercise preparation, ENTITY: gym (fitness) → HEALTH
- "study for google interview" → PRIMARY: interview preparation, ENTITY: Google (company) → WORK
- "order pizza" → PRIMARY: food ordering, ENTITY: pizza (food) → FOOD
- "review CS notes" → PRIMARY: studying, ENTITY: CS (course subject) → LEARNING

### 4. Context Clues
TEXT/CALL/EMAIL + PERSON NAME = PERSONAL (highest priority for communication)
COMMUNICATION VERB + SOMEONE + ABOUT/TO = PERSONAL/SOCIAL (not club, not hobby, not event)
INTERVIEWS + COMPANY NAME = WORK (not food, even with "prep")
PREPARE + FOOD ITEM = FOOD
STUDY/REVIEW + COURSE/SUBJECT = LEARNING
MEET/CALL + FAMILY = PERSONAL
TICKETS + VENUE/ARTIST = EVENTS
EXERCISE + FITNESS LOCATION = HEALTH

### 5. Disambiguation Rules
When you see communication verbs (text, call, email, message, contact, remind):
- If followed by a person name → PERSONAL/SOCIAL
- These are NEVER club, hobby, event, or food tasks

When a word like "prep", "prepare", "review", "check", "get" appears:
- Look at what follows it
- If it's a company name → likely WORK
- If it's a food item → likely FOOD
- If it's a course/subject → likely LEARNING
- If it's a workout/exercise → likely HEALTH

### 6. Common Pitfalls to AVOID
❌ DON'T categorize "text/call/email [person]" as club, hobby, event, or anything other than PERSONAL/SOCIAL
❌ DON'T ignore the communication verb - if someone is texting/calling someone, it's PERSONAL
❌ DON'T categorize "prep [company] interview" as FOOD just because "prep" can mean food prep
❌ DON'T categorize "[company] interview" as anything other than WORK
❌ DON'T categorize course codes (CS101, ENGIN26) as anything other than LEARNING
❌ DON'T rely on single keyword matches - always consider full context

### 7. Decision Priority
1. Communication patterns (text/call/email person → personal/social) - HIGHEST PRIORITY
2. Explicit entity type (company → work, course code → learning, person name → personal)
3. Primary action purpose (what is the task fundamentally about?)
4. Life domain (where does this naturally belong?)
5. User expectation (where would someone intuitively look for this?)

### 8. When to Use "Uncategorized"
- If the task is too vague or random
- If it doesn't clearly fit any specific category
- If you're uncertain or the task is ambiguous
- DON'T force a task into a category if it doesn't belong there
- It's BETTER to say "Uncategorized" than to guess wrong
- Random phrases, unclear tasks, or mixed-purpose items should be "Uncategorized"`,
        },
        {
          role: "user",
          content: `Task: "${taskText}"

Available categories:
${categoryContext}

Follow the analysis framework:
1. Identify any entities (companies, courses, people, places)
2. Determine the primary action and its target
3. Consider the full context and real-world meaning
4. Match to the most appropriate category based on TRUE intent
5. If the task is vague, random, or doesn't fit well, choose "Uncategorized" instead of forcing it

Remember: It's better to say "Uncategorized" than to guess incorrectly.

Respond with ONLY the category name that best matches. Nothing else.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 30,
    });

    // Race between the API call and timeout
    const response = await Promise.race([apiCallPromise, timeoutPromise]) as any;

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