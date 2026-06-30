import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../App';
import './AIAdvisor.css';

const API = 'http://localhost:4000';

const QUICK = [
  'How can I reduce my monthly expenses?',
  'Am I saving enough based on my transactions?',
  'Where is most of my money going?',
  'Give me a realistic budget for next month',
];

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
    </svg>
  );
}

export default function AIAdvisor() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([{
    role: 'ai',
    text: "Hi! I'm your AI Financial Advisor, powered by Llama 3.1 via Groq. I have access to your transaction history and can give you personalised advice. What would you like to know?",
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai/advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: 3, question: msg }),
      });
      const data = await res.json();
      const reply = data.advice || data.message || data.response
        || 'I could not generate a response. Please try again.';
      setMessages(m => [...m, { role: 'ai', text: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Could not reach the AI service. Make sure your backend is running on port 4000.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="ai-page">
      <div className="ai-header">
        <div className="ai-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5a4 4 0 00-4 4v1a4 4 0 004 4 4 4 0 004-4V9a4 4 0 00-4-4z"/>
            <path d="M8 9H5a2 2 0 000 4h1"/><path d="M16 9h3a2 2 0 010 4h-1"/>
            <path d="M9 18v1a3 3 0 006 0v-1"/>
          </svg>
        </div>
        <div>
          <p className="ai-name">AI Financial Advisor</p>
          <p className="ai-model">Llama 3.1 · Groq · Knows your transactions</p>
        </div>
        <div className="ai-live"><span className="live-dot" />Live</div>
      </div>

      <div className="chat-body">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg-wrap ${m.role}`}>
              {m.role === 'ai' && (
                <div className="msg-av">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5a4 4 0 00-4 4v1a4 4 0 004 4 4 4 0 004-4V9a4 4 0 00-4-4z"/>
                    <path d="M9 18v1a3 3 0 006 0v-1"/>
                  </svg>
                </div>
              )}
              <div className="bubble">{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="msg-wrap ai">
              <div className="msg-av">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5a4 4 0 00-4 4v1a4 4 0 004 4 4 4 0 004-4V9a4 4 0 00-4-4z"/>
                  <path d="M9 18v1a3 3 0 006 0v-1"/>
                </svg>
              </div>
              <div className="bubble typing"><span/><span/><span/></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="quick-bar">
          {QUICK.map((q, i) => (
            <button key={i} className="quick-chip" onClick={() => send(q)} disabled={loading}>
              {q}
            </button>
          ))}
        </div>

        <div className="input-bar">
          <textarea
            ref={inputRef}
            className="chat-input"
            rows={1}
            placeholder="Ask about your finances…  (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}