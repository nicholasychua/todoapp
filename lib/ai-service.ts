import OpenAI from 'openai';

// Initialize OpenAI client with Azure configuration
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
  defaultQuery: { 'api-version': '2024-03-01-preview' },
  defaultHeaders: { 'api-key': process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY },
  dangerouslyAllowBrowser: true  // Enable browser usage
});

export interface ProcessedTask {
  taskName: string;
  description: string;
  date: string | null;
  tags: string[];
}

export async function processVoiceInput(rawInput: string): Promise<ProcessedTask> {
  try {
    console.log('Attempting to process voice input:', rawInput);
    console.log('Using model:', process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4.1");
    
    const response = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a task processing assistant. Extract task information from the user's voice input.
          Return a JSON object with the following structure:
          {
            "taskName": "Main task name",
            "description": "Detailed description",
            "date": "YYYY-MM-DD or null if no date mentioned",
            "tags": ["array", "of", "relevant", "tags"]
          }
          
          Rules:
          - If a date is mentioned, convert it to YYYY-MM-DD format
          - Extract any hashtags as tags
          - Keep the taskName concise but descriptive
          - Include any additional context in the description
          - If no date is mentioned, set date to null`
        },
        {
          role: "user",
          content: rawInput
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const result = JSON.parse(content);
    return result as ProcessedTask;
  } catch (error) {
    console.error('Error processing voice input:', error);
    console.error('Error details:', {
      endpoint: process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT,
      deploymentName: process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT_NAME,
      apiVersion: '2024-03-01-preview'
    });
    // Return a default structure if processing fails
    return {
      taskName: rawInput,
      description: rawInput,
      date: null,
      tags: []
    };
  }
} 