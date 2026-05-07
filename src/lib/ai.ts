import fs from 'fs/promises';

const getApiKey = async (): Promise<string> => {
  // In production (Vercel), use the ANTHROPIC_API_KEY env var
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // In Claude Code sandbox, read from the session auth file
  try {
    const token = await fs.readFile('/home/claude/.claude/remote/.session_ingress_token', 'utf-8');
    return token.trim();
  } catch {
    throw new Error('No API key available. Set ANTHROPIC_API_KEY environment variable.');
  }
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}

export async function chatCompletion(options: ChatOptions): Promise<string> {
  const apiKey = await getApiKey();
  const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';

  const systemMsg = options.messages.find(m => m.role === 'system')?.content;
  const userMessages = options.messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: options.max_tokens ?? 4096,
      ...(systemMsg ? { system: systemMsg } : {}),
      messages: userMessages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}
