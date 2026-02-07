
import React, { useState } from 'react';
import { SystemMap } from './visuals/SystemMap';
import { calculateSynastry } from '../services/engine';
import { Zap, GitMerge } from 'lucide-react';
import CinemaLayout from '../components/layout/CinemaLayout';

export const Orbit = () => {
  const [active, setActive] = useState(false);
  const [personB, setPersonB] = useState({ name: '', date: '' });
  const [result, setResult] = useState<any>(null);

  const handleRunOrbit = () => {
    setActive(true);
    // Mock Self Data
    const self = { name: "You" };
    const synastry = calculateSynastry(self, personB);

    // Map dynamics to SystemMap format
    const mapData = synastry.dynamics.map((d: any) => ({
      name: d.source,
      type: d.type
    }));

    setResult({ ...synastry, mapData });
  };

  return (
    <div className="max-w-6xl mx-auto pt-4 md:pt-10 animate-fade-in px-4">
      
      {/* HEADER */}
      <div className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-4">
          Orbit <span className="text-amber-500">Dynamics</span>
        </h1>
        <p className="text-[#94A3B8] text-sm md:text-lg font-light max-w-lg mx-auto">
          Analyze the mechanics of interaction between two designs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
        
        {/* CONTROL PANEL */}
        <div className="lg:col-span-4 space-y-6">
           <div className="studio-panel p-8 bg-[#0A0A0A]/60 backdrop-blur-xl border-white/10 hover:border-amber-500/50 transition-all duration-500">
            <div className="absolute top-4 right-4 text-xs font-mono text-amber-500/50">SUBJECT B</div>
            <div className="space-y-4">
              <div>
                <label className="text-mono-label block mb-2 text-gray-500 text-xs">Name</label>
                <input 
                  type="text" 
                  value={personB.name}
                  onChange={e => setPersonB({...personB, name: e.target.value})}
                  className="studio-input w-full bg-[#050505]/50 border-white/10" 
                  placeholder="Partner Name" 
                />
              </div>
              <div>
                <label className="text-mono-label block mb-2 text-gray-500 text-xs">Date</label>
                <input 
                  type="date" 
                  value={personB.date}
                  onChange={e => setPersonB({...personB, date: e.target.value})}
                  className="studio-input w-full bg-[#050505]/50 border-white/10" 
                />
              </div>
              <button 
                onClick={handleRunOrbit}
                className="w-full bg-white text-black font-medium py-3 rounded-full hover:bg-amber-400 transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-4"
              >
                <Zap className="w-4 h-4 fill-current" />
                RUN DYNAMICS
              </button>
            </div>
          </div>

          {/* INSIGHTS */}
          {result && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calculated Friction</h3>
              {result.dynamics.map((d: any, i: number) => (
                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl backdrop-blur-sm">
                  <div className={`text-xs font-bold mb-1 tracking-widest uppercase ${
                    d.type === 'CONFLICT' ? 'text-red-400' : 
                    d.type === 'FUSION' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    {d.type} // {d.source}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VISUALIZER */}
        <div className="lg:col-span-8 h-[500px] md:h-[600px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl backdrop-blur-sm">
          {result ? (
            <SystemMap dynamics={result.mapData} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 font-mono text-xs gap-4">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                 <GitMerge className="w-6 h-6 text-slate-700" />
              </div>
              AWAITING ORBITAL DATA...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
