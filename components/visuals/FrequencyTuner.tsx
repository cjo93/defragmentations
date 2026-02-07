
import React from 'react';

export const FrequencyTuner = ({ shadow, gift, gate }: { shadow: string, gift: string, gate: number }) => {
  return (
    <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 relative overflow-hidden group animate-fade-in">
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-neutral-300/5 opacity-0 group-hover:opacity-100 transition duration-700"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        {/* The Shadow (Left) */}
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-widest text-red-400 mb-1">Detected Signal</div>
          <div className="text-xl font-bold text-slate-400 group-hover:text-slate-500 transition">{shadow}</div>
        </div>

        {/* The Pivot Point (Center) */}
        <div className="flex flex-col items-center px-4">
          <div className="text-[10px] text-slate-600 mb-1 font-mono">GATE {gate}</div>
          <svg className="w-6 h-6 text-neutral-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </div>

        {/* The Gift (Right) */}
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400 mb-1">Target Frequency</div>
          <div className="text-xl font-bold text-white group-hover:text-neutral-300 transition">{gift}</div>
        </div>
      </div>

      <div className="mt-3 text-[10px] text-center text-slate-500 border-t border-white/5 pt-2 uppercase tracking-widest">
        Alchemical Inversion Protocol Active
      </div>
    </div>
  );
};
