
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiInstance, getSystemInstruction } from '../services/geminiService';
import { calculateSEDA } from '../services/sedaCalculator';
import { Message, UserProfile } from '../types';

interface ChatbotProps {
  user: UserProfile;
}

export const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState({ score: 50, status: 'SAFE' });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persistent storage unique to each user profile
  useEffect(() => {
    const key = `defrag_chat_v2_${user}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`defrag_chat_v2_${user}`, JSON.stringify(messages));
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    
    // Recalculate SEDA Score based on recent conversation context
    if (messages.length > 0) {
      const recentContext = messages.slice(-5).map(m => m.content).join(' ');
      const seda = calculateSEDA(recentContext);
      setRiskAssessment({ score: seda.score, status: seda.status });
    }
  }, [messages, user]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const ai = getGeminiInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: currentInput,
        config: {
          systemInstruction: getSystemInstruction(user),
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      setMessages(prev => [...prev, { role: 'model', content: response.text || "Kernel Error: Null response." }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: `Kernel Fault: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DANGER': return 'text-red-500 border-red-500 bg-red-500/10';
      case 'CAUTION': return 'text-amber-500 border-amber-500 bg-amber-500/10';
      default: return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 overflow-hidden h-full safe-bottom">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase leading-none">Deep Think Hub</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Profile: {user}</p>
            <div className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${getStatusColor(riskAssessment.status)}`}>
               SEDA STATUS: {riskAssessment.status} ({Math.round(riskAssessment.score)}%)
            </div>
          </div>
        </div>
        <button 
          onClick={() => { if(confirm("Clear logic history?")) setMessages([]); }}
          className="p-2 text-neutral-600 hover:text-red-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      
      <div className="flex-1 bg-neutral-900/40 border border-neutral-800/50 rounded-[40px] flex flex-col overflow-hidden relative shadow-inner">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
               <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center mb-6">
                 <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75V19a1 1 0 01-1 1h-2a1 1 0 01-1 1v-.25a3.374 3.374 0 00-.814-2.206l-.548-.547z" /></svg>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Structural Core Ready</p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[75%] space-y-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-6 rounded-[32px] text-xs leading-relaxed shadow-sm transition-all ${
                  m.role === 'user' ? 'bg-white text-black font-medium' : 'bg-neutral-800/50 text-neutral-200 border border-neutral-700/50'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[32px] border border-white/5 w-fit animate-pulse">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em]">Mapping Logic Gates...</span>
            </div>
          )}
          <div className="h-4" />
        </div>
        
        <div className="p-6 md:p-8 border-t border-neutral-800/50 bg-black/40 backdrop-blur-md">
          <div className="flex gap-4 max-w-4xl mx-auto">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inject Logic String..."
              className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-[28px] px-8 py-5 text-xs focus:border-white/40 focus:bg-neutral-800 outline-none transition-all placeholder:text-neutral-600"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-full hover:bg-neutral-200 active:scale-90 transition-all shadow-xl disabled:opacity-30 disabled:pointer-events-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
