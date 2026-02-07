
import React, { useState } from 'react';
import { ArrowRight, Cpu, Activity, Shield } from 'lucide-react';
import CinemaLayout from '../components/layout/CinemaLayout';

export default function Manual() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => setStep(2), 2500);
  };

  return (
    <CinemaLayout intensity={loading ? 'high' : 'low'}>
      <div className="max-w-4xl mx-auto pt-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-medium text-white tracking-tight mb-4">
            System <span className="text-amber-500">Analysis</span>
          </h1>
          <p className="text-[#94A3B8] text-lg font-light max-w-lg mx-auto">
            Input natal metrics to map your internal architecture.
          </p>
        </div>

        {/* THE GLASS CARD */}
        {step === 1 && (
          <div className="studio-panel p-10 max-w-xl mx-auto backdrop-blur-2xl bg-[#0A0A0A]/40 border border-white/10 relative overflow-hidden">
            {/* Form Content */}
            <div className="space-y-6 relative z-10">
              <div>
                <label className="text-xs font-mono text-amber-500/80 uppercase tracking-wider mb-2 block">Subject Name</label>
                <input type="text" className="studio-input w-full bg-[#050505]/50 border-white/10 focus:border-amber-500 transition-all" placeholder="Enter name" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-mono text-amber-500/80 uppercase tracking-wider mb-2 block">Date of Birth</label>
                  <input type="date" className="studio-input w-full bg-[#050505]/50 border-white/10 focus:border-amber-500" />
                </div>
                <div>
                  <label className="text-xs font-mono text-amber-500/80 uppercase tracking-wider mb-2 block">Time</label>
                  <input type="time" className="studio-input w-full bg-[#050505]/50 border-white/10 focus:border-amber-500" />
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                className="w-full bg-amber-500 text-black font-medium py-4 rounded-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    RUN DIAGNOSTIC
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS PREVIEW */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Data Card */}
            <div className="studio-panel p-8 border-amber-500/20 bg-[#0A0A0A]/60 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-mono text-amber-500 uppercase">Core Data</span>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">TYPE</span>
                  <span className="text-white">PROJECTOR</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">PROFILE</span>
                  <span className="text-white">3/5</span>
                </p>
                <p className="text-xs text-amber-500 mt-4 bg-amber-500/10 p-3 rounded">
                  DIAGNOSIS: Systemic drag detected in decision-making centers.
                </p>
              </div>
            </div>

            {/* Product Card */}
            <div className="studio-panel p-8 flex flex-col justify-center text-center bg-[#0A0A0A]/60 backdrop-blur-xl border-white/10">
              <h3 className="text-xl text-white font-medium mb-2">Operating Manual</h3>
              <p className="text-gray-400 text-sm mb-6">Unlock the full 25-page technical guide.</p>
              <div className="text-4xl font-light text-white mb-8">$29.00</div>
              <button className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors">
                SECURE ACCESS
              </button>
            </div>
          </div>
        )}

      </div>
    </CinemaLayout>
  );
}
