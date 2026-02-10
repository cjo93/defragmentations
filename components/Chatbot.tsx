
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithModel, getSystemInstruction, generateSpeech, scanForShadows } from '../services/aiService';
import { getFrequency } from '../services/frequencies';
import { assembleGlobalContext, contextToPromptBlock, parseUICommands, UICommand } from '../services/globalContext';
import { loadGlobalMemory, hydrateMemory, parseMemoryUpdates, applyMemoryUpdates, processFileUpload, addUploadToMemory, buildUploadPrompt } from '../services/globalMemory';
import { Message, UserProfile, UploadedAsset } from '../types';
import { ChatCanvas } from './ChatCanvas';
import { FrequencyTuner } from './visuals/FrequencyTuner';

interface ChatbotProps {
  user: UserProfile;
}

/* ─── Context-Aware Keyword Detection ───────────────────────── */
const RELATIONAL_KEYWORDS = ['partner', 'mother', 'father', 'parent', 'sibling', 'friend', 'boss', 'colleague', 'relationship', 'argument', 'conflict', 'triangul', 'blame', 'scapegoat', 'mediator', 'stuck between', 'taking sides'];
const PATTERN_KEYWORDS = ['always', 'keep doing', 'every time', 'same thing', 'repeating', 'loop', 'cycle', 'pattern', 'habit', 'again and again'];
const TRANSIT_KEYWORDS = ['right now', 'today', 'this week', 'currently', 'lately', 'energy today', 'weather', 'transit', 'what\'s happening'];
const DISTRESS_KEYWORDS = ['anxious', 'panic', 'can\'t breathe', 'overwhelmed', 'spiraling', 'falling apart', 'can\'t cope', 'help me', 'scared', 'numb'];
const BLUEPRINT_KEYWORDS = ['my design', 'my type', 'my blueprint', 'how am i built', 'my architecture', 'my centers', 'my profile', 'my chart', 'who am i'];
const SHADOW_KEYWORDS = ['shadow', 'gift', 'frequency', 'inversion', 'gene key', 'gate'];

const detectIntent = (text: string): string[] => {
  const lower = text.toLowerCase();
  const intents: string[] = [];
  if (RELATIONAL_KEYWORDS.some(k => lower.includes(k))) intents.push('RELATIONAL');
  if (PATTERN_KEYWORDS.some(k => lower.includes(k))) intents.push('PATTERN');
  if (TRANSIT_KEYWORDS.some(k => lower.includes(k))) intents.push('TRANSIT');
  if (DISTRESS_KEYWORDS.some(k => lower.includes(k))) intents.push('DISTRESS');
  if (BLUEPRINT_KEYWORDS.some(k => lower.includes(k))) intents.push('BLUEPRINT');
  if (SHADOW_KEYWORDS.some(k => lower.includes(k))) intents.push('SHADOW');
  return intents;
};

/* ─── Canvas Instructions for System Prompt ─────────────────── */
const CANVAS_INSTRUCTIONS = `
[CANVAS SYSTEM — Inline Feature Rendering]
You can trigger visual canvases that render inline in the chat. Use these when appropriate:

[CANVAS:BLUEPRINT] — Shows the user's full blueprint (type, strategy, authority, centers). Use when they ask about their design, profile, or how they're built.
[CANVAS:BREATHING] — Opens a guided breathing exercise. Use when the user is distressed, overwhelmed, or asks for grounding.
[CANVAS:PATTERN] — Shows their recurring patterns from journal entries. Use when discussing loops, habits, or repeating themes.
[CANVAS:EXPLAIN:Topic Name] — Creates a concept explainer card for a topic you just explained. Use when teaching complex ideas like Bowen triangulation, gate frequencies, shadow/gift dynamics, etc.

Rules:
- Place the canvas tag at the END of your response, after your text explanation.
- Only use ONE canvas per response.
- Always provide helpful text context BEFORE triggering a canvas.
- If the user is in crisis, ALWAYS use [CANVAS:BREATHING] before analysis.
- For concept explanations, include the topic name: [CANVAS:EXPLAIN:Bowen Triangulation]
`;

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const SESSIONS_KEY = (user: string) => `defrag_sessions_${user}`;
const ACTIVE_KEY = (user: string) => `defrag_active_session_${user}`;

const loadSessions = (user: string): ChatSession[] => {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY(user)) || '[]'); } catch { return []; }
};

const saveSessions = (user: string, sessions: ChatSession[]) => {
  localStorage.setItem(SESSIONS_KEY(user), JSON.stringify(sessions));
};

