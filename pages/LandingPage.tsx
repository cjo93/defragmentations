import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { DEFRAG_MANIFEST } from '../constants/manifest';
import LivingBackground from '../components/visuals/LivingBackground';
import { initiateCheckout } from '../services/payment';
import { processBirthData } from '../services/engine';
import { calculateSEDA } from '../services/sedaCalculator';
import { saveBirthData } from '../services/globalContext';

/* ─── Animation Primitives ──────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/* ─── Animated Counter ──────────────────────────────────────── */
const Counter: React.FC<{ target: number; suffix?: string; label: string; duration?: number }> = ({ target, suffix = '', label, duration = 2.2 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const ctrl = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.floor(v).toLocaleString() + suffix; },
    });
    return () => ctrl.stop();
  }, [inView, target, suffix, duration]);
  return (
    <div className="text-center">
      <span ref={ref} className="block text-4xl md:text-5xl font-extrabold tracking-tight text-white">0{suffix}</span>
      <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-500 mt-3">{label}</span>
    </div>
  );
};

/* ─── Horizontal Marquee Testimonials ───────────────────────── */
const TESTIMONIALS = [
  { text: "I stopped blaming my partner for the friction. Turns out, we were structurally incompatible in our decision-making — not emotionally.", who: "M.K." },
  { text: "I showed my therapist the blueprint. She said it was the most accurate behavioral map she'd ever seen.", who: "J.L." },
  { text: "For the first time, I understood why I shut down during conflict. It wasn't weakness — it was my design running its protocol.", who: "S.R." },
  { text: "We ran each other through the Orbit engine. Now we fight less because we understand the structural load between us.", who: "A.P." },
  { text: "The Signal Filter caught a pattern I'd been repeating for 15 years. Seeing it mapped changed everything.", who: "D.C." },
  { text: "I cried. Not because it was sad. Because someone finally described how I work — mechanically, clearly, without judgment.", who: "T.N." },
];
const TestimonialMarquee: React.FC = () => (
  <div className="relative overflow-hidden py-20 -mx-6">
    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />
    <motion.div
      animate={{ x: ['0%', '-50%'] }}
      transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
      className="flex gap-6 w-max"
    >
      {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
        <div key={i} className="flex-none w-[380px] border border-white/[0.06] rounded-2xl bg-white/[0.02] backdrop-blur-md px-8 py-7 flex flex-col justify-between">
          <p className="text-[14px] text-neutral-300 leading-relaxed italic mb-6">&ldquo;{t.text}&rdquo;</p>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-neutral-400">{t.who}</div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
          </div>
        </div>
      ))}
    </motion.div>
  </div>
);

/* ─── Pricing ───────────────────────────────────────────────── */
const PricingTier: React.FC<{ tier: { name: string; price: string; desc: string }; label: string; onSelect: () => void; featured?: boolean }> = ({ tier, label, onSelect, featured }) => (
  <motion.div variants={fadeUp} className={['relative flex flex-col rounded-3xl border backdrop-blur-2xl p-9 transition-all duration-700', featured ? 'border-white/20 bg-white/[0.05] shadow-[0_0_80px_-20px_rgba(255,255,255,0.08)] md:-translate-y-2' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'].join(' ')}>
    {featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] bg-white text-black">Recommended</div>}
    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-5">{label}</span>
    <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
    <div className="text-3xl font-extrabold text-white mb-3 tracking-tight">{tier.price}</div>
    <p className="text-sm text-neutral-400 leading-relaxed flex-1 mb-8">{tier.desc}</p>
    <button onClick={onSelect} className={['w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-300', featured ? 'bg-white text-black hover:bg-neutral-200 shadow-[0_4px_30px_-4px_rgba(255,255,255,0.15)]' : 'border border-white/10 text-white hover:bg-white/5 hover:border-white/20'].join(' ')}>Initialize</button>
  </motion.div>
);

/* ─── Pillar Card ───────────────────────────────────────────── */
const PillarCard: React.FC<{ icon: React.ReactNode; label: string; title: string; body: string; index: number }> = ({ icon, label, title, body, index }) => (
  <motion.div
    variants={fadeUp}
    custom={index}
    className="group rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden"
  >
    <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
        {icon}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-3 block">{label}</span>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-neutral-400 leading-relaxed">{body}</p>
    </div>
  </motion.div>
);

/* ─── SEDA Gauge Mock-up ────────────────────────────────────── */
const SedaGauge: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <div ref={ref} className="relative mx-auto w-64 h-64">
      {/* Outer ring */}
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
        <motion.circle
          cx="100" cy="100" r="88"
          fill="none" stroke="url(#sedaGradient)" strokeWidth="4"
          strokeLinecap="round" strokeDasharray={553}
          initial={{ strokeDashoffset: 553 }}
          animate={inView ? { strokeDashoffset: 553 * 0.28 } : {}}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          transform="rotate(-90 100 100)"
        />
        <defs>
          <linearGradient id="sedaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2E2E8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E2E2E8" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-extrabold tracking-tight text-white"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.8 }}
        >72<span className="text-lg text-neutral-500">/100</span></motion.span>
        <motion.span
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 mt-2"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.6, duration: 0.8 }}
        >Stability Meter</motion.span>
      </div>
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-white/[0.01] blur-[60px] animate-breathe pointer-events-none" />
    </div>
  );
};

