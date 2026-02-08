
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithModel, getSystemInstruction } from '../services/aiService';
import { calculateSEDA } from '../services/sedaCalculator';
import { assembleGlobalContext, contextToPromptBlock, parseUICommands, UICommand } from '../services/globalContext';
import { Message, UserProfile } from '../types';

interface ChatbotProps {
  user: UserProfile;
}

/* ─── Context-Aware Keyword Detection ───────────────────────── */
const RELATIONAL_KEYWORDS = ['partner', 'mother', 'father', 'parent', 'sibling', 'friend', 'boss', 'colleague', 'relationship', 'argument', 'conflict', 'triangul', 'blame', 'scapegoat', 'mediator', 'stuck between', 'taking sides'];
const PATTERN_KEYWORDS = ['always', 'keep doing', 'every time', 'same thing', 'repeating', 'loop', 'cycle', 'pattern', 'habit', 'again and again'];
const TRANSIT_KEYWORDS = ['right now', 'today', 'this week', 'currently', 'lately', 'energy today', 'weather', 'transit', 'what\'s happening'];

const detectIntent = (text: string): string[] => {
  const lower = text.toLowerCase();
  const intents: string[] = [];
  if (RELATIONAL_KEYWORDS.some(k => lower.includes(k))) intents.push('RELATIONAL');
  if (PATTERN_KEYWORDS.some(k => lower.includes(k))) intents.push('PATTERN');
  if (TRANSIT_KEYWORDS.some(k => lower.includes(k))) intents.push('TRANSIT');
  return intents;
};

