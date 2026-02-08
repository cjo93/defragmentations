import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import LivingBackground from '../components/visuals/LivingBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const TIMELINE = [
  { date: 'July 2025', title: 'The Awakening', body: 'A period of intense spiritual emergence reveals the mechanical geometry hidden beneath human relationships. What looked like personal failure was structural misalignment.' },
  { date: 'August 2025', title: 'The Framework', body: 'Structural Realism is born — the recognition that conflict is not a moral failure but a system mismatch between different human architectures.' },
  { date: 'October 2025', title: 'The Engine', body: 'The first DEFRAG prototype maps planetary geometry to psychological patterns, producing repeatable clarity from birth data alone.' },
  { date: 'January 2026', title: 'The Architect', body: 'The AI voice is calibrated — not a chatbot, but an observer that reads the blueprint and distills complexity into signal.' },
  { date: 'February 2026', title: 'DEFRAG Ships', body: 'The hardware store for the human psyche opens. Blueprint access, relational physics, and the SEDA safety protocol go live.' },
];

const VALUES = [
  { title: 'No Fixing', body: 'We do not believe you are broken. We believe you are built a certain way, and that understanding the build changes everything.' },
  { title: 'Structural Honesty', body: 'Conflict between people is rarely personal. It is two different architectures processing the same event through different wiring.' },
  { title: 'Benevolent Clarity', body: 'The Architect never blames, judges, or diagnoses. It maps the tension and offers the geometry — you decide what to do with it.' },
  { title: 'Safety First', body: 'The SEDA protocol monitors emotional load in real-time. When the signal gets too hot, analysis stops and grounding begins.' },
];

