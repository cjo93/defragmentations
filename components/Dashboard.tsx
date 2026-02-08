import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DEFRAG_MANIFEST } from '../constants/manifest';
import { processBirthData, calculateTransits, TransitReport } from '../services/engine';
import { loadBirthData } from '../services/globalContext';
import { loadEntries, analyzeEcho } from '../services/echoEngine';
import { calculateSEDA } from '../services/sedaCalculator';
import { SystemMap } from './visuals/SystemMap';
import { SystemStatus } from './visuals/SystemStatus';
import { HelpIcon } from './visuals/HelpTooltips';
import { FamilyManager } from './FamilyManager';
import { GenerationalOverlay } from './GenerationalOverlay';
import { loadFamilyMembers, loadActivityLog, logActivity, ActivityEntry } from '../services/familyService';

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

/* ─── Stat Pill ─────────────────────────────────────────────── */
const StatPill: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 cursor-default relative overflow-hidden">
    <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <span className="text-lg font-bold text-white relative z-10">{value}</span>
    <span className="text-[11px] text-neutral-500 leading-tight relative z-10">{label}</span>
  </div>
);

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
  const [userData, setUserData] = useState<any>(null);
  const [transits, setTransits] = useState<TransitReport | null>(null);
  const [clarityScore, setClarityScore] = useState(0);
  const [stabilityScore, setStabilityScore] = useState(50);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [familyRefreshKey, setFamilyRefreshKey] = useState(0);

  // Load real user data from localStorage (set during onboarding)
  useEffect(() => {
    const birthData = loadBirthData();
    if (birthData) {
      const bp = processBirthData(birthData.date, birthData.time);
      setUserData(bp);

      // Compute live transits against the user's natal chart
      const tr = calculateTransits(bp);
      setTransits(tr);

      // Log dashboard visit
      logActivity('◉', 'Dashboard loaded with live data', 'System');
    } else {
      // Fallback: check if legacy data exists
      try {
        const legacy = localStorage.getItem('defrag_user_data');
        if (legacy) {
          setUserData(JSON.parse(legacy));
        }
      } catch {}
    }
  }, []);

  // Compute real Clarity and Stability scores
  useEffect(() => {
    // Clarity: derived from echo pattern analysis — fewer active loops = more clarity
    const entries = loadEntries();
    if (entries.length > 0) {
      const userType = userData?.type || 'Generator';
      const echo = analyzeEcho(entries, userType, 30);
      // Invert drag: high drag = low clarity
      const clarity = Math.max(0, 100 - echo.overallDrag);
      setClarityScore(Math.round(clarity));
    } else {
      // No echo entries yet — neutral clarity
      setClarityScore(50);
    }

    // Stability: from SEDA score based on recent entries
    const recentText = entries.slice(-5).map(e => e.text).join(' ');
    if (recentText) {
      const seda = calculateSEDA(recentText);
      // SEDA is risk 0-100 (100=danger), invert for stability (100=stable)
      setStabilityScore(100 - seda.score);
    } else {
      setStabilityScore(50);
    }
  }, [userData]);

  // Load activity log
  useEffect(() => {
    setActivityLog(loadActivityLog());
  }, [familyRefreshKey]);

  const handleFamilyUpdate = useCallback(() => {
    setFamilyRefreshKey(k => k + 1);
  }, []);

  if (!userData) return (
    <div className="flex flex-col items-center justify-center h-full bg-transparent gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border border-white/[0.06] animate-ping" />
        <div className="absolute inset-2 rounded-full bg-white/[0.06] animate-pulse" />
        <div className="absolute inset-[14px] rounded-full bg-white animate-breathe" />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 animate-pulse">Calibrating...</span>
    </div>
  );

  const definedCenters = Object.values(userData.centers || {}).filter(Boolean).length;
  const totalCenters = 9;
  const familyMembers = loadFamilyMembers();

  return (
    <div className="relative text-slate-200 font-sans overflow-y-auto h-full">

      {/* ─── TOP BAR ──────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex justify-between items-center p-6 border-b border-white/[0.04] bg-[#050505]/60 backdrop-blur-2xl"
      >
        <div className="font-bold text-lg tracking-tight">{DEFRAG_MANIFEST.BRAND.NAME}</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe" />
            Live Data
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <span className="text-xs text-neutral-600">
            {userData.meta?.birthDate || 'No birth data'}
          </span>
        </div>
      </motion.header>

      {/* ─── STAT STRIP — horizontal metrics bar ──────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 px-6 py-5 border-b border-white/[0.04] flex flex-wrap gap-3"
      >
        {[
          { v: userData.type, l: 'Type', tip: 'Your energy type determines how you best interact with the world — whether you initiate, respond, wait, or reflect.' },
          { v: userData.strategy, l: 'Strategy', tip: 'Your strategy is the most reliable way for you to make decisions that lead to satisfaction instead of friction.' },
          { v: userData.authority, l: 'Authority', tip: 'Your inner authority is your body\'s built-in decision-making tool — it tells you what\'s correct for you.' },
          { v: `${definedCenters}/${totalCenters}`, l: 'Defined', tip: 'Defined centers are your consistent personality traits. Open centers are where you absorb and amplify other people\'s energy.' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-500 cursor-default relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-lg font-bold text-white relative z-10">{s.v}</span>
              <span className="text-[11px] text-neutral-500 leading-tight relative z-10">{s.l}</span>
              <HelpIcon tooltip={s.tip} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── MAIN GRID ────────────────────────────────────── */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6"
      >

        {/* ── LEFT COLUMN: Visual + Rings ──────────────────── */}
        <div className="md:col-span-5 space-y-6">

          {/* System Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-[320px] bg-white/[0.02] border border-white/[0.06] rounded-3xl p-2 relative backdrop-blur-sm overflow-hidden animate-glow-ring"
          >
            <SystemMap dynamics={userData.relationalDynamics} />
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">Your Map</span>
                <HelpIcon tooltip="Your personal map — colored areas are your consistent traits. Uncolored areas are where you absorb other people's energy, which can create friction if you don't recognize it." />
              </div>
              <span className="text-[10px] text-neutral-700">Live</span>
            </div>
          </motion.div>

          {/* Progress Rings Row — REAL DATA */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
              <ProgressRing value={Math.round((definedCenters / totalCenters) * 100)} size={80} label="Defined" sub={`${definedCenters} of 9 areas`} />
              <HelpIcon tooltip="How many of your 9 personality centers operate consistently. More defined = more fixed traits. More open = more adaptive." className="mt-1" />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
              <ProgressRing value={clarityScore} size={80} label="Clarity" sub={clarityScore > 70 ? 'Clear' : clarityScore > 40 ? 'Moderate' : 'Noisy'} />
              <HelpIcon tooltip="Clarity measures how free you are from recurring negative patterns. Based on your journal entries — fewer loops = more clarity." className="mt-1" />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
              <ProgressRing value={stabilityScore} size={80} label="Stability" sub={stabilityScore > 70 ? 'Grounded' : stabilityScore > 40 ? 'Managing' : 'Under load'} />
              <HelpIcon tooltip="Stability tracks your emotional baseline from recent conversations. Higher = calmer and more grounded. Lower = more stress detected." className="mt-1" />
            </div>
          </div>

          {/* Planetary Data — LIVE from astronomy-engine */}
          {userData.astrology && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl backdrop-blur-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Your Natal Positions</span>
                <HelpIcon tooltip="These are the exact positions of planets at your birth, calculated from astronomical data. They determine your personality blueprint." />
              </div>
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
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Activity + Architecture + Family ── */}
        <div className="md:col-span-7 space-y-6">

          {/* System Status — Unified Memory Indicator */}
          <SystemStatus />

          {/* Architecture Summary */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Your Blueprint</span>
                <HelpIcon tooltip="A summary of your personal architecture derived from your birth data. These traits are consistent — they don't change." />
              </div>
              <span className="text-[10px] text-neutral-700">
                Born {userData.meta?.birthDate || 'unknown'}
                {userData.meta?.birthTime ? ` at ${userData.meta.birthTime}` : ''}
              </span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Type', value: userData.type, tip: 'Your energy type — how you best engage with the world.' },
                { label: 'Strategy', value: userData.strategy, tip: 'Your most effective decision-making approach.' },
                { label: 'Authority', value: userData.authority, tip: 'Your body\'s internal compass for making correct choices.' },
                { label: 'Profile', value: userData.profile || '—', tip: 'Your life role — the costume you wear in the world.' },
                { label: 'Definition', value: userData.definition || '—', tip: 'How your defined centers connect. Single = self-contained. Split = needs others to bridge energy.' },
                { label: 'Life Theme', value: userData.cross || '—', tip: 'Your incarnation purpose — the overarching theme of what you\'re here to experience.' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-[10px] text-neutral-600 uppercase tracking-wider">{item.label}</span>
                    <HelpIcon tooltip={item.tip} />
                  </div>
                  <span className="text-sm text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Transit Weather — LIVE */}
          {transits && transits.aspects.length > 0 && (
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04] flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Today's Influences</span>
                <HelpIcon tooltip="These are real planetary positions right now compared to your birth chart. When today's planets align with your natal positions, specific traits get activated." />
                <span className="ml-auto text-[10px] text-neutral-700">Live · {new Date().toLocaleDateString()}</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">{transits.weatherSummary}</p>
                <div className="space-y-2">
                  {transits.aspects.slice(0, 5).map((a, i) => (
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
              </div>
            </div>
          )}

          {/* Family Manager — Upload + Add Members */}
          <FamilyManager onUpdate={handleFamilyUpdate} />

          {/* Generational Overlay — Shows family dynamics */}
          <GenerationalOverlay key={familyRefreshKey} />

          {/* Activity Stream — REAL from localStorage */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Activity</span>
              <span className="text-[10px] text-neutral-700">Recent</span>
            </div>
            <div className="px-6 py-2">
              {activityLog.length > 0 ? (
                activityLog.slice(0, 8).map((entry, i) => (
                  <ActivityItem key={entry.id} icon={entry.icon} text={entry.text} time={entry.time} accent={entry.accent} />
                ))
              ) : (
                <>
                  <ActivityItem icon="◉" text="Blueprint generated from your birth data" time="System" accent="Blueprint" />
                  <ActivityItem icon="⬡" text={`${definedCenters} personality areas mapped`} time="System" accent="Design" />
                  {transits && <ActivityItem icon="◈" text={`${transits.aspects.length} active transit aspects today`} time="Live" accent="Transits" />}
                  <ActivityItem icon="▹" text="Start a chat session in The Forge to begin" time="Next step" />
                </>
              )}
            </div>
          </div>

          {/* Quick-launch */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Start Session', icon: '◉' },
              { label: 'Orbit Analysis', icon: '⬡' },
              { label: 'Voice Mode', icon: '◈' },
              { label: 'Signal Filter', icon: '▣' },
            ].map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 text-sm text-neutral-300"
              >
                <span className="text-neutral-500">{action.icon}</span>
                {action.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.main>
    </div>
  );
};
