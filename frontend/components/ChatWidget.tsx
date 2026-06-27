'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MessageSquare, X, Send, Sparkles, Bot, User, RefreshCw } from 'lucide-react';
import { BASE_API_URL } from '@/lib/config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your PhonicsFlow AI Tutor. 🎙️\n\nI have access to your practice history. You can ask me questions like:\n• *\"What sounds should I focus on?\"*\n• *\"How do I pronounce the /th/ sound?\"*\n• *\"Give me a quick word exercise to practice.\"*",
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // If not authenticated or loading, don't show the widget
  if (isLoading || !isAuthenticated || !user) return null;

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    // Add placeholder assistant message that will be populated by the stream
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`${BASE_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          studentId: user.role === 'student' ? user.id : undefined,
          userId: user.role === 'teacher' ? user.id : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf('\n');

        while (boundary !== -1) {
          const line = buffer.substring(0, boundary).trim();
          buffer = buffer.substring(boundary + 1);

          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                currentText += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    last.content = currentText;
                  }
                  return updated;
                });
              }
            } catch (err) {
              // incomplete line, wait for more data
            }
          }
          boundary = buffer.indexOf('\n');
        }
      }
    } catch (err) {
      console.error('Chat widget error:', err);
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          last.content = "I'm sorry, I couldn't reach the tutoring server. Please try again in a bit!";
        }
        return updated;
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  const formatText = (text: string) => {
    // Basic Markdown bold and list formatting
    return text.split('\n').map((line, idx) => {
      let content = line;
      // Bold **text**
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bold *text*
      content = content.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
        );
      }
      return (
        <p key={idx} className="text-sm min-h-[1em]" dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="w-[360px] sm:w-[390px] h-[520px] rounded-3xl overflow-hidden flex flex-col mb-4 animate-fade-in-up"
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(13, 148, 136, 0.2)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between text-white"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-['Outfit']">Phonics Coach</h3>
                <span className="text-[10px] text-teal-100 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Context Aware AI Tutor
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: '#fdf8f0' }}>
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end animate-fade-in'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4.5 h-4.5 text-teal-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm space-y-1.5 shadow-sm ${
                      isAssistant
                        ? 'bg-white border border-[#ece7df] text-gray-800 rounded-tl-none'
                        : 'bg-teal-600 text-white rounded-tr-none'
                    }`}
                  >
                    {msg.content === '' && isSending ? (
                      <div className="flex items-center gap-1.5 py-1">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                        <span className="text-xs text-gray-400 font-medium">Thinking...</span>
                      </div>
                    ) : (
                      formatText(msg.content)
                    )}
                  </div>
                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                      {user.role === 'student'
                        ? user.studentData?.name?.[0]?.toUpperCase() || 'S'
                        : user.teacherData?.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (only show if assistant is not thinking) */}
          {!isSending && messages.length <= 2 && (
            <div className="px-4 py-2 flex flex-wrap gap-2" style={{ background: '#fdf8f0' }}>
              {[
                "What sounds should I focus on?",
                "Tips to pronounce /th/?",
                "Give me a speaking exercise",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-teal-200/50 text-teal-700 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-300 transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t flex gap-2"
            style={{ borderColor: '#ece7df' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your phonics coach..."
              disabled={isSending}
              className="flex-1 px-4 py-2.5 rounded-full border border-[#ece7df] text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── Circular Floating Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all duration-200 relative group"
        style={{
          background: 'linear-gradient(135deg, #0d9488, #0f766e)',
        }}
        aria-label="Ask AI Tutor"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
}
