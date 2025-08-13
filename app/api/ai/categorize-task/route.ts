import { NextResponse } from "next/server";
import OpenAI from "openai";

// Simple fallback categorization logic
const fallbackCategorize = (taskText: string, categories: string[]) => {
  console.log('Using built-in fallback categorization for:', taskText);
  
  const lowerTaskText = taskText.toLowerCase();
  
  // Base keyword map for common task types (will be expanded per-category by name heuristics)
  const keywordMap: Record<string, string[]> = {
    'work': ['work', 'job', 'office', 'meeting', 'project', 'client', 'business', 'deadline'],
    'personal': ['personal', 'family', 'home', 'house', 'life'],
    'health': ['health', 'fitness', 'exercise', 'workout', 'gym', 'diet', 'medical', 'doctor', 'appointment'],
    'shopping': ['shopping', 'buy', 'purchase', 'store', 'market', 'groceries', 'order'],
    'finance': ['finance', 'money', 'budget', 'bill', 'payment', 'bank', 'investment', 'invoice', 'tax'],
    'learning': ['learn', 'study', 'read', 'course', 'education', 'training', 'class', 'homework'],
    'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'booking', 'drive', 'commute'],
    'social': ['social', 'friend', 'party', 'event', 'dinner', 'meet', 'hangout'],
    'events': ['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'ticket', 'tickets', 'venue', 'meetup'],
    'event': ['event', 'events', 'concert', 'show', 'gig', 'performance', 'festival', 'ticket', 'tickets', 'venue', 'meetup'],
    'chores': ['chore', 'clean', 'laundry', 'dishes', 'organize', 'maintenance', 'repair'],
    'hobby': ['hobby', 'craft', 'art', 'music', 'game', 'fun', 'entertainment', 'movie']
  };

  const expandKeywordsForCategory = (categoryName: string): string[] => {
    const lc = categoryName.toLowerCase();
    let keywords = keywordMap[lc] || [];

    // Expand by semantic hints from the category name
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
  let bestMatch = categories[0]; // Default — may be overridden below on 0-score
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
  let payload: { taskText?: string; categories?: string[] } = {};
  try {
    payload = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Task text and categories array are required" },
      { status: 400 }
    );
  }

  const taskText = payload.taskText;
  const categories = payload.categories;

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

    const openai = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: process.env.AZURE_OPENAI_ENDPOINT,
      defaultQuery: { "api-version": "2024-02-15-preview" },
      defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
    });

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a task categorization assistant. Your job is to analyze a task description and assign it to the most appropriate category from a given list of categories.

Rules:
- Analyze the task content, context, and intent
- Consider the semantic meaning and purpose of the task
- Choose the category that best represents the task's domain or purpose
- Prefer "Events"/"Social"/"Entertainment"-like categories for concerts, shows, festivals, or ticketed performances
- Only choose "Work" if the description clearly indicates professional context (e.g., client, project, meeting, deadline)
- If no category fits well, choose the most general or closest category (avoid defaulting to Work)
- Return only the category name, nothing else
- Be consistent with categorization logic`,
        },
        {
          role: "user",
          content: `Task: "${taskText}"

Available categories: ${categories.join(", ")}

Please categorize this task into one of the available categories. Respond with only the category name.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
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