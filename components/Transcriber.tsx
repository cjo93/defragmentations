
import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiService';

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
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tighter">Structural Logs</h2>
        <p className="text-neutral-500">Flash-powered high-fidelity audio transcription.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 flex flex-col items-center justify-center">
           <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${
              isRecording ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse' : 'border-neutral-800 hover:border-neutral-600'
            }`}
           >
             <div className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-500' : 'bg-neutral-700'}`}></div>
           </button>
           <p className="mt-8 text-sm font-bold text-neutral-500 uppercase tracking-widest">
             {isRecording ? 'Capturing Signal...' : 'Push to Log'}
           </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col overflow-hidden">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Transcription History</h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {loading && <div className="text-blue-500 animate-pulse text-xs font-bold">DECODING SIGNAL...</div>}
            {logs.map((log, i) => (
              <div key={i} className="p-4 bg-black border border-neutral-800 rounded-xl text-sm text-neutral-300">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