/* ─── Quick-Start Diagnostic ────────────────────────────────── */
const QuickDiagnostic: React.FC = () => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [result, setResult] = useState<{ type: string; strategy: string; authority: string; seda: number; status: string; gates: number[] } | null>(null);
  const [computing, setComputing] = useState(false);

  const runDiagnostic = () => {
    if (!birthDate) return;
    setComputing(true);
    setTimeout(() => {
      try {
        const blueprint = processBirthData(birthDate, birthTime || '12:00');
        const seda = calculateSEDA('initial diagnostic baseline assessment');
        saveBirthData(birthDate, birthTime || '12:00');
        setResult({
          type: blueprint.type,
          strategy: blueprint.strategy,
          authority: blueprint.authority,
          seda: seda.score,
          status: seda.status,
          gates: blueprint.personality.gates.slice(0, 6),
        });
      } catch {
        setResult(null);
      }
      setComputing(false);
    }, 1200);
  };

  return (
    <motion.div variants={fadeUp} custom={1} className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10">
      {!result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-2">Date of Birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white focus:border-white/30 outline-none transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-2">Time of Birth <span className="text-neutral-700">(optional)</span></label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-sm text-white focus:border-white/30 outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>
          <button
            onClick={runDiagnostic}
            disabled={!birthDate || computing}
            className="w-full py-4 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shadow-[0_4px_30px_-4px_rgba(255,255,255,0.15)] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3"
          >
            {computing ? (
              <>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-black/40" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} />
                  ))}
                </div>
                Computing...
              </>
            ) : 'Run Diagnostic'}
          </button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
          <div className="text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-3">Your Blueprint</span>
            <h3 className="text-3xl font-bold text-white">{result.type}</h3>
            <p className="text-neutral-400 text-sm mt-1">Strategy: {result.strategy} &middot; Authority: {result.authority}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <span className="text-2xl font-bold text-white">{result.seda}</span><span className="text-neutral-500 text-sm">/100</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mt-2">Stability Score</span>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
              <span className="text-2xl font-bold text-white">{result.gates.length}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mt-2">Active Points</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/login" className="flex-1 text-center py-4 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-all shadow-[0_4px_30px_-4px_rgba(255,255,255,0.15)]">
              See Full Map
            </Link>
            <button onClick={() => setResult(null)} className="flex-1 py-4 rounded-2xl border border-white/10 text-neutral-400 font-medium text-sm hover:bg-white/5 hover:border-white/20 transition-all">
              Try Another
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE — From Fragmentation to Flow
   ═══════════════════════════════════════════════════════════════ */