const generateTitle = (msgs: Message[]): string => {
  const firstUser = msgs.find(m => m.role === 'user');
  if (!firstUser) return 'New session';
  const text = firstUser.content.slice(0, 50);
  return text.length < firstUser.content.length ? text + '…' : text;
};

export const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions(user));
  const [activeSessionId, setActiveSessionId] = useState<string>(() =>
    localStorage.getItem(ACTIVE_KEY(user)) || ''
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextActive, setContextActive] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<UploadedAsset | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [activeInversion, setActiveInversion] = useState<{ gate: number; shadow: string; gift: string } | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceActiveRef = useRef(false);

  // Load active session or create first one
  useEffect(() => {
    let allSessions = loadSessions(user);
    const savedActiveId = localStorage.getItem(ACTIVE_KEY(user)) || '';
    
    // Migrate from old single-chat format
    if (allSessions.length === 0) {
      const oldKey = `defrag_chat_v2_${user}`;
      const oldMsgs = localStorage.getItem(oldKey);
      let migratedMsgs: Message[] = [];
      if (oldMsgs) { try { migratedMsgs = JSON.parse(oldMsgs); } catch {} }
      
      const firstSession: ChatSession = {
        id: crypto.randomUUID(),
        title: migratedMsgs.length > 0 ? generateTitle(migratedMsgs) : 'New session',
        messages: migratedMsgs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allSessions = [firstSession];
      saveSessions(user, allSessions);
      setSessions(allSessions);
      setActiveSessionId(firstSession.id);
      setMessages(firstSession.messages);
      localStorage.setItem(ACTIVE_KEY(user), firstSession.id);
      return;
    }
    
    setSessions(allSessions);
    const active = allSessions.find(s => s.id === savedActiveId) || allSessions[0];
    setActiveSessionId(active.id);
    setMessages(active.messages);
    localStorage.setItem(ACTIVE_KEY(user), active.id);
  }, [user]);

  // Persist messages to active session
  useEffect(() => {
    if (!activeSessionId) return;
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    const memory = loadGlobalMemory();
    setContextActive(!!(memory.profile.type || memory.relationships.length > 0 || memory.patterns.length > 0));

    setSessions(prev => {
      const updated = prev.map(s => s.id === activeSessionId
        ? { ...s, messages, title: messages.length > 0 ? generateTitle(messages) : s.title, updatedAt: new Date().toISOString() }
        : s
      );
      saveSessions(user, updated);
      return updated;
    });
  }, [messages, activeSessionId, user]);

  const switchSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    setActiveSessionId(id);
    setMessages(session.messages);
    localStorage.setItem(ACTIVE_KEY(user), id);
    setShowSessions(false);
  };

  const newSession = () => {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New session',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [session, ...sessions];
    setSessions(updated);
    saveSessions(user, updated);
    setActiveSessionId(session.id);
    setMessages([]);
    localStorage.setItem(ACTIVE_KEY(user), session.id);
    setShowSessions(false);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    if (updated.length === 0) { newSession(); return; }
    setSessions(updated);
    saveSessions(user, updated);
    if (activeSessionId === id) {
      switchSession(updated[0].id);
    }
  };

  /* ─── Legacy UI Bridge (kept for backward compat) ────────── */
  const handleUICommands = useCallback((commands: UICommand[]) => {
    const viewRoutes: Record<string, string> = {
      SHOW_TRANSITS: '/dashboard',
      SHOW_ECHO: '/echo',
      SHOW_TRIANGULATION: '/orbit',
      SHOW_SIGNAL: '/signal',
      SHOW_SEDA: '/safe-place',
    };
    commands.forEach(cmd => {
      if (cmd.type !== 'NAVIGATE' && cmd.type !== 'SHOW_SIGNAL') {
        const route = viewRoutes[cmd.type];
        if (route) navigate(route);
      }
    });
  }, [navigate]);

  const handleSend = async (overrideInput?: string) => {
    const msgContent = overrideInput || input;
    if (!msgContent.trim() || loading) return;
    
    const currentUpload = pendingUpload;
    const userMsg: Message = { role: 'user', content: msgContent, attachment: currentUpload || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setPendingUpload(null);
    setLoading(true);

    try {
      // Hydrate global memory (pulls from all sources)
      let memory = hydrateMemory();

      // If there's an upload, add it to memory
      if (currentUpload) {
        memory = addUploadToMemory(memory, currentUpload);
      }

      // Assemble global context for transit weather
      const globalCtx = assembleGlobalContext();
      const contextBlock = contextToPromptBlock(globalCtx);

      // Detect user intent for context-aware enrichment
      const intents = detectIntent(msgContent);
      let contextEnrichment = '';

      if (intents.includes('DISTRESS')) {
        contextEnrichment += `\n[DISTRESS DETECTED]\nUser sounds overwhelmed. Validate first. Offer grounding. Use [CANVAS:BREATHING] to provide an immediate breathing exercise.\n`;
      }
      if (intents.includes('BLUEPRINT')) {
        contextEnrichment += `\n[BLUEPRINT REQUEST]\nUser is asking about their personal design. Explain their architecture clearly, then use [CANVAS:BLUEPRINT] to show their full map.\n`;
      }
      if (intents.includes('SHADOW')) {
        contextEnrichment += `\n[SHADOW/FREQUENCY REQUEST]\nUser is asking about shadow/gift frequencies. Identify the relevant gates, explain the shadow→gift inversion mechanic. Validate the shadow, explain the mechanic, then pivot to the gift frequency.\n`;
      }
      if (intents.includes('RELATIONAL')) {
        contextEnrichment += `\n[TRIANGULATION ALERT]\nUser is describing a relational dynamic. Analyze for structural friction patterns. Explain the dynamic clearly.\n`;
      }
      if (intents.includes('PATTERN')) {
        contextEnrichment += `\n[PATTERN ALERT]\nUser describes a recurring loop. Reference their patterns from Global Memory. Use [CANVAS:PATTERN] to show tracked patterns.\n`;
      }
      if (intents.includes('TRANSIT')) {
        contextEnrichment += `\n[TRANSIT REQUEST]\nUser asking about current energy. Reference Current Weather from Global Context.\n`;
      }

      // Build the user message — augment with upload context if present
      const userMessageForAI = currentUpload
        ? buildUploadPrompt(currentUpload, msgContent)
        : msgContent;

      // Build system prompt with canvas instructions + full memory
      const baseInstruction = getSystemInstruction(user, 'PUCK');

      // Shadow scanning — detect active shadows from user's gates
      let shadowContext = '';
      setActiveInversion(null);
      try {
        const userData = JSON.parse(localStorage.getItem('defrag_onboarding') || '{}');
        const userGates: number[] = userData?.personality?.gates || [];
        if (userGates.length > 0) {
          const detected = scanForShadows(msgContent, userGates);
          if (detected.length > 0) {
            setActiveInversion({ gate: detected[0].gate, shadow: detected[0].shadow, gift: detected[0].gift });
            const gateDetails = userGates.map(g => { const f = getFrequency(g); return `Gate ${g}: Shadow(${f.shadow}) → Gift(${f.gift})`; }).join('\n');
            shadowContext = `\n[SUBJECT GATE ARCHITECTURE]:\n${gateDetails}\n\n[DETECTED SHADOW ACTIVATION]: ${detected.map(d => `${d.shadow} (Gate ${d.gate})`).join(', ')}\n\n[PROTOCOL: ALCHEMICAL INVERSION]\n1. Validate the Shadow\n2. Explain the mechanic (why this gate produces this shadow)\n3. Pivot to Gift with a micro-action\n`;
          }
        }
      } catch {}

      const fullPrompt = `${baseInstruction}${contextBlock}${contextEnrichment}${shadowContext}${CANVAS_INSTRUCTIONS}`;

      const responseText = await chatWithModel({
        systemPrompt: fullPrompt,
        userMessage: userMessageForAI,
        maxTokens: 2048,
        temperature: 0.7,
      });

      // Parse memory updates from AI response
      const { cleanText: textAfterMemory, updates: memoryUpdates } = parseMemoryUpdates(responseText || '');
      
      // Apply memory updates if any
      if (memoryUpdates.length > 0) {
        memory = applyMemoryUpdates(memory, memoryUpdates);
      }

      // Parse canvas + legacy commands from cleaned response
      const { cleanText, commands, canvas } = parseUICommands(textAfterMemory);

      const aiMsg: Message = {
        role: 'model',
        content: cleanText || "Signal lost. Try sending that again.",
        canvas: canvas,
      };
      setMessages(prev => [...prev, aiMsg]);
      
      // Voice mode: speak the response via TTS
      if (voiceActiveRef.current && cleanText) {
        try {
          const audioBlob = await generateSpeech(cleanText.slice(0, 500));
          if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);
            audio.onended = () => URL.revokeObjectURL(url);
            audio.play().catch(() => {});
          }
        } catch {}
      }
      
      // Execute any legacy UI Bridge commands
      if (commands.length > 0) {
        setTimeout(() => handleUICommands(commands), 800);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: `Signal interrupted. Let's recalibrate. (${err.message})` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'text/plain', 'application/pdf'];
    const validExtensions = ['.txt', '.md', '.csv', '.json'];
    const isValidType = validTypes.includes(file.type) || validExtensions.some(ext => file.name.endsWith(ext));
    
    if (!isValidType) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'Supported formats: images (JPEG, PNG, WebP), text files (.txt, .md), and documents. Try again with a supported file.'
      }]);
      return;
    }

    // Size cap: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'File too large. Keep uploads under 5MB for now.'
      }]);
      return;
    }

    try {
      const asset = await processFileUpload(file);
      setPendingUpload(asset);
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'Failed to process that file. Try again.'
      }]);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRecalibrate = () => {
    handleSend("That last response didn't feel right. Can you try a different angle?");
  };

  const handleConfirm = () => {
    setMessages(prev => [...prev, { role: 'user', content: "That resonated. Thank you." }]);
  };

  /* ─── Voice Mode — Mic Toggle ─────────────────────────────── */
  const startVoice = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    
    voiceActiveRef.current = true;
    setVoiceActive(true);

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (final.trim()) {
        setInterimText('');
        handleSend(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.error('[Voice]', event.error);
    };

    recognition.onend = () => {
      if (voiceActiveRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setVoiceActive(false);
      voiceActiveRef.current = false;
    }
  }, []);

  const stopVoice = useCallback(() => {
    voiceActiveRef.current = false;
    setVoiceActive(false);
    setInterimText('');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => { return () => { stopVoice(); }; }, [stopVoice]);

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
            <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-[0.15em]">Your personal intelligence</p>
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
                <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">Memory Active</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-all"
            aria-label="Sessions"
            title="Chat sessions"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </button>
          <button
            onClick={newSession}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-all"
            aria-label="New session"
            title="New session"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          <button 
            onClick={() => { if(window.confirm("Clear this session?")) { setMessages([]); } }}
            className="p-2.5 rounded-xl text-neutral-600 hover:text-red-400 hover:bg-white/[0.04] transition-all"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </motion.div>
      
      <div className="flex-1 bg-neutral-900/40 border border-neutral-800/50 rounded-[40px] flex flex-col overflow-hidden relative shadow-inner">
        {/* Sessions Panel */}
        <AnimatePresence>
          {showSessions && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm rounded-[40px]"
                onClick={() => setShowSessions(false)}
              />
              <motion.div
                initial={{ x: -280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -280, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-0 bottom-0 z-50 w-72 bg-[#0A0A0A]/95 backdrop-blur-2xl border-r border-white/[0.06] rounded-l-[40px] flex flex-col overflow-hidden"
              >
                <div className="p-5 border-b border-white/[0.04] flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.12em]">Sessions</span>
                  <button onClick={newSession} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white/60 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all">
                    + New
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      className={`group flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                        s.id === activeSessionId
                          ? 'bg-white/[0.06] border border-white/[0.1]'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      }`}
                      onClick={() => switchSession(s.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-medium truncate ${s.id === activeSessionId ? 'text-white' : 'text-neutral-400'}`}>
                          {s.title}
                        </p>
                        <p className="text-[9px] text-neutral-600 mt-0.5">
                          {s.messages.length} messages
                        </p>
                      </div>
                      {sessions.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-neutral-600 hover:text-red-400 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-8">
               <div className="relative">
                 <div className="w-20 h-20 bg-white/[0.04] rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden">
                   <div className="card-inner-glow" style={{ opacity: 0.5 }} />
                   <svg className="w-10 h-10 text-white/60 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                   </svg>
                 </div>
                 <div className="absolute -inset-4 bg-white/[0.02] blur-2xl rounded-full -z-10 animate-breathe" />
               </div>
               <div className="max-w-md">
                 <h3 className="text-lg font-bold text-white mb-2">Ask me anything</h3>
                 <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                   I have your blueprint, patterns, and current influences loaded. Ask about yourself, your relationships, or what's happening in your life right now.
                 </p>
                 <div className="grid grid-cols-1 gap-2 text-left">
                   {[
                     'Ask about your design',
                     'Show me my blueprint',
                     'Why do I keep having the same argument?',
                     "What's influencing my energy today?",
                     'I\'m feeling overwhelmed right now',
                   ].map((prompt, i) => (
                     <motion.button
                       key={i}
                       initial={{ opacity: 0, y: 8 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 * i }}
                       onClick={() => handleSend(prompt)}
                       className="text-xs text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-neutral-400 hover:text-white cursor-pointer"
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
              <div className="max-w-[90%] md:max-w-[75%] space-y-2">
                {/* Upload attachment indicator */}
                {m.attachment && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] ${
                    m.role === 'user' ? 'bg-neutral-200 text-neutral-600' : 'bg-white/[0.04] text-neutral-500'
                  }`}>
                    {m.attachment.type === 'image' ? (
                      <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    )}
                    <span className="truncate">{m.attachment.filename}</span>
                  </div>
                )}
                
                <div className={`p-6 rounded-[28px] text-[13px] leading-relaxed shadow-sm transition-all ${
                  m.role === 'user' ? 'bg-white text-black font-medium' : 'bg-neutral-800/50 text-neutral-200 border border-neutral-700/50'
                }`}>
                  {m.content}
                </div>

                {/* Inline Canvas Rendering */}
                {m.canvas && <ChatCanvas canvas={m.canvas} />}
                
                {/* Shadow→Gift Frequency Tuner */}
                {m.role === 'model' && i === messages.length - 1 && activeInversion && (
                  <FrequencyTuner shadow={activeInversion.shadow} gift={activeInversion.gift} gate={activeInversion.gate} />
                )}
              </div>
              
              {/* Feedback UI — latest model message only */}
              {m.role === 'model' && i === messages.length - 1 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex items-center gap-2 mt-3 ml-4"
                >
                  <span className="text-[9px] uppercase tracking-wider font-medium text-neutral-600">Did this land?</span>
                  <button 
                    onClick={handleConfirm}
                    className="px-3 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-semibold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
                  >
                    Resonates
                  </button>
                  <button 
                    onClick={handleRecalibrate}
                    className="px-3 py-1.5 rounded-full text-[9px] uppercase tracking-wider font-semibold border border-white/[0.06] bg-white/[0.02] text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-300 transition-all"
                  >
                    Try again
                  </button>
                </motion.div>
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
                <span className="text-[9px] font-medium text-neutral-500 uppercase tracking-[0.2em]">Processing...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-4" />
        </div>
        
        <div className="p-6 md:p-8 border-t border-neutral-800/50 bg-black/40 backdrop-blur-md">
          {/* Voice mode indicator + interim text */}
          <AnimatePresence>
            {voiceActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-4xl mx-auto mb-3"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[11px] text-emerald-400/80 font-medium">
                    {interimText || 'Listening...'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Pending upload indicator */}
          <AnimatePresence>
            {pendingUpload && (
              <motion.div
                initial={{ opacity: 0, y: 8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="max-w-4xl mx-auto mb-3"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center">
                    {pendingUpload.type === 'image' ? (
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 truncate flex-1">{pendingUpload.filename}</span>
                  <button
                    onClick={() => setPendingUpload(null)}
                    className="p-1 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-neutral-300 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex gap-4 max-w-4xl mx-auto">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.txt,.md,.csv,.json,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-14 h-14 bg-white/[0.04] border border-white/[0.08] text-neutral-400 flex items-center justify-center rounded-full hover:bg-white/[0.08] hover:text-white active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Upload file"
              title="Upload photo or document"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>
            
            {/* Voice toggle */}
            <button
              onClick={voiceActive ? stopVoice : startVoice}
              className={`w-14 h-14 flex items-center justify-center rounded-full active:scale-95 transition-all ${
                voiceActive 
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30' 
                  : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:bg-white/[0.08] hover:text-white'
              }`}
              aria-label={voiceActive ? "Stop voice mode" : "Start voice mode"}
              title={voiceActive ? "Stop listening" : "Voice mode"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-8a3 3 0 016 0v1" /></svg>
            </button>
            
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={pendingUpload ? `Describe what you uploaded...` : "What's on your mind..."}
              className="flex-1 bg-neutral-800/50 border border-neutral-700/50 rounded-[28px] px-8 py-5 text-[13px] focus:border-white/40 focus:bg-neutral-800 outline-none transition-all placeholder:text-neutral-600"
              aria-label="Message input"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-14 h-14 bg-white text-black flex items-center justify-center rounded-full hover:bg-neutral-200 active:scale-95 transition-all shadow-lg disabled:opacity-20 disabled:pointer-events-none"
              aria-label="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
