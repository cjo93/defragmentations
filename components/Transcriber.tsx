
import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/aiService';

export const Transcriber: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setLoading(true);
        const text = await transcribeAudio(base64);
        if (text) setLogs(prev => [text, ...prev]);
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    };
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex-1 flex flex-col p-8 md:p-12 overflow-hidden bg-gradient-to-br from-[#0A0A0A]/80 to-[#18181B]/80">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Transcriber</h2>
        <p className="text-neutral-400 text-sm">Whisper-powered high-fidelity audio transcription.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-12 flex flex-col items-center justify-center shadow-xl backdrop-blur-2xl">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.25)] animate-pulse'
                : 'border-white/10 hover:border-white/30'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            <div className={`w-16 h-16 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500' : 'bg-white/10 group-hover:bg-white/20'}`}></div>
          </button>
          <p className="mt-8 text-xs font-bold text-neutral-400 uppercase tracking-widest">
            {isRecording ? 'Capturing Signal...' : 'Push to Log'}
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-8 flex flex-col overflow-hidden shadow-xl backdrop-blur-2xl">
          <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Transcription History</h3>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
            {loading && <div className="text-blue-400 animate-pulse text-xs font-bold">DECODING SIGNAL...</div>}
            {logs.length === 0 && !loading && (
              <div className="text-xs text-neutral-600 italic text-center py-8">No logs yet. Record to begin.</div>
            )}
            {logs.map((log, i) => (
              <div key={i} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-neutral-200 shadow-sm">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
