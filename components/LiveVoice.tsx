
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData, getGeminiInstance, getSystemInstruction } from '../services/geminiService';
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
  const [status, setStatus] = useState<string>('Logic Gate Ready');
  const [transcription, setTranscription] = useState<{ role: string; text: string }[]>([]);
  const [volume, setVolume] = useState(0);
  const [tension, setTension] = useState(0);
  const [archive, setArchive] = useState<SavedSession[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');
  // SEDA is now silent - we track it but do not display it
  const [riskAssessment, setRiskAssessment] = useState({ score: 50, status: 'SAFE' });

  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentInRef = useRef('');
  const currentOutRef = useRef('');

  useEffect(() => {
    const logKey = `defrag_live_v3_${user}`;
    const archiveKey = `defrag_archive_${user}`;
    const savedLogs = localStorage.getItem(logKey);
    if (savedLogs) try { setTranscription(JSON.parse(savedLogs)); } catch (e) {}
    const savedArchive = localStorage.getItem(archiveKey);
    if (savedArchive) try { setArchive(JSON.parse(savedArchive)); } catch (e) {}
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`defrag_live_v3_${user}`, JSON.stringify(transcription));
    
    // Real-time SEDA Analysis (Silent Layer)
    if (transcription.length > 0) {
      const recentContext = transcription.slice(-5).map(m => m.text).join(' ');
      const seda = calculateSEDA(recentContext);
      setRiskAssessment({ score: seda.score, status: seda.status });
      // In a real production app, high risk scores would trigger backend alerts here
    }
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

  const stopSession = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    setIsActive(false);
    setStatus('Logic Gate Closed');
    setVolume(0);
    setTension(0);
  }, []);

  const startSession = async () => {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const inCtx = new AudioContextClass({ sampleRate: 16000 });
    const outCtx = new AudioContextClass({ sampleRate: 24000 });

    try {
      setStatus('Accessing Mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
      });
      streamRef.current = stream;
      if (inCtx.state === 'suspended') await inCtx.resume();
      if (outCtx.state === 'suspended') await outCtx.resume();
      audioContextInRef.current = inCtx;
      audioContextOutRef.current = outCtx;

      const ai = getGeminiInstance();
      setStatus('Syncing Manual...');

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Linked');
            setIsActive(true);
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            const analyzer = inCtx.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);
            analyzerRef.current = analyzer;

            const updateVisuals = () => {
              const dataArray = new Uint8Array(analyzer.frequencyBinCount);
              analyzer.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setVolume(average);
              setTension(prev => (prev * 0.95) + (average * 0.05));
              animationFrameRef.current = requestAnimationFrame(updateVisuals);
            };
            updateVisuals();
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) currentOutRef.current += msg.serverContent.outputTranscription.text;
            else if (msg.serverContent?.inputTranscription) currentInRef.current += msg.serverContent.inputTranscription.text;
            if (msg.serverContent?.turnComplete) {
              const u = currentInRef.current.trim();
              const m = currentOutRef.current.trim();
              if (u || m) setTranscription(prev => [...prev, ...(u ? [{role: 'User', text: u}] : []), ...(m ? [{role: 'Gemini', text: m}] : [])].slice(-100));
              currentInRef.current = ''; currentOutRef.current = '';
            }
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => { stopSession(); setStatus('Gate Fault'); },
          onclose: () => { setIsActive(false); setStatus('Logic Gate Closed'); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          systemInstruction: getSystemInstruction(user)
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { stopSession(); }
  };

  useEffect(() => { return () => stopSession(); }, [stopSession]);

  // Visual Styles - Locked to Golden Soul Aesthetic (Ignoring SEDA for visuals)
  const getOrbStyles = () => {
    if (!isActive) return 'bg-neutral-800 border-2 border-white/5';
    // Consistent Golden Core
    return 'bg-amber-500 shadow-[0_0_120px_rgba(245,158,11,0.6)]';
  };

  return (
    <CinemaLayout intensity={isActive ? 'high' : 'low'}>
      <div className="flex-1 flex flex-col pt-10 px-6 max-w-7xl mx-auto w-full h-[calc(100vh-100px)]">
        
        {/* Archive UI Overlay */}
        {showArchive && (
          <div className="absolute inset-0 z-[100] ios-glass flex items-center justify-center p-4 md:p-10">
            <div className="w-full max-w-4xl h-full bg-black border border-white/5 rounded-[48px] flex flex-col overflow-hidden shadow-2xl transition-all">
              <div className="p-8 border-b border-white/5 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Archived Signals</h3>
                  </div>
                  <button onClick={() => { setShowArchive(false); setArchiveSearch(''); }} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg>
                  </button>
                </div>
                
                <input 
                  type="text"
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  placeholder="FILTER LOGS..."
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest uppercase outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {filteredArchive.map((s) => (
                  <div key={s.id} onClick={() => { setTranscription(s.logs); setShowArchive(false); }} className="p-6 bg-neutral-900/30 border border-white/5 rounded-2xl hover:border-amber-500/30 cursor-pointer group transition-all">
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold text-amber-500 tracking-widest">{s.timestamp}</span>
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
                  Live <span className="text-amber-500">Voice</span>
                </h2>
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-neutral-500">
                  <span>DEFRAG KERNEL v1.1</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-700" />
                  <span>{user}</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                isActive ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-neutral-900 border-white/10 text-neutral-500'
              }`}>
                {status}
              </div>
            </div>

            <div className="flex-1 studio-panel relative flex flex-col items-center justify-center p-12 overflow-hidden">
              
              {/* Tension Bar (Subtle) */}
              <div className="absolute top-8 left-8 right-8 z-20">
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Audio Tensor</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 origin-left transition-transform duration-100" style={{ transform: `scaleX(${Math.min(1, tension/128)})` }} />
                 </div>
              </div>

              {/* THE ORB */}
              <div className="relative flex items-center justify-center py-10">
                <div 
                  className={`w-48 h-48 md:w-64 md:h-64 rounded-full transition-all duration-300 flex items-center justify-center z-10 ${getOrbStyles()}`} 
                  style={{ transform: `scale(${1 + (volume / 300)})` }}
                >
                  {!isActive && <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" strokeWidth={1.5} /></svg>}
                </div>
                {isActive && (
                  <div 
                    className="absolute w-[140%] h-[140%] animate-pulse transition-colors duration-500" 
                    style={{ background: `radial-gradient(circle at center, rgba(245,158,11,0.15) 0%, transparent 70%)` }} 
                  />
                )}
              </div>

              <div className="absolute bottom-10 left-0 right-0 px-10 flex justify-center">
                 {!isActive ? (
                   <button onClick={startSession} className="px-10 py-4 bg-white text-black font-bold rounded-full text-xs tracking-widest uppercase hover:bg-neutral-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                     Initialize Sync
                   </button>
                 ) : (
                   <button onClick={stopSession} className="px-10 py-4 bg-neutral-900 text-red-500 border border-red-900/30 font-bold rounded-full text-xs tracking-widest uppercase hover:bg-red-900/10 transition-all">
                     Terminate Link
                   </button>
                 )}
              </div>
            </div>
          </div>

          {/* RIGHT: Transcription Stream */}
          <div className="lg:col-span-5 studio-panel flex flex-col overflow-hidden h-full max-h-[600px] lg:max-h-full">
             <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0A0A0A]/40 backdrop-blur-md">
               <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Logic Stream</span>
               <div className="flex gap-2">
                  <button onClick={saveCurrentSession} className="p-2 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeWidth={2} /></svg></button>
                  <button onClick={() => setShowArchive(true)} className="p-2 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} /></svg></button>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
               {transcription.map((t, i) => (
                 <div key={i} className={`flex flex-col ${t.role === 'User' ? 'items-end' : 'items-start'}`}>
                   <div className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-2 px-2">{t.role === 'User' ? 'Source' : 'Defrag'}</div>
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
                    <span className="text-[10px] font-bold uppercase tracking-widest">Awaiting Signal</span>
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>
    </CinemaLayout>
  );
};
