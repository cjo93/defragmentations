
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BREATHING_PHASES = [
  { label: 'Breathe in', duration: 4000, scale: 1.3 },
  { label: 'Hold', duration: 4000, scale: 1.3 },
  { label: 'Breathe out', duration: 6000, scale: 1.0 },
  { label: 'Rest', duration: 2000, scale: 1.0 },
];

const GROUNDING_STEPS = [
  'Name five things you can see right now.',
  'Name four things you can physically touch.',
  'Name three things you can hear.',
  'Name two things you can smell.',
  'Name one thing you can taste.',
];

export const SafePlace: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showGrounding, setShowGrounding] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);

  const phase = BREATHING_PHASES[phaseIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev + 100 >= phase.duration) {
          setPhaseIndex(p => (p + 1) % BREATHING_PHASES.length);
          return 0;
        }
        return prev + 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [phaseIndex, phase.duration]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-[#050505] relative overflow-hidden min-h-screen">
      {/* Ambient background glow — shifts to teal/emerald for calm */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(20,184,166,0.06)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,_rgba(226,226,232,0.04)_0%,_transparent_80%)] pointer-events-none" />

      <div className="relative z-10 text-center space-y-12 max-w-xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-400/60">Grounding Protocol</span>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Ground state.
          </h1>
          <p className="text-[#A3A3A3] text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Analysis paused. The only task right now is to settle the system. Breathe with the light.
          </p>
        </motion.div>

        {/* Breathing Orb */}
        <div className="relative flex items-center justify-center h-64 md:h-72">
          {/* Outer glow */}
          <motion.div
            animate={{ scale: phase.scale, opacity: phase.scale > 1 ? 0.5 : 0.2 }}
            transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
            className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full bg-teal-400/15 blur-[60px]"
          />
          {/* Ring */}
          <motion.div
            animate={{ scale: phase.scale }}
            transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
            className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full border border-teal-400/20"
          />
          {/* Core Orb */}
          <motion.div
            animate={{
              scale: phase.scale,
              boxShadow: phase.scale > 1
                ? '0 0 120px rgba(20,184,166,0.4)'
                : '0 0 60px rgba(20,184,166,0.15)',
            }}
            transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-teal-300 to-teal-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.35)_0%,_transparent_70%)]" />
          </motion.div>
        </div>

        {/* Phase Label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={phaseIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xl md:text-2xl font-medium text-white tracking-tight"
          >
            {phase.label}
          </motion.p>
        </AnimatePresence>

        {/* Timer bar */}
        <div className="w-48 mx-auto h-px bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-teal-400/50"
            style={{ width: `${(timer / phase.duration) * 100}%` }}
          />
        </div>

        {/* Grounding Exercise Toggle */}
        <div className="pt-4">
          <button
            onClick={() => { setShowGrounding(!showGrounding); setGroundingStep(0); }}
            className="text-[13px] text-[#A3A3A3] hover:text-teal-300 transition-colors duration-300 underline underline-offset-4 decoration-white/10 hover:decoration-teal-400/40"
          >
            {showGrounding ? 'Close grounding exercise' : 'Try a grounding exercise'}
          </button>

          <AnimatePresence>
            {showGrounding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden"
              >
                <div className="mt-8 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 text-left space-y-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400/60">5-4-3-2-1 Grounding</span>
                  <p className="text-white font-medium text-lg">{GROUNDING_STEPS[groundingStep]}</p>
                  <p className="text-[#A3A3A3] text-sm">Step {groundingStep + 1} of {GROUNDING_STEPS.length}</p>
                  <div className="flex gap-3 pt-2">
                    {groundingStep > 0 && (
                      <button onClick={() => setGroundingStep(s => s - 1)} className="px-5 py-2 rounded-xl border border-white/10 text-sm text-[#A3A3A3] hover:bg-white/5 transition-all">Back</button>
                    )}
                    {groundingStep < GROUNDING_STEPS.length - 1 ? (
                      <button onClick={() => setGroundingStep(s => s + 1)} className="px-5 py-2 rounded-xl bg-teal-500/20 border border-teal-400/20 text-sm text-teal-300 hover:bg-teal-500/30 transition-all">Next</button>
                    ) : (
                      <button onClick={() => setShowGrounding(false)} className="px-5 py-2 rounded-xl bg-teal-500/20 border border-teal-400/20 text-sm text-teal-300 hover:bg-teal-500/30 transition-all">Complete</button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Crisis Resources */}
        <div className="pt-6 space-y-4">
          <div className="w-px h-12 bg-gradient-to-b from-teal-400/30 to-transparent mx-auto" />
          <p className="text-[11px] text-neutral-500 uppercase tracking-[0.15em]">If the weight is too much</p>
          <div className="space-y-2 text-sm text-[#A3A3A3]">
            <p><span className="text-white font-medium">988 Suicide & Crisis Lifeline</span> — Call or text 988</p>
            <p><span className="text-white font-medium">Crisis Text Line</span> — Text HOME to 741741</p>
            <p><span className="text-white font-medium">SAMHSA Helpline</span> — 1-800-662-4357</p>
          </div>
          <p className="text-xs text-neutral-600 mt-4 max-w-sm mx-auto leading-relaxed">When you are ready, return to the dashboard. The architecture will be waiting.</p>
        </div>
      </div>
    </div>
  );
};
