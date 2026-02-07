
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SystemMap } from './visuals/SystemMap';
import { SedaGauge } from './visuals/SedaGauge';
import { OrbitEmptyState } from './visuals/EmptyState';
import { generateOrbitReport, FrictionResult } from '../services/orbitEngine';
import { generateTriangulationReport, TriangulationReport } from '../services/triangulationEngine';
import { calculateSedaSpectrum } from '../services/sedaCalculator';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const FrictionMeter: React.FC<{ score: number; type: string }> = ({ score, type }) => {
  const color = type === 'STRUCTURAL_FRICTION' ? '#EF4444' : type === 'MIXED_GEOMETRY' ? '#E2E2E8' : '#14B8A6';
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Friction Coefficient</span>
        <span className="text-2xl font-bold text-white">{score}<span className="text-sm text-neutral-500">/100</span></span>
      </div>
      <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const ResonanceMeter: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color = value >= 60 ? '#10B981' : value >= 40 ? '#E2E2E8' : '#64748B';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
      <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const PersonInput: React.FC<{
  label: string;
  borderClass: string;
  person: { name: string; date: string; time: string };
  onChange: (p: { name: string; date: string; time: string }) => void;
  placeholder?: string;
}> = ({ label, borderClass, person, onChange, placeholder }) => (
  <div className={`rounded-3xl border ${borderClass} bg-white/[0.02] backdrop-blur-2xl p-7`}>
    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E2E2E8]/60 block mb-4">{label}</span>
    <div className="space-y-3">
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 block mb-1.5">Name</label>
        <input type="text" value={person.name} onChange={e => onChange({...person, name: e.target.value})} className="w-full bg-[#050505]/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#E2E2E8]/40 focus:outline-none transition-all" placeholder={placeholder || 'Name'} />
      </div>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 block mb-1.5">Birth Date</label>
        <input type="date" value={person.date} onChange={e => onChange({...person, date: e.target.value})} className="w-full bg-[#050505]/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#E2E2E8]/40 focus:outline-none transition-all" />
      </div>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 block mb-1.5">Birth Time</label>
        <input type="time" value={person.time} onChange={e => onChange({...person, time: e.target.value})} className="w-full bg-[#050505]/50 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-[#E2E2E8]/40 focus:outline-none transition-all" />
      </div>
    </div>
  </div>
);

