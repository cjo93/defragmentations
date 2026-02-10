
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import LivingBackground from '../visuals/LivingBackground';
import { useToast } from '../visuals/Toast';

/* ─── Logo Mark ─────────────────────────────────────────────── */
const DefragLogo: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    {/* Outer ring */}
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="24" cy="24" r="16" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      {/* Core node */}
      <circle cx="24" cy="24" r="4" fill="white" opacity="0.9" />
      {/* Orbital nodes */}
      <circle cx="24" cy="6" r="2" fill="white" opacity="0.35" />
      <circle cx="40" cy="18" r="2" fill="white" opacity="0.25" />
      <circle cx="36" cy="36" r="2" fill="white" opacity="0.3" />
      <circle cx="12" cy="36" r="2" fill="white" opacity="0.2" />
      <circle cx="8" cy="18" r="2" fill="white" opacity="0.35" />
      {/* Connection lines */}
      <line x1="24" y1="8" x2="24" y2="20" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <line x1="38" y1="19" x2="28" y2="23" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="35" y1="35" x2="27" y2="27" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="13" y1="35" x2="21" y2="27" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="10" y1="19" x2="20" y2="23" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    </svg>
    {/* Glow */}
    {/* Removed extra animation per strict platform alignment */}
  </div>
);

type AuthView = 'login' | 'forgot' | 'reset-sent';

export const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      localStorage.setItem('defrag_auth_token', 'session_active');
      localStorage.setItem('defrag_user_email', email);
      
      showToast('success', 'Welcome back to DEFRAG');
      
      setTimeout(() => {
        const hasData = localStorage.getItem('defrag_user_data');
        if (hasData) {
          localStorage.setItem('defrag_onboarding_complete', 'true');
        }
        navigate(hasData ? '/dashboard' : '/onboarding');
      }, 800);
    }, 1500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setView('reset-sent');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
      <LivingBackground mode="calm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative rounded-[32px] overflow-hidden">
          {/* Glass layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-white/[0.01] backdrop-blur-3xl" />
          <div className="absolute inset-0 border border-white/[0.08] rounded-[32px]" />
          {/* Removed extra animation per strict platform alignment */}
          {/* Removed extra animation per strict platform alignment */}
          {/* Edge light */}
          <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_-1px_0_0_rgba(255,255,255,0.02)] pointer-events-none" />

          <div className="relative p-10 md:p-14">
            <AnimatePresence mode="wait">
              {/* ─── LOGIN VIEW ──────────────────────────────── */}
              {view === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-10"
                  >
                    <div className="flex justify-center mb-7">
                      <DefragLogo size={52} />
                    </div>
                    <h2 className="text-[28px] font-bold tracking-[-0.02em] mb-2">
                      Welcome <span className="bg-gradient-to-r from-white via-neutral-400 to-neutral-300 bg-clip-text text-transparent">back.</span>
                    </h2>
                    <p className="text-white/35 text-[13px]">Pick up where you left off.</p>
                  </motion.div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/25 ml-1 font-medium">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl px-5 py-4 text-[14px] text-white placeholder-white/15 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.03)] transition-all duration-300"
                        placeholder="name@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-medium">Password</label>
                        <button
                          type="button"
                          onClick={() => setView('forgot')}
                          className="text-[11px] text-white/30 hover:text-white/60 transition-colors duration-300"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl px-5 py-4 text-[14px] text-white placeholder-white/15 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.03)] transition-all duration-300"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white text-black rounded-2xl py-4.5 font-semibold text-[14px] hover:bg-neutral-100 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2.5 group shadow-[0_4px_40px_-8px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_50px_-6px_rgba(255,255,255,0.3)]"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-black/15 border-t-black rounded-full"
                          />
                          <span>Entering...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 text-[10px] uppercase tracking-[0.2em] text-white/20 bg-transparent">or</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[13px] text-white/25">
                      New here?{' '}
                      <Link to="/onboarding" className="text-white/70 hover:text-white transition-colors duration-300 font-medium">
                        Create your blueprint
                      </Link>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ─── FORGOT PASSWORD VIEW ───────────────────── */}
              {view === 'forgot' && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-center mb-10"
                  >
                    <div className="flex justify-center mb-7">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-[24px] font-bold tracking-[-0.02em] mb-2">Reset your password</h2>
                    <p className="text-white/35 text-[13px] leading-relaxed max-w-[280px] mx-auto">
                      Enter the email associated with your account. We'll send you a link to get back in.
                    </p>
                  </motion.div>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/25 ml-1 font-medium">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-2xl px-5 py-4 text-[14px] text-white placeholder-white/15 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.03)] transition-all duration-300"
                        placeholder="name@example.com"
                        required
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email.trim()}
                      className="w-full bg-white text-black rounded-2xl py-4.5 font-semibold text-[14px] hover:bg-neutral-100 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2.5 shadow-[0_4px_40px_-8px_rgba(255,255,255,0.2)]"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-black/15 border-t-black rounded-full"
                          />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                  </form>

                  <button
                    onClick={() => { setView('login'); setIsLoading(false); }}
                    className="w-full mt-6 py-3 text-[13px] text-white/30 hover:text-white/60 transition-colors duration-300 flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5m7-7l-7 7 7 7" /></svg>
                    Back to sign in
                  </button>
                </motion.div>
              )}

              {/* ─── RESET SENT CONFIRMATION ────────────────── */}
              {view === 'reset-sent' && (
                <motion.div
                  key="reset-sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-center mb-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <motion.svg
                        width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="text-emerald-400"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </motion.svg>
                    </div>
                  </motion.div>
                  <h2 className="text-[22px] font-bold tracking-[-0.02em] mb-3">Check your inbox</h2>
                  <p className="text-white/35 text-[13px] leading-relaxed max-w-[300px] mx-auto mb-2">
                    If an account exists for <span className="text-white/60 font-medium">{email}</span>, you'll receive a reset link shortly.
                  </p>
                  <p className="text-white/20 text-[11px] mb-8">Don't see it? Check your spam folder.</p>

                  <button
                    onClick={() => { setView('login'); setIsLoading(false); }}
                    className="w-full py-4 rounded-2xl border border-white/[0.08] text-white/50 font-medium text-[13px] hover:bg-white/[0.04] hover:text-white/80 hover:border-white/[0.15] transition-all duration-300"
                  >
                    Return to sign in
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subtle brand below card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          <div className="w-1 h-1 rounded-full bg-white/15" />
          <span className="text-[10px] text-white/15 font-medium tracking-[0.15em] uppercase">Defrag</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