export const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);
  const navigate = useNavigate();
  const tiers = DEFRAG_MANIFEST.LANDING.TIERS;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-white/20 selection:text-white">
      <LivingBackground mode="calm" />

      {/* ─── NAV ──────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 py-5 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
          <span className="text-sm font-semibold tracking-tight">{DEFRAG_MANIFEST.BRAND.NAME}</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#architecture" className="text-[13px] text-neutral-500 hover:text-white transition hidden sm:block">Architecture</a>
          <a href="#how-it-works" className="text-[13px] text-neutral-500 hover:text-white transition hidden sm:block">How It Works</a>
          <a href="#plans" className="text-[13px] text-neutral-500 hover:text-white transition hidden sm:block">Plans</a>
          <Link to="/login" className="text-[13px] font-medium px-5 py-2 rounded-full border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all duration-300">Sign In</Link>
        </div>
      </nav>

      {/* ─── 01 // HERO ──────────────────────────────────── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-24">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-breathe" />
            <span className="text-[11px] text-neutral-400 font-medium">The Operating System of the Self — now live</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-[clamp(2.5rem,6.5vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-8">
            From fragmentation<br />to <span className="bg-gradient-to-r from-white via-neutral-400 to-white bg-clip-text text-transparent">flow.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="max-w-xl mx-auto text-base md:text-lg text-neutral-400 leading-relaxed mb-12">
            DEFRAG maps your internal architecture — how you process, decide, and connect. Then it shows you where the friction lives, and how to remove it. The manual you never received.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="group relative inline-flex items-center justify-center px-9 py-4 rounded-2xl bg-white text-black font-semibold text-sm overflow-hidden transition-all duration-500 hover:shadow-[0_0_60px_-5px_rgba(255,255,255,0.2)] hover:-translate-y-0.5">
              <span className="relative z-10">Initialize System Map</span>
            </Link>
            <a href="#architecture" className="inline-flex items-center justify-center px-9 py-4 rounded-2xl border border-white/[0.08] text-neutral-400 font-medium text-sm hover:bg-white/[0.03] hover:border-white/[0.15] transition-all duration-500">Run Diagnostic</a>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1.5 }} className="absolute bottom-14 flex flex-col items-center gap-3">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </motion.section>

      {/* ─── PROOF BAR — Animated Counters ────────────────── */}
      <section className="relative z-10 py-16 border-y border-white/[0.04]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 px-6">
          <Counter target={9} label="Energy Centers" />
          <Counter target={64} label="Activation Points" />
          <Counter target={6} label="Intelligence Layers" />
          <Counter target={250} suffix="ms" label="Stability Response" />
        </div>
      </section>

      {/* ─── 02 // THE ARCHITECTURE ──────────────────────── */}
      <section id="architecture" className="relative z-10 py-28 md:py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">The Architecture</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">
            You're not broken.<br />You're fragmented.
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-neutral-400 mt-8 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            The same arguments. The same shutdowns. The same invisible friction you can't name — not to your partner, not to your therapist, not even to yourself.
          </motion.p>
          <motion.p variants={fadeUp} custom={3} className="text-neutral-400 mt-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            DEFRAG doesn't fix you. It <em className="text-white/80 not-italic font-medium">defragments</em> the noise — so you can finally see how you're built, and why the friction keeps showing up.
          </motion.p>
          <motion.p variants={fadeUp} custom={4} className="text-white font-semibold mt-6 text-lg md:text-xl">
            We don't add features. We remove friction. Clarity is what remains.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── GRADIENT DIVIDER ─────────────────────────────── */}
      <div className="relative z-10 h-px max-w-3xl mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ─── 03 // THREE PILLARS ──────────────────────────── */}
      <section id="pillars" className="relative z-10 py-28 md:py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-20">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Three Pillars</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">Signal. Structure. Pattern.</h2>
            <p className="text-neutral-400 mt-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Three tools working together. Each reads a different part of how you operate — then combines them into one clear picture.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <PillarCard
              index={1}
              label="Pillar I"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
              title="The Signal Filter"
              body="Your Personal Profile — Maps how you process information, make decisions, and where stress tends to build up. Your baseline — generated once, referenced in everything DEFRAG does."
            />
            <PillarCard
              index={2}
              label="Pillar II"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4M8.5 16.5l-1 .5M15.5 16.5l1 .5"/></svg>}
              title="The Triangulation Engine"
              body="Relationship Mapping — Analyzes the dynamics between three people at a time. Shows who carries the emotional weight, who creates tension, and how it moves between you."
            />
            <PillarCard
              index={3}
              label="Pillar III"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
              title="The Echo Engine"
              body="Pattern Tracking — Monitors your behavior over 30 days to spot recurring cycles. The arguments, reactions, and shutdown moments you keep repeating — made visible so you can break them."
            />
          </div>
        </motion.div>
      </section>

      {/* ─── GRADIENT DIVIDER ─────────────────────────────── */}
      <div className="relative z-10 h-px max-w-3xl mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ─── 03.5 // HOW IT WORKS — Universal Language ──── */}
      <section id="how-it-works" className="relative z-10 py-28 md:py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-20">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">How It Works</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">Four layers. One system.</h2>
            <p className="text-neutral-400 mt-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              Four tools that work together to show you how you're wired, where you get stuck, and what to do about it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { num: '01', name: 'The Map', sub: 'Personal Profile', body: 'A detailed picture of how you naturally think, decide, and respond — generated from your birth data. See your strengths, blind spots, and the patterns that shape your daily life.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> },
              { num: '02', name: 'The Field', sub: 'Relationship Dynamics', body: 'See how your close relationships actually work — who steadies things, who absorbs the tension, and where the friction comes from. Maps the dynamics between any three people.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4M8.5 16.5l-1 .5M15.5 16.5l1 .5"/></svg> },
              { num: '03', name: 'The Shift', sub: 'Strength Mapping', body: 'Your biggest frustrations often point to your biggest strengths — used in the wrong situation. DEFRAG identifies the pattern and shows you where that trait works instead.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg> },
              { num: '04', name: 'The Memory', sub: 'Pattern Tracking', body: 'Tracks your recurring patterns over 30 days — the reactions, habits, and conflicts that keep showing up. Once you can see a loop, you can break it.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                variants={fadeUp}
                custom={i}
                className="group rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden"
              >
                <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="relative z-10 flex gap-6">
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-bold text-neutral-600 tracking-wider">{item.num}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-3">{item.sub}</span>
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── GRADIENT DIVIDER ─────────────────────────────── */}
      <div className="relative z-10 h-px max-w-3xl mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ─── 04 // SEDA GAUGE SHOWCASE ───────────────────── */}
      <section className="relative z-10 py-28 md:py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} custom={0}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Safety Layer</span>
              <h2 className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">
                The Stability Meter.
              </h2>
              <p className="text-neutral-400 mt-6 text-base leading-relaxed">
                Real-time emotional safety monitoring. DEFRAG reads your state and adjusts how it responds — direct when you're steady, gentle when you're not.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { mode: 'LOGIC MODE', desc: 'Clear, direct answers. Standard conversation.' },
                  { mode: 'HOLDING SPACE', desc: 'Emotional weight detected. Pace slows. Your feelings come first.' },
                  { mode: 'CRISIS MODE', desc: 'Analysis stops. Breathing exercises and support resources only.' },
                ].map((m) => (
                  <div key={m.mode} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-white/70 tracking-wide">{m.mode}</span>
                      <p className="text-sm text-neutral-500 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} custom={1} className="flex justify-center">
              <SedaGauge />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── GRADIENT DIVIDER ─────────────────────────────── */}
      <div className="relative z-10 h-px max-w-3xl mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ─── 05 // SYSTEM MAP ────────────────────────────── */}
      <section className="relative z-10 py-28 md:py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">The Output</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">
            Your complete<br />system map.
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-neutral-400 mt-8 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Your personality, your relationships, and your recurring patterns — combined into one clear picture. Not a label. A detailed, living map of how you actually work.
          </motion.p>

          {/* Visual accent — system node cluster */}
          <motion.div variants={fadeUp} custom={3} className="mt-16 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center animate-breathe">
                <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white/20 shadow-[0_0_24px_rgba(255,255,255,0.2)]" />
                </div>
              </div>
              {/* Orbiting nodes */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <motion.div
                  key={deg}
                  className="absolute w-2 h-2 rounded-full bg-white/10 border border-white/[0.15]"
                  style={{ top: '50%', left: '50%' }}
                  animate={{
                    x: [Math.cos((deg * Math.PI) / 180) * 72, Math.cos(((deg + 360) * Math.PI) / 180) * 72],
                    y: [Math.sin((deg * Math.PI) / 180) * 72, Math.sin(((deg + 360) * Math.PI) / 180) * 72],
                  }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                />
              ))}
              <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-[50px] animate-glow-ring pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── 06 // ZERO-KNOWLEDGE ────────────────────────── */}
      <section className="relative z-10 py-20 md:py-28 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] mb-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span className="text-[11px] text-neutral-400 font-medium">Zero-Knowledge Architecture</span>
          </motion.div>
          <motion.h3 variants={fadeUp} custom={1} className="text-xl md:text-2xl font-bold tracking-tight">
            Your data never leaves your device.
          </motion.h3>
          <motion.p variants={fadeUp} custom={2} className="text-neutral-500 mt-4 text-sm leading-relaxed max-w-lg mx-auto">
            No cloud storage. No third-party analytics. All blueprints, echo logs, and system maps persist in your browser's local storage — encrypted on your machine, accessible only to you.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── TESTIMONIALS — Horizontal marquee ────────────── */}
      <section className="relative z-10 py-20 md:py-28 px-6 overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Signal Reports</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight">After running the diagnostic.</h2>
          </motion.div>
        </motion.div>
        <TestimonialMarquee />
      </section>

      {/* ─── QUICK-START DIAGNOSTIC ─────────────────────── */}
      <section className="relative z-10 py-28 md:py-36 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Instant Diagnostic</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">See your stability score.<br />Right now.</h2>
            <p className="text-neutral-400 mt-6 text-base leading-relaxed max-w-xl mx-auto">
              Enter your birth data and get an instant reading from the DEFRAG engine. No sign-up required.
            </p>
          </motion.div>

          <QuickDiagnostic />
        </motion.div>
      </section>

      {/* ─── PLANS ────────────────────────────────────────── */}
      <section id="plans" className="relative z-10 py-28 md:py-36 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Access</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight">Choose your depth.</h2>
            <p className="text-neutral-500 mt-4 text-sm max-w-lg mx-auto">One blueprint, or continuous clarity. No trials. No data harvesting.</p>
          </motion.div>
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-5">
            <PricingTier tier={tiers.SINGLE} label="Free" onSelect={() => navigate('/onboarding')} />
            <PricingTier tier={tiers.BASIC} label="Monthly" onSelect={() => initiateCheckout('BLUEPRINT')} featured />
            <PricingTier tier={tiers.PRO} label="Full Access" onSelect={() => initiateCheckout('ORBIT')} />
          </motion.div>
          <motion.p variants={fadeUp} custom={4} className="text-center text-[11px] text-neutral-600 mt-10">Zero-knowledge architecture. Cancel anytime.</motion.p>
        </motion.div>
      </section>

      {/* ─── FOOTER / MANIFESTO TEASE ─────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.03] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-600 mb-4">The Protocol</p>
          <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-medium mb-3">
            We don't add features. We remove friction.<br />
            <span className="text-white">Coherence is what remains.</span>
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            DEFRAG — The manual you wish came with the people you love.
          </p>
        </div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.25)]" />
            <span className="text-xs font-semibold tracking-tight text-neutral-500">{DEFRAG_MANIFEST.BRAND.NAME}</span>
          </div>
          <div className="flex items-center gap-8 text-[11px] text-neutral-600">
            <Link to="/manifesto" className="hover:text-neutral-400 transition">Manifesto</Link>
            <Link to="/contact" className="hover:text-neutral-400 transition">Contact</Link>
            <Link to="/legal" className="hover:text-neutral-400 transition">Terms</Link>
            <Link to="/legal" className="hover:text-neutral-400 transition">Privacy</Link>
          </div>
          <p className="text-[11px] text-neutral-700">&copy; {new Date().getFullYear()} {DEFRAG_MANIFEST.BRAND.NAME}</p>
        </div>
      </footer>
    </div>
  );
};
