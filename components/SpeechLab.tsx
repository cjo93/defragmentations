
import React, { useState } from 'react';
import { generateSpeech, decode, decodeAudioData } from '../services/geminiService';

export const SpeechLab: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [voice, setVoice] = useState('Kore');

  const speak = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const base64 = await generateSpeech(text, voice);
      if (base64) {
        const ctx = new AudioContext();
        const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
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
        <p className="text-neutral-500">Gemini 2.5 TTS Vocal Engine.</p>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 max-w-2xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase">Voice Selection</label>
          <div className="grid grid-cols-4 gap-2">
            {['Kore', 'Puck', 'Charon', 'Fenrir'].map(v => (
              <button 
                key={v} 
                onClick={() => setVoice(v)}
                className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                  voice === v ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-500 uppercase">Script</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-black border border-neutral-800 rounded-2xl p-6 text-sm h-48 focus:border-blue-500 outline-none"
            placeholder="Enter text for high-fidelity vocalization..."
          />
        </div>
        <button 
          onClick={speak}
          disabled={loading || !text.trim()}
          className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 active:scale-[0.98] transition-all"
        >
          {loading ? 'Synthesizing...' : 'GENERATE AUDIO'}
        </button>
      </div>
    </div>
  );
};
