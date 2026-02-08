import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LivingBackground from '../components/visuals/LivingBackground';
import { DEFRAG_MANIFEST } from '../constants/manifest';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export const LegalPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      <LivingBackground mode="calm" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_16px_rgba(255,255,255,0.5)] transition-shadow" />
            <span className="text-sm font-semibold tracking-tight">{DEFRAG_MANIFEST.BRAND.NAME}</span>
          </Link>
          <Link to="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition">Back</Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">

          {/* Terms of Service */}
          <motion.section initial="hidden" animate="visible" variants={stagger} className="mb-20">
            <motion.div variants={fadeUp} custom={0}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Legal</span>
              <h1 className="text-3xl md:text-4xl font-bold mt-4 tracking-tight">Terms of Service</h1>
              <p className="text-neutral-500 mt-3 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="mt-10 space-y-8 text-sm text-neutral-400 leading-relaxed">
              <div>
                <h2 className="text-white font-semibold text-base mb-3">1. Acceptance</h2>
                <p>By accessing or using DEFRAG ("the Service"), you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">2. Description of Service</h2>
                <p>DEFRAG is a behavioral intelligence platform that maps internal architecture — how you process, decide, and connect. The Service provides informational and analytical outputs based on the data you provide. It is not a substitute for professional medical, psychological, or therapeutic advice.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">3. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account. You agree to provide accurate information and to update it as necessary. We reserve the right to suspend or terminate accounts that violate these Terms.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">4. Acceptable Use</h2>
                <p>You agree not to misuse the Service, attempt to access unauthorized areas, reverse-engineer any part of the platform, or use the Service for any unlawful purpose.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">5. Subscriptions & Billing</h2>
                <p>Paid features are billed on a recurring basis. You may cancel at any time — access continues through the end of the current billing period. No refunds are provided for partial periods. All payments are processed securely through Stripe.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">6. Intellectual Property</h2>
                <p>All content, design, and code of the Service are owned by DEFRAG. Your data remains yours — we claim no ownership of the information you provide.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">7. Limitation of Liability</h2>
                <p>The Service is provided "as is" without warranties of any kind. DEFRAG shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">8. Changes</h2>
                <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">9. Contact</h2>
                <p>Questions about these Terms? Reach us at <a href="mailto:help@defrag.app" className="text-neutral-300 hover:text-white transition underline underline-offset-4">help@defrag.app</a>.</p>
              </div>
            </motion.div>
          </motion.section>

          {/* Divider */}
          <div className="border-t border-white/[0.06] mb-20" />

          {/* Privacy Policy */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} id="privacy">
            <motion.div variants={fadeUp} custom={0}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">Legal</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 tracking-tight">Privacy Policy</h2>
              <p className="text-neutral-500 mt-3 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="mt-10 space-y-8 text-sm text-neutral-400 leading-relaxed">
              <div>
                <h2 className="text-white font-semibold text-base mb-3">1. What We Collect</h2>
                <p>We collect only the information you explicitly provide: birth data (date, time, location), text inputs, and account credentials. We do not collect browsing behavior, sell data to third parties, or build advertising profiles.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">2. How We Use It</h2>
                <p>Your data is used solely to generate your architectural outputs — blueprint calculations, relational analysis, and pattern recognition. It is processed in real-time and stored locally in your browser where possible.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">3. Zero-Knowledge Architecture</h2>
                <p>DEFRAG is built on a zero-knowledge principle. We minimize server-side data storage. Calculations happen client-side where feasible. We do not have access to your journal entries, voice transcripts, or chat history unless explicitly transmitted for AI processing — in which case they are not stored after the response is generated.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">4. Third-Party Services</h2>
                <p>We use the following external services:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-500">
                  <li><span className="text-neutral-400">Stripe</span> — for payment processing (we never see your full card number)</li>
                  <li><span className="text-neutral-400">Hugging Face</span> — for AI inference (data is processed but not stored)</li>
                  <li><span className="text-neutral-400">Vercel</span> — for hosting and deployment</li>
                  <li><span className="text-neutral-400">Resend</span> — for transactional email</li>
                </ul>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">5. Cookies</h2>
                <p>We use essential cookies (localStorage) for authentication state and your preferences. We do not use tracking cookies, analytics pixels, or advertising identifiers.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">6. Data Retention & Deletion</h2>
                <p>Your data is stored locally in your browser. You can delete it at any time by clearing your browser storage or using the in-app logout. If you request full account deletion, email <a href="mailto:help@defrag.app" className="text-neutral-300 hover:text-white transition underline underline-offset-4">help@defrag.app</a> and we will remove all server-side data within 30 days.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">7. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal data at any time. If you are in the EU, you also have rights under GDPR including data portability and the right to object to processing.</p>
              </div>

              <div>
                <h2 className="text-white font-semibold text-base mb-3">8. Contact</h2>
                <p>For privacy inquiries: <a href="mailto:help@defrag.app" className="text-neutral-300 hover:text-white transition underline underline-offset-4">help@defrag.app</a></p>
              </div>
            </motion.div>
          </motion.section>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.03] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.25)]" />
            <span className="text-xs font-semibold tracking-tight text-neutral-500">{DEFRAG_MANIFEST.BRAND.NAME}</span>
          </div>
          <div className="flex items-center gap-8 text-[11px] text-neutral-600">
            <Link to="/" className="hover:text-neutral-400 transition">Home</Link>
            <Link to="/contact" className="hover:text-neutral-400 transition">Contact</Link>
          </div>
          <p className="text-[11px] text-neutral-700">&copy; {new Date().getFullYear()} {DEFRAG_MANIFEST.BRAND.NAME}</p>
        </div>
      </footer>
    </div>
  );
};
