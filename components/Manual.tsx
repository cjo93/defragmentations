
import React, { useEffect, useState } from 'react';
import { Activity, Network, ShieldCheck } from 'lucide-react';
import { SystemMap } from './visuals/SystemMap';
import { processBirthData } from '../services/engine';

interface ManualProps {
  data?: any;
}

const DifferentiationGauge = ({ score }: { score: number }) => (
  <div className="w-full p-6 border-b border-white/5">
    <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-widest">
      <span>Reactive (High Friction)</span>
      <span>Grounded (Low Friction)</span>
    </div>
    
    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
      {/* The Bar */}
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-neutral-300 to-emerald-500 transition-all duration-1000 ease-out" 
        style={{ width: `${score}%` }}
      />
    </div>
    
    <div className="flex justify-between items-end">
      <p className="text-[10px] text-slate-400 max-w-[70%]">
        {score < 50 ? "High structural friction detected. Focus on grounding." : 
         score < 75 ? "Functional balance. System operating within normal parameters." : 
         "Optimal state. High clarity and low friction."}
      </p>
      <div className="text-right">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[9px] text-slate-500 block">/100 STABILITY</span>
      </div>
    </div>
  </div>
);

export const Manual: React.FC<ManualProps> = ({ data: initialData }) => {
  const [data, setData] = useState<any>(initialData);

  useEffect(() => {
    if (!data) {
      // Mock loading if data isn't provided via props
      const loaded = processBirthData("1993-07-26", "20:00");
      setData(loaded);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="bg-slate-900/50 p-6 rounded-lg border border-white/5 text-center">
        <p className="text-slate-500 text-xs font-mono">LOADING BLUEPRINT...</p>
      </div>
    );
  }

  // Use Differentiation score from engine or default to 50
  const differentiationScore = data.differentiationScore || 50;
  const dynamics = data.relationalDynamics || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-6 animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-6">Your Blueprint</h2>
      
      {/* DIFFERENTIATION SCALE */}
      <div className="bg-[#0A0A0A]/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
        <DifferentiationGauge score={differentiationScore} />
      </div>

      {/* SYSTEM MAP (BOWEN GENOGRAM) */}
      <section className="bg-[#0A0A0A]/40 backdrop-blur-md h-[400px] rounded-2xl border border-white/5 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neutral-800 to-transparent opacity-50"></div>
        <div className="absolute top-4 left-4 z-10">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Network className="w-3 h-3 text-neutral-300" />
            System Map
          </h3>
        </div>
        <SystemMap dynamics={dynamics} />
      </section>

      {/* METRICS GRID */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
             <ShieldCheck className="w-3 h-3 text-neutral-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Perimeter</span>
          </div>
          <div className="text-xl font-mono text-white">
            {differentiationScore > 70 ? "Intact" : differentiationScore > 50 ? "Porous" : "Fused"}
          </div>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
             <Activity className="w-3 h-3 text-neutral-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">System Tension</span>
          </div>
          <div className="text-xl font-mono text-white">
            {differentiationScore > 70 ? "Low" : differentiationScore > 50 ? "Moderate" : "Elevated"}
          </div>
        </div>
      </section>
      
      {/* ANALYST NOTE */}
      <div className="p-5 bg-neutral-800/10 rounded-xl border border-neutral-300/10 relative">
        <div className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest mb-2">System Note</div>
        <p className="text-xs text-neutral-100/70 leading-relaxed font-medium">
          Your system map indicates {dynamics.filter((d: any) => d.type === 'FUSION').length > 0 ? "overlapping boundaries" : "relative stability"} in the primary nodes. 
          To increase clarity, focus on defining where you end and others begin. 
          Respond to facts, not the emotional weather of the room.
        </p>
      </div>

    </div>
  );
};
