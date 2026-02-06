
import React, { useState, useEffect } from 'react';
import { generateVideoFromImage } from '../services/geminiService';

export const VideoLab: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

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
      setHasKey(true); // Proceed assuming success per instructions
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    const msgs = [
      "Connecting to Veo compute engine...",
      "Uploading frame assets...",
      "Analyzing temporal vectors...",
      "Synthesizing motion path...",
      "Rendering final frames...",
      "Post-processing video stream..."
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      setLoadingMsg(msgs[msgIdx % msgs.length]);
      msgIdx++;
    }, 5000);

    try {
      const url = await generateVideoFromImage(prompt, uploadedImage, aspectRatio);
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      if (String(err).includes("Requested entity was not found")) {
        setHasKey(false);
      }
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  if (!hasKey) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto text-blue-500 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Veo 3.1 Access Required</h3>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Veo video generation requires a paid Google AI Studio API key. 
            Please select your key to continue.
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
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter">Video Lab</h2>
          <p className="text-neutral-500">Animate static images into 1080p motion sequences with Veo.</p>
        </div>
        <div className="text-[10px] font-mono text-neutral-600 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          VEO-3.1-FAST-GENERATE-PREVIEW
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl space-y-6 flex flex-col">
          <div className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Source Asset</h3>
             <input type="file" onChange={handleFileUpload} className="hidden" id="video-upload" accept="image/*" />
             <label 
                htmlFor="video-upload" 
                className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  uploadedImage ? 'border-neutral-700 bg-black' : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                }`}
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Upload" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <svg className="w-10 h-10 text-neutral-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-xs text-neutral-500 font-bold">Drop Image to Animate</span>
                  </>
                )}
             </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500">Motion Prompt (Optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Slowly zoom in as light flickers..."
              className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-500">Aspect Ratio</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAspectRatio("16:9")}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                  aspectRatio === "16:9" ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                16:9 Landscape
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                  aspectRatio === "9:16" ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          <button
            disabled={loading || !uploadedImage}
            onClick={handleGenerate}
            className="w-full py-4 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-white/5"
          >
            {loading ? 'Synthesizing Video...' : 'Generate Motion'}
          </button>
        </div>

        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden relative flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            {loading ? (
              <div className="text-center space-y-6 max-w-sm">
                <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto"></div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Rendering Masterpiece</h4>
                  <p className="text-neutral-500 text-sm leading-relaxed">{loadingMsg || "Initializing Veo engine..."}</p>
                </div>
                <div className="bg-neutral-800/50 p-4 rounded-xl text-[10px] text-neutral-400 font-mono text-left space-y-1">
                  <div>[VEO_SESSION] SYNCING_REF_FRAMES...</div>
                  <div className="animate-pulse">[VEO_PROCESS] INTERPOLATING_VECTORS_720P...</div>
                </div>
              </div>
            ) : videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className={`max-h-[80vh] rounded-2xl shadow-2xl border border-neutral-800 ${aspectRatio === '9:16' ? 'w-auto' : 'w-full'}`}
              />
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto text-neutral-600 mb-4 rotate-12">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <h4 className="text-lg font-bold text-neutral-400">Video Preview</h4>
                <p className="text-sm text-neutral-600 max-w-xs mx-auto">Upload an image and click generate. Processing usually takes 30-60 seconds.</p>
              </div>
            )}
          </div>
          
          {videoUrl && !loading && (
            <div className="p-4 border-t border-neutral-800 flex justify-end">
              <a 
                href={videoUrl} 
                download="veo-output.mp4" 
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700"
              >
                Save to Disk
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