export const Orbit = () => {
  const [personA, setPersonA] = useState({ name: 'You', date: '1993-07-26', time: '20:00' });
  const [personB, setPersonB] = useState({ name: '', date: '', time: '12:00' });
  const [personC, setPersonC] = useState({ name: '', date: '', time: '12:00' });
  const [showTriangulation, setShowTriangulation] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [triReport, setTriReport] = useState<TriangulationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pair' | 'system'>('pair');

  const handleRunOrbit = () => {
    if (!personB.date) return;
    setLoading(true);
    setTimeout(() => {
      const result = generateOrbitReport(personA, personB);
      setReport(result);

      // If Person C data is provided, run triangulation
      if (showTriangulation && personC.date) {
        const tri = generateTriangulationReport(personA, personB, personC, result.friction.score);
        setTriReport(tri);
        setActiveTab('system');
      } else {
        setTriReport(null);
        setActiveTab('pair');
      }
      setLoading(false);
    }, 400);
  };

  // Determine SEDA spectrum from friction description text
  const getSpectrumFromFriction = (score: number): 'ENTROPY' | 'INTEGRATION' | 'EXPANSION' => {
    if (score > 65) return 'ENTROPY';
    if (score > 40) return 'INTEGRATION';
    return 'EXPANSION';
  };

  return (
    <div className="max-w-6xl mx-auto pt-4 md:pt-10 px-4 animate-fade-in">

      {/* Header */}
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60">Relational Physics</span>
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mt-2 mb-3">
          Orbit
        </h1>
        <p className="text-[#A3A3A3] text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Map the angular relationship between two or more people. The orbit engine calculates electromagnetic friction, resonance, and the invisible contracts running beneath every connection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-start">

        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-5">
          <PersonInput label="Your Data" borderClass="border-white/[0.06]" person={personA} onChange={setPersonA} placeholder="Your name" />
          <PersonInput label="Their Data" borderClass="border-[#E2E2E8]/[0.1]" person={personB} onChange={setPersonB} placeholder="Partner, friend, family…" />

          {/* Triangulation Toggle */}
          <button
            onClick={() => setShowTriangulation(!showTriangulation)}
            className="w-full flex items-center justify-between py-3 px-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-left hover:border-white/[0.12] transition-all duration-300"
          >
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E2E2E8]/60 block">The 3-Body Problem</span>
              <span className="text-xs text-[#A3A3A3]">Add a third person to detect triangulation dynamics</span>
            </div>
            <motion.svg
              animate={{ rotate: showTriangulation ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-4 h-4 text-neutral-500 shrink-0"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {showTriangulation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <PersonInput label="The Third Body" borderClass="border-purple-500/[0.1]" person={personC} onChange={setPersonC} placeholder="Child, parent, sibling…" />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleRunOrbit}
            disabled={!personB.date || loading}
            className="w-full py-4 rounded-2xl bg-[#E2E2E8] text-black font-semibold text-sm hover:bg-[#C8C8D0] transition-all duration-300 shadow-[0_4px_24px_-4px_rgba(226,226,232,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Mapping geometry…' : showTriangulation && personC.date ? 'Map Family Dynamic' : 'Map Relational Geometry'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 space-y-5">

          {/* Tab Navigation — only show when we have both reports */}
          {report && triReport && (
            <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              {(['pair', 'system'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-white/[0.06] text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {tab === 'pair' ? 'Pair Analysis' : 'Family System'}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {report && activeTab === 'pair' ? (
              <motion.div key="pair-results" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-5">

                {/* Friction Score */}
                <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                  <FrictionMeter score={report.friction.score} type={report.friction.type} />
                  <p className="text-sm text-[#A3A3A3] leading-relaxed mt-4">{report.friction.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
                      report.friction.type === 'STRUCTURAL_FRICTION' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                      report.friction.type === 'MIXED_GEOMETRY' ? 'text-[#E2E2E8] border-[#E2E2E8]/20 bg-[#E2E2E8]/5' :
                      'text-teal-400 border-teal-400/20 bg-teal-400/5'
                    }`}>{report.friction.type.replace('_', ' ')}</span>
                  </div>
                </motion.div>

                {/* SEDA Gauge */}
                <motion.div variants={fadeUp}>
                  <SedaGauge spectrum={getSpectrumFromFriction(report.friction.score)} />
                </motion.div>

                {/* Architectures Side by Side */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                  {[report.personA, report.personB].map((person: any, idx: number) => (
                    <div key={idx} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-6">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E2E2E8]/60">{person.name}</span>
                      <h3 className="text-lg font-bold text-white mt-1">{person.type}</h3>
                      <p className="text-xs text-[#A3A3A3] mt-1">{person.strategy}</p>
                      <p className="text-xs text-neutral-500">{person.authority}</p>
                    </div>
                  ))}
                </motion.div>

                {/* Planetary Aspects */}
                {report.friction.aspects.length > 0 && (
                  <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-4">Planetary Aspects</span>
                    <div className="space-y-3">
                      {report.friction.aspects.map((a: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                          <div>
                            <span className="text-sm text-white font-medium">{a.pair}</span>
                            <span className="text-xs text-neutral-500 ml-3">{a.distance}</span>
                          </div>
                          <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
                            a.nature === 'hard' ? 'text-red-400 border-red-400/20 bg-red-400/5' :
                            a.nature === 'soft' ? 'text-teal-400 border-teal-400/20 bg-teal-400/5' :
                            'text-[#E2E2E8] border-[#E2E2E8]/20 bg-[#E2E2E8]/5'
                          }`}>{a.aspect}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Conditioning Channels */}
                {report.conditioning.length > 0 && (
                  <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-4">Conditioning Channels</span>
                    <div className="space-y-4">
                      {report.conditioning.map((c: any, i: number) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white font-medium">{c.center}</span>
                            <span className="text-[10px] text-[#E2E2E8]/60">{c.direction}</span>
                          </div>
                          <p className="text-xs text-[#A3A3A3] leading-relaxed">{c.insight}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Summary */}
                <motion.div variants={fadeUp} className="rounded-3xl border border-[#E2E2E8]/[0.08] bg-[#E2E2E8]/[0.02] backdrop-blur-2xl p-6 text-center">
                  <p className="text-sm text-[#A3A3A3] leading-relaxed">{report.summary}</p>
                </motion.div>
              </motion.div>

            ) : report && triReport && activeTab === 'system' ? (
              <motion.div key="system-results" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-5">

                {/* Triangulation Header */}
                <motion.div variants={fadeUp} className="rounded-3xl border border-purple-500/[0.12] bg-purple-500/[0.02] backdrop-blur-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${triReport.triangulation.detected ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-neutral-600'}`} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-400/80">
                      {triReport.triangulation.detected ? 'Triangulation Detected' : 'No Active Triangulation'}
                    </span>
                  </div>
                  {triReport.triangulation.detected && (
                    <div className="mb-4">
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
                        triReport.triangulation.type === 'STABILIZER'
                          ? 'text-purple-400 border-purple-400/20 bg-purple-400/5'
                          : 'text-red-400 border-red-400/20 bg-red-400/5'
                      }`}>{triReport.triangulation.type === 'STABILIZER' ? 'Relief Valve' : 'Scapegoat Pattern'}</span>
                    </div>
                  )}
                  <p className="text-sm text-[#A3A3A3] leading-relaxed">{triReport.triangulation.impact}</p>
                </motion.div>

                {/* Three Architectures */}
                <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
                  {[triReport.personA, triReport.personB, triReport.personC].map((person, idx) => (
                    <div key={idx} className={`rounded-3xl border ${idx === 2 ? 'border-purple-500/[0.12]' : 'border-white/[0.06]'} bg-white/[0.02] backdrop-blur-2xl p-5`}>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${idx === 2 ? 'text-purple-400/60' : 'text-[#E2E2E8]/60'}`}>{person.name}</span>
                      <h3 className="text-base font-bold text-white mt-1">{person.type}</h3>
                    </div>
                  ))}
                </motion.div>

                {/* Resonance Meters */}
                <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-5">Geometric Resonance</span>
                  <div className="grid grid-cols-2 gap-6">
                    <ResonanceMeter label={`${triReport.personC.name} ↔ ${triReport.personA.name}`} value={triReport.triangulation.resonanceWithA} />
                    <ResonanceMeter label={`${triReport.personC.name} ↔ ${triReport.personB.name}`} value={triReport.triangulation.resonanceWithB} />
                  </div>
                  <div className="mt-5 pt-5 border-t border-white/[0.04]">
                    <ResonanceMeter label="Pair Friction" value={triReport.pairFriction} />
                  </div>
                </motion.div>

                {/* Conflict Axis */}
                {triReport.triangulation.conflictAxis && (
                  <motion.div variants={fadeUp} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-3">Conflict Axis</span>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-white font-medium">Mars {triReport.triangulation.conflictAxis.aspectName}</span>
                      <span className="text-xs text-neutral-500">{triReport.triangulation.conflictAxis.distance.toFixed(1)}°</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${
                        triReport.triangulation.conflictAxis.nature === 'hard'
                          ? 'text-red-400 border-red-400/20 bg-red-400/5'
                          : 'text-teal-400 border-teal-400/20 bg-teal-400/5'
                      }`}>{triReport.triangulation.conflictAxis.nature}</span>
                    </div>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">{triReport.triangulation.conflictAxis.description}</p>
                  </motion.div>
                )}

                {/* Risk + Recommendation */}
                {triReport.triangulation.detected && (
                  <>
                    <motion.div variants={fadeUp} className="rounded-3xl border border-red-500/[0.08] bg-red-500/[0.02] backdrop-blur-2xl p-8">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400/60 block mb-3">Structural Risk</span>
                      <p className="text-sm text-[#A3A3A3] leading-relaxed">{triReport.triangulation.risk}</p>
                    </motion.div>
                    <motion.div variants={fadeUp} className="rounded-3xl border border-emerald-500/[0.08] bg-emerald-500/[0.02] backdrop-blur-2xl p-8">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/60 block mb-3">The Intervention</span>
                      <p className="text-sm text-[#A3A3A3] leading-relaxed">{triReport.triangulation.recommendation}</p>
                    </motion.div>
                  </>
                )}

                {/* SEDA Gauge for system state */}
                <motion.div variants={fadeUp}>
                  <SedaGauge
                    spectrum={getSpectrumFromFriction(triReport.pairFriction)}
                    description={triReport.triangulation.detected
                      ? 'The family system is redistributing its structural load through a third body. Awareness is the first step toward conscious de-triangulation.'
                      : 'The system geometry does not indicate active triangulation. The load is being held between the pair.'}
                  />
                </motion.div>
              </motion.div>

            ) : !report ? (
              <OrbitEmptyState />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
