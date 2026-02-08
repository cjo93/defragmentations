
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import LivingBackground from '../visuals/LivingBackground';
import { useToast } from '../visuals/Toast';

export const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      localStorage.setItem('defrag_auth_token', 'session_active');
      localStorage.setItem('defrag_user_email', email);
      
      showToast('success', 'Welcome back to DEFRAG');
      
      setTimeout(() => {
        const hasData = localStorage.getItem('defrag_user_data');
        navigate(hasData ? '/dashboard' : '/onboarding');
      }, 800);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans text-white">
      <LivingBackground mode="calm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 md:p-12 shadow-[0_8px_60px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-white/[0.01] blur-[60px] animate-breathe-slow pointer-events-none" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-6 animate-breathe">
              <Sparkles className="w-8 h-8 text-[#E2E2E8]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome <span className="bg-gradient-to-r from-white via-neutral-400 to-white bg-clip-text text-transparent">back.</span></h2>
            <p className="text-white/40 text-sm">Pick up where you left off.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 ml-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all duration-300"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Password</label>
                <a href="#" className="text-[11px] text-[#E2E2E8]/60 hover:text-[#E2E2E8] transition">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.05] transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black rounded-2xl p-4 font-semibold hover:bg-neutral-100 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2 group shadow-[0_4px_30px_-4px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_40px_-4px_rgba(255,255,255,0.25)]"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                  />
                  <span>Entering...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-white/30">
            New here? <Link to="/onboarding" className="text-white hover:text-[#E2E2E8] transition underline decoration-white/20 underline-offset-4">Create your blueprint</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
