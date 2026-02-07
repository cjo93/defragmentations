
import React, { useState } from 'react';
import { GitMerge, Zap } from 'lucide-react';
import CinemaLayout from '../components/layout/CinemaLayout';

export default function Orbit() {
  const [active, setActive] = useState(false);

  return (
    <CinemaLayout intensity={active ? 'high' : 'low'}>
      <div className="max-w-5xl mx-auto pt-10">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-medium text-white tracking-tight mb-4">
            Orbit <span className="text-amber-500">Dynamics</span>
          </h1>
          <p className="text-[#94A3B8] text-lg font-light max-w-lg mx-auto">
            Analyze the mechanics of interaction between two designs.
          </p>
        </div>

        {/* INPUT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative items-center">
          
          {/* Card A */}
          <div className="studio-panel p-8 bg-[#0A0A0A]/40 backdrop-blur-xl border-white/10 hover:border-amber-500/50 transition-all duration-500"
               onMouseEnter={() => setActive(true)}
               onMouseLeave={() => setActive(false)}>
            <div className="absolute top-4 right-4 text-xs font-mono text-amber-500/50">SUBJECT A</div>
            <div className="space-y-4">
              <div>
                <label className="text-mono-label block mb-2 text-gray-500 text-xs">Name</label>
                <input type="text" className="studio-input w-full bg-[#050505]/50 border-white/10" placeholder="Name" />
              </div>
              <div>
                <label className="text-mono-label block mb-2 text-gray-500 text-xs">Date</label>
                <input type="date" className="studio-input w-full bg-[#050505]/50 border-white/10" />
              </div>
            </div>
          </div>

          {/* Connector Visual (Floating in center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <div className="w-16 h-16 rounded-full bg-[#050505] border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <GitMerge className="w-6 h-6 text-amber-500" />
            </div>
          </div>

          {/* Card B */}
          <div className="studio-panel p-8 bg-[#0A0A0A]/40 backdrop-blur-xl border-white/10 hover:border-amber-500/50 transition-all duration-500"
               onMouseEnter={() => setActive(true)}
               onMouseLeave={() => setActive(false)}>
            <div className="absolute top-4 right-4 text-xs font-mono text-amber-500/50">SUBJECT B</div>
            <div className="space-y-4">
              <div>
                <label className="text-mono-label block mb-2 text-gray-500 text-xs">Name</label>
                <input type="text" className="studio-input w-full bg-[#050505]/50 border-white/10" placeholder="Partner Name" />
              </div>
              <div>
                <label className="text-mono-label block mb-2 text-gray-500 text-xs">Date</label>
                <input type="date" className="studio-input w-full bg-[#050505]/50 border-white/10" />
              </div>
            </div>
          </div>

        </div>

        {/* Action */}
        <div className="mt-16 text-center">
          <button className="bg-white text-black font-medium py-4 px-12 rounded-full hover:bg-gray-200 transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Zap className="w-4 h-4 fill-current" />
            CALCULATE DYNAMICS
          </button>
        </div>

      </div>
    </CinemaLayout>
  );
}
