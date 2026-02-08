import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateImage, editImage } from '../services/aiService';

export const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState("1:1");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const url = await generateImage(prompt, aspect);
      setResultImage(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !uploadedImage) return;
    setLoading(true);
    try {
      const url = await editImage(uploadedImage, prompt);
      setResultImage(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold tracking-tighter">Asset Generation</h2>
        <p className="text-neutral-500">FLUX.1 high-fidelity image synthesis with structural editing.</p>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Base Image (For Editing)</label>
              <input type="file" onChange={handleFileUpload} className="hidden" id="image-upload" accept="image/*" />
              <label 
                htmlFor="image-upload" 
                className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  uploadedImage ? 'border-neutral-700 bg-black' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                }`}
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Upload" className="h-full object-contain rounded-xl p-2" />
                ) : (
                  <>
                    <svg className="w-8 h-8 text-neutral-700 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Source Image</span>
                  </>
                )}
              </label>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Inversion Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the structural asset..."
                className="w-full bg-black border border-neutral-800 rounded-2xl p-4 text-sm h-32 focus:border-neutral-300/50 outline-none resize-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map(r => (
                  <button
                    key={r}
                    onClick={() => setAspect(r)}
                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                      aspect === r ? 'bg-[#E2E2E8] text-black border-[#E2E2E8]' : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt}
                className="flex-1 py-4 bg-[#E2E2E8] text-black font-bold rounded-2xl hover:bg-[#C8C8D0] disabled:opacity-50 transition-all shadow-[0_4px_24px_-4px_rgba(226,226,232,0.3)]"
              >
                GENERATE
              </button>
              <button
                onClick={handleEdit}
                disabled={loading || !prompt || !uploadedImage}
                className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-xl shadow-emerald-600/20"
              >
                EDIT
              </button>
            </div>
            <p className="text-[10px] text-neutral-600 text-center">Powered by FLUX.1 · Free inference via Hugging Face</p>
          </div>
        </div>
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex items-center justify-center p-8 relative">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-full border-2 border-neutral-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 -mt-1 rounded-full bg-[#E2E2E8]" />
                  </motion.div>
                </div>
                <motion.p
                  className="text-xs font-bold text-neutral-300 mt-4"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  SYNTHESIZING PIXELS...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
          {resultImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative group max-h-full"
            >
              <img src={resultImage} alt="Generated result" className="max-h-full rounded-2xl shadow-2xl border border-neutral-800" />
              <button 
                onClick={() => setUploadedImage(resultImage)}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                USE AS BASE
              </button>
            </motion.div>
          ) : (
            <div className="text-neutral-700 text-center font-bold italic">Awaiting structural input</div>
          )}
        </div>
      </div>
    </div>
  );
};
