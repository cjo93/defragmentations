import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HelpIcon } from './visuals/HelpTooltips';
import {
  FamilyGroup,
  FamilyMember,
  FamilyDynamic,
  calculateFamilyDynamics,
} from '../services/familyService';

/* ─── Generation Label ──────────────────────────────────────── */
const GEN_LABELS: Record<number, string> = {
  [-2]: 'Grandparents',
  [-1]: 'Parents',
  [0]: 'Your Generation',
  [1]: 'Children',
};

/* ─── Dynamic Badge ─────────────────────────────────────────── */
const DynamicBadge: React.FC<{ type: string }> = ({ type }) => {
  const colors: Record<string, string> = {
    HEALTHY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    FUSION: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CONFLICT: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${colors[type] || colors.HEALTHY}`}>
      {type === 'FUSION' ? 'Enmeshed' : type === 'CONFLICT' ? 'Friction' : 'Aligned'}
    </span>
  );
};

/* ─── Compatibility Score ───────────────────────────────────── */
const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 36 }) => {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? 'rgba(52,211,153,0.8)' : score >= 40 ? 'rgba(251,191,36,0.8)' : 'rgba(239,68,68,0.8)';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[9px] font-bold text-white">{score}</span>
    </div>
  );
};

/* ─── Pair Card ─────────────────────────────────────────────── */
const PairCard: React.FC<{ dynamic: FamilyDynamic }> = ({ dynamic }) => (
  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
    <div className="flex items-center gap-3">
      <ScoreRing score={dynamic.compatibilityScore} />
      <div className="flex-1 min-w-0">
        <span className="text-xs text-white font-medium block">
          {dynamic.nameA} & {dynamic.nameB}
        </span>
        <div className="flex flex-wrap gap-1 mt-1">
          {dynamic.dynamics.map((d, i) => (
            <DynamicBadge key={i} type={d.type} />
          ))}
        </div>
      </div>
    </div>
    {dynamic.dynamics.length > 0 && (
      <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">
        {dynamic.dynamics[0].description}
      </p>
    )}
  </div>
);

/* ─── Generation Row ────────────────────────────────────────── */
const GenerationRow: React.FC<{ gen: number; members: FamilyMember[] }> = ({ gen, members }) => (
  <div className="relative">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-600">
        {GEN_LABELS[gen] || `Generation ${gen}`}
      </span>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
    <div className="flex flex-wrap gap-2">
      {members.map(m => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
          <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[8px] font-bold text-neutral-400">
            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <span className="text-[11px] text-white font-medium block leading-tight">{m.name}</span>
            <span className="text-[9px] text-neutral-500">{m.blueprint?.type || '—'}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
export const GenerationalOverlay: React.FC = () => {
  const familyData = useMemo<FamilyGroup>(() => calculateFamilyDynamics(), []);

  if (familyData.members.length === 0) return null;

  const generations = Object.entries(familyData.generationMap)
    .map(([gen, members]) => ({ gen: parseInt(gen), members }))
    .sort((a, b) => a.gen - b.gen);

  const topDynamics = familyData.dynamics
    .sort((a, b) => {
      // Sort by most friction first (lowest score)
      return a.compatibilityScore - b.compatibilityScore;
    })
    .slice(0, 6);

  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Generational Map</span>
          <HelpIcon tooltip="Shows how your family members' personality types interact across generations. Lower scores indicate more structural friction — not conflict, but areas where you naturally condition each other." />
        </div>
        <span className="text-[10px] text-neutral-600">{familyData.members.length} members</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Generation Rows */}
        {generations.map(({ gen, members }) => (
          <GenerationRow key={gen} gen={gen} members={members} />
        ))}

        {/* Dynamics */}
        {topDynamics.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Key Dynamics</span>
              <HelpIcon tooltip="These are the structural dynamics between family members based on their designs. Enmeshed = blurred boundaries. Friction = conditioning pressure. Aligned = natural flow." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {topDynamics.map((d, i) => (
                <PairCard key={i} dynamic={d} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
