import React from 'react';
import { Link } from 'react-router-dom';
import { DEFRAG_MANIFEST } from '../constants/manifest';
import LivingBackground from '../components/visuals/LivingBackground';

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
      <LivingBackground mode="calm" />
      
      {/* NAVIGATION */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12 border-b border-white/5 bg-black/50 backdrop-blur-sm">
        <div className="text-xl font-bold tracking-tight">{DEFRAG_MANIFEST.BRAND.NAME}</div>
        <div className="space-x-8 text-sm font-medium text-slate-300">
          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/login" className="hover:text-white transition">Log In</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight max-w-4xl">
          {DEFRAG_MANIFEST.LANDING.HERO_TITLE}
        </h1>
        
        <p className="max-w-2xl text-lg text-slate-400 mb-10 leading-relaxed">
          {DEFRAG_MANIFEST.LANDING.HERO_SUB}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
           <Link 
             to="/login" 
             className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-amber-400 transition transform hover:-translate-y-1"
           >
             {DEFRAG_MANIFEST.LANDING.CTA_PRIMARY}
           </Link>
           <Link 
             to="/about" 
             className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition"
           >
             {DEFRAG_MANIFEST.LANDING.CTA_SECONDARY}
           </Link>
        </div>
      </main>
      
      {/* FOOTER */}
      <footer className="relative z-10 w-full p-8 text-center text-xs text-slate-600 border-t border-white/5">
        <div className="flex justify-center gap-6 mb-4">
          <Link to="/legal" className="hover:text-slate-400">Terms of Service</Link>
          <Link to="/legal" className="hover:text-slate-400">Privacy Policy</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} {DEFRAG_MANIFEST.BRAND.NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
};