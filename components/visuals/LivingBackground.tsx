
import React from 'react';

const LivingBackground: React.FC<{ intensity?: 'low' | 'high' }> = ({ intensity = 'low' }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#050505]">
      {/* 1. The Void */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* 2. The Golden Core (Amber/Orange) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1500ms] ease-in-out
        ${intensity === 'high' ? 'w-[1000px] h-[1000px] opacity-100' : 'w-[700px] h-[700px] opacity-50'}
      `}>
        {/* Outer Warmth */}
        <div className="w-full h-full rounded-full bg-amber-600/10 blur-[120px] animate-pulse-slow" />
        
        {/* Inner Reactor */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-amber-500/20 blur-[90px] animate-blob" />
        
        {/* The Hotspot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-200/10 blur-[50px]" />
      </div>

      {/* 3. The Cinematic Grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(245, 158, 11, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* 4. Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)]" />
    </div>
  );
};

export default LivingBackground;
