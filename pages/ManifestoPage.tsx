import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LivingBackground from '../components/visuals/LivingBackground';
import { DEFRAG_MANIFEST } from '../constants/manifest';

/* ─── Animation Primitives ──────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

/* ─── Manifesto Block ───────────────────────────────────────── */
const ManifestoBlock: React.FC<{ number: string; title: string; body: string; index: number }> = ({ number, title, body, index }) => (
  <motion.div variants={fadeUp} custom={index} className="relative pl-16 md:pl-20 py-8 border-l border-white/[0.06]">
    <span className="absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full bg-[#050505] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-neutral-500">{number}</span>
    <h3 className="text-lg md:text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-xl">{body}</p>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   THE INVERSION PROTOCOL — Manifesto
   ═══════════════════════════════════════════════════════════════ */
export const ManifestoPage = () => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-white/20 selection:text-white">
      <LivingBackground mode="calm" />

      {/* ─── NAV ──────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 py-5 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/[0.03]">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
          <span className="text-sm font-semibold tracking-tight">{DEFRAG_MANIFEST.BRAND.NAME}</span>
        </Link>
        <Link to="/login" className="text-[13px] font-medium px-5 py-2 rounded-full border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all duration-300">Enter</Link>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] text-center px-6 pt-32">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">The Protocol</motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] mt-6 mb-8">
            The Inversion<br />Protocol.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="max-w-xl mx-auto text-base md:text-lg text-neutral-400 leading-relaxed">
            DEFRAG is not additive. We do not add features, layers, or complexity. We subtract — systematically removing friction until the signal emerges on its own.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── DIVIDER ──────────────────────────────────────── */}
      <div className="relative z-10 h-px max-w-3xl mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ─── THE PRINCIPLES ───────────────────────────────── */}
      <section className="relative z-10 py-28 md:py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Principles</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-4 tracking-tight">What we believe.</h2>
          </motion.div>

          <ManifestoBlock
            number="01"
            index={1}
            title="You are not broken."
            body="You are fragmented. There is a difference. Broken implies damage. Fragmentation implies scattered coherence — signal buried under noise. DEFRAG doesn't fix. It defragments."
          />
          <ManifestoBlock
            number="02"
            index={2}
            title="Every shadow has a gift."
            body="The Gene Keys framework maps 64 frequencies. Each frequency has a shadow (unconscious friction) and a gift (conscious alignment). The inversion is not mystical — it is mechanical. G = (1/S) × A. The gift is always the inverse of the shadow, scaled by alignment."
          />
          <ManifestoBlock
            number="03"
            index={3}
            title="Conflict is structural, not personal."
            body="When two people create friction, it is not because someone is wrong. It is because their architectures — their centers, gates, and authority channels — create interference patterns. See the structure, and the blame dissolves."
          />
          <ManifestoBlock
            number="04"
            index={4}
            title="Triangulation is the oldest pattern on earth."
            body="Bowen Family Systems identified it: when two-body tension overflows, a third body absorbs the load. Someone becomes the stabilizer. Someone becomes the scapegoat. DEFRAG maps this geometry so you can see it — and stop carrying what isn't yours."
          />
          <ManifestoBlock
            number="05"
            index={5}
            title="Subtraction is the method."
            body="We don't add insights. We remove noise. We don't layer affirmations. We strip interference. What remains after defragmentation is coherence — the natural signal of your design, running without friction."
          />
          <ManifestoBlock
            number="06"
            index={6}
            title="The system regulates itself."
            body="SEDA — our safety middleware — monitors every interaction for grounding, inflation, and distress. When load exceeds structural capacity, the system doesn't push harder. It slows down. It holds space. It grounds. Then it continues."
          />
          <ManifestoBlock
            number="07"
            index={7}
            title="Your data is sovereign."
            body="Zero-knowledge architecture. No cloud databases. No third-party analytics. Your blueprints, echo logs, and system maps stay on your device — encrypted, local, and entirely yours. We don't sell what we don't store."
          />
        </motion.div>
      </section>

      {/* ─── DIVIDER ──────────────────────────────────────── */}
      <div className="relative z-10 h-px max-w-3xl mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* ─── THE SYNTHESIS ────────────────────────────────── */}
      <section className="relative z-10 py-28 md:py-40 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">The Synthesis</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold mt-5 tracking-tight leading-tight">
            Three systems. One architecture.
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-neutral-400 mt-8 text-base leading-relaxed max-w-2xl mx-auto">
            <strong className="text-white/80">Human Design</strong> maps your internal circuitry — how you process energy, make decisions, and interface with the world.
          </motion.p>
          <motion.p variants={fadeUp} custom={3} className="text-neutral-400 mt-4 text-base leading-relaxed max-w-2xl mx-auto">
            <strong className="text-white/80">Bowen Family Systems Theory</strong> maps your relational dynamics — who carries the load, who absorbs the tension, and where the triangulation points emerge.
          </motion.p>
          <motion.p variants={fadeUp} custom={4} className="text-neutral-400 mt-4 text-base leading-relaxed max-w-2xl mx-auto">
            <strong className="text-white/80">Alchemical Inversion</strong> maps the transformation path — the precise mechanism by which shadow frequencies invert into gift frequencies through conscious alignment.
          </motion.p>
          <motion.p variants={fadeUp} custom={5} className="text-white font-semibold mt-10 text-lg">
            Separately, they describe you.<br />Together, they defragment you.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── CLOSING ──────────────────────────────────────── */}
      <section className="relative z-10 py-20 md:py-28 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.p variants={fadeUp} custom={1} className="text-neutral-500 mt-10 text-sm">
            We don't add features. We remove friction.
          </motion.p>
          <motion.p variants={fadeUp} custom={2} className="text-white font-bold mt-2 text-lg">
            Coherence is what remains.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="mt-10">
            <Link to="/login" className="inline-flex items-center justify-center px-9 py-4 rounded-2xl bg-white text-black font-semibold text-sm hover:shadow-[0_0_60px_-5px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-500">
              Initialize System Map
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.03] py-14 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.25)]" />
            <span className="text-xs font-semibold tracking-tight text-neutral-500">{DEFRAG_MANIFEST.BRAND.NAME}</span>
          </div>
          <p className="text-[11px] text-neutral-700">&copy; {new Date().getFullYear()} {DEFRAG_MANIFEST.BRAND.NAME}</p>
        </div>
      </footer>
    </div>
  );
};
