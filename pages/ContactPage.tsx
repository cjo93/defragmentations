import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
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

type FormState = 'idle' | 'sending' | 'success' | 'error';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = name.trim() && email.trim() && message.trim() && formState !== 'sending';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setFormState('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong.');
      }

      setFormState('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setFormState('error');
      setErrorMsg(err.message || 'Signal interrupted. Try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      <LivingBackground mode="calm" />

      {/* ─── NAV BAR ─────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_16px_rgba(255,255,255,0.5)] transition-shadow" />
            <span className="text-sm font-semibold tracking-tight">{DEFRAG_MANIFEST.BRAND.NAME}</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>
      </nav>

      {/* ─── CONTENT ─────────────────────────────────────── */}
      <main className="relative z-10 pt-32 pb-24 px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Contact</span>
            <h1 className="text-3xl md:text-4xl font-bold mt-4 tracking-tight">Open a channel.</h1>
            <p className="text-neutral-500 mt-3 text-sm max-w-md mx-auto">
              Questions, feedback, partnership inquiries — we read every message.
            </p>
          </motion.div>

          {/* Success State */}
          {formState === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-16"
            >
              <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Signal received.</h2>
              <p className="text-sm text-neutral-500 mb-8">We'll respond within 24 hours.</p>
              <button
                onClick={() => setFormState('idle')}
                className="text-xs text-neutral-500 hover:text-neutral-300 transition underline underline-offset-4"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            /* Form */
            <motion.form
              variants={fadeUp}
              custom={1}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.04] transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.04] transition"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-2">
                  Subject <span className="text-neutral-700 normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What's this about?"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.04] transition"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={6}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.04] transition resize-none"
                  required
                />
              </div>

              {/* Error */}
              {formState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-red-500/[0.06] border border-red-500/[0.12]"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-300">{errorMsg}</span>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2.5 bg-white text-black font-semibold text-sm py-3.5 rounded-lg hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                {formState === 'sending' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {formState === 'sending' ? 'Transmitting...' : 'Send Message'}
              </button>

              {/* Direct email fallback */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <Mail className="w-3.5 h-3.5 text-neutral-600" />
                <span className="text-[11px] text-neutral-600">
                  Or email directly:{' '}
                  <a href="mailto:help@defrag.app" className="text-neutral-400 hover:text-neutral-300 transition">
                    help@defrag.app
                  </a>
                </span>
              </div>
            </motion.form>
          )}
        </motion.div>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.03] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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
