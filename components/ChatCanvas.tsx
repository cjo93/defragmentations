
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CanvasBlock } from '../types';
import { processBirthData } from '../services/engine';
import { loadBirthData } from '../services/globalContext';
import { loadEntries, analyzeEcho, RecurringLoop } from '../services/echoEngine';

/* ─── Blueprint Canvas — Shows user's system map inline ────── */
const BlueprintCanvas: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const bd = loadBirthData();
    if (bd) {
      setData(processBirthData(bd.date, bd.time));
    }
  }, []);

  if (!data) return (
    <div className="text-center py-6 text-neutral-500 text-xs">
      No birth data found. Complete onboarding first to see your blueprint.
    </div>
  );

  const centers = data.personality?.centers || {};
  const definedList = Object.entries(centers).filter(([, v]) => v).map(([k]) => k);
  const openList = Object.entries(centers).filter(([, v]) => !v).map(([k]) => k);

  return (
    <div className="space-y-4">
      {/* Type + Strategy + Authority */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Type', value: data.type },
          { label: 'Strategy', value: data.strategy },
          { label: 'Authority', value: data.authority },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.03] rounded-xl p-3 text-center">
            <span className="text-[9px] uppercase tracking-wider text-neutral-500 block mb-1">{item.label}</span>
            <span className="text-xs font-semibold text-white">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Centers */}
      <div className="space-y-2">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500">Consistent traits ({definedList.length})</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {definedList.map(c => (
              <span key={c} className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white/80 capitalize">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-neutral-500">Influenced by others ({openList.length})</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {openList.map(c => (
              <span key={c} className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] text-neutral-500 capitalize">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Breathing Canvas — Inline guided breathing ─────────── */
const BREATHING_PHASES = [
  { label: 'Breathe in', duration: 4000, scale: 1.4 },
  { label: 'Hold', duration: 4000, scale: 1.4 },
  { label: 'Breathe out', duration: 6000, scale: 1.0 },
  { label: 'Rest', duration: 2000, scale: 1.0 },
];

const BreathingCanvas: React.FC = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [active, setActive] = useState(false);
  const phase = BREATHING_PHASES[phaseIndex];

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setPhaseIndex(p => (p + 1) % BREATHING_PHASES.length);
    }, phase.duration);
    return () => clearInterval(interval);
  }, [phaseIndex, active, phase.duration]);

  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      {!active ? (
        <button
          onClick={() => setActive(true)}
          className="text-xs px-5 py-2.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 transition-all"
        >
          Start breathing exercise
        </button>
      ) : (
        <>
          <motion.div
            animate={{ scale: phase.scale }}
            transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center"
          >
            <div className="w-6 h-6 rounded-full bg-teal-400/40" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span
              key={phase.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-sm text-teal-300 font-medium"
            >
              {phase.label}
            </motion.span>
          </AnimatePresence>
          <button
            onClick={() => { setActive(false); setPhaseIndex(0); }}
            className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Stop
          </button>
        </>
      )}
    </div>
  );
};

/* ─── Pattern Canvas — Shows echo patterns inline ──────────── */
const PatternCanvas: React.FC = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const entries = loadEntries();
    if (entries.length > 0) {
      const bd = loadBirthData();
      const blueprint = bd ? processBirthData(bd.date, bd.time) : null;
      const analysis = analyzeEcho(entries, blueprint?.type || 'Generator', 30);
      setReport(analysis);
    }
  }, []);

  if (!report || !report.loops || report.loops.length === 0) {
    return (
      <div className="text-center py-4 text-neutral-500 text-xs">
        No patterns detected yet. Keep journaling in the chat — the pattern tracker needs a few entries to find recurring themes.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500">30-Day Patterns</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400">{report.loops.length} detected</span>
      </div>
      {report.loops.slice(0, 4).map((loop: RecurringLoop, i: number) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
          <div>
            <span className="text-xs text-white font-medium block">{loop.theme}</span>
            <span className="text-[10px] text-neutral-500">{loop.frequency} occurrences · drag {loop.systemDrag}/100</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Explain Canvas — Concept explainer with visual ──────── */
const ExplainCanvas: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-xs font-semibold text-white">{title || 'Concept'}</span>
      </div>
      <p className="text-[11px] text-neutral-400 leading-relaxed">
        The AI's explanation is in the message above. This card highlights that DEFRAG identified a concept worth exploring further.
      </p>
    </div>
  );
};

/* ─── Main Canvas Router ──────────────────────────────────── */
export const ChatCanvas: React.FC<{ canvas: CanvasBlock }> = ({ canvas }) => {
  const titles: Record<string, string> = {
    BLUEPRINT: 'Your Blueprint',
    BREATHING: 'Grounding Exercise',
    PATTERN: 'Pattern Tracker',
    ORBIT: 'Relationship Map',
    EXPLAIN: canvas.title || 'Deep Dive',
  };

  const renderContent = () => {
    switch (canvas.type) {
      case 'BLUEPRINT': return <BlueprintCanvas />;
      case 'BREATHING': return <BreathingCanvas />;
      case 'PATTERN': return <PatternCanvas />;
      case 'EXPLAIN': return <ExplainCanvas title={canvas.title} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
    >
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
          {titles[canvas.type] || 'Canvas'}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe" />
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </motion.div>
  );
};
