import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFRAG_MANIFEST } from '../constants/manifest';
import { processBirthData, calculateTransits, TransitReport } from '../services/engine';
import { loadBirthData } from '../services/globalContext';
import { loadEntries, analyzeEcho } from '../services/echoEngine';
import { calculateSEDA } from '../services/sedaCalculator';
import { SystemMap } from './visuals/SystemMap';
import { HelpIcon } from './visuals/HelpTooltips';
import { FamilyManager } from './FamilyManager';
import { GenerationalOverlay } from './GenerationalOverlay';
import { loadActivityLog, logActivity, ActivityEntry } from '../services/familyService';

/* ─── Type Descriptions (new-user friendly) ─────────────────── */
const TYPE_INTROS: Record<string, { line: string; action: string }> = {
  'Generator': {
    line: 'You have consistent life-force energy. You\'re built to respond to what lights you up — not to initiate from scratch.',
    action: 'Your strategy is to wait for something to respond to. When it excites you, go all in.',
  },
  'Manifesting Generator': {
    line: 'You have the energy of a Generator with the speed of a Manifestor. Multi-passionate, fast-moving, non-linear.',
    action: 'Wait to respond, then move fast. Skip what bores you — that\'s your design working correctly.',
  },
  'Projector': {
    line: 'You see systems and people more clearly than anyone. You\'re built to guide — not to grind.',
    action: 'Wait to be recognized and invited. Your efficiency comes from wisdom, not force.',
  },
  'Manifestor': {
    line: 'You\'re built to initiate and set things in motion. You need freedom — and people need a heads-up before you move.',
    action: 'Inform the people around you, then act. Resistance drops when others aren\'t blindsided.',
  },
  'Reflector': {
    line: 'You mirror everything around you. Your openness is your superpower — you feel the health of every room you enter.',
    action: 'Wait a full lunar cycle before major decisions. Your clarity comes from patience, not pressure.',
  },
};

/* ─── SVG Progress Ring ─────────────────────────────────────── */
const ProgressRing: React.FC<{ value: number; size?: number; label: string; sub?: string }> = ({ value, size = 100, label, sub }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="4"
          strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="text-center -mt-[calc(50%+14px)] mb-4">
        <span className="text-xl font-bold text-white">{value}%</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">{label}</span>
      {sub && <span className="text-[10px] text-neutral-600 -mt-2">{sub}</span>}
    </div>
  );
};

/* ─── Action Card ───────────────────────────────────────────── */
const ActionCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick: () => void; primary?: boolean }> = ({ icon, title, desc, onClick, primary }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`group text-left rounded-2xl border p-5 transition-all duration-500 relative overflow-hidden w-full ${
      primary
        ? 'bg-white/[0.06] border-white/[0.12] hover:bg-white/[0.09] hover:border-white/[0.2] shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]'
        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.14]'
    }`}
  >
    <div className="card-inner-glow" />
    <div className="relative z-10 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${primary ? 'bg-white/[0.08] border border-white/[0.15]' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h4 className="text-[13px] font-semibold text-white mb-0.5">{title}</h4>
        <p className="text-[11px] text-neutral-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  </motion.button>
);

