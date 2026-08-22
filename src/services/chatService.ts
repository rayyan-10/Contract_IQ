/**
 * chatService — Calls POST /chat (no auth required)
 *
 * Request:  { message, aco_id?, conversation_history }
 * Response: { reply, aco_id, sources, suggested_questions }
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  acoId: string;
  sources: string[];
  suggestedQuestions: string[];
}

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[],
  acoId?: string
): Promise<ChatResponse> {
  const res = await fetch(API_BASE + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      aco_id: acoId || undefined,
      conversation_history: conversationHistory,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Chat API ' + res.status + ': ' + text);
  }

  const data = await res.json();

  return {
    reply: String(data.reply ?? ''),
    acoId: String(data.aco_id ?? ''),
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    suggestedQuestions: Array.isArray(data.suggested_questions) ? data.suggested_questions.map(String) : [],
  };
}
