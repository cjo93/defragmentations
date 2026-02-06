
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData, getGeminiInstance, getSystemInstruction } from '../services/geminiService';
import { UserProfile } from '../types';

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

  return (
    <div className="flex-1 flex flex-col p-10 lg:p-20 overflow-hidden h-full safe-bottom relative">
      {/* Archive UI */}
      {showArchive && (
        <div className="absolute inset-0 z-[100] ios-glass flex items-center justify-center p-4 md:p-10">
          <div className="w-full max-w-4xl h-full bg-black border border-white/5 rounded-[48px] md:rounded-[64px] flex flex-col overflow-hidden shadow-2xl transition-all">
            <div className="p-8 md:p-10 border-b border-white/5 space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Archived Signals</h3>
                  <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.4em]">Historical Logic States</p>
                </div>
                <button onClick={() => { setShowArchive(false); setArchiveSearch(''); }} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} /></svg>
                </button>
              </div>
              
              <div className="relative group">
                <input 
                  type="text"
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  placeholder="FILTER BY TIMESTAMP OR CONTENT..."
                  className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl px-12 py-5 text-[10px] font-black tracking-widest uppercase outline-none focus:border-white/20 transition-all placeholder:text-neutral-700"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 md:space-y-6 custom-scrollbar">
              {filteredArchive.length > 0 ? filteredArchive.map((s) => (
                <div key={s.id} onClick={() => { setTranscription(s.logs); setShowArchive(false); setArchiveSearch(''); }} className="p-6 md:p-8 bg-neutral-900/30 border border-white/5 rounded-[32px] md:rounded-[40px] hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                      <span className="text-[11px] font-black text-white tracking-widest">{s.timestamp.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black px-3 py-1 bg-white/5 rounded-full text-neutral-500 uppercase tracking-widest border border-white/5">{s.logs.length} LOGS</span>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 group-hover:text-neutral-300 transition-colors line-clamp-2 italic font-medium">"{s.logs[0]?.text || 'Empty session'}"</p>
                  
                  {/* Subtle background graphic */}
                  <div className="absolute right-0 bottom-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em]">No matching signals found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 flex-1 overflow-hidden">
        <div className="lg:col-span-7 flex flex-col gap-10">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Splenic Orb</h2>
              <div className="flex items-center gap-4 text-[10px] font-black tracking-[0.4em] text-neutral-600">
                DEFRAG KERNEL v1.1 <span className="w-1.5 h-1.5 rounded-full bg-white/20" /> {user} AUTH
              </div>
            </div>
            <div className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all duration-700 ${isActive ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-neutral-900 border-white/5 text-neutral-600'}`}>
              {status}
            </div>
          </div>

          <div className="flex-1 bg-neutral-900/30 border border-white/5 rounded-[80px] relative flex flex-col items-center justify-center p-20 overflow-hidden shadow-inner">
            <div className="absolute top-12 left-12 right-12 z-20 space-y-4">
               <div className="flex justify-between items-end">
                 <span className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.5em]">Tension Vector</span>
                 <span className="text-[10px] font-mono text-white/40">{Math.round(tension)}Hz</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-white origin-left transition-transform duration-200" style={{ transform: `scaleX(${Math.min(1, tension/128)})` }} />
               </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className={`w-56 h-56 lg:w-80 lg:h-80 rounded-full transition-all duration-300 ease-out will-change-transform flex items-center justify-center z-10 ${isActive ? 'bg-white shadow-[0_0_120px_rgba(255,255,255,0.3)]' : 'bg-neutral-800 border-2 border-white/5'}`} style={{ transform: `scale(${1 + (volume / 255)})` }}>
                {!isActive && <svg className="w-20 h-20 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth={1.2} /></svg>}
              </div>
              {isActive && <div className="absolute w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] animate-pulse" />}
            </div>

            <div className="absolute bottom-16 left-0 right-0 px-20 flex flex-col items-center gap-12">
               <div className="flex gap-2 h-12 items-center">
                 {Array.from({length: 32}).map((_, i) => (
                   <div key={i} className="w-1 bg-white/10 rounded-full transition-all duration-100" style={{ height: isActive ? `${Math.random() * 48}px` : '4px' }} />
                 ))}
               </div>
               {!isActive ? (
                 <button onClick={startSession} className="w-full max-sm:text-[10px] max-w-sm py-8 bg-white text-black font-black rounded-[32px] text-xs tracking-[0.4em] uppercase hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">Initialize Sync</button>
               ) : (
                 <button onClick={stopSession} className="w-full max-sm:text-[10px] max-w-sm py-8 bg-neutral-900 text-red-500 font-black rounded-[32px] text-xs tracking-[0.4em] uppercase border border-red-900/20 hover:bg-red-900/10 transition-all">De-Link Kernel</button>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-neutral-900/30 border border-white/5 rounded-[80px] flex flex-col overflow-hidden shadow-inner">
           <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/40">
             <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.5em]">Manual Entry Stream</span>
             <div className="flex gap-4">
                <button onClick={saveCurrentSession} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeWidth={2.5} /></svg></button>
                <button onClick={() => setShowArchive(true)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5} /></svg></button>
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-12 space-y-10 scroll-smooth custom-scrollbar">
             {transcription.map((t, i) => (
               <div key={i} className={`flex flex-col ${t.role === 'User' ? 'items-end' : 'items-start'}`}>
                 <div className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em] mb-4 px-2">{t.role === 'User' ? 'Source' : 'Defrag Insight'}</div>
                 <div className={`px-10 py-8 rounded-[40px] text-sm leading-relaxed border no-flicker ${t.role === 'User' ? 'bg-white text-black font-bold border-white rounded-tr-none shadow-xl' : 'bg-neutral-800/40 text-neutral-300 border-white/5 rounded-tl-none backdrop-blur-xl'}`}>
                    {t.text}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
