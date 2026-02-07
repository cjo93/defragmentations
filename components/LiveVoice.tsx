import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { chatWithModel, getSystemInstruction, generateSpeech, transcribeAudioBlob } from '../services/geminiService';
import { calculateSEDA } from '../services/sedaCalculator';
import { UserProfile } from '../types';
import CinemaLayout from './layout/CinemaLayout';

interface LiveVoiceProps {
  user: UserProfile;
}

interface SavedSession {
  id: string;
  timestamp: string;
  logs: { role: string; text: string }[];
}

export const LiveVoice: React.FC<LiveVoiceProps> = ({ user }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>('Ready');
  const [transcription, setTranscription] = useState<{ role: string; text: string }[]>([]);
  const [volume, setVolume] = useState(0);
  const [tension, setTension] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [archive, setArchive] = useState<SavedSession[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [interimText, setInterimText] = useState('');

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const processingRef = useRef(false);

  // Load persisted data
  useEffect(() => {
    const logKey = `defrag_live_v3_${user}`;
    const archiveKey = `defrag_archive_${user}`;
    const savedLogs = localStorage.getItem(logKey);
    if (savedLogs) try { setTranscription(JSON.parse(savedLogs)); } catch {}
    const savedArchive = localStorage.getItem(archiveKey);
    if (savedArchive) try { setArchive(JSON.parse(savedArchive)); } catch {}
  }, [user]);

  // Persist transcription + silent SEDA
  useEffect(() => {
    localStorage.setItem(`defrag_live_v3_${user}`, JSON.stringify(transcription));
  }, [transcription, user]);

  const saveCurrentSession = () => {
    if (transcription.length === 0) return;
    const newSession: SavedSession = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      logs: [...transcription],
    };
    const updatedArchive = [newSession, ...archive];
    setArchive(updatedArchive);
    localStorage.setItem(`defrag_archive_${user}`, JSON.stringify(updatedArchive));
  };

  const filteredArchive = useMemo(() => {
    if (!archiveSearch.trim()) return archive;
    const lowerSearch = archiveSearch.toLowerCase();
    return archive.filter(s =>
      s.timestamp.toLowerCase().includes(lowerSearch) ||
      s.logs.some(l => l.text.toLowerCase().includes(lowerSearch))
    );
  }, [archive, archiveSearch]);

  // ── Process a complete user utterance ─────────────────────
  const processUtterance = useCallback(async (userText: string) => {
    if (!userText.trim() || processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    setStatus('Thinking…');

    // Add user message
    setTranscription(prev => [...prev, { role: 'User', text: userText }]);

    try {
      // Get AI response
      const systemPrompt = getSystemInstruction(user);
      const aiText = await chatWithModel({
        systemPrompt,
        userMessage: userText,
        maxTokens: 1024,
        temperature: 0.7,
      });

      // Add AI response to transcript
      setTranscription(prev => [...prev, { role: 'Architect', text: aiText }]);

      // Generate speech
      setStatus('Speaking…');
      const audioBlob = await generateSpeech(aiText.slice(0, 500)); // TTS limit
      if (audioBlob && activeRef.current) {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (activeRef.current) setStatus('Listening…');
        };
        await audio.play();
      } else {
        if (activeRef.current) setStatus('Listening…');
      }
    } catch (err) {
      console.error('[DEFRAG LIVE]', err);
      setTranscription(prev => [...prev, { role: 'Architect', text: 'Connection interrupted. Please try again.' }]);
      if (activeRef.current) setStatus('Listening…');
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [user]);

  // ── Volume visualization ──────────────────────────────────
  const startVolumeMonitor = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const update = () => {
        if (!analyzerRef.current) return;
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);
        setTension(prev => (prev * 0.95) + (average * 0.05));
        animationFrameRef.current = requestAnimationFrame(update);
      };
      update();
    } catch {}
  }, []);

  // ── Start session ─────────────────────────────────────────
  const startSession = useCallback(async () => {
    activeRef.current = true;
    setIsActive(true);
    setStatus('Listening…');

    await startVolumeMonitor();

    // Try Web Speech API first (browser-native, free)
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
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
          processUtterance(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        console.error('[Speech]', event.error);
      };

      recognition.onend = () => {
        // Auto-restart if session is still active
        if (activeRef.current && !processingRef.current) {
          try { recognition.start(); } catch {}
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.error('[Speech] Failed to start', err);
        setStatus('Speech recognition unavailable');
      }
    } else {
      setStatus('Speech recognition not supported in this browser');
    }
  }, [startVolumeMonitor, processUtterance]);

  // ── Stop session ──────────────────────────────────────────
  const stopSession = useCallback(() => {
    activeRef.current = false;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyzerRef.current = null;
    setIsActive(false);
    setStatus('Session ended');
    setVolume(0);
    setTension(0);
    setInterimText('');
  }, []);

  useEffect(() => { return () => stopSession(); }, [stopSession]);

  const getOrbStyles = () => {
    if (!isActive) return 'bg-neutral-800 border-2 border-white/5';
    if (isProcessing) return 'bg-neutral-400 shadow-[0_0_80px_rgba(226,226,232,0.4)] animate-pulse';
    return 'bg-neutral-300 shadow-[0_0_120px_rgba(226,226,232,0.6)]';
  };

  return (
    <CinemaLayout intensity={isActive ? 'high' : 'low'}>
      <div className="flex-1 flex flex-col pt-10 px-6 max-w-7xl mx-auto w-full h-[calc(100vh-100px)]">

        {/* Archive UI Overlay */}
        {showArchive && (
          <div className="absolute inset-0 z-[100] ios-glass flex items-center justify-center p-4 md:p-10">
            <div className="w-full max-w-4xl h-full bg-black border border-white/5 rounded-[48px] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-white/5 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold tracking-tight">Past Sessions</h3>
                  <button onClick={() => { setShowArchive(false); setArchiveSearch(''); }} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg>
                  </button>
                </div>
                <input
                  type="text"
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  placeholder="Search past sessions…"
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest uppercase outline-none focus:border-neutral-300/50 transition-all"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {filteredArchive.map((s) => (
                  <div key={s.id} onClick={() => { setTranscription(s.logs); setShowArchive(false); }} className="p-6 bg-neutral-900/30 border border-white/5 rounded-2xl hover:border-neutral-300/30 cursor-pointer transition-all">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold text-neutral-300 tracking-widest">{s.timestamp}</span>
                      <span className="text-[10px] text-neutral-500">{s.logs.length} EVENTS</span>
                    </div>
                    <p className="text-sm text-neutral-400 line-clamp-1 italic">"{s.logs[0]?.text || 'Empty'}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

          {/* LEFT: The Orb & Controls */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight">
                  Live <span className="text-neutral-300">Voice</span>
                </h2>
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  <span>Speak. The Architect listens.</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? isProcessing
                    ? 'bg-neutral-400/50 text-neutral-100 border-neutral-400 animate-pulse'
                    : 'bg-neutral-300 text-black border-neutral-300 shadow-[0_0_20px_rgba(226,226,232,0.3)]'
                  : 'bg-neutral-900 border-white/10 text-neutral-500'
              }`}>
                {status}
              </div>
            </div>

            <div className="flex-1 studio-panel relative flex flex-col items-center justify-center p-12 overflow-hidden">

              {/* Tension Bar */}
              <div className="absolute top-8 left-8 right-8 z-20">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[9px] font-semibold text-neutral-600 uppercase tracking-[0.15em]">Signal</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neutral-300 origin-left transition-transform duration-100" style={{ transform: `scaleX(${Math.min(1, tension / 128)})` }} />
                </div>
              </div>

              {/* Interim text (what user is currently saying) */}
              {interimText && (
                <div className="absolute top-20 left-8 right-8 z-20">
                  <p className="text-xs text-neutral-300/50 italic truncate">{interimText}</p>
                </div>
              )}

              {/* THE ORB */}
              <div className="relative flex items-center justify-center py-10">
                <div
                  className={`w-48 h-48 md:w-64 md:h-64 rounded-full transition-all duration-300 flex items-center justify-center z-10 ${getOrbStyles()}`}
                  style={{ transform: `scale(${1 + (volume / 300)})` }}
                >
                  {!isActive && <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" strokeWidth={1.5} /></svg>}
                  {isProcessing && <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                </div>
                {isActive && (
                  <div
                    className="absolute w-[140%] h-[140%] animate-pulse transition-colors duration-500"
                    style={{ background: `radial-gradient(circle at center, rgba(226,226,232,0.15) 0%, transparent 70%)` }}
                  />
                )}
              </div>

              <div className="absolute bottom-10 left-0 right-0 px-10 flex justify-center">
                {!isActive ? (
                  <button onClick={startSession} className="px-10 py-4 bg-[#E2E2E8] text-black font-semibold rounded-2xl text-sm hover:bg-[#C8C8D0] transition-all shadow-[0_4px_24px_-4px_rgba(226,226,232,0.3)]">
                    Begin Session
                  </button>
                ) : (
                  <button onClick={stopSession} className="px-10 py-4 bg-neutral-900 text-red-400 border border-red-400/20 font-semibold rounded-2xl text-sm hover:bg-red-900/10 transition-all">
                    End Session
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Transcription Stream */}
          <div className="lg:col-span-5 studio-panel flex flex-col overflow-hidden h-full max-h-[600px] lg:max-h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A]/40 backdrop-blur-md">
              <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.15em]">Conversation</span>
              <div className="flex gap-2">
                <button onClick={saveCurrentSession} className="p-2 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeWidth={2} /></svg></button>
                <button onClick={() => setShowArchive(true)} className="p-2 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
              {transcription.map((t, i) => (
                <div key={i} className={`flex flex-col ${t.role === 'User' ? 'items-end' : 'items-start'}`}>
                  <div className="text-[9px] font-semibold text-neutral-600 uppercase tracking-[0.15em] mb-2 px-2">{t.role === 'User' ? 'You' : 'Architect'}</div>
                  <div className={`px-6 py-4 rounded-2xl text-sm leading-relaxed max-w-[90%] ${t.role === 'User' ? 'bg-white text-black' : 'bg-neutral-800/50 text-neutral-300 border border-white/5'}`}>
                    {t.text}
                  </div>
                </div>
              ))}
              {transcription.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-neutral-700 gap-4">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth={1.5} /></svg>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Your words will appear here</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </CinemaLayout>
  );
};
