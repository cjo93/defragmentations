
import React, { useState } from 'react';
import { getGeminiInstance } from '../services/geminiService';
import { Message, GroundingChunk } from '../types';

export const IntelligenceHub: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'maps'>('search');

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = getGeminiInstance();
      // Search grounding uses gemini-3-flash-preview, Maps uses gemini-2.5 series
      const modelName = mode === 'search' ? 'gemini-3-flash-preview' : 'gemini-2.5-flash-lite-latest';
      const tools: any[] = mode === 'search' ? [{ googleSearch: {} }] : [{ googleMaps: {} }];
      
      const config: any = { tools };
      
      if (mode === 'maps') {
        // Mocking geo location for maps grounding as fallback, 
        // in real use we would navigator.geolocation.getCurrentPosition
        config.toolConfig = {
          retrievalConfig: {
            latLng: { latitude: 37.7749, longitude: -122.4194 } // SF Default
          }
        };
      }

      // Standardize contents format as an array of parts
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: input }] }],
        config
      });

      // Fix: Cast grounding chunks from response candidates to our local GroundingChunk type
      const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      const modelMsg: Message = {
        role: 'model',
        content: response.text || "I couldn't generate a response.",
        grounding: grounding
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Error communicating with intelligence module." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter">Intelligence Hub</h2>
          <p className="text-neutral-500">Research tool grounded in real-world data from Google Search & Maps.</p>
        </div>
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-2xl p-1">
          <button
            onClick={() => setMode('search')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'search' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Google Search
          </button>
          <button
            onClick={() => setMode('maps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'maps' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Google Maps
          </button>
        </div>
      </div>

      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  mode === 'search' ? 'bg-blue-600/10 text-blue-500' : 'bg-emerald-600/10 text-emerald-500'
                }`}>
                  {mode === 'search' ? (
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </div>
                <h3 className="text-xl font-bold">Ask anything about {mode === 'search' ? 'the current web' : 'places & geography'}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  {mode === 'search' 
                    ? "Get up-to-date facts about recent news, sports, or trends with full source citations."
                    : "Find restaurants, venues, and transit info nearby or across the globe."}
                </p>
             </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] space-y-3 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' : 'bg-neutral-800/50 text-neutral-300 border border-neutral-800'
                }`}>
                  {m.content}
                </div>
                {m.grounding && m.grounding.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.grounding.map((chunk, j) => {
                      const link = chunk.web || chunk.maps;
                      if (!link) return null;
                      return (
                        <a 
                          key={j} 
                          href={link.uri || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-bold text-neutral-400 hover:text-white hover:border-neutral-600 transition-all"
                        >
                          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          {link.title?.substring(0, 30) || 'Source'}{link.title && link.title.length > 30 ? '...' : ''}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-1 items-center px-4">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={mode === 'search' ? "Search the web for news..." : "Find nearby restaurants..."}
              className="flex-1 bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-8 py-4 bg-white text-black font-bold rounded-2xl text-sm hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
