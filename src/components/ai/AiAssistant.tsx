import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, User, RotateCcw, Database } from 'lucide-react';
import { sendChatMessage, type ChatMessage, type ChatResponse } from '@/services/chatService';

// ─── Markdown-lite renderer ───────────────────────────────────────────────────

function MdLine({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i} className="font-semibold text-maroon-900">{p}</strong> : <span key={i}>{p}</span>
      )}
    </>
  );
}

function renderMarkdown(raw: string): React.ReactNode {
  const lines = raw.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    // Pipe table detection
    if (line.trim().startsWith('|') && line.includes('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter out separator rows (|---|---|)
      const dataRows = tableLines.filter(l => !l.match(/^\|[\s\-:|]+\|$/));
      if (dataRows.length > 0) {
        nodes.push(
          <div key={'tbl-' + i} className="overflow-x-auto my-2 rounded-lg border border-cream-300">
            <table className="w-full text-[10px]">
              <tbody>
                {dataRows.map((row, ri) => {
                  const cells = row.split('|').slice(1, -1).map(c => c.trim());
                  const isHeader = ri === 0;
                  return (
                    <tr key={ri} className={isHeader ? 'bg-cream-200' : ri % 2 === 0 ? 'bg-cream-100' : 'bg-white'}>
                      {cells.map((cell, ci) => {
                        const Tag = isHeader ? 'th' : 'td';
                        return (
                          <Tag key={ci} className={['px-2 py-1.5 border-b border-cream-200 text-left', isHeader ? 'font-bold text-maroon-900' : 'text-maroon-800/70'].join(' ')}>
                            <MdLine text={cell} />
                          </Tag>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Numbered list (1. 2. 3.)
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      nodes.push(
        <ol key={'ol-' + i} className="space-y-1.5 my-1.5 pl-1">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[9px] font-bold text-amber-700 mt-0.5">{ii + 1}</span>
              <MdLine text={item} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Bullet list
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
      const bullets: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('• ') || lines[i].trim().startsWith('* '))) {
        bullets.push(lines[i].trim().replace(/^[-•*]\s/, ''));
        i++;
      }
      nodes.push(
        <ul key={'ul-' + i} className="space-y-1 my-1.5">
          {bullets.map((b, bi) => (
            <li key={bi} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
              <MdLine text={b} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Heading (### or ##)
    if (line.trim().startsWith('#')) {
      const text = line.replace(/^#+\s*/, '');
      nodes.push(<p key={'h-' + i} className="text-xs font-bold text-maroon-900 mt-2.5 mb-1"><MdLine text={text} /></p>);
      i++; continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      nodes.push(<hr key={'hr-' + i} className="border-cream-300 my-2" />);
      i++; continue;
    }

    // Normal line
    nodes.push(<p key={'p-' + i} className="text-xs leading-relaxed text-maroon-800/80"><MdLine text={line} /></p>);
    i++;
  }

  return <div className="flex flex-col gap-0.5">{nodes}</div>;
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={['flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row'].join(' ')}>
      <div className={[
        'flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full mt-0.5',
        isUser ? 'bg-cream-200 border border-cream-300' : 'bg-maroon-900',
      ].join(' ')}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-maroon-900" />
          : <Bot  className="w-3.5 h-3.5 text-amber-400" />}
      </div>
      <div className={[
        'max-w-[85%] rounded-2xl px-4 py-3',
        isUser
          ? 'bg-maroon-900 text-cream-100 rounded-tr-sm'
          : 'bg-white border border-cream-300 rounded-tl-sm',
      ].join(' ')} style={!isUser ? { boxShadow: '0 1px 3px rgba(61,21,21,0.04)' } : undefined}>
        {isUser
          ? <p className="text-xs leading-relaxed">{msg.content}</p>
          : <div className="text-maroon-800/80">{renderMarkdown(msg.content)}</div>}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex gap-2.5">
      <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-maroon-900">
        <Bot className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <div className="bg-white border border-cream-300 rounded-2xl rounded-tl-sm px-4 py-3" style={{ boxShadow: '0 1px 3px rgba(61,21,21,0.04)' }}>
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: i * 150 + 'ms' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AiAssistant() {
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  // Focus input on open
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(q, messages);
      setMessages(prev => [
        ...prev,
        { role: 'user', content: q },
        { role: 'assistant', content: response.reply },
      ]);
      setLastResponse(response);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: q },
        { role: 'assistant', content: 'Unable to connect to the server. Please try again.' },
      ]);
      setLastResponse(null);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); send(input); };
  const handleReset  = () => { setMessages([]); setLastResponse(null); };

  return (
    <>
      {/* FAB trigger */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-maroon-900 text-cream-100 shadow-card-lg hover:shadow-card-lg transition-all duration-200 hover:-translate-y-0.5 group"
          aria-label="Open AI Assistant">
          <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-semibold">AI Assistant</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] h-[600px] bg-cream-100 rounded-2xl shadow-card-lg border border-cream-300 overflow-hidden animate-scale-in">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-maroon-900 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-cream-100 leading-none">ContractIQ Assistant</p>
                <p className="text-[10px] text-cream-400 mt-0.5">ACO Performance Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button onClick={handleReset}
                  className="p-1.5 rounded-lg text-cream-400 hover:text-cream-100 hover:bg-white/10 transition-colors" aria-label="Clear">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-cream-400 hover:text-cream-100 hover:bg-white/10 transition-colors" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {/* Welcome message if no messages */}
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-sm font-bold text-maroon-900">How can I help you?</p>
                <p className="text-xs text-maroon-800/50 leading-relaxed">
                  Ask me about ACO performance, quality scores, risk predictions, financials, or comparisons.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Suggested questions — inline after last message */}
            {lastResponse && lastResponse.suggestedQuestions.length > 0 && !loading && messages.length > 0 && (
              <div className="pl-10">
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {lastResponse.suggestedQuestions.map((q, i) => (
                    <button key={i} onClick={() => send(q)}
                      className="text-left text-[11px] text-maroon-900 bg-cream-200 hover:bg-amber-50 border border-cream-300 hover:border-amber-200 px-2.5 py-1.5 rounded-lg transition-all font-medium">
                      {q}
                    </button>
                  ))}
                </div>
                {lastResponse.sources.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-[9px] text-maroon-800/30">
                    <Database className="w-3 h-3" />
                    <span>{lastResponse.sources[0]}</span>
                  </div>
                )}
              </div>
            )}

            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Initial suggestions (no messages yet) */}
          {messages.length === 0 && !loading && (
            <div className="px-4 py-3 border-t border-cream-300 bg-white flex-shrink-0">
              <p className="text-[9px] font-bold text-maroon-800/40 uppercase tracking-wider mb-2">Try asking</p>
              <div className="flex flex-col gap-1.5">
                {[
                  'How is A00001 performing on quality?',
                  'Which ACOs are under high risk?',
                  'Compare A00001 and A00002',
                ].map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-left text-xs text-maroon-900 bg-cream-200 hover:bg-amber-50 border border-cream-300 hover:border-amber-200 px-3 py-2 rounded-xl transition-all font-medium">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t border-cream-300 bg-white flex-shrink-0">
            <input ref={inputRef} type="text" value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about ACO performance…"
              disabled={loading}
              className="flex-1 text-xs bg-cream-100 border border-cream-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 placeholder:text-maroon-800/30 text-maroon-900 disabled:opacity-50 transition-all"
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-maroon-900 text-amber-400 hover:bg-maroon-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
