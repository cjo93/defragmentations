import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DEFRAG_MANIFEST } from '../constants/manifest';
import { processBirthData } from '../services/engine';
import { SystemMap } from './visuals/SystemMap';
import { SystemStatus } from './visuals/SystemStatus';
import { HelpIcon } from './visuals/HelpTooltips';

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

  useEffect(() => {
    const demo = processBirthData("1993-07-26", "20:00");
    setUserData(demo);
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

  const definedCenters = userData.definedCenters?.length ?? 5;
  const totalCenters = 9;

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
            Online
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <span className="text-xs text-neutral-600">v1.0</span>
        </div>
      </motion.header>

      {/* ─── STAT STRIP — horizontal metrics bar ──────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 px-6 py-5 border-b border-white/[0.04] flex flex-wrap gap-3"
      >
        {[{ v: userData.type, l: 'Type' }, { v: userData.strategy, l: 'Strategy' }, { v: userData.authority, l: 'Authority' }, { v: `${definedCenters}/${totalCenters}`, l: 'Defined Centers' }].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <StatPill value={s.v} label={s.l} />
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
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">System Map</span>
                <HelpIcon tooltip="Your personal map — colored areas are your consistent traits, uncolored areas are where you're more influenced by others" />
              </div>
              <span className="text-[10px] text-neutral-700">Live</span>
            </div>
          </motion.div>

          {/* Progress Rings Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
              <ProgressRing value={Math.round((definedCenters / totalCenters) * 100)} size={80} label="Defined" sub={`${definedCenters} of 9 areas`} />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
              <ProgressRing value={72} size={80} label="Clarity" sub="Session avg" />
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
              <ProgressRing value={28} size={80} label="Stability" sub="Low load" />
            </div>
          </div>

          {/* Planetary Data — Table style, not card */}
          {userData.astrology && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl backdrop-blur-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04]">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Today's Influences</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { label: 'Sun', ...userData.astrology.sun },
                    { label: 'Moon', ...userData.astrology.moon },
                    { label: 'Mars', ...userData.astrology.mars },
                  ].map((planet, i) => (
                    <tr key={i} className="border-b border-white/[0.03] last:border-0">
                      <td className="px-6 py-3.5 text-neutral-500">{planet.label}</td>
                      <td className="px-6 py-3.5 text-white font-medium text-right">{planet.sign}</td>
                      <td className="px-6 py-3.5 text-neutral-600 text-right font-mono text-xs">{planet.degree}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Activity + Architecture ────────── */}
        <div className="md:col-span-7 space-y-6">

          {/* System Status — Unified Memory Indicator */}
          <SystemStatus />

          {/* Architecture Summary — horizontal key/value, not card */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Your Blueprint</span>
              <span className="text-[10px] text-neutral-700">Generated from your birth data</span>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Type', value: userData.type },
                { label: 'Strategy', value: userData.strategy },
                { label: 'Authority', value: userData.authority },
                { label: 'Profile', value: userData.profile || '4/6' },
                { label: 'Definition', value: userData.definition || 'Split' },
                { label: 'Life Theme', value: userData.cross || 'Right Angle' },
              ].map((item, i) => (
                <div key={i}>
                  <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1">{item.label}</span>
                  <span className="text-sm text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream — timeline-style, not cards */}
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Activity</span>
              <span className="text-[10px] text-neutral-700">Recent</span>
            </div>
            <div className="px-6 py-2">
              <ActivityItem icon="◉" text="Blueprint generated from birth data" time="Just now" accent="Blueprint" />
              <ActivityItem icon="⬡" text={`${definedCenters} personality areas mapped and classified`} time="Just now" accent="Design" />
              <ActivityItem icon="◈" text="Daily influences active — today's conditions are being tracked" time="Just now" accent="Daily" />
              <ActivityItem icon="◇" text="Emotional safety monitoring active" time="Active" accent="Safety" />
              <ActivityItem icon="▹" text="Start a session to begin analysis" time="Pending" />
            </div>
          </div>

          {/* Quick-launch — icon row, not cards */}
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
