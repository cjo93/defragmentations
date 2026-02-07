import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SedaGauge } from './visuals/SedaGauge';
import { EchoEmptyState } from './visuals/EmptyState';
import {
  analyzeEcho,
  EchoReport,
  EchoEntry,
  RecurringLoop,
  loadEntries,
  addEntry,
  deleteEntry,
} from '../services/echoEngine';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

// ── System Drag Meter ───────────────────────────────────────
const DragMeter: React.FC<{ drag: number; status: string }> = ({ drag, status }) => {
  const color = status === 'CHRONIC_PATTERN' ? '#EF4444' : status === 'ACTIVE_LOOP' ? '#E2E2E8' : '#14B8A6';
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">System Drag</span>
        <span className="text-2xl font-bold text-white">{drag}<span className="text-sm text-neutral-500">/100</span></span>
      </div>
      <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${drag}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ── Loop Card ───────────────────────────────────────────────
const LoopCard: React.FC<{ loop: RecurringLoop; index: number }> = ({ loop, index }) => (
  <motion.div
    variants={fadeUp}
    className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${loop.systemDrag > 50 ? 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : loop.systemDrag > 25 ? 'bg-[#E2E2E8] shadow-[0_0_8px_rgba(226,226,232,0.5)]' : 'bg-teal-400'}`} />
        <span className="text-sm font-bold text-white">{loop.theme}</span>
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
        loop.systemDrag > 50
          ? 'text-red-400 border-red-400/20 bg-red-400/5'
          : loop.systemDrag > 25
          ? 'text-[#E2E2E8] border-[#E2E2E8]/20 bg-[#E2E2E8]/5'
          : 'text-teal-400 border-teal-400/20 bg-teal-400/5'
      }`}>Drag: {loop.systemDrag}</span>
    </div>

    <p className="text-sm text-[#A3A3A3] leading-relaxed mb-4">{loop.description}</p>

    {/* Frequency & Intensity */}
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 block">Frequency</span>
        <span className="text-lg font-bold text-white">{loop.frequency} <span className="text-xs text-neutral-500">entries</span></span>
      </div>
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 block">Intensity</span>
        <span className="text-lg font-bold text-white">{loop.intensity} <span className="text-xs text-neutral-500">markers/entry</span></span>
      </div>
    </div>

    {/* Matched Entries */}
    <div className="space-y-2 mb-5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Echoes Found</span>
      {loop.matches.slice(0, 3).map((m, i) => (
        <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-[#E2E2E8]/60">{new Date(m.date).toLocaleDateString()}</span>
            <div className="flex gap-1">
              {m.matchedMarkers.slice(0, 3).map((mk, j) => (
                <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-neutral-500">{mk}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#A3A3A3] leading-relaxed italic">{m.excerpt}</p>
        </div>
      ))}
      {loop.matches.length > 3 && (
        <p className="text-[10px] text-neutral-600">+ {loop.matches.length - 3} more entries</p>
      )}
    </div>

    {/* The Adjustment */}
    <div className="rounded-xl border border-emerald-500/[0.08] bg-emerald-500/[0.02] p-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/60 block mb-2">Mechanical Adjustment</span>
      <p className="text-sm text-[#A3A3A3] leading-relaxed">{loop.adjustment}</p>
    </div>
  </motion.div>
);

// ── Main Component ──────────────────────────────────────────
export const Echo = () => {
  const [entries, setEntries] = useState<EchoEntry[]>([]);
  const [newText, setNewText] = useState('');
  const [report, setReport] = useState<EchoReport | null>(null);
  const [userType] = useState('Projector'); // TODO: pull from user's blueprint
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load entries on mount
  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const handleAddEntry = useCallback(() => {
    if (!newText.trim()) return;
    const updated = addEntry(newText.trim());
    setEntries(updated);
    setNewText('');
  }, [newText]);

  const handleDeleteEntry = useCallback((id: string) => {
    const updated = deleteEntry(id);
    setEntries(updated);
    // Re-run analysis if report is showing
    if (report) {
      const newReport = analyzeEcho(updated, userType);
      setReport(newReport);
    }
  }, [report, userType]);

  const handleAnalyze = useCallback(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeEcho(entries, userType);
      setReport(result);
      setIsAnalyzing(false);
    }, 400);
  }, [entries, userType]);

  return (
    <div className="max-w-6xl mx-auto pt-4 md:pt-10 px-4 animate-fade-in pb-20">

      {/* Header */}
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60">Pattern Recognition</span>
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-3">
          Echo
        </h1>
        <p className="text-[#A3A3A3] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Log what you feel. Over time, the Architect identifies the loops — the recurring themes your conscious mind misses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-start">

        {/* Input + Journal Panel */}
        <div className="lg:col-span-5 space-y-5">

          {/* New Entry */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-7">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E2E2E8]/60 block mb-4">Log a Signal</span>
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="What are you feeling right now? What happened today? Write freely — the Architect is listening for patterns, not grammar."
              className="w-full bg-[#050505]/50 border border-white/[0.08] rounded-xl px-4 py-4 text-sm text-white focus:border-[#E2E2E8]/40 focus:outline-none transition-all resize-none leading-relaxed placeholder:text-neutral-600"
              rows={6}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-neutral-600">
                {entries.length} total entries logged
              </span>
              <button
                onClick={handleAddEntry}
                disabled={!newText.trim()}
                className="text-xs font-semibold px-5 py-2 rounded-xl bg-white/[0.06] border border-white/[0.06] text-white hover:bg-white/[0.1] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Log Entry
              </button>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={entries.length < 2 || isAnalyzing}
            className="w-full py-4 rounded-2xl bg-[#E2E2E8] text-black font-semibold text-sm hover:bg-[#C8C8D0] transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(226,226,232,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Scanning for patterns…' : entries.length < 2 ? 'Need at least 2 entries' : `Analyze ${entries.length} Entries`}
          </button>

          {/* Recent Entries */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-7">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-4">Recent Entries</span>
            {entries.length === 0 ? (
              <EchoEmptyState />
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {entries.slice(0, 15).map((entry) => (
                  <div key={entry.id} className="group rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 hover:border-white/[0.08] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[#E2E2E8]/60">{new Date(entry.date).toLocaleDateString()} · {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <div className="flex items-center gap-2">
                        {entry.spectrum && (
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            entry.spectrum.spectrum === 'ENTROPY' ? 'text-red-400/60 bg-red-400/5' :
                            entry.spectrum.spectrum === 'EXPANSION' ? 'text-emerald-400/60 bg-emerald-400/5' :
                            'text-[#E2E2E8]/60 bg-[#E2E2E8]/5'
                          }`}>{entry.spectrum.spectrum}</span>
                        )}
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600 hover:text-red-400"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">{entry.text.length > 200 ? entry.text.slice(0, 200) + '…' : entry.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-5">
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div key="report" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-5">

                {/* System Drag Score */}
                <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                  <DragMeter drag={report.overallDrag} status={report.status} />
                  <p className="text-sm text-[#A3A3A3] leading-relaxed mt-4">{report.insight}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
                      report.status === 'CHRONIC_PATTERN' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                      report.status === 'ACTIVE_LOOP' ? 'text-[#E2E2E8] border-[#E2E2E8]/20 bg-[#E2E2E8]/5' :
                      'text-teal-400 border-teal-400/20 bg-teal-400/5'
                    }`}>{report.status.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-neutral-600">{report.totalEntries} entries · {report.windowDays}-day window</span>
                  </div>
                </motion.div>

                {/* SEDA Gauge */}
                <motion.div variants={fadeUp}>
                  <SedaGauge
                    spectrum={report.overallDrag > 60 ? 'ENTROPY' : report.overallDrag > 25 ? 'INTEGRATION' : 'EXPANSION'}
                    description={
                      report.overallDrag > 60
                        ? 'The pattern is chronic. The system is repeating the same loop. Conscious intervention is required.'
                        : report.overallDrag > 25
                        ? 'An active loop is being processed. The Architect has identified the theme — awareness is the first step.'
                        : 'The architecture is running clean. No dominant Not-Self loops detected in this window.'
                    }
                  />
                </motion.div>

                {/* Recurring Loops */}
                {report.loops.length > 0 ? (
                  report.loops.map((loop, i) => (
                    <LoopCard key={i} loop={loop} index={i} />
                  ))
                ) : (
                  <motion.div variants={fadeUp} className="rounded-3xl border border-teal-500/[0.08] bg-teal-500/[0.02] backdrop-blur-2xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full border border-teal-500/[0.12] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Clean signal.</h3>
                    <p className="text-sm text-[#A3A3A3] max-w-sm mx-auto leading-relaxed">No recurring Not-Self loops detected in the last {report.windowDays} days. The architecture is running as designed.</p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl h-[500px] md:h-[600px] flex flex-col items-center justify-center text-center p-10">
                <div className="w-16 h-16 rounded-full border border-white/[0.08] flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">The temporal observer.</h3>
                <p className="text-sm text-[#A3A3A3] max-w-sm leading-relaxed">
                  Log what you feel over days and weeks. Echo watches for recurring themes — the behavioral loops your conscious mind overlooks.
                </p>
                <p className="text-xs text-neutral-600 mt-4 max-w-xs">
                  Minimum 2 entries needed. The more data, the sharper the pattern recognition.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
