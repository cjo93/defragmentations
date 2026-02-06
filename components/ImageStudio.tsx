
import React, { useState, useEffect } from 'react';
import { generateImage, editImage } from '../services/geminiService';

export const ImageStudio: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState("1:1");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Add fix: Mandatory key selection check for Gemini 3 Pro usage
  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio?.hasSelectedApiKey?.();
      setHasKey(!!selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio?.openSelectKey?.();
      setHasKey(true);
    } catch (err) {
      console.error(err);
    }
  };

  const aspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

  // Add fix: Handle image upload for editing
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

  if (!hasKey) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto text-blue-500 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.581-1.581a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Gemini Pro Image Access Required</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            High-fidelity asset generation requires a paid Google AI Studio API key. 
            Please select your project key to proceed.
          </p>
          <div className="pt-4 space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
            >
              Select API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="block text-xs text-neutral-500 hover:text-neutral-300 underline"
            >
              Learn about billing and project setup
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tighter">Asset Generation</h2>
        <p className="text-neutral-500">G3P Pro with custom aspect ratio control and structural editing.</p>
      </div>

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
                className="w-full bg-black border border-neutral-800 rounded-2xl p-4 text-sm h-32 focus:border-blue-500 outline-none resize-none"
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
                      aspect === r ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
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
                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl shadow-blue-600/20"
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
          </div>
        </div>
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex items-center justify-center p-8 relative">
          {loading && (
             <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
               <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
               <p className="text-xs font-bold text-blue-500 animate-pulse">SYNTHESIZING PIXELS...</p>
             </div>
          )}
          {resultImage ? (
            <div className="relative group max-h-full">
              <img src={resultImage} className="max-h-full rounded-2xl shadow-2xl border border-neutral-800" />
              <button 
                onClick={() => setUploadedImage(resultImage)}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                USE AS BASE
              </button>
            </div>
          ) : (
            <div className="text-neutral-700 text-center font-bold italic">Awaiting structural input</div>
          )}
        </div>
      </div>
    </div>
  );
};