export const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState({ score: 50, status: 'SAFE' });
  const [contextActive, setContextActive] = useState(false);
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

    // Check if unified memory is active
    const ctx = assembleGlobalContext();
    setContextActive(!!(ctx.blueprint || (ctx.echo && ctx.echo.loops.length > 0) || ctx.transits));
  }, [messages, user]);

  /* ─── UI Bridge — handle CMD responses from AI ──────────── */
  const handleUICommands = useCallback((commands: UICommand[]) => {
    const viewRoutes: Record<string, string> = {
      SHOW_TRANSITS: '/dashboard',
      SHOW_ECHO: '/echo',
      SHOW_TRIANGULATION: '/orbit',
      SHOW_SIGNAL: '/signal',
      SHOW_SEDA: '/safe-place',
    };
    const namedRoutes: Record<string, string> = {
      lab: '/dashboard', forge: '/chatbot', archive: '/echo',
      orbit: '/orbit', signal: '/signal', blueprint: '/manual',
    };
    commands.forEach(cmd => {
      if (cmd.type === 'NAVIGATE') {
        const route = namedRoutes[cmd.target.toLowerCase()];
        if (route) navigate(route);
      } else {
        const route = viewRoutes[cmd.type];
        if (route) navigate(route);
      }
    });
  }, [navigate]);

  const handleSend = async (overrideInput?: string) => {
    const msgContent = overrideInput || input;
    if (!msgContent.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: msgContent };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Assemble global context for unified memory
      const globalCtx = assembleGlobalContext();
      const contextBlock = contextToPromptBlock(globalCtx);

      // Detect user intent for context-aware engine calling
      const intents = detectIntent(msgContent);
      let contextEnrichment = '';

      if (intents.includes('RELATIONAL')) {
        contextEnrichment += `\n[TRIANGULATION ALERT]\nUser is describing a relational dynamic. Analyze for stabilizer/scapegoat/relief-valve patterns. Suggest they run a full Orbit analysis with the people involved. If appropriate, use CMD:SHOW_TRIANGULATION.\n`;
      }
      if (intents.includes('PATTERN')) {
        contextEnrichment += `\n[PATTERN ALERT]\nUser describes a recurring loop. Reference their Echo patterns from Global Context. Help them see the pattern structurally.\n`;
      }
      if (intents.includes('TRANSIT')) {
        contextEnrichment += `\n[TRANSIT REQUEST]\nUser asking about current energy. Reference Current Weather from Global Context.\n`;
      }

      // Build system prompt: Puck persona + global context + intent enrichment + UI bridge
      const baseInstruction = getSystemInstruction(user, 'PUCK');
      const fullPrompt = `${baseInstruction}${contextBlock}${contextEnrichment}\n\n[UI BRIDGE]\nYou can embed commands to trigger panels: CMD:SHOW_TRANSITS, CMD:SHOW_ECHO, CMD:SHOW_TRIANGULATION, CMD:SHOW_SIGNAL, CMD:SHOW_SEDA. Use sparingly, at end of response.`;

      const responseText = await chatWithModel({
        systemPrompt: fullPrompt,
        userMessage: msgContent,
        maxTokens: 2048,
        temperature: 0.7,
      });

      // Parse UI commands from response
      const { cleanText, commands } = parseUICommands(responseText || '');
      setMessages(prev => [...prev, { role: 'model', content: cleanText || "I couldn't generate a response. Try again?" }]);
      
      // Execute any UI Bridge commands
      if (commands.length > 0) {
        setTimeout(() => handleUICommands(commands), 800);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: `Something went wrong. Let’s try that again. (${err.message})` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalibrate = () => {
    const recalibrateMsg = "That last response didn't feel right. Can you try a different angle on what I shared?";
    handleSend(recalibrateMsg);
  };

  const handleConfirm = () => {
    setMessages(prev => [...prev, { role: 'user', content: "That resonated. Thank you." }]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DANGER': return 'text-red-500 border-red-500 bg-red-500/10';
      case 'CAUTION': return 'text-neutral-300 border-neutral-300 bg-neutral-300/10';
      default: return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 md:p-10 overflow-hidden h-full safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-none">The Forge</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-[0.15em]">Your singular intelligence</p>
            {contextActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">Context Active</span>
              </motion.div>
            )}
          </div>
        </div>
        <button 
          onClick={() => { if(confirm("Clear conversation?")) setMessages([]); }}
          className="p-2 text-neutral-600 hover:text-red-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </motion.div>
      
      <div className="flex-1 bg-neutral-900/40 border border-neutral-800/50 rounded-[40px] flex flex-col overflow-hidden relative shadow-inner">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-8">
               <div className="relative">
                 <div className="w-20 h-20 bg-white/[0.04] rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden">
                   <div className="absolute inset-0 animate-shimmer opacity-50" />
                   <svg className="w-10 h-10 text-white/60 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                   </svg>
                 </div>
                 <div className="absolute -inset-4 bg-white/[0.02] blur-2xl rounded-full -z-10 animate-breathe" />
               </div>
               <div className="max-w-md">
                 <h3 className="text-lg font-bold text-white mb-2">The Forge is ready</h3>
                 <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                   This is your singular intelligence. Ask anything — The Forge has access to your blueprint, echo patterns, transit weather, and stability score.
                 </p>
                 <div className="grid grid-cols-1 gap-2 text-left">
                   {[
                     'Why do I keep repeating this pattern?',
                     "What's happening with my energy today?",
                     "How do I work with someone who's a [Type]?",
                     'Show me my relational geometry',
                   ].map((prompt, i) => (
                     <motion.button
                       key={i}
                       initial={{ opacity: 0, y: 8 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 * i }}
                       onClick={() => { setInput(prompt); }}
                       className="text-xs text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-neutral-400 hover:text-white"
                     >
                       {prompt}
                     </motion.button>
                   ))}
                 </div>
               </div>
            </div>
          )}
          
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[90%] md:max-w-[75%] space-y-2`}>
                <div className={`p-6 rounded-[32px] text-xs leading-relaxed shadow-sm transition-all ${
                  m.role === 'user' ? 'bg-white text-black font-medium' : 'bg-neutral-800/50 text-neutral-200 border border-neutral-700/50'
                }`}>
                  {m.content}
                </div>
              </div>
              
              {/* Reality Check / Calibration UI - Show only for the latest message if it is from the model */}
              {m.role === 'model' && i === messages.length - 1 && !loading && (
                <div className="flex gap-3 mt-2 ml-4 text-[9px] uppercase tracking-wider font-medium text-neutral-500 animate-in fade-in duration-500">
                  <span>Did this land?</span>
                  <button 
                    onClick={handleConfirm}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    This resonates
                  </button>
                  <button 
                    onClick={handleRecalibrate}
                    className="hover:text-neutral-300 transition-colors flex items-center gap-1"
                  >
                    Not quite
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 p-5 bg-white/[0.03] rounded-[32px] border border-white/[0.06] w-fit"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-neutral-400"
                      animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                    />
                  ))}
                </div>
                <span className="text-[9px] font-medium text-neutral-500 uppercase tracking-[0.2em]">Processing…</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-4" />
        </div>
        
        <div className="p-6 md:p-8 border-t border-neutral-800/50 bg-black/40 backdrop-blur-md">
          <div className="flex gap-4 max-w-4xl mx-auto">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="What's on your mind…"
              className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-[28px] px-8 py-5 text-xs focus:border-white/40 focus:bg-neutral-800 outline-none transition-all placeholder:text-neutral-600"
            />
            <button 
              onClick={() => handleSend()}
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
