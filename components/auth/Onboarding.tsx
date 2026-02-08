
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { processBirthData } from '../../services/engine';
import { saveBirthData } from '../../services/globalContext';
import LivingBackground from '../visuals/LivingBackground';

const STEPS = [
  { id: 1, name: 'Welcome', desc: 'Introduction to DEFRAG' },
  { id: 2, name: 'Blueprint', desc: 'Generate your system map' },
  { id: 3, name: 'Calibration', desc: 'Processing architecture' },
];

export const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ date: '', time: '', location: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);

  const handleBlueprintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep(3);

    setTimeout(() => {
      try {
        const bp = processBirthData(formData.date, formData.time);
        saveBirthData(formData.date, formData.time);
        setBlueprint(bp);
        localStorage.setItem('defrag_user_data', JSON.stringify(bp));
        localStorage.setItem('defrag_onboarding_complete', 'true');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        console.error("Blueprint generation failed", error);
        setIsProcessing(false);
        setStep(2);
      }
    }, 2500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
      <LivingBackground mode={step === 3 ? "active" : "calm"} />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <motion.div
                className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${step >= s.id ? 'bg-white/[0.06]' : 'bg-white/[0.02]'}`}
                animate={{ scale: step === s.id ? 1.05 : 1 }}
              >
                <div className={`w-2 h-2 rounded-full ${step > s.id ? 'bg-emerald-500' : step === s.id ? 'bg-white animate-breathe' : 'bg-white/20'}`} />
                <span className={`text-xs font-medium tracking-wide ${step >= s.id ? 'text-white' : 'text-white/30'}`}>{s.name}</span>
              </motion.div>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/[0.06] mx-2" />}
            </div>
          ))}
        </div>

        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 md:p-12 shadow-[0_8px_60px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-white/[0.01] blur-[60px] animate-breathe-slow pointer-events-none" />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-6">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-3">Welcome to <span className="bg-gradient-to-r from-white via-neutral-400 to-white bg-clip-text text-transparent">DEFRAG</span></h2>
                  <p className="text-neutral-400 text-base leading-relaxed max-w-md mx-auto">
                    From fragmentation to flow. We'll map your internal architecture in three steps.
                  </p>
                </div>
                <div className="space-y-4 mb-10">
                  {[
                    { icon: '◉', label: 'The Map', desc: 'Your 9 energy centers and 64 activation points — decoded' },
                    { icon: '⬡', label: 'The Field', desc: 'Relational geometry — how people pull you in or out of balance' },
                    { icon: '◈', label: 'The Memory', desc: 'Pattern detection across 30-day behavioral windows' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-neutral-500 text-xl mt-0.5">{item.icon}</span>
                      <div>
                        <div className="font-semibold text-white mb-1">{item.label}</div>
                        <div className="text-sm text-neutral-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-black rounded-2xl py-4 font-semibold hover:bg-neutral-200 transition-all shadow-[0_4px_30px_-4px_rgba(255,255,255,0.15)]"
                >
                  Begin Mapping
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="blueprint"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Your Blueprint</h2>
                  <p className="text-neutral-400 text-sm">Enter your birth data so we can map your precise architecture.</p>
                </div>

                <form onSubmit={handleBlueprintSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-1 font-medium">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#E2E2E8]/50 transition-all [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-1 font-medium">Time of Birth</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#E2E2E8]/50 transition-all [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-1 font-medium">Location <span className="text-neutral-700">(Optional)</span></label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#E2E2E8]/50 transition-all"
                    />
                    <p className="text-xs text-neutral-600 ml-1 mt-1">Used for precise architectural calculations.</p>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-2xl border border-white/10 text-neutral-400 font-medium hover:bg-white/5 hover:border-white/20 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!formData.date || !formData.time}
                      className="flex-1 bg-white text-black rounded-2xl py-4 font-semibold hover:bg-neutral-200 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-[0_4px_30px_-4px_rgba(255,255,255,0.15)]"
                    >
                      Generate Blueprint
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12"
              >
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                    <motion.div
                      className="w-20 h-20 rounded-full border-2 border-white/20 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight mb-3">Calibrating <span className="bg-gradient-to-r from-white via-neutral-400 to-neutral-300 bg-clip-text text-transparent">Architecture</span></h2>
                <p className="text-neutral-400 text-sm mb-8 max-w-md mx-auto">
                  Processing {blueprint?.personality?.gates?.length || 0} activation points across 9 centers...
                </p>

                <div className="space-y-3 max-w-sm mx-auto">
                  {[
                    { label: 'Calculating positional data', delay: 0 },
                    { label: 'Mapping energy centers', delay: 0.5 },
                    { label: 'Detecting friction patterns', delay: 1 },
                    { label: 'Assembling your blueprint', delay: 1.5 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: item.delay }}
                      className="flex items-center gap-3 text-sm text-neutral-500"
                    >
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: item.delay }}
                      />
                      {item.label}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
