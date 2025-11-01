import { NextResponse } from "next/server";

interface CategoryMetadata {
  name: string;
  description?: string;
  keywords?: string[];
}

// Simple fallback categorization logic - basic keyword matching only
const fallbackCategorize = (
  taskText: string, 
  categories: string[] | CategoryMetadata[]
) => {
  console.log('Using built-in fallback categorization for:', taskText);
  
  const lowerTaskText = taskText.toLowerCase();
  
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
    const lc = category.name.toLowerCase();
    if (keywords.length === 0) {
      keywords = defaultKeywordMap[lc] || [];
    }

    return Array.from(new Set(keywords.map(k => k.toLowerCase())));
  };
  
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
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category.name;
    }
  }
  
  // Smart uncategorized handling - prefer uncategorized when uncertain
  const uncategorizedCategory = categoryList.find(c => /uncategorized|general|misc|inbox|backlog/.test(c.name.toLowerCase()));
  
  // Conservative threshold - prefer uncategorized unless we have a strong match
  const minScoreRequired = 20;
  
  // If score is too low, use uncategorized
  if (bestScore < minScoreRequired && uncategorizedCategory) {
    console.log(`Low score (${bestScore}) - using Uncategorized`);
    return {
      suggestedCategory: uncategorizedCategory.name,
      confidence: "low",
      reasoning: "Task doesn't match any category well enough"
    };
  }
  
  // Determine confidence based on score
  let confidence: "low" | "medium" | "high" = "low";
  let reasoning = "";
  
  if (bestScore >= 50) {
    confidence = "high";
    reasoning = "Strong category match";
  } else if (bestScore >= 30) {
    confidence = "medium";
    reasoning = "Moderate category match";
  } else {
    confidence = "low";
    reasoning = "Weak category match";
    // If low confidence and uncategorized exists, use it instead
    if (uncategorizedCategory) {
      console.log(`Low confidence categorization - defaulting to Uncategorized`);
      return {
        suggestedCategory: uncategorizedCategory.name,
        confidence: "low",
        reasoning: "Uncertain categorization"
      };
    }
  }
  
  return {
    suggestedCategory: bestMatch,
    confidence,
    reasoning
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

## CRITICAL: Confidence-Based Categorization

You must ALWAYS return a JSON object with:
- "category": the best matching category name
- "confidence": a number from 0-100 indicating how confident you are
- "reasoning": brief explanation of your decision

**Confidence Guidelines:**
- 90-100: Perfect match, no ambiguity (e.g., "gym workout" → Health, "CS homework" → Learning)
- 70-89: Strong match with clear context (e.g., "prep google interview" → Work)
- 50-69: Moderate match, some ambiguity but reasonable fit
- 30-49: Weak match, multiple possible categories
- 0-29: Very uncertain, task is vague or doesn't fit well

**IMPORTANT:** If confidence is below 50, you MUST use "Uncategorized" instead of forcing a weak match.

## Core Analysis Framework

### 1. Context Understanding
- Analyze the ENTIRE phrase, not isolated words
- Identify the primary action and its target
- Consider what domain/life area this activity belongs to
- Understand implied relationships between words

### 2. Entity Recognition (HIGH CONFIDENCE INDICATORS)
- **COMMUNICATION + PERSON = PERSONAL/SOCIAL (HIGHEST PRIORITY, 95+ confidence)**
  - "text mom" → Personal/Social/Communication (95% confidence)
  - "call dad" → Personal/Social/Communication (95% confidence)
  - "email sarah" → Personal/Social/Communication (95% confidence)
  - If no Personal/Social category exists or matches poorly → USE UNCATEGORIZED (don't force into wrong category like App/Tech)
- Company names (Google, Amazon, Meta, Datadog, etc.) → Work/Professional (90+ confidence)
- Course codes (CS101, ENGIN26, MATH 3A, BIO220) → Academic/Learning (95+ confidence)
- Restaurant names, food items, meal types → Food (85+ confidence)
- Family members (mom, dad, brother, sister, mommy, daddy) → Personal (90+ confidence)
- Venue names, artist names → Events/Entertainment (85+ confidence)

### 3. Action-Target Analysis
DON'T just match keywords. Analyze what action is being performed on what target:

Examples:
- "text mom" → Communication + Family Member = PERSONAL/SOCIAL (95% confidence, NEVER App/Tech)
- "text sarah to review app" → Communication + Person = PERSONAL/SOCIAL (95% confidence, NOT App category)
- "call dad" → Communication + Family = PERSONAL/SOCIAL (95% confidence)
- "prep datadog interview" → Interview + Company = WORK (95% confidence)
- "finish ENGIN26 homework" → Homework + Course Code = LEARNING (98% confidence)
- "order pizza" → Order + Food = appropriate food category (90% confidence)
- "do something" → Vague = UNCATEGORIZED (10% confidence)
- "text mom" (no Personal category exists) → UNCATEGORIZED (20% confidence, don't force into wrong category)

### 4. Semantic Context Clues (CRITICAL PRIORITIES)
- **TEXT/CALL/EMAIL + PERSON NAME/FAMILY = PERSONAL/SOCIAL (HIGHEST PRIORITY, 95+ confidence)**
  - These tasks MUST go to Personal/Social/Communication categories
  - If no suitable Personal/Social category exists → USE UNCATEGORIZED
  - NEVER categorize into App/Tech/Software categories even if the word "app" appears
- INTERVIEWS + COMPANY NAME = WORK (95+ confidence)
- COURSE CODE + ACADEMIC WORD = LEARNING (95+ confidence)
- FOOD ITEM + ACTION = appropriate food category (85+ confidence)
- EXERCISE + FITNESS LOCATION = HEALTH (90+ confidence)

### 5. When to Use "Uncategorized" (MANDATORY)
Use "Uncategorized" when:
- Confidence score is below 50
- Task is vague, random, or unclear (e.g., "stuff", "things", "idk")
- Task doesn't match any category well
- Multiple categories could apply equally well
- Task is too short or ambiguous (e.g., "check")
- You're uncertain about the true intent
- **Communication task (text/call/email + person) but no suitable Personal/Social category exists or matches poorly**
- **Better to use Uncategorized than force into wrong category (e.g., "text mom" → App is WRONG, use Uncategorized)**

Examples that SHOULD be "Uncategorized":
- "do stuff" (too vague)
- "check thing" (no clear target)
- "random task" (no context)
- "something important" (no domain specified)
- "asdf" (gibberish)
- "misc" (explicitly miscellaneous)
- "text mom" (if no Personal/Social category matches well - better uncategorized than wrong category)

### 6. Decision Priority (STRICT ORDER)
1. **Communication + Person/Family (text/call/email + person) → Personal/Social/Communication (95+ confidence)**
   - If no suitable Personal category → Uncategorized (NOT App/Tech/other wrong category)
2. Entity recognition (company/course/person) - 90+ confidence
3. Primary action + clear target - 70-89 confidence
4. Keyword matching with context - 50-69 confidence
5. Weak matches - Use Uncategorized instead

### 8. Common Pitfalls to AVOID (CRITICAL)
❌ DON'T categorize "text mom" or "call dad" into App/Tech/Software categories (even if word "app" appears in task)
❌ DON'T force communication tasks into wrong categories - use Uncategorized if no Personal/Social category
❌ DON'T force weak matches - use Uncategorized
❌ DON'T ignore confidence thresholds
❌ DON'T categorize vague tasks
❌ DON'T rely on single keywords without context
❌ DON'T give high confidence to ambiguous tasks
✅ DO prioritize Personal/Social categories for communication tasks
✅ DO use Uncategorized when communication tasks have no good personal category match`,
        },
        {
          role: "user",
          content: `Task: "${taskText}"

Available Categories:
${categoryContext}

Analyze this task carefully:
1. Identify entities (companies, courses, people, places)
2. Determine the primary action and its target
3. Calculate your confidence score (0-100)
4. If confidence < 50, use "Uncategorized"
5. Provide reasoning for your decision

Respond with ONLY a JSON object in this exact format:
{
  "category": "CategoryName",
  "confidence": 85,
  "reasoning": "Brief explanation"
}

Do not include any other text before or after the JSON.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    // Race between the API call and timeout
    const response = await Promise.race([apiCallPromise, timeoutPromise]) as any;

    const responseContent = response.choices[0].message.content?.trim();
    
    if (!responseContent) {
      console.warn("Empty AI response, using fallback");
      return NextResponse.json(
        fallbackCategorize(taskText, categories)
      );
    }

    // Parse the JSON response
    let aiResult: { category: string; confidence: number; reasoning: string };
    try {
      aiResult = JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", responseContent);
      // If it's not JSON, try to use it as a plain category name (backward compatibility)
      return NextResponse.json({
        suggestedCategory: responseContent,
        confidence: "medium",
        reasoning: "Legacy response format"
      });
    }

    console.log("AI categorization result:", aiResult);

    // Find the uncategorized category if it exists
    const uncategorizedCategory = categoryList.find(c => 
      /uncategorized|general|misc|inbox|backlog/.test(c.name.toLowerCase())
    );

    // Apply confidence threshold - if confidence < 50, force to Uncategorized
    const CONFIDENCE_THRESHOLD = 50;
    let finalCategory = aiResult.category;
    let finalConfidence = aiResult.confidence;
    let finalReasoning = aiResult.reasoning;

    if (finalConfidence < CONFIDENCE_THRESHOLD) {
      console.log(`AI confidence (${finalConfidence}) below threshold (${CONFIDENCE_THRESHOLD}) - forcing Uncategorized`);
      if (uncategorizedCategory) {
        finalCategory = uncategorizedCategory.name;
        finalReasoning = `Low confidence (${finalConfidence}): ${aiResult.reasoning}`;
      } else {
        // If no uncategorized category exists, keep the AI's choice but mark as low confidence
        console.warn("No Uncategorized category found, keeping AI suggestion with low confidence");
      }
    }

    // Verify the category exists in the provided categories
    const categoryExists = categoryList.some(c => 
      c.name.toLowerCase() === finalCategory.toLowerCase()
    );

    if (!categoryExists) {
      console.warn(`AI suggested category "${finalCategory}" not found in available categories`);
      // Try to find a case-insensitive match
      const matchingCategory = categoryList.find(c => 
        c.name.toLowerCase() === finalCategory.toLowerCase()
      );
      if (matchingCategory) {
        finalCategory = matchingCategory.name;
      } else if (uncategorizedCategory) {
        // Category doesn't exist, use Uncategorized
        finalCategory = uncategorizedCategory.name;
        finalReasoning = `Category "${aiResult.category}" not found`;
      }
    }

    // Convert numeric confidence to low/medium/high
    let confidenceLevel: "low" | "medium" | "high";
    if (finalConfidence >= 70) {
      confidenceLevel = "high";
    } else if (finalConfidence >= 50) {
      confidenceLevel = "medium";
    } else {
      confidenceLevel = "low";
    }

    return NextResponse.json({
      suggestedCategory: finalCategory,
      confidence: confidenceLevel,
      confidenceScore: finalConfidence,
      reasoning: finalReasoning
    });

  } catch (error) {
    console.error("Error categorizing task:", error);
    // Always use fallback instead of returning error
    const fallbackResult = fallbackCategorize(taskText, categories);
    return NextResponse.json(fallbackResult);
  }
} 