import { NextResponse } from "next/server";

interface CategoryWithExamples {
  name: string;
  examples: string[];
}

/**
 * Simple reasoning-based fallback categorization
 * Uses category names and basic semantic understanding
 */
const fallbackCategorize = (
  taskText: string, 
  categoriesWithExamples: CategoryWithExamples[]
) => {
  
  const lowerTaskText = taskText.toLowerCase();
  
  // Find the best matching category based on name similarity and examples
  let bestMatch = categoriesWithExamples[0]?.name || 'Uncategorized';
  let bestScore = 0;
  
  for (const category of categoriesWithExamples) {
    const lowerCategoryName = category.name.toLowerCase();
    let score = 0;
    
    // Check if the task mentions the category name directly
    if (lowerTaskText.includes(lowerCategoryName)) {
      score += 20;
    }
    
    // Check similarity with example tasks
    if (category.examples && category.examples.length > 0) {
      for (const example of category.examples) {
        const lowerExample = example.toLowerCase();
        const taskWords = lowerTaskText.split(/\s+/);
        const exampleWords = lowerExample.split(/\s+/);
        
        // Count shared words (simple similarity)
        const sharedWords = taskWords.filter(word => 
          word.length > 3 && exampleWords.includes(word)
        ).length;
        
        if (sharedWords > 0) {
          score += sharedWords * 3;
        }
      }
    }
    
    // Basic semantic matching based on category name meaning
    const categoryHints: Record<string, string[]> = {
      'school': ['homework', 'study', 'class', 'exam', 'assignment'],
      'work': ['meeting', 'project', 'interview', 'deadline'],
      'career': ['interview', 'resume', 'job', 'application'],
      'coffee': ['coffee', 'meet', 'chat', 'catch'],
      'errands': ['buy', 'pick', 'drop', 'get'],
      'events': ['attend', 'go to', 'rsvp', 'ticket']
    };
    
    // Check if category name has semantic hints
    for (const [key, hints] of Object.entries(categoryHints)) {
      if (lowerCategoryName.includes(key)) {
        for (const hint of hints) {
          if (lowerTaskText.includes(hint)) {
            score += 5;
          }
        }
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category.name;
    }
  }
  
  // Find uncategorized category if it exists
  const uncategorizedCategory = categoriesWithExamples.find(c => 
    /uncategorized|general|misc|inbox|backlog/i.test(c.name)
  );
  
  // Use uncategorized if score is too low
  if (bestScore < 10 && uncategorizedCategory) {
    return {
      suggestedCategory: uncategorizedCategory.name,
      confidence: "low" as const,
      reasoning: "No strong category match found"
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
    confidence,
    reasoning: `Score: ${bestScore}`
  };
};

// Check if required environment variables are set
const isAIConfigured = () => {
  // Support both OpenAI and Azure OpenAI
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAzure = !!(process.env.AZURE_OPENAI_API_KEY && 
                      process.env.AZURE_OPENAI_ENDPOINT && 
                      process.env.AZURE_OPENAI_DEPLOYMENT_NAME);
  return hasOpenAI || hasAzure;
};

export async function POST(request: Request) {
  // Parse request body
  let payload: { 
    taskText?: string; 
    categories?: string[];
    userId?: string;
  } = {};
  
  try {
    payload = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { taskText, categories, userId } = payload;

  if (!taskText || !categories || !Array.isArray(categories) || !userId) {
    return NextResponse.json(
      { error: "Task text, categories array, and userId are required" },
      { status: 400 }
    );
  }

  try {
    // Build categories (without examples for now - requires Firebase Admin SDK)
    // The AI will use category names and semantic understanding
    const categoriesWithExamples: CategoryWithExamples[] = categories.map(categoryName => ({
      name: categoryName,
      examples: [] // TODO: Fetch examples when Firebase Admin SDK is configured
    }));

    // Check if AI is properly configured - use fallback if not
    if (!isAIConfigured()) {
      console.warn("OpenAI not configured - using fallback categorization");
      const fallbackResult = fallbackCategorize(taskText, categoriesWithExamples);
      return NextResponse.json(fallbackResult);
    }

    // Dynamically import OpenAI to avoid bundling issues
    let OpenAI;
    try {
      OpenAI = (await import("openai")).default;
    } catch (importError) {
      console.error("Failed to import OpenAI:", importError);
      const fallbackResult = fallbackCategorize(taskText, categoriesWithExamples);
      return NextResponse.json(fallbackResult);
    }

    // Configure OpenAI client (supports both OpenAI and Azure)
    const isAzure = !!(
      process.env.AZURE_OPENAI_ENDPOINT &&
      process.env.AZURE_OPENAI_API_KEY &&
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME
    );

    // Remove trailing slash from Azure endpoint if present
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
    const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    
    const openai = isAzure
      ? new OpenAI({
          // For Azure OpenAI, use the base endpoint URL without the deployment path
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          baseURL: `${azureEndpoint}/openai/deployments/${azureDeployment}`,
          defaultQuery: { "api-version": "2024-08-01-preview" },
          defaultHeaders: { "api-key": process.env.AZURE_OPENAI_API_KEY },
          timeout: 5000,
        })
      : new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          timeout: 5000,
        });

    // Build category context with names and example tasks
    const categoryContext = categoriesWithExamples.map(cat => {
      let ctx = `**${cat.name}**`;
      if (cat.examples && cat.examples.length > 0) {
        ctx += `\n  Example tasks: ${cat.examples.slice(0, 5).join(', ')}`;
      } else {
        ctx += '\n  (No example tasks yet)';
      }
      return ctx;
    }).join('\n\n');

    // Create a timeout promise (5 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI categorization timeout')), 5000);
    });

    // Determine which model to use
    const model = isAzure 
      // In Azure, `model` should be set to the *deployment name*.
      ? (process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini")
      : "gpt-4o-mini"; // Use gpt-4o-mini for standard OpenAI (faster & cheaper)
    
    // Create the OpenAI API call promise
    const apiCallPromise = openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are a smart task categorization assistant that categorizes tasks based on REASONING about meaning.

## What You're Given

For each task, you will receive:
1. The task text to categorize
2. A list of categories, each with:
   - Category name (e.g., "School", "Career", "Coffee Chats", "Deep Work", "Errands")
   - Example tasks previously placed in that category (if any)

## Your Objective

Choose which category this new task naturally fits into based on:
- The ordinary meaning of the category NAME
- The example tasks already in each category
- Reasoning about similarity in purpose, topic, actions, or context

## How to Reason

### 1. Use the Category Name
Interpret the ordinary meaning:
- "School" → homework, studying, classes, academic tasks
- "Career" → jobs, resumes, interviews, networking
- "Coffee Chats" → social or networking conversations over coffee
- "Events" → birthdays, gatherings, dinners
- "Errands" → groceries, chores, small tasks
- "Deep Work" → focused work sessions

Names are your PRIMARY guide when a category has few or no tasks.

### 2. Use Example Tasks in Each Category
Once a category has tasks inside it:
- Treat those tasks as examples showing how the user interprets that category
- Look for patterns:
  - Shared topics (all about school, all about work, all social)
  - Shared actions/verbs (buying things, meeting people, studying)
  - Shared context (academic, professional, personal, social)
  - Shared intent or purpose

Example:
If "Coffee Chats" contains: "coffee with alum", "coffee with recruiter"
Then "coffee with Meta PM" likely belongs there as well.

### 3. Combine Name + Examples
- Category name gives BROAD meaning
- Example tasks give SPECIFIC meaning based on user's behavior
- Use BOTH to make the best decision

### 4. When to Assign a Category
Ask: "Does this new task seem similar in purpose, topic, or nature to tasks in this category?"
Choose the category that fits most naturally.

### 5. When NOT to Assign
If NO category feels like an appropriate match:
- DO NOT force a decision
- Use "Uncategorized" (if it exists)
- Or leave confidence LOW and let the system decide

AVOID incorrect confident assignments.

### 6. Confidence Scoring
- 80-100: Strong match with name AND examples align clearly
- 60-79: Good match with name OR examples align well
- 40-59: Moderate match, reasonable but not perfect
- 20-39: Weak match, uncertain
- 0-19: Very poor match or too vague

If confidence < 50, consider using "Uncategorized" if available.

## Examples of Reasoning

### Example 1:
Task: "finish math 55 homework"
Categories: School, Career, Coffee Chats
Reasoning: "Math 55 homework" is clearly academic work. "School" is the natural fit.
→ Assign to School (confidence: 95)

### Example 2:
Task: "coffee with Meta PM on Friday"
Categories: School, Career, Coffee Chats
- "Coffee Chats" exists and name suggests coffee meetings
- If examples include "coffee with alum", "coffee with recruiter", this fits perfectly
→ Assign to Coffee Chats (confidence: 90)

### Example 3:
Task: "buy groceries"
Categories: School, Career, Coffee Chats
Reasoning: Groceries don't match School, Career, or Coffee Chats
→ Use Uncategorized or LOW confidence (confidence: 10)

## Response Format

Respond with ONLY a JSON object:
{
  "category": "CategoryName",
  "confidence": 85,
  "reasoning": "Brief explanation of why this category fits"
}

Always reason about MEANING, not statistical patterns. Think like a human would.`,
        },
        {
          role: "user",
          content: `Task: "${taskText}"

Available Categories:
${categoryContext}

Instructions:
1. Read the task and understand what it means
2. Look at each category name and its example tasks
3. Reason about which category this task naturally belongs to
4. Consider: shared topics, actions, context, or purpose
5. If no good match, use low confidence or "Uncategorized"

Respond with ONLY a JSON object:
{
  "category": "CategoryName",
  "confidence": 85,
  "reasoning": "Brief explanation"
}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    try {
      // Race between the API call and timeout
      const response = await Promise.race([apiCallPromise, timeoutPromise]) as any;

      const responseContent = response.choices[0].message.content?.trim();
      
      if (!responseContent) {
        console.warn("Empty AI response, using fallback");
        return NextResponse.json(
          fallbackCategorize(taskText, categoriesWithExamples)
        );
      }

      // Parse the JSON response
      let aiResult: { category: string; confidence: number; reasoning: string };
      try {
        aiResult = JSON.parse(responseContent);
      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", responseContent);
        // Use fallback instead
        const fallbackResult = fallbackCategorize(taskText, categoriesWithExamples);
        return NextResponse.json(fallbackResult);
      }

      // Find the uncategorized category if it exists
      const uncategorizedCategory = categoriesWithExamples.find(c => 
        /uncategorized|general|misc|inbox|backlog/i.test(c.name)
      );

      // Apply confidence threshold - if confidence < 50, force to Uncategorized
      const CONFIDENCE_THRESHOLD = 50;
      let finalCategory = aiResult.category;
      let finalConfidence = aiResult.confidence;
      let finalReasoning = aiResult.reasoning;

      if (finalConfidence < CONFIDENCE_THRESHOLD) {
        if (uncategorizedCategory) {
          finalCategory = uncategorizedCategory.name;
          finalReasoning = `Low confidence (${finalConfidence}): ${aiResult.reasoning}`;
        } else {
          // If no uncategorized category exists, keep the AI's choice but mark as low confidence
          console.warn("No Uncategorized category found, keeping AI suggestion with low confidence");
        }
      }

      // Verify the category exists in the provided categories
      const categoryExists = categoriesWithExamples.some(c => 
        c.name.toLowerCase() === finalCategory.toLowerCase()
      );

      if (!categoryExists) {
        console.warn(`AI suggested category "${finalCategory}" not found in available categories`);
        // Try to find a case-insensitive match
        const matchingCategory = categoriesWithExamples.find(c => 
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
    } catch (aiError) {
      // Handle any OpenAI errors (including timeout and network errors)
      const err = aiError as any;
      if (err?.status === 404 || err?.code === "404") {
        console.warn(
          "OpenAI API returned 404 (resource not found). " +
          "If you're using Azure OpenAI, double-check AZURE_OPENAI_ENDPOINT " +
          "and AZURE_OPENAI_DEPLOYMENT_NAME match your deployment."
        );
      }
      console.warn("OpenAI API error, using fallback:", aiError);
      const fallbackResult = fallbackCategorize(taskText, categoriesWithExamples);
      return NextResponse.json(fallbackResult);
    }

  } catch (error) {
    console.error("Error categorizing task:", error);
    // Always use fallback instead of returning error
    const categoriesWithExamples: CategoryWithExamples[] = categories.map(categoryName => ({
      name: categoryName,
      examples: []
    }));
    const fallbackResult = fallbackCategorize(taskText, categoriesWithExamples);
    return NextResponse.json(fallbackResult);
  }
} 