
import React from 'react';
import LivingBackground from '../visuals/LivingBackground';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children?: React.ReactNode;
  intensity?: 'low' | 'high';
}

export default function CinemaLayout({ children, intensity = 'low' }: LayoutProps) {
  return (
    <div className="min-h-screen w-full relative font-sans text-[#EDEDED] selection:bg-amber-500 selection:text-black">
      <LivingBackground intensity={intensity} />
      
      {/* Nav Bar */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-2 h-2 rounded-full bg-amber-500 group-hover:animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-widest text-white/60 group-hover:text-amber-500 transition-colors">DEFRAG_OS</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20">
        {children}
      </main>
    </div>
  );
}
