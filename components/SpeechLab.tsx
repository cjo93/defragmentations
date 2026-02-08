import React, { useState } from 'react';
import { generateSpeech } from '../services/aiService';

export const SpeechLab: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const speak = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const audioBlob = await generateSpeech(text);
      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tighter">Vocal Synthesis</h2>
        <p className="text-neutral-500">High-fidelity text-to-speech engine.</p>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 max-w-2xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase">Script</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-black border border-neutral-800 rounded-2xl p-6 text-sm h-48 focus:border-neutral-300/50 outline-none transition-all"
            placeholder="Enter text for high-fidelity vocalization..."
          />
        </div>
        <button 
          onClick={speak}
          disabled={loading || !text.trim()}
          className="w-full py-5 bg-[#E2E2E8] text-black font-bold rounded-2xl hover:bg-[#C8C8D0] active:scale-[0.98] transition-all shadow-[0_4px_24px_-4px_rgba(226,226,232,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Synthesizing...' : 'GENERATE AUDIO'}
        </button>
        <p className="text-[10px] text-neutral-600 text-center">Powered by Facebook MMS-TTS · Free, no API key required</p>
      </div>
    </div>
  );
};
