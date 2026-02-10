import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
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

/* ─── Dramatic Text Animations ──────────────────────────────── */
const lineReveal = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.25 + 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};
const dramaPause = {
  hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.3 + 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── Scroll Progress Bar ───────────────────────────────────── */
const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{
        scaleX: scrollYProgress,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.4), rgba(255,255,255,0.05))',
      }}
    />
  );
};

/* ─── Animated Gradient Divider ─────────────────────────────── */
const GlowDivider: React.FC = () => (
  <div className="relative z-10 h-px max-w-4xl mx-auto overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-pulse-line" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
      animate={{ x: ['-100%', '100%'] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      style={{ width: '50%' }}
    />
  </div>
);

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
        <div key={i} className="flex-none w-[380px] border border-white/[0.06] rounded-2xl bg-white/[0.02] backdrop-blur-md px-8 py-7 flex flex-col justify-between group hover:border-white/[0.12] transition-all duration-500">
          <p className="text-[14px] text-neutral-300 leading-relaxed italic mb-6">&ldquo;{t.text}&rdquo;</p>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-neutral-400 group-hover:bg-white/[0.1] transition-all">{t.who}</div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
          </div>
        </div>
      ))}
    </motion.div>
  </div>
);

/* ─── Persona Card ──────────────────────────────────────────── */
const PERSONAS = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>,
    tag: 'The Overthinker',
    headline: '"I can\'t stop replaying every conversation."',
    body: 'Your mind isn\'t broken — it\'s running without a filter. DEFRAG shows you which signals matter and which are just noise your design amplifies.',
    detail: 'The Signal Filter identifies your specific mental loops — which thoughts are productive analysis and which are just your system running at idle. Once mapped, the noise drops.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M17 18a5 5 0 0 0-10 0"/><circle cx="12" cy="7" r="4"/><path d="M3.5 21h17"/></svg>,
    tag: 'The People Pleaser',
    headline: '"I always end up carrying everyone else\'s weight."',
    body: 'Not a character flaw — a structural tendency. See where you absorb others\' tension and where your boundaries naturally live.',
    detail: 'Your open centers absorb and amplify energy from others. DEFRAG maps exactly which centers are open — so you know what emotions are yours and what you\'re carrying for someone else.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>,
    tag: 'The Conflict Avoider',
    headline: '"Every argument feels like it\'s going to break us."',
    body: 'Conflict isn\'t the problem — it\'s the processing mismatch. DEFRAG maps both sides so you can see why it escalates.',
    detail: 'The Triangulation Engine shows the structural dynamics between you and the other person. You\'ll see who initiates, who absorbs, and where the tension actually lives — mechanically, not emotionally.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
    tag: 'The Purpose Seeker',
    headline: '"I feel like I\'m supposed to be doing something different."',
    body: 'You probably are. Your design has a built-in decision strategy. Most people have never been told theirs.',
    detail: 'Your authority — your body\'s built-in decision-making tool — has been ignored in favor of logic, social pressure, or fear. Once you see it mapped, you stop second-guessing.',
  },
];

/* ─── Comparison Row ────────────────────────────────────────── */
const COMPARISONS = [
  { label: 'Therapy', desc: 'Explores feelings', defrag: 'Maps your structure' },
  { label: 'Astrology', desc: 'Describes tendencies', defrag: 'Calculates mechanics' },
  { label: 'Personality tests', desc: 'Labels you', defrag: 'Shows how you operate' },
  { label: 'Self-help', desc: 'Lists techniques', defrag: 'Identifies your specific friction' },
];

