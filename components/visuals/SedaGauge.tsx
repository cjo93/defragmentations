import React from 'react';
import { motion } from 'framer-motion';

interface SedaGaugeProps {
  spectrum: 'ENTROPY' | 'INTEGRATION' | 'EXPANSION';
  description?: string;
}

export const SedaGauge: React.FC<SedaGaugeProps> = ({ spectrum, description }) => {
  const config = {
    ENTROPY: {
      width: '20%',
      color: '#EF4444',
      glow: 'rgba(239,68,68,0.4)',
      label: 'Contracting',
      defaultDesc: 'The system is contracting. Discharge the load. Move toward grounding.',
    },
    INTEGRATION: {
      width: '60%',
      color: '#E2E2E8',
      glow: 'rgba(226,226,232,0.4)',
      label: 'Processing',
      defaultDesc: 'The signal is being processed. Clarity is forming within the friction.',
    },
    EXPANSION: {
      width: '100%',
      color: '#10B981',
      glow: 'rgba(16,185,129,0.4)',
      label: 'Opening',
      defaultDesc: 'The architecture is open. This is the optimal state for alchemical inversion.',
    },
  };

  const c = config[spectrum];

  return (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden relative">
      {/* Subtle glow */}
      <div
        className="absolute inset-0 opacity-[0.03] rounded-3xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${c.color}, transparent 70%)` }}
      />

      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] tracking-widest text-white/20 uppercase font-mono">Current Spectrum</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.glow}` }} />
            <span className="text-[10px] tracking-widest text-white/50 uppercase font-mono">{spectrum}</span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-1.5 w-full bg-white/5 rounded-full relative overflow-hidden">
          <motion.div
            initial={{ width: '33%' }}
            animate={{ width: c.width }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ backgroundColor: c.color, boxShadow: `0 0 12px ${c.glow}` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-white/15 font-mono">Entropy</span>
          <span className="text-[9px] text-white/15 font-mono">Integration</span>
          <span className="text-[9px] text-white/15 font-mono">Expansion</span>
        </div>

        <p className="mt-4 text-xs text-white/40 font-light leading-relaxed italic">
          {description || c.defaultDesc}
        </p>
      </div>
    </div>
  );
};
