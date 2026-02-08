
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithModel, scanForShadows } from '../services/aiService';
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
      // 1. Contextual Scanning (Framework Awareness)
      let frameworkContext = "";
      let activeShadows: string[] = [];
      let userGates: number[] = [];

      if (userData && userData.personality && userData.personality.gates) {
        userGates = userData.personality.gates;
        
        frameworkContext += "\n[SUBJECT ARCHITECTURE]:\n";
        userGates.forEach(gate => {
          const f = getFrequency(gate);
          frameworkContext += `- Gate ${gate}: Shadow(${f.shadow}) → Gift(${f.gift})\n`;
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

      const responseText = await chatWithModel({
        systemPrompt,
        userMessage: input,
        maxTokens: 2048,
        temperature: 0.7,
      });

      const modelMsg: Message = {
        role: 'model',
        content: responseText || "I couldn't generate a response.",
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
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="p-6 border-b border-white/[0.04] bg-white/[0.02] backdrop-blur-2xl"
      >
        <h2 className="text-xl font-bold text-white tracking-tight">Research</h2>
        <p className="text-white/40 text-sm">Deep analytical queries processed through structural intelligence.</p>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <div className="w-14 h-14 border border-white/[0.08] rounded-full flex items-center justify-center mb-5">
                 <div className="w-2 h-2 bg-[#E2E2E8]/40 rounded-full shadow-[0_0_8px_rgba(226,226,232,0.2)]" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">What would you like to explore?</p>
           </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col w-full ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-white text-black font-medium' 
                : 'bg-white/[0.03] text-[#A3A3A3] border border-white/[0.06] backdrop-blur-sm'
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
          </motion.div>
        ))}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex justify-start"
            >
              <div className="bg-white/[0.03] rounded-2xl p-4 flex gap-1.5 items-center border border-white/[0.06]">
                {[0, 1, 2].map(d => (
                  <motion.div
                    key={d}
                    className="w-1.5 h-1.5 bg-[#E2E2E8]/50 rounded-full"
                    animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.12, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/[0.04] bg-[#050505]/60 backdrop-blur-2xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="What would you like to explore…"
            className="flex-1 bg-black/20 border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#E2E2E8]/50 focus:ring-1 focus:ring-[#E2E2E8]/30 outline-none transition-all placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3.5 bg-white text-black font-medium rounded-xl text-sm hover:bg-neutral-50 disabled:opacity-30 transition-all"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};
