export interface ProcessedTask {
  taskName: string;
  description: string;
  date: string | null;
  time: string | null;
  tags: string[];
}

export async function processVoiceInput(rawInput: string): Promise<ProcessedTask> {
  const response = await fetch('/api/ai/process-voice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rawInput }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Error processing voice input. Status:', response.status, 'Body:', errorBody);
    throw new Error('Failed to process voice input');
  }

  const result = await response.json();
  return result as ProcessedTask;
} 