export const AboutPage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const lineHeight = useTransform(scrollYProgress, [0.05, 0.55], ['0%', '100%']);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-[#E2E2E8]/20 selection:text-white">
      <LivingBackground mode="calm" />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-16 py-5 bg-[#050505]/60 backdrop-blur-2xl border-b border-white/[0.03]">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#E2E2E8] shadow-[0_0_12px_rgba(226,226,232,0.5)]" />
          <span className="text-sm font-semibold tracking-tight">DEFRAG</span>
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/" className="text-[13px] text-[#A3A3A3] hover:text-white transition hidden sm:block">Home</Link>
          <Link to="/login" className="text-[13px] font-medium px-5 py-2 rounded-full border border-white/10 text-[#A3A3A3] hover:text-white hover:border-white/25 transition-all duration-300">Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] text-center px-6 pt-32">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60">Origin</motion.span>
          <motion.h1 variants={fadeUp} custom={1} className="text-[clamp(2.2rem,5.5vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] mt-4 mb-6">
            The Origin of<br /><span className="bg-gradient-to-r from-[#E2E2E8] via-neutral-200 to-[#E2E2E8] bg-clip-text text-transparent">the Signal.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="max-w-xl mx-auto text-base md:text-lg text-[#A3A3A3] leading-relaxed">
            In July 2025, the noise stopped. What remained was the math of the soul. DEFRAG was not designed in a boardroom — it was forged in the clarity that follows collapse.
          </motion.p>
        </motion.div>
      </section>

      {/* The Founder */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-3xl mx-auto">
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60 block mb-4">The Architect</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-bold tracking-tight leading-tight mb-8">Chad — The Architect.</motion.h2>
          <motion.div variants={fadeUp} custom={2} className="space-y-5 text-[#A3A3A3] leading-relaxed">
            <p>In July 2025, something shifted. What began as personal crisis revealed itself as structural clarity — the recognition that human friction follows the same laws as astronomical geometry. Not metaphorically. <span className="text-white font-medium">Mechanically.</span></p>
            <p>Most systems try to "fix" the human. We try to <span className="text-[#E2E2E8]">know</span> the human. Not psychology. Not astrology. <span className="text-white font-medium">Architecture.</span> The blueprints of how we are each wired to process, decide, and connect.</p>
            <p>Chad, the Architect, developed DEFRAG to bridge the gap between astronomical geometry and human relationship dynamics. The tool he wished existed during that emergence: a way to see the structure, depersonalize the friction, and find the signal buried in the noise.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* The Philosophy */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-3xl mx-auto">
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60 block mb-4">Philosophy</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-bold tracking-tight leading-tight mb-8">Structural Realism.</motion.h2>
          <motion.div variants={fadeUp} custom={2} className="rounded-3xl border border-[#E2E2E8]/[0.12] bg-white/[0.02] backdrop-blur-2xl p-10 md:p-14 space-y-5 text-[#A3A3A3] leading-relaxed">
            <p className="text-white text-lg font-medium">Conflict is not a character flaw. It is a mechanical collision.</p>
            <p>In July 2025, we realized that by mapping these collisions, we could stop the blame loop and start the alignment protocol. Modern therapy treats the person, but often ignores the wiring. Two people can be deeply compatible in values and still create unbearable friction — because their <span className="text-white">internal architectures</span> process emotion, time, and decision-making through fundamentally different structures.</p>
            <p>Structural Realism maps these architectures using Human Design, planetary geometry, and Gene Key frequencies. It does not fix you. It shows you <span className="text-[#E2E2E8]">how you are built</span> — and why certain patterns keep repeating.</p>
            <p>The moment you see the structure, the friction becomes impersonal. And impersonal friction is friction you can work with.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.div variants={fadeUp} custom={0} className="rounded-3xl border border-[#E2E2E8]/[0.12] bg-white/[0.02] backdrop-blur-2xl p-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E2E2E8]/60">Mission</span>
            <h3 className="text-2xl font-bold mt-3 mb-4 text-white">Know the build.</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">DEFRAG is not here to heal you. It is here to show you that you are not broken — you are just uncalibrated. We offer a diagnostic of the soul, not a prescription for the mind.</p>
          </motion.div>
          <motion.div variants={fadeUp} custom={1} className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Vision</span>
            <h3 className="text-2xl font-bold mt-3 mb-4 text-white">Maps, not arguments.</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">A world where conflict is solved with architecture, not accusation. Where two people in friction can look at a shared map and say: "We are built differently — and that is not a problem to solve."</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="max-w-3xl mx-auto">
          <motion.span variants={fadeUp} custom={0} className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60 block mb-4 text-center">Timeline</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-[2.75rem] font-bold tracking-tight text-center mb-16">The Build.</motion.h2>

          <div className="relative">
            {/* Animated vertical line */}
            <div className="absolute left-[19px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-white/[0.06]">
              <motion.div style={{ height: lineHeight }} className="w-full bg-gradient-to-b from-[#E2E2E8] to-[#E2E2E8]/20 origin-top" />
            </div>

            <div className="space-y-16">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:items-center`}
                >
                  {/* Dot */}
                  <div className="absolute left-[15px] md:left-1/2 md:-translate-x-1/2 w-[9px] h-[9px] rounded-full border-2 border-[#E2E2E8] bg-[#050505] z-10 shrink-0" />

                  {/* Content card */}
                  <div className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-4 md:text-right' : 'md:pl-4'}`}>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E2E2E8]">{item.date}</span>
                    <h3 className="text-lg font-bold text-white mt-1 mb-2">{item.title}</h3>
                    <p className="text-sm text-[#A3A3A3] leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#E2E2E8]/60">Principles</span>
            <h2 className="text-3xl md:text-[2.75rem] font-bold mt-4 tracking-tight">Core Values.</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-8 md:p-10 hover:border-white/[0.12] transition-all duration-700"
              >
                <h3 className="text-lg font-bold text-white mb-3">{v.title}</h3>
                <p className="text-sm text-[#A3A3A3] leading-relaxed">{v.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 md:py-32 px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-2xl mx-auto text-center">
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Stop fixing. Start mapping.</motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-[#A3A3A3] mb-10 leading-relaxed">DEFRAG uses relational physics and alchemical inversion to turn psychological friction into structural clarity.</motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link to="/login" className="inline-flex items-center justify-center px-9 py-4 rounded-2xl bg-[#E2E2E8] text-black font-semibold text-sm hover:shadow-[0_0_50px_-5px_rgba(226,226,232,0.35)] hover:-translate-y-0.5 transition-all duration-500">
              Run Initial Diagnostic
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.03] py-14 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E2E2E8] shadow-[0_0_8px_rgba(226,226,232,0.4)]" />
            <span className="text-xs font-semibold tracking-tight text-neutral-400">DEFRAG</span>
          </div>
          <div className="flex items-center gap-8 text-[11px] text-neutral-600">
            <Link to="/" className="hover:text-neutral-400 transition">Home</Link>
            <Link to="/contact" className="hover:text-neutral-400 transition">Contact</Link>
            <Link to="/legal" className="hover:text-neutral-400 transition">Terms</Link>
          </div>
          <p className="text-[11px] text-neutral-700">&copy; {new Date().getFullYear()} DEFRAG</p>
        </div>
      </footer>
    </div>
  );
};