/* ─── FAQ Accordion ─────────────────────────────────────────── */
const FAQS = [
  { q: 'How is this different from a personality test?', a: 'Personality tests ask you questions about yourself — then label the answers. DEFRAG calculates your behavioral architecture from objective astronomical data. No self-reporting bias. No vague categories. A precise map of how you actually process, decide, and connect.' },
  { q: 'What data do you use?', a: 'Your birth date, time, and location. From this, we calculate the exact planetary positions at the moment you were born and map them to your energy centers, gates, and channels — the same way an engineer reads a circuit diagram.' },
  { q: 'Is this scientifically validated?', a: 'DEFRAG draws from Human Design (synthesis of I Ching, Kabbalah, chakra system, and quantum mechanics), Gene Keys, and Bowen Family Systems Theory. It\'s a behavioral mapping framework — not a medical diagnostic. Think of it as architectural analysis for people.' },
  { q: 'What happens to my data?', a: 'Nothing leaves your device. Zero cloud storage. Zero third-party analytics. All blueprints, echo logs, and system maps persist in your browser\'s local storage — encrypted on your machine, accessible only to you.' },
  { q: 'Can I map my relationships?', a: 'Yes. The Orbit engine analyzes the dynamics between two or three people at a time — showing who absorbs tension, who initiates, and where the structural friction lives. Most relationship problems aren\'t personal. They\'re geometric.' },
  { q: 'What if I\'m in crisis?', a: 'DEFRAG includes a real-time stability meter (SEDA). If emotional distress is detected, analysis stops automatically. The system shifts to grounding exercises or connects you with professional support resources. Architecture comes after safety.' },
];
const FaqItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} custom={index} className="border-b border-white/[0.05] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-6 text-left group">
        <span className="text-[15px] font-medium text-white group-hover:text-white/90 transition pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3 }} className="w-6 h-6 rounded-full border border-white/[0.1] bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-hover:border-white/[0.2] transition">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-400"><path d="M12 5v14M5 12h14"/></svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-neutral-400 leading-relaxed pb-6 pr-12">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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
    whileHover={{ scale: 1.015, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
  >
    <div className="card-inner-glow" />
    <div className="card-edge-light" />
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
  const [expandedPersona, setExpandedPersona] = useState<number | null>(null);
  const [expandedBento, setExpandedBento] = useState<number | null>(null);

  // Scroll snap container for desktop
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-white/20 selection:text-white snap-y snap-mandatory h-screen overflow-auto">
      <LivingBackground mode="calm" />
      <ScrollProgress />

      {/* ─── NAV ──────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-16 py-4 md:py-5 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/[0.03] safe-top">
        <div className="flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
            <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" />
            <circle cx="10" cy="10" r="2.5" fill="white" opacity="0.9" />
            <circle cx="10" cy="2.5" r="1" fill="white" opacity="0.4" />
            <circle cx="16.5" cy="6.5" r="1" fill="white" opacity="0.3" />
            <circle cx="16.5" cy="13.5" r="1" fill="white" opacity="0.25" />
            <circle cx="10" cy="17.5" r="1" fill="white" opacity="0.35" />
            <circle cx="3.5" cy="13.5" r="1" fill="white" opacity="0.3" />
            <circle cx="3.5" cy="6.5" r="1" fill="white" opacity="0.4" />
          </svg>
          <span className="text-[13px] md:text-sm font-semibold tracking-[-0.01em]">{DEFRAG_MANIFEST.BRAND.NAME}</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <a href="#architecture" className="text-[13px] text-neutral-500 hover:text-white transition hidden sm:block">Architecture</a>
          <a href="#how-it-works" className="text-[13px] text-neutral-500 hover:text-white transition hidden sm:block">How It Works</a>
          <a href="#plans" className="text-[13px] text-neutral-500 hover:text-white transition hidden sm:block">Plans</a>
          <Link to="/login" className="text-[12px] md:text-[13px] font-medium px-4 md:px-5 py-2 rounded-full border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all duration-300">Sign In</Link>
        </div>
      </nav>

      {/* ─── 01 // HERO ──────────────────────────────────── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="snap-start relative z-10 flex flex-col items-center justify-center min-h-[100svh] text-center px-5 pt-20 md:pt-24">
        {/* Parallax glow effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-emerald-400/10 via-white/10 to-emerald-500/10 blur-[180px] pointer-events-none"
          style={{ x: scrollYProgress ? scrollYProgress : 0, y: scrollYProgress ? scrollYProgress : 0 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        {/* Atmospheric orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-white/[0.01] blur-[120px] animate-breathe-slow pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/5 w-56 h-56 rounded-full bg-white/[0.008] blur-[90px] animate-breathe pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.003] blur-[150px] animate-breathe-slow pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl">
          {/* High-impact opening line */}
          <motion.div variants={fadeUp} custom={0} className="mb-14">
            <span className="text-[11px] md:text-[12px] font-medium tracking-[0.3em] uppercase text-neutral-600">
              Stop guessing. Start understanding.
            </span>
          </motion.div>

          {/* Main headline — bold, urgent, value-driven */}
          <motion.h1 variants={fadeUp} custom={1} className="text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[1] tracking-[-0.04em] mb-10">
            <motion.span variants={lineReveal} custom={0} className="block text-white">
              Your friction is structural.
            </motion.span>
            <motion.span variants={lineReveal} custom={1} className="block bg-gradient-to-r from-white via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              DEFRAG maps your mechanics.
            </motion.span>
          </motion.h1>

          {/* Subtext — clarity, urgency, value */}
          <motion.div variants={fadeUp} custom={2} className="max-w-2xl mx-auto mb-14 space-y-5">
            <motion.p variants={lineReveal} custom={0} className="text-[16px] md:text-[19px] text-neutral-500 leading-[1.7]">
              You’re not broken. You’re running your design. DEFRAG reveals the exact architecture behind your patterns, decisions, and relationships.<br className="hidden md:block" />
              See your blueprint. End the confusion. Upgrade your life.
            </motion.p>
            <motion.p variants={lineReveal} custom={1} className="text-[15px] text-neutral-400 mt-4">
              <span className="font-bold text-white">No guesswork. No labels. Just your real mechanics.</span>
            </motion.p>
            <motion.div variants={dramaPause} custom={1} className="relative mt-8">
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <p className="text-[18px] md:text-[22px] text-white/90 font-semibold tracking-[-0.01em] pt-4">
                It's not you. It's your wiring.
              </p>
            </motion.div>
            <motion.p variants={dramaPause} custom={2} className="text-[14px] md:text-[15px] text-neutral-500 leading-[1.8] mt-4">
              DEFRAG calculates your behavioral architecture from birth data —<br className="hidden md:block" />
              <span className="text-neutral-400">the patterns, the friction points, the reason every relationship</span><br className="hidden md:block" />
              <span className="text-neutral-400">hits the same wall.</span>
              <span className="block mt-2 text-neutral-600 italic text-[13px]">Then it shows you exactly what to do about it.</span>
            </motion.p>
          </motion.div>

          {/* CTA cluster — primary action + proof */}
          <motion.div variants={fadeUp} custom={3} className="flex flex-col items-center gap-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-black font-semibold text-[15px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_80px_-5px_rgba(255,255,255,0.25)] hover:-translate-y-0.5">
                <span className="relative z-10">See Your Blueprint — Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-neutral-200 to-white bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-gradient-shift transition-opacity" />
                {/* Glow effect */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {/* Tooltip */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs bg-black/80 text-white rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">Start your DEFRAG journey</span>
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center px-9 py-5 rounded-2xl border border-white/[0.08] text-neutral-400 font-medium text-sm hover:bg-white/[0.03] hover:border-white/[0.15] transition-all duration-500 gap-2">
                <span>How it works</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500"><path d="M6 9l6 6 6-6" /></svg>
              </a>
            </div>
            {/* Proof bar — tight, under CTAs */}
            <motion.div
              variants={dramaPause}
              custom={3}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-neutral-600"
            >
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500/50" /> 30-second blueprint</span>
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500/50" /> No sign-up wall</span>
              <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500/50" /> Zero data leaves your device</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3, duration: 1.5 }} className="absolute bottom-14 flex flex-col items-center gap-3">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </motion.section>

      {/* ─── PROOF BAR — Emotional Hooks ─────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="snap-start relative z-10 py-14 md:py-16 border-y border-white/[0.04]"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 px-6">
          {[
            { hook: '"Why do I keep', hook2: 'doing this?"', answer: 'Finally answered.' },
            { hook: 'Relationships', hook2: 'mapped.', answer: 'Not guessed.' },
            { hook: 'Your patterns —', hook2: '', answer: 'finally visible.' },
            { hook: '30 seconds.', hook2: '', answer: 'Your first blueprint.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={lineReveal}
              custom={i}
              className={`text-center px-4 ${i > 0 ? 'md:border-l md:border-white/[0.04]' : ''}`}
            >
              <p className="text-[13px] md:text-[14px] text-neutral-500 italic leading-snug">{item.hook}{item.hook2 && <br />}{item.hook2}</p>
              <motion.p
                variants={dramaPause}
                custom={i}
                className="text-[13px] md:text-[14px] text-white/80 font-semibold mt-2"
              >{item.answer}</motion.p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── 02 // THE ARCHITECTURE ──────────────────────── */}
      <section id="architecture" className="snap-start relative z-10 py-20 md:py-40 px-5 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">The Architecture</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">
            You're not broken.<br />You're <span className="bg-gradient-to-r from-white via-neutral-400 to-neutral-300 bg-clip-text text-transparent">fragmented.</span>
          </motion.h2>
          <motion.p variants={lineReveal} custom={0} className="text-neutral-400 mt-8 text-[15px] md:text-lg leading-[1.8] max-w-xl mx-auto">
            DEFRAG doesn't fix you. It <em className="text-white/80 not-italic font-medium">defragments</em> the noise —<br />
            so you can finally see <strong className="text-white/70 font-semibold">how you're built.</strong>
          </motion.p>
          <motion.p variants={dramaPause} custom={2} className="text-white/90 font-semibold mt-8 text-lg md:text-xl tracking-tight">
            We don't add features. We remove friction.
          </motion.p>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── WHO IS THIS FOR ─────────────────────────────── */}
      <section className="snap-start relative z-10 py-20 md:py-40 px-5 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-20">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Recognition</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">Sound familiar?</h2>
            <motion.p variants={dramaPause} custom={1} className="text-neutral-500 mt-4 text-sm italic">Tap any card to see how DEFRAG helps.</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {PERSONAS.map((p, i) => (
              <motion.div
                key={p.tag}
                variants={fadeUp}
                custom={i}
                onClick={() => setExpandedPersona(expandedPersona === i ? null : i)}
                className="group rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-2xl p-8 md:p-10 hover:border-white/[0.14] hover:bg-white/[0.035] transition-all duration-700 relative overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.015, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="card-inner-glow" />
                <div className="card-edge-light" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] transition-all">
                      {p.icon}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{p.tag}</span>
                    <motion.svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="ml-auto text-neutral-600"
                      animate={{ rotate: expandedPersona === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </motion.svg>
                  </div>
                  <h3 className="text-[17px] font-bold text-white/90 mb-3 leading-snug">{p.headline}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{p.body}</p>
                  <AnimatePresence>
                    {expandedPersona === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 border-t border-white/[0.06]">
                          <p className="text-sm text-neutral-300 leading-relaxed italic">{p.detail}</p>
                          <Link to="/login" className="inline-flex items-center gap-2 mt-4 text-[12px] font-semibold text-white/60 hover:text-white/90 transition-colors">
                            See your map <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── 03 // THREE PILLARS ──────────────────────────── */}
      <section id="pillars" className="snap-start relative z-10 py-20 md:py-40 px-5 md:px-6">
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
            <motion.p variants={lineReveal} custom={1} className="text-neutral-400 mt-6 text-[15px] md:text-lg leading-[1.8] max-w-2xl mx-auto">
              Each reads a different layer of <strong className="text-white/70 font-semibold">how you operate</strong> —<br />
              <motion.span variants={dramaPause} custom={2} className="inline-block mt-1 italic text-white/50">combined into one clear picture.</motion.span>
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <PillarCard
              index={1}
              label="Pillar I"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
              title="The Signal Filter"
              body="Maps how you process, decide, and where stress builds. Generated once — referenced in everything DEFRAG does."
            />
            <PillarCard
              index={2}
              label="Pillar II"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4M8.5 16.5l-1 .5M15.5 16.5l1 .5"/></svg>}
              title="The Triangulation Engine"
              body="Analyzes dynamics between people. Shows who carries the weight, who creates tension, and how it moves."
            />
            <PillarCard
              index={3}
              label="Pillar III"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
              title="The Echo Engine"
              body="Monitors your behavior over 30 days to surface recurring cycles — the arguments and shutdowns you keep repeating, made visible."
            />
          </div>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── 03.5 // HOW IT WORKS — Bento Grid ─────────── */}
      <section id="how-it-works" className="snap-section relative z-10 py-20 md:py-40 px-5 md:px-6">
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
            <motion.p variants={lineReveal} custom={1} className="text-neutral-400 mt-6 text-[15px] md:text-lg leading-[1.8] max-w-2xl mx-auto">
              How you're wired, where you get stuck,<br />
              <motion.span variants={dramaPause} custom={2} className="inline-block mt-1 italic text-white/50">and what to do about it.</motion.span>
            </motion.p>
          </motion.div>

          {/* Bento Grid — 1 featured large + 3 compact */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* Featured: The Map — spans 2 cols on desktop */}
            <motion.div
              variants={fadeUp}
              custom={0}
              onClick={() => setExpandedBento(expandedBento === 0 ? null : 0)}
              className="group md:col-span-2 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-10 md:p-12 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.01, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="card-inner-glow" />
              <div className="card-edge-light" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/[0.15] transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 tracking-wider">01</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">The Map</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-4">Personal Profile</span>
                  <p className="text-[15px] text-neutral-400 leading-relaxed mb-6">How you naturally think, decide, and respond — generated from your birth data. Your strengths, blind spots, and the patterns shaping your daily life.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Energy type', 'Decision strategy', 'Stress patterns', 'Active gates'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-medium text-neutral-500 border border-white/[0.06] bg-white/[0.02]">{tag}</span>
                    ))}
                  </div>
                  <AnimatePresence>
                    {expandedBento === 0 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <p className="mt-5 pt-5 border-t border-white/[0.06] text-sm text-neutral-300 leading-relaxed italic">Generated once from your birth data — no questionnaires. Your energy type, decision strategy, defined centers, and active gates are calculated astronomically and mapped into a readable blueprint you can reference daily.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* The Field — single col */}
            <motion.div
              variants={fadeUp}
              custom={1}
              onClick={() => setExpandedBento(expandedBento === 1 ? null : 1)}
              className="group rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.015, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="card-inner-glow" />
              <div className="card-edge-light" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><circle cx="12" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="M12 8v4M8.5 16.5l-1 .5M15.5 16.5l1 .5"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 tracking-wider">02</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">The Field</h3>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-3">Relationship Dynamics</span>
                <p className="text-sm text-neutral-400 leading-relaxed">Who steadies things, who absorbs tension, and where friction comes from.</p>
                <AnimatePresence>
                  {expandedBento === 1 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="mt-4 pt-4 border-t border-white/[0.06] text-sm text-neutral-300 leading-relaxed italic">Analyzes the dynamics between two or three people. Shows who initiates, who absorbs emotional weight, and where the structural friction lives — mechanically, not emotionally.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* The Shift — single col */}
            <motion.div
              variants={fadeUp}
              custom={2}
              onClick={() => setExpandedBento(expandedBento === 2 ? null : 2)}
              className="group rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.015, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="card-inner-glow" />
              <div className="card-edge-light" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 tracking-wider">03</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">The Shift</h3>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-3">Strength Mapping</span>
                <p className="text-sm text-neutral-400 leading-relaxed">Your biggest frustrations point to your biggest strengths — used wrong. See where they actually work.</p>
                <AnimatePresence>
                  {expandedBento === 2 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="mt-4 pt-4 border-t border-white/[0.06] text-sm text-neutral-300 leading-relaxed italic">Uses Gene Keys shadow-to-gift mapping. Your most frustrating traits contain your highest potential — DEFRAG identifies the exact reframe so frustration becomes leverage.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* The Memory — spans 2 cols on desktop */}
            <motion.div
              variants={fadeUp}
              custom={3}
              onClick={() => setExpandedBento(expandedBento === 3 ? null : 3)}
              className="group md:col-span-2 rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-700 relative overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.01, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="card-inner-glow" />
              <div className="card-edge-light" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-600 tracking-wider">04</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">The Memory</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-3">Pattern Tracking</span>
                  <p className="text-[15px] text-neutral-400 leading-relaxed">Tracks your recurring patterns over 30 days. Once you can see a loop, you can break it.</p>
                  <AnimatePresence>
                    {expandedBento === 3 && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <p className="mt-4 pt-4 border-t border-white/[0.06] text-sm text-neutral-300 leading-relaxed italic">The Echo Engine logs your conversations and reactions over time. After 30 days, it surfaces the loops — the same arguments, shutdowns, and avoidance patterns — so you can finally see them before they run.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── 04 // SEDA GAUGE SHOWCASE ───────────────────── */}
      <section className="snap-section relative z-10 py-20 md:py-40 px-5 md:px-6">
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
          <motion.p variants={lineReveal} custom={1} className="text-neutral-400 mt-6 text-[15px] leading-[1.8]">
                DEFRAG reads your state and adjusts —<br />
                <motion.span variants={dramaPause} custom={2} className="inline-block mt-1 italic text-white/50">direct when you're steady, gentle when you're not.</motion.span>
              </motion.p>
              <div className="mt-8 space-y-4">
                {[
                  { mode: 'LOGIC MODE', desc: 'Clear, direct answers. Standard conversation.', color: 'bg-emerald-400/30' },
                  { mode: 'HOLDING SPACE', desc: 'Emotional weight detected. Pace slows. Your feelings come first.', color: 'bg-amber-400/30' },
                  { mode: 'CRISIS MODE', desc: 'Analysis stops. Breathing exercises and support resources only.', color: 'bg-red-400/30' },
                ].map((m) => (
                  <div key={m.mode} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${m.color} mt-2 flex-shrink-0 ring-2 ring-white/[0.04]`} />
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

      <GlowDivider />

      {/* ─── 05 // SYSTEM MAP — Enhanced ──────────────────── */}
      <section className="snap-section relative z-10 py-20 md:py-40 px-5 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">The Output</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">
            Your complete<br /><span className="bg-gradient-to-r from-white via-neutral-400 to-neutral-300 bg-clip-text text-transparent">system map.</span>
          </motion.h2>
          <motion.div variants={lineReveal} custom={1} className="text-neutral-400 mt-8 text-[15px] md:text-lg leading-[1.8] max-w-2xl mx-auto">
            <p>Your personality. Your relationships. Your patterns.</p>
            <motion.p variants={dramaPause} custom={2} className="mt-2">
              <span className="text-neutral-300 font-medium">One living map</span> — not a label.
            </motion.p>
          </motion.div>

          {/* Enhanced orbiting visual */}
          <motion.div variants={fadeUp} custom={3} className="mt-16 flex justify-center">
            <div className="relative">
              {/* Outer ring glow */}
              <div className="absolute -inset-8 rounded-full bg-gradient-to-br from-white/[0.02] to-transparent blur-[40px] animate-breathe-slow pointer-events-none" />
              {/* Outer orbit ring */}
              <div className="absolute inset-[-20px] rounded-full border border-white/[0.03] border-dashed" />
              <div className="w-36 h-36 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center animate-breathe">
                <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-white/20 shadow-[0_0_30px_rgba(255,255,255,0.25)]" />
                </div>
              </div>
              {/* Orbiting labeled nodes */}
              {[
                { deg: 0, label: 'Signal' },
                { deg: 72, label: 'Structure' },
                { deg: 144, label: 'Pattern' },
                { deg: 216, label: 'Memory' },
                { deg: 288, label: 'Field' },
              ].map((node) => (
                <motion.div
                  key={node.deg}
                  className="absolute flex items-center gap-2"
                  style={{ top: '50%', left: '50%' }}
                  animate={{
                    x: [Math.cos((node.deg * Math.PI) / 180) * 85, Math.cos(((node.deg + 360) * Math.PI) / 180) * 85],
                    y: [Math.sin((node.deg * Math.PI) / 180) * 85, Math.sin(((node.deg + 360) * Math.PI) / 180) * 85],
                  }}
                  transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/15 border border-white/[0.2] shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                </motion.div>
              ))}
              <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-[50px] animate-glow-ring pointer-events-none" />
            </div>
          </motion.div>

          {/* Layer labels */}
          <motion.div variants={fadeUp} custom={4} className="mt-16 flex flex-wrap justify-center gap-3">
            {['Signal', 'Structure', 'Pattern', 'Memory', 'Field'].map(l => (
              <span key={l} className="px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 border border-white/[0.06] bg-white/[0.02]">{l}</span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── NOT LIKE THE OTHERS — Comparison ────────────── */}
      <section className="snap-section relative z-10 py-20 md:py-36 px-5 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Different By Design</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">Not therapy.<br />Not astrology.<br /><motion.span variants={dramaPause} custom={1} className="inline-block text-neutral-400">Architecture.</motion.span></h2>
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 px-8 py-5 border-b border-white/[0.05]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">Tool</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">Approach</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">DEFRAG</span>
            </div>
            {COMPARISONS.map((c, i) => (
              <div key={c.label} className={`grid grid-cols-3 gap-4 px-8 py-5 ${i < COMPARISONS.length - 1 ? 'border-b border-white/[0.03]' : ''} hover:bg-white/[0.02] transition-colors`}>
                <span className="text-sm text-neutral-400 font-medium">{c.label}</span>
                <span className="text-sm text-neutral-500">{c.desc}</span>
                <span className="text-sm text-white font-medium">{c.defrag}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── 06 // ZERO-KNOWLEDGE ────────────────────────── */}
      <section className="snap-start relative z-10 py-16 md:py-32 px-5 md:px-6">
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
          <motion.h3 variants={fadeUp} custom={1} className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
            Your data never leaves<br /><motion.span variants={dramaPause} custom={2} className="inline-block">your device.</motion.span>
          </motion.h3>
          <motion.div variants={lineReveal} custom={1} className="text-neutral-500 mt-4 text-sm leading-[1.8] max-w-lg mx-auto">
            <p>No cloud storage. No third-party analytics.</p>
            <motion.p variants={dramaPause} custom={2} className="mt-1">
              <span className="text-neutral-400 font-medium">Everything stays on your device</span> —<br />
              <em className="italic text-neutral-300">encrypted, local, yours alone.</em>
            </motion.p>
          </motion.div>
          {/* Trust indicators */}
          <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-wrap justify-center gap-6">
            {[
              { label: 'End-to-end encrypted' },
              { label: 'No cloud storage' },
              { label: 'Zero third-party access' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 text-[12px] text-neutral-500">
                <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                <span>{t.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── TESTIMONIALS — Horizontal marquee ────────────── */}
      <section className="snap-section relative z-10 py-16 md:py-28 px-5 md:px-6 overflow-hidden">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Signal Reports</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight leading-tight">After the diagnostic.</h2>
          </motion.div>
        </motion.div>
        <TestimonialMarquee />
      </section>

      {/* ─── QUICK-START DIAGNOSTIC ─────────────────────── */}
      <section className="snap-section relative z-10 py-20 md:py-36 px-5 md:px-6">
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
            <motion.div variants={lineReveal} custom={1} className="text-neutral-400 mt-6 text-[15px] leading-[1.8] max-w-xl mx-auto">
              <p>Enter your birth data. <strong className="text-white/70 font-semibold">Instant reading</strong> from the engine.</p>
            </motion.div>
          </motion.div>

          <QuickDiagnostic />
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section className="snap-section relative z-10 py-20 md:py-36 px-5 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Common Questions</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-5 tracking-tight leading-tight">Before you begin.</h2>
            <motion.p variants={dramaPause} custom={1} className="text-neutral-500 mt-4 text-sm italic">Everything you need to know — nothing you don't.</motion.p>
          </motion.div>
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-2xl px-8 md:px-10">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </motion.div>
      </section>

      <GlowDivider />

      {/* ─── PLANS ────────────────────────────────────────── */}
      <section id="plans" className="snap-section relative z-10 py-20 md:py-36 px-5 md:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Access</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight leading-tight">Choose your depth.</h2>
            <motion.p variants={lineReveal} custom={1} className="text-neutral-500 mt-4 text-sm max-w-lg mx-auto">
              One blueprint, or <strong className="text-neutral-400 font-semibold">continuous clarity</strong>.
            </motion.p>
            <motion.p variants={dramaPause} custom={2} className="text-neutral-500 mt-1 text-sm italic">No trials. No data harvesting.</motion.p>
          </motion.div>
          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-5">
            <PricingTier tier={tiers.SINGLE} label="Free" onSelect={() => navigate('/onboarding')} />
            <PricingTier tier={tiers.BASIC} label="Monthly" onSelect={() => initiateCheckout('BLUEPRINT')} featured />
            <PricingTier tier={tiers.PRO} label="Full Access" onSelect={() => initiateCheckout('ORBIT')} />
          </motion.div>
          <motion.p variants={fadeUp} custom={4} className="text-center text-[11px] text-neutral-600 mt-10">Zero-knowledge architecture. Cancel anytime.</motion.p>
        </motion.div>
      </section>

      {/* ─── CLOSING CTA ──────────────────────────────────── */}
      <section className="snap-section relative z-10 py-20 md:py-36 px-5 md:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-[2.75rem] font-bold tracking-tight leading-tight">
            Stop guessing.<br />
            <motion.span variants={dramaPause} custom={1} className="inline-block bg-gradient-to-r from-white via-neutral-400 to-neutral-300 bg-clip-text text-transparent">Start seeing.</motion.span>
          </motion.h2>
          <motion.p variants={lineReveal} custom={1} className="text-neutral-400 mt-6 text-[15px] md:text-lg leading-[1.8] max-w-xl mx-auto">
            Your free blueprint takes <strong className="text-white/70 font-semibold">30 seconds</strong>.
          </motion.p>
          <motion.p variants={dramaPause} custom={2} className="text-sm text-neutral-500 italic mt-2">No sign-up. No credit card. Just clarity.</motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-10">
            <Link to="/login" className="group relative inline-flex items-center justify-center px-12 py-5 rounded-2xl bg-white text-black font-semibold text-[15px] overflow-hidden transition-all duration-500 hover:shadow-[0_0_80px_-5px_rgba(255,255,255,0.25)] hover:-translate-y-0.5">
              <span className="relative z-10">Get Your Free Blueprint</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-neutral-200 to-white bg-[length:200%_100%] opacity-0 group-hover:opacity-100 group-hover:animate-gradient-shift transition-opacity" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER / MANIFESTO TEASE ─────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.03] py-14 md:py-20 px-5 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-600 mb-4">The Protocol</p>
          <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-medium">
            The manual you wish came with<br />the people you love.
          </p>
        </div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />
              <circle cx="10" cy="10" r="2.5" fill="white" opacity="0.4" />
              <circle cx="10" cy="2.5" r="1" fill="white" opacity="0.2" />
              <circle cx="16.5" cy="6.5" r="1" fill="white" opacity="0.15" />
              <circle cx="16.5" cy="13.5" r="1" fill="white" opacity="0.12" />
              <circle cx="10" cy="17.5" r="1" fill="white" opacity="0.18" />
              <circle cx="3.5" cy="13.5" r="1" fill="white" opacity="0.15" />
              <circle cx="3.5" cy="6.5" r="1" fill="white" opacity="0.2" />
            </svg>
            <span className="text-xs font-semibold tracking-[-0.01em] text-neutral-500">{DEFRAG_MANIFEST.BRAND.NAME}</span>
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
