import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSignal, SignalAnalysis } from '../services/signalFilter';
import { SedaGauge } from './visuals/SedaGauge';
import { SignalEmptyState } from './visuals/EmptyState';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const SpectrumBar: React.FC<{ label: string; value: number; color: string; glow: string }> = ({ label, value, color, glow }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-baseline">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">{label}</span>
      <span className="text-sm font-bold text-white">{value}<span className="text-[10px] text-neutral-600">/100</span></span>
    </div>
    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${glow}` }}
      />
    </div>
  </div>
);

const DensityBadge: React.FC<{ density: SignalAnalysis['density'] }> = ({ density }) => {
  const styles = {
    LOW: 'text-neutral-400 border-neutral-400/20 bg-neutral-400/5',
    MODERATE: 'text-[#E2E2E8] border-[#E2E2E8]/20 bg-[#E2E2E8]/5',
    HIGH: 'text-orange-400 border-orange-400/20 bg-orange-400/5',
    CRITICAL: 'text-red-400 border-red-400/20 bg-red-400/5',
  };

  return (
    <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${styles[density]}`}>
      {density === 'CRITICAL' ? '⚠ Critical' : density}
    </span>
  );
};

export const Signal = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<SignalAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = useCallback(() => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    // Slight delay for the scanning animation feel
    setTimeout(() => {
      const result = analyzeSignal(inputText);
      setAnalysis(result);
      setIsScanning(false);
    }, 350);
  }, [inputText]);

  const handleClear = () => {
    setInputText('');
    setAnalysis(null);
  };

  return (
    <div className="max-w-6xl mx-auto pt-4 md:pt-10 px-4 animate-fade-in">

      {/* Header */}
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60">Entropy Pre-Filter</span>
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-3">
          Signal
        </h1>
        <p className="text-[#A3A3A3] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Scan incoming messages before you read them. Know the emotional architecture of a signal before it reaches your nervous system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-start">

        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-5">

          {/* Text Input */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-7">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E2E2E8]/60 block mb-4">Incoming Signal</span>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste a text message, email, or any communication you want to scan…"
              className="w-full bg-[#050505]/50 border border-white/[0.08] rounded-xl px-4 py-4 text-sm text-white focus:border-[#E2E2E8]/40 focus:outline-none transition-all resize-none leading-relaxed placeholder:text-neutral-600"
              rows={10}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-neutral-600">
                {inputText.trim() ? `${inputText.split(/\s+/).filter(Boolean).length} words` : 'Waiting for signal…'}
              </span>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleScan}
            disabled={!inputText.trim() || isScanning}
            className="w-full py-4 rounded-2xl bg-[#E2E2E8] text-black font-semibold text-sm hover:bg-[#C8C8D0] transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(226,226,232,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isScanning ? 'Scanning entropy…' : 'Scan Signal'}
          </button>

          {/* Quick Guide */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-7">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-4">How It Works</span>
            <div className="space-y-3 text-xs text-[#A3A3A3] leading-relaxed">
              <p><span className="text-red-400 font-medium">Entropy</span> — Conflict markers. Blame, pressure, guilt, withdrawal. The higher this reads, the more structural load the message carries.</p>
              <p><span className="text-[#E2E2E8] font-medium">Integration</span> — Processing markers. Repair attempts, reflection, shared understanding. This signal is being metabolized.</p>
              <p><span className="text-emerald-400 font-medium">Expansion</span> — Connection markers. Warmth, trust, support, gratitude. This is structurally safe to receive.</p>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-5">
          <AnimatePresence mode="wait">
            {analysis && analysis.markerCount > 0 ? (
              <motion.div key="results" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-5">

                {/* Flag — The headline */}
                <motion.div variants={fadeUp} className={`rounded-3xl border backdrop-blur-2xl p-8 ${
                  analysis.spectrum === 'ENTROPY'
                    ? 'border-red-500/[0.12] bg-red-500/[0.02]'
                    : analysis.spectrum === 'EXPANSION'
                    ? 'border-emerald-500/[0.12] bg-emerald-500/[0.02]'
                    : 'border-[#E2E2E8]/[0.12] bg-[#E2E2E8]/[0.02]'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Signal Reading</span>
                    <DensityBadge density={analysis.density} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{analysis.flag}</h3>
                  <p className="text-sm text-[#A3A3A3] leading-relaxed">{analysis.body}</p>
                </motion.div>

                {/* Spectrum Bars */}
                <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-5">Spectrum Analysis</span>
                  <div className="space-y-4">
                    <SpectrumBar label="Entropy" value={analysis.entropy} color="#EF4444" glow="rgba(239,68,68,0.3)" />
                    <SpectrumBar label="Integration" value={analysis.integration} color="#E2E2E8" glow="rgba(226,226,232,0.3)" />
                    <SpectrumBar label="Expansion" value={analysis.expansion} color="#10B981" glow="rgba(16,185,129,0.3)" />
                  </div>
                </motion.div>

                {/* SEDA Gauge */}
                <motion.div variants={fadeUp}>
                  <SedaGauge spectrum={analysis.spectrum} />
                </motion.div>

                {/* Detected Markers */}
                {analysis.topMarkers.length > 0 && (
                  <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-4">Detected Markers</span>
                    <div className="flex flex-wrap gap-2">
                      {analysis.topMarkers.map((marker, i) => (
                        <span key={i} className="text-[11px] px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[#A3A3A3]">
                          {marker}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-neutral-600 mt-3">{analysis.markerCount} total markers detected across all spectrums</p>
                  </motion.div>
                )}

                {/* Preparation — The intervention */}
                {analysis.preparation && (
                  <motion.div variants={fadeUp} className="rounded-3xl border border-emerald-500/[0.08] bg-emerald-500/[0.02] backdrop-blur-2xl p-8">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/60 block mb-3">Preparation</span>
                    <p className="text-sm text-[#A3A3A3] leading-relaxed">{analysis.preparation}</p>
                  </motion.div>
                )}

              </motion.div>
            ) : analysis && analysis.markerCount === 0 ? (
              <motion.div key="neutral" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-10 text-center">
                <div className="w-14 h-14 rounded-full border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
                  <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Clean signal.</h3>
                <p className="text-sm text-[#A3A3A3] max-w-sm mx-auto leading-relaxed">No significant emotional markers detected. This message is low-charge — safe to engage at your natural pace.</p>
              </motion.div>
            ) : (
              <SignalEmptyState />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
