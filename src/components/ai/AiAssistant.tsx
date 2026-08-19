import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, User, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { generateAiResponse, getSuggestions } from '@/services/aiService';
import type { AiMessage } from '@/services/aiService';

// ─── Minimal markdown renderer ────────────────────────────────────────────────
// Handles **bold**, bullet lists, and | pipe tables — no extra deps.

function MdLine({ text }: { text: string }) {
  // Bold: **text**
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold">{p}</strong> : <span key={i}>{p}</span>
      )}
    </>
  );
}

function renderContent(raw: string): React.ReactNode {
  const lines = raw.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') { i++; continue; }

    // Table — collect consecutive pipe rows
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
      nodes.push(
        <div key={i} className="overflow-x-auto my-2">
          <table className="text-xs w-full border-collapse">
            {rows.map((row, ri) => {
              const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
              const Tag = ri === 0 ? 'th' : 'td';
              return (
                <tr key={ri} className={ri === 0 ? 'bg-slate-100' : ri % 2 === 0 ? 'bg-slate-50' : ''}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} className="px-2 py-1 border border-slate-200 text-left font-normal whitespace-nowrap">
                      <MdLine text={cell.trim()} />
                    </Tag>
                  ))}
                </tr>
              );
            })}
          </table>
        </div>
      );
      continue;
    }

    // Bullet
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const bullets: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('• '))) {
        bullets.push(lines[i].trim().replace(/^[-•]\s/, ''));
        i++;
      }
      nodes.push(
        <ul key={i} className="list-disc list-inside space-y-0.5 my-1 pl-1">
          {bullets.map((b, bi) => (
            <li key={bi} className="text-xs leading-relaxed"><MdLine text={b} /></li>
          ))}
        </ul>
      );
      continue;
    }

    // Heading-style bold line (starts with **)
    if (line.trim().startsWith('**') && line.trim().endsWith('**') && !line.includes('|')) {
      nodes.push(
        <p key={i} className="text-xs font-semibold text-slate-700 mt-2 mb-0.5">
          {line.trim().replace(/\*\*/g, '')}
        </p>
      );
      i++; continue;
    }

    // Normal line
    nodes.push(
      <p key={i} className="text-xs leading-relaxed text-slate-700">
        <MdLine text={line} />
      </p>
    );
    i++;
  }

  return <div className="flex flex-col gap-0.5">{nodes}</div>;
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: AiMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={['flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row'].join(' ')}>
      {/* Avatar */}
      <div className={[
        'flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full mt-0.5',
        isUser ? 'bg-brand-100' : 'bg-brand-600',
      ].join(' ')}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-brand-600" />
          : <Bot  className="w-3.5 h-3.5 text-white" />}
      </div>

      {/* Bubble */}
      <div className={[
        'max-w-[85%] rounded-xl px-3.5 py-2.5',
        isUser
          ? 'bg-brand-600 text-white rounded-tr-sm'
          : 'bg-white border border-surface-border rounded-tl-sm shadow-card',
      ].join(' ')}>
        {isUser
          ? <p className="text-xs text-white leading-relaxed">{msg.content}</p>
          : renderContent(msg.content)}
        {msg.agent && !isUser && (
          <p className="text-[10px] text-slate-300 mt-1.5 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {msg.agent}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-brand-600">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white border border-surface-border rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-card">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"
              style={{ animationDelay: i * 150 + 'ms' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AiAssistant() {
  const { user } = useAuth();
  const role = user?.role ?? 'CMS';
  const suggestions = getSuggestions(role);

  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: role === 'CMS'
        ? 'Hello! I can help you analyze ACO portfolio performance, risk profiles, quality metrics, and generate recommendations. What would you like to know?'
        : 'Hello! I can help you understand your cost drivers, quality improvement opportunities, provider performance, and peer comparisons. What would you like to know?',
      timestamp: new Date(),
      agent: 'OrchestratorAgent',
    },
  ]);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);
  const hasMessages = messages.length > 1;

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');

    const userMsg: AiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const reply = await generateAiResponse(q, role, user?.acoId);
    setMessages(prev => [...prev, reply]);
    setLoading(false);
  }, [loading, role, user?.acoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: role === 'CMS'
        ? 'Conversation cleared. What would you like to analyze?'
        : 'Conversation cleared. How can I help you?',
      timestamp: new Date(),
      agent: 'OrchestratorAgent',
    }]);
  };

  return (
    <>
      {/* FAB trigger */}
      <button
        onClick={() => setOpen(true)}
        className={[
          'fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl',
          'bg-brand-600 text-white shadow-card-lg hover:bg-brand-700 transition-colors duration-150',
          open ? 'hidden' : 'flex',
        ].join(' ')}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-semibold">AI Assistant</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[380px] h-[580px] bg-white rounded-2xl shadow-card-lg border border-surface-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-950 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-500">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-none">AI Assistant</p>
                <p className="text-[10px] text-brand-400 mt-0.5">ContractIQ Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 bg-slate-50">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — show only on welcome state */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 flex flex-col gap-1.5 border-t border-surface-border bg-white flex-shrink-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Suggested</p>
              <div className="flex flex-col gap-1">
                {suggestions.slice(0, 3).map(s => (
                  <button
                    key={s.id}
                    onClick={() => send(s.text)}
                    className="text-left text-xs text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors truncate"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 border-t border-surface-border bg-white flex-shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about performance…"
              disabled={loading}
              className="flex-1 text-xs bg-slate-50 border border-surface-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-slate-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
