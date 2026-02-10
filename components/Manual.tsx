
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SystemMap } from './visuals/SystemMap';
import { processBirthData } from '../services/engine';
import { loadGlobalMemory } from '../services/globalMemory';
import { getFrequency } from '../services/frequencies';

interface ManualProps {
  data?: any;
}

const StabilityGauge = ({ score }: { score: number }) => (
  <div className="w-full space-y-3">
    <div className="flex justify-between text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-500">
      <span>Reactive</span>
      <span>Grounded</span>
    </div>
    <div className="relative h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-red-500/60 via-neutral-300/60 to-emerald-500/60"
      />
    </div>
    <div className="flex justify-between items-end">
      <p className="text-[11px] text-neutral-500 max-w-[70%] leading-relaxed">
        {score < 50 ? "High structural friction. Focus on grounding before decisions." :
         score < 75 ? "Functional balance. System operating within normal range." :
         "High clarity. Minimal friction, strong self-reference."}
      </p>
      <div className="text-right">
        <span className="text-2xl font-bold text-white tracking-tight">{score}</span>
        <span className="text-[9px] text-neutral-600 block uppercase tracking-wider">/100</span>
      </div>
    </div>
  </div>
);

const GateCard = ({ gate, shadow, gift }: { gate: number; shadow: string; gift: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Gate {gate}</span>
      <div className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center">
        <span className="text-[9px] font-bold text-white/60">{gate}</span>
      </div>
    </div>
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-red-400/50" />
        <span className="text-[11px] text-neutral-500">{shadow}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 rounded-full bg-emerald-400/50" />
        <span className="text-[11px] text-neutral-300 font-medium">{gift}</span>
      </div>
    </div>
  </motion.div>
);

export const Manual: React.FC<ManualProps> = ({ data: initialData }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(initialData);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [gateData, setGateData] = useState<{ gate: number; shadow: string; gift: string }[]>([]);

  useEffect(() => {
    // Load real user data from onboarding
    try {
      const onboarding = JSON.parse(localStorage.getItem('defrag_onboarding') || '{}');
      if (onboarding.birthDate && onboarding.birthTime) {
        const processed = processBirthData(onboarding.birthDate, onboarding.birthTime);
        setData(processed);
      } else if (!data) {
        setData(processBirthData("1993-07-26", "20:00"));
      }
      setUserProfile(onboarding);
    } catch {
      if (!data) setData(processBirthData("1993-07-26", "20:00"));
    }

    // Load gate frequencies from global memory
    const memory = loadGlobalMemory();
    const gates = memory.profile.gates || [];
    const frequencies = gates.map(g => {
      const f = getFrequency(g);
      return { gate: g, shadow: f.shadow || 'Unknown', gift: f.gift || 'Unknown' };
    });
    setGateData(frequencies);
  }, []);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-[10px] font-medium text-neutral-600 uppercase tracking-[0.2em]">
          Loading blueprint...
        </motion.div>
      </div>
    );
  }

  const differentiationScore = data.differentiationScore || 50;
  const dynamics = data.relationalDynamics || [];
  const memory = loadGlobalMemory();
  const hdType = memory.profile.type || data.type || 'Unknown';
  const strategy = memory.profile.strategy || data.strategy || 'Unknown';
  const authority = memory.profile.authority || data.authority || 'Unknown';

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="mb-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Your Blueprint</h2>
          <p className="text-neutral-500 text-[10px] font-medium uppercase tracking-[0.15em] mt-2">Structural map of your design</p>
        </div>

        {/* Core Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 md:p-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-[0.15em]">Type</span>
              <p className="text-lg font-bold text-white mt-1">{hdType}</p>
            </div>
            <div>
              <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-[0.15em]">Strategy</span>
              <p className="text-lg font-bold text-white mt-1">{strategy}</p>
            </div>
            <div>
              <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-[0.15em]">Authority</span>
              <p className="text-lg font-bold text-white mt-1">{authority}</p>
            </div>
          </div>
          <StabilityGauge score={differentiationScore} />
        </motion.div>

        {/* Gate Frequencies */}
        {gateData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.15em] mb-3 px-1">Gate Frequencies</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gateData.map((g, i) => (
                <GateCard key={g.gate} gate={g.gate} shadow={g.shadow} gift={g.gift} />
              ))}
            </div>
          </motion.div>
        )}

        {/* System Map */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-3xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/[0.04] flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.12em]">System Map</span>
          </div>
          <div className="h-[360px] relative">
            <SystemMap dynamics={dynamics} />
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5"
          >
            <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-[0.15em]">Boundaries</span>
            <p className="text-xl font-bold text-white mt-2">
              {differentiationScore > 70 ? "Intact" : differentiationScore > 50 ? "Porous" : "Fused"}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5"
          >
            <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-[0.15em]">Friction Level</span>
            <p className="text-xl font-bold text-white mt-2">
              {differentiationScore > 70 ? "Low" : differentiationScore > 50 ? "Moderate" : "Elevated"}
            </p>
          </motion.div>
        </div>

        {/* Memory Insights */}
        {(memory.profile.stressPatterns.length > 0 || memory.profile.giftActivations.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6"
          >
            <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-[0.15em]">AI Observations</span>
            <div className="mt-3 space-y-2">
              {memory.profile.giftActivations.slice(0, 3).map((g, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-400/50 mt-1.5 shrink-0" />
                  <span className="text-[12px] text-neutral-400 leading-relaxed">{g}</span>
                </div>
              ))}
              {memory.profile.stressPatterns.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-amber-400/50 mt-1.5 shrink-0" />
                  <span className="text-[12px] text-neutral-400 leading-relaxed">{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 pt-2 pb-8"
        >
          <button
            onClick={() => navigate('/chatbot')}
            className="px-5 py-3 bg-white text-black text-[12px] font-semibold rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all"
          >
            Ask about your design
          </button>
          <button
            onClick={() => navigate('/orbit')}
            className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] text-[12px] font-medium text-neutral-400 rounded-xl hover:bg-white/[0.06] hover:text-white transition-all"
          >
            Map a relationship
          </button>
          {/* ExportPDF button for Cypress test */}
          <div className="ml-4">
            {/* Download Relationship User Manual (PDF) button */}
            <import path="./ExportPDF" />
            <ExportPDF />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
