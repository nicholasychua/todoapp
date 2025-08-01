import { NextResponse } from "next/server";
import OpenAI from "openai";

// Simple fallback categorization logic
const fallbackCategorize = (taskText: string, categories: string[]) => {
  console.log('Using built-in fallback categorization for:', taskText);
  
  const lowerTaskText = taskText.toLowerCase();
  
  // Simple keyword matching for common task types
  const keywordMap: Record<string, string[]> = {
    'work': ['work', 'job', 'office', 'meeting', 'project', 'client', 'business'],
    'personal': ['personal', 'family', 'home', 'house', 'life'],
    'health': ['health', 'fitness', 'exercise', 'workout', 'gym', 'diet', 'medical'],
    'shopping': ['shopping', 'buy', 'purchase', 'store', 'market', 'groceries'],
    'finance': ['finance', 'money', 'budget', 'bill', 'payment', 'bank', 'investment'],
    'learning': ['learn', 'study', 'read', 'course', 'education', 'training'],
    'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'booking'],
    'social': ['social', 'friend', 'party', 'event', 'dinner', 'meet'],
    'chores': ['chore', 'clean', 'laundry', 'dishes', 'organize', 'maintenance'],
    'hobby': ['hobby', 'craft', 'art', 'music', 'game', 'fun', 'entertainment']
  };
  
  // Find the best matching category
  let bestMatch = categories[0]; // Default to first category
  let bestScore = 0;
  
  for (const category of categories) {
    const lowerCategory = category.toLowerCase();
    let score = 0;
    
    // Check direct category name match
    if (lowerTaskText.includes(lowerCategory)) {
      score += 10;
    }
    
    // Check keyword matches
    const keywords = keywordMap[lowerCategory.toLowerCase()] || [];
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
  try {
    const { taskText, categories } = await request.json();

    if (!taskText || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: "Task text and categories array are required" },
        { status: 400 }
      );
    }

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
- If no category fits well, choose the most general or closest category
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
    const { taskText, categories } = await request.json().catch(() => ({ taskText: "", categories: [] }));
    
    if (taskText && Array.isArray(categories)) {
      const fallbackResult = fallbackCategorize(taskText, categories);
      return NextResponse.json(fallbackResult);
    }
    
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
} 