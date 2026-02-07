
import React, { useState } from 'react';
import { getGeminiInstance, scanForShadows } from '../services/geminiService';
import { getFrequency } from '../services/frequencies';
import { Message } from '../types';
import { calculateSEDA } from '../services/sedaCalculator';
import { FrequencyTuner } from './visuals/FrequencyTuner';

interface IntelligenceHubProps {
  manifest?: any;
  userData?: any;
}

interface InversionState {
  gate: number;
  shadow: string;
  gift: string;
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ manifest, userData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeInversion, setActiveInversion] = useState<InversionState | null>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setActiveInversion(null); // Reset on new message

    try {
      const ai = getGeminiInstance();
      
      // 1. Contextual Scanning (Framework Awareness)
      let frameworkContext = "";
      let activeShadows: string[] = [];
      let userGates: number[] = [];

      if (userData && userData.personality && userData.personality.gates) {
        userGates = userData.personality.gates;
        
        frameworkContext += "\n[USER HARDWARE SPECS]:\n";
        userGates.forEach(gate => {
          const f = getFrequency(gate);
          frameworkContext += `- Gate ${gate}: Shadow(${f.shadow}) -> Gift(${f.gift})\n`;
        });

        // Scan for shadows in the user text
        const detected = scanForShadows(input, userGates);
        detected.forEach(d => activeShadows.push(`${d.shadow} (Gate ${d.gate})`));
        
        // If shadows detected, trigger UI update
        if (detected.length > 0) {
          // Just take the first one for the UI visual to avoid clutter
          setActiveInversion({
            gate: detected[0].gate,
            shadow: detected[0].shadow,
            gift: detected[0].gift
          });
        }
      }

      const seda = calculateSEDA(input);
      const toneDirective = manifest?.SAFETY_PROTOCOL?.MODES?.[seda.toneDirective] || '';

      const systemPrompt = `
        ${manifest?.SYSTEM_PROMPTS?.CORE_IDENTITY || ''}
        ${manifest?.SAFETY_PROTOCOL?.UNIVERSAL_TONE || ''}
        
        [CURRENT TONE MODE]: ${seda.toneDirective} - ${toneDirective}
        
        [USER CONTEXT]
        Birth Data: ${JSON.stringify(userData)}
        Centers Defined: ${JSON.stringify(userData?.personality?.centers)}

        ${frameworkContext}

        [DETECTED SHADOW ACTIVATION]
        ${activeShadows.length > 0 ? `The user is speaking from these Shadows: ${activeShadows.join(', ')}` : "No direct keyword match, infer from context."}

        [PROTOCOL: ALCHEMICAL INVERSION]
        If a Shadow is present, do NOT fix it. INVERT it.
        
        1. **Validate the Shadow:** Acknowledge the heaviness (e.g., "It makes sense you feel [Shadow] right now.")
        2. **Identify the Mechanic:** Explain *why* this gate produces this shadow (e.g., "Gate 63 is designed to doubt so it can find the truth, but right now it's just spinning.")
        3. **Pivot to Gift:** Offer a micro-action to unlock the Gift frequency. (e.g., "To move from Doubt to Inquiry, ask a question you *can* answer.")

        [TRANSLATION LAYER]
        ${JSON.stringify(manifest?.PSYCH_TRANSLATION_LAYER?.CONCEPTS || {})}
        
        User Query: ${input}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: input }] }],
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const modelMsg: Message = {
        role: 'model',
        content: response.text || "I couldn't generate a response.",
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: "Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white tracking-tight">Intelligence Hub</h2>
        <p className="text-slate-500 text-sm">Ask about your design, friction points, or daily weather.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <p className="text-sm font-medium">Ready to analyze your blueprint.</p>
           </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col w-full ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-white text-black font-medium' 
                : 'bg-slate-800 text-slate-200 border border-white/5'
            }`}>
              {m.content}
            </div>
            {/* Show Frequency Tuner if this is the latest AI response and an inversion is active */}
            {m.role === 'model' && i === messages.length - 1 && activeInversion && (
              <div className="w-full max-w-[80%]">
                 <FrequencyTuner 
                    shadow={activeInversion.shadow} 
                    gift={activeInversion.gift} 
                    gate={activeInversion.gate} 
                 />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-800/50 rounded-2xl p-4 flex gap-2 items-center">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200" />
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-white transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