/* ─── Collapsible Section ───────────────────────────────────── */
const CollapsibleSection: React.FC<{ title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, badge, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{title}</span>
          {badge && <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-neutral-500">{badge}</span>}
        </div>
        <motion.svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-neutral-600"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.04]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Activity Item ─────────────────────────────────────────── */
const ActivityItem: React.FC<{ icon: string; text: string; time: string; accent?: string }> = ({ icon, text, time, accent }) => (
  <div className="flex items-start gap-3 py-3 border-b border-white/[0.03] last:border-0">
    <span className="text-sm mt-0.5">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] text-neutral-300 leading-relaxed truncate">{text}</p>
      <span className="text-[10px] text-neutral-600">{time}</span>
    </div>
    {accent && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-neutral-400 shrink-0">{accent}</span>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
export const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [transits, setTransits] = useState<TransitReport | null>(null);
  const [clarityScore, setClarityScore] = useState(0);
  const [stabilityScore, setStabilityScore] = useState(50);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [familyRefreshKey, setFamilyRefreshKey] = useState(0);

  useEffect(() => {
    const birthData = loadBirthData();
    if (birthData) {
      const bp = processBirthData(birthData.date, birthData.time);
      setUserData(bp);
      const tr = calculateTransits(bp);
      setTransits(tr);
      logActivity('◉', 'Dashboard loaded with live data', 'System');
    } else {
      try {
        const legacy = localStorage.getItem('defrag_user_data');
        if (legacy) { setUserData(JSON.parse(legacy)); return; }
      } catch {}
      const demo = processBirthData('1993-07-26', '20:00');
      (demo as any)._isDemo = true;
      setUserData(demo);
    }
  }, []);

  useEffect(() => {
    const entries = loadEntries();
    if (entries.length > 0) {
      const userType = userData?.type || 'Generator';
      const echo = analyzeEcho(entries, userType, 30);
      setClarityScore(Math.round(Math.max(0, 100 - echo.overallDrag)));
    } else {
      setClarityScore(50);
    }
    const recentText = entries.slice(-5).map(e => e.text).join(' ');
    if (recentText) {
      const seda = calculateSEDA(recentText);
      setStabilityScore(100 - seda.score);
    } else {
      setStabilityScore(50);
    }
  }, [userData]);

  useEffect(() => { setActivityLog(loadActivityLog()); }, [familyRefreshKey]);

  const handleFamilyUpdate = useCallback(() => { setFamilyRefreshKey(k => k + 1); }, []);

  if (!userData) return (
    <div className="flex flex-col items-center justify-center h-full bg-transparent gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border border-white/[0.06] animate-ping" />
        <div className="absolute inset-2 rounded-full bg-white/[0.06] animate-pulse" />
        {/* Removed extra animation per strict platform alignment */}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 animate-pulse">Calibrating...</span>
    </div>
  );

  const definedCenters = Object.values(userData.centers || {}).filter(Boolean).length;
  const totalCenters = 9;
  const isDemo = !!(userData as any)?._isDemo;
  const typeInfo = TYPE_INTROS[userData.type] || TYPE_INTROS['Generator'];

  return (
     <div className="relative text-slate-200 font-sans overflow-y-auto h-full">
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 p-6 max-w-6xl mx-auto space-y-6"
      >
        {/* Blueprint Purchase CTA - subtle glow, no green */}
        <div className="flex justify-end p-4">
          <button
            className="px-6 py-3 rounded-xl bg-white/[0.07] border border-white/[0.13] text-white font-semibold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.09)] hover:bg-white/[0.12] hover:border-white/[0.18] transition-all"
            onClick={() => window.open('https://stripe.com', '_blank')}
          >
            Access Full Blueprint
          </button>
        </div>
        {/* ...existing code... */}
      </motion.main>

      {/* ─── DEMO BANNER ─────────────────────────────────── */}
      {isDemo && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-6 mt-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.09] flex items-center gap-4 shadow-[0_0_40px_-10px_rgba(255,255,255,0.09)]"
        >
          <div className="w-8 h-8 rounded-xl bg-white/[0.09] border border-white/[0.13] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white/80">Demo mode: blueprint is simulated.</p>
            <p className="text-[10px] text-white/60 mt-0.5">Complete onboarding to generate your real system map.</p>
          </div>
          <button onClick={() => navigate('/onboarding')} className="px-4 py-2 rounded-xl bg-white/[0.09] border border-white/[0.13] text-[11px] font-semibold text-white/80 hover:bg-white/[0.13] transition-all shrink-0">
            Begin Mapping
          </button>
        </motion.div>
      )}

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 p-6 max-w-6xl mx-auto space-y-6"
      >

        {/* ═══ 1. WELCOME + IDENTITY ═════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-7 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl p-8 md:p-10 relative overflow-hidden"
          >
            {/* Removed extra animation per strict platform alignment */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                {/* Removed extra animation per strict platform alignment */}
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                  {isDemo ? 'Demo Blueprint' : 'Your Blueprint'}
                </span>
              </div>

              <h1 className="text-[28px] md:text-[34px] font-bold tracking-[-0.03em] leading-[1.15] mb-4">
                You're a{/^[aeiouAEIOU]/.test(userData.type) ? 'n' : ''}{' '}
                <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-400 bg-clip-text text-transparent">{userData.type}.</span>
              </h1>
              <p className="text-[15px] text-neutral-400 leading-[1.7] mb-2">{typeInfo.line}</p>
              <p className="text-[13px] text-neutral-500 leading-[1.7] italic">{typeInfo.action}</p>

              {/* Key stats — single instance, horizontal */}
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/[0.05]">
                {[
                  { v: userData.strategy, l: 'Strategy' },
                  { v: userData.authority, l: 'Authority' },
                  { v: userData.profile || '—', l: 'Profile' },
                  { v: `${definedCenters}/9`, l: 'Defined' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-[13px] font-semibold text-white">{s.v}</span>
                    <span className="text-[10px] text-neutral-600">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* System Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5 h-[320px] bg-white/[0.02] border border-white/[0.06] rounded-3xl p-2 relative backdrop-blur-sm overflow-hidden group hover:border-white/[0.1] transition-all duration-700"
          >
            {/* Removed extra animation per strict platform alignment */}
            <SystemMap dynamics={userData.relationalDynamics} />
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">Your Map</span>
                <HelpIcon tooltip="Colored areas are your consistent traits. Open areas absorb others' energy — knowing which is which is the key to less friction." />
              </div>
              <span className="text-[10px] text-neutral-700">{isDemo ? 'Demo' : 'Live'}</span>
            </div>
          </motion.div>
        </section>

        {/* ═══ 2. WHAT TO DO ═════════════════════════════════ */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 block mb-4 ml-1">Blueprint Operations</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <ActionCard
                primary
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                title="Session: Structural Analysis"
                desc="Run a diagnostic. See friction mapped to your architecture. No labels, just clarity."
                onClick={() => navigate('/chatbot')}
              />
              <ActionCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                title="Relationship Mapping"
                desc="Map structural dynamics between you and another. See friction, not blame."
                onClick={() => navigate('/orbit')}
              />
              <ActionCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                title="Signal Filter"
                desc="Distinguish real signals from noise. Identify structural stress points."
                onClick={() => navigate('/signal')}
              />
              <ActionCard
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4-8a3 3 0 016 0v1" /></svg>}
                title="Voice Mode"
                desc="Speak your friction. The system maps it in real time. Hands-free, architect language."
                onClick={() => navigate('/chatbot')}
              />
            </div>
          </motion.div>
        </section>

        {/* ═══ 3. PROGRESS — Rings + Activity ════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Progress Rings */}
          <div className="md:col-span-4">
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Your Readings</span>
                <HelpIcon tooltip="These update as you use DEFRAG. Start a chat session or journal to see your scores change." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <ProgressRing value={Math.round((definedCenters / totalCenters) * 100)} size={72} label="Defined" sub={`${definedCenters} of 9`} />
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <ProgressRing value={clarityScore} size={72} label="Clarity" sub={clarityScore > 70 ? 'Clear' : clarityScore > 40 ? 'Moderate' : 'Noisy'} />
                </div>
                <div className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <ProgressRing value={stabilityScore} size={72} label="Stability" sub={stabilityScore > 70 ? 'Grounded' : stabilityScore > 40 ? 'Managing' : 'Under load'} />
                </div>
              </div>
              {clarityScore === 50 && stabilityScore === 50 && (
                <p className="text-[10px] text-neutral-600 text-center mt-4 italic">Start a session to see your scores update in real time.</p>
              )}
            </div>
          </div>

          {/* Activity + Transit Preview */}
          <div className="md:col-span-8 space-y-6">
            {/* Today's Weather — compact preview */}
            {transits && transits.aspects.length > 0 && (
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Today's Weather</span>
                  <HelpIcon tooltip="Current planetary positions compared to your birth chart. When they align, specific patterns get activated." />
                  <span className="ml-auto text-[10px] text-neutral-700">Live</span>
                </div>
                <div className="px-6 py-4">
                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">{transits.weatherSummary}</p>
                  <div className="flex flex-wrap gap-2">
                    {transits.aspects.slice(0, 4).map((a, i) => (
                      <span key={i} className={`text-[10px] px-2.5 py-1 rounded-full border ${
                        a.aspect === 'Conjunction' ? 'bg-white/10 text-white/70 border-white/20' :
                        a.aspect === 'Square' || a.aspect === 'Opposition' ? 'bg-red-500/10 text-red-400/70 border-red-500/20' :
                        'bg-emerald-500/10 text-emerald-400/70 border-emerald-500/20'
                      }`}>{a.transitPlanet} {a.aspect} {a.natalPlanet}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Stream */}
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Activity</span>
              </div>
              <div className="px-6 py-2">
                {activityLog.length > 0 ? (
                  activityLog.slice(0, 6).map((entry) => (
                    <ActivityItem key={entry.id} icon={entry.icon} text={entry.text} time={entry.time} accent={entry.accent} />
                  ))
                ) : (
                  <>
                    <ActivityItem icon="◉" text="Blueprint generated from your birth data" time="System" accent="Blueprint" />
                    <ActivityItem icon="⬡" text={`${definedCenters} personality areas mapped`} time="System" accent="Design" />
                    <ActivityItem icon="▹" text="Start a session in The Forge to begin tracking patterns" time="Next step" />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 4. ADVANCED — Collapsible ═════════════════════ */}
        <section className="space-y-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 block ml-1">Go Deeper</span>

          {/* Planetary Data */}
          {userData.astrology && (
            <CollapsibleSection title="Natal Positions" badge={`${Object.keys(userData.astrology).length} planets`}>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(userData.astrology).map(([planet, data]: [string, any], i) => (
                    <tr key={i} className="border-b border-white/[0.03] last:border-0">
                      <td className="px-6 py-3.5 text-neutral-500 capitalize">{planet}</td>
                      <td className="px-6 py-3.5 text-white font-medium text-right">{data.sign}</td>
                      <td className="px-6 py-3.5 text-neutral-600 text-right font-mono text-xs">{data.degree}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CollapsibleSection>
          )}

          {/* Full Transit Details */}
          {transits && transits.aspects.length > 0 && (
            <CollapsibleSection title="Transit Details" badge={`${transits.aspects.length} aspects`}>
              <div className="p-5 space-y-2">
                {transits.aspects.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.03] last:border-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${
                      a.aspect === 'Conjunction' ? 'bg-white/10 text-white border-white/20' :
                      a.aspect === 'Square' || a.aspect === 'Opposition' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>{a.aspect}</span>
                    <div className="flex-1">
                      <span className="text-xs text-white">{a.transitPlanet} → {a.natalPlanet}</span>
                      <span className="text-[10px] text-neutral-600 ml-2">orb {a.orb}°</span>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Family System */}
          <CollapsibleSection title="Family System" badge="Relationship mapping">
            <div className="p-5 space-y-5">
              <FamilyManager onUpdate={handleFamilyUpdate} />
              <GenerationalOverlay key={familyRefreshKey} />
            </div>
          </CollapsibleSection>
        </section>

      </motion.main>
    </div>
  );
};
