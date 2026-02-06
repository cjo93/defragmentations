
import React from 'react';

export const SafePlace: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-black relative overflow-hidden no-flicker">
      {/* Radiant Amber Background Layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.08)_0%,_transparent_70%)] animate-pulse-slow pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.03)_0%,_transparent_90%)] animate-pulse-slower pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-16 max-w-2xl">
        <div className="space-y-6">
          <h2 className="text-amber-500 text-[11px] font-black uppercase tracking-[1em] mb-4">SEDA_STABILIZATION_SYNC</h2>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">Safe Place</h1>
        </div>

        {/* Radiant Amber Orb Assembly */}
        <div className="relative flex items-center justify-center h-80 no-flicker">
           {/* Deep Blur Glow */}
           <div className="absolute w-48 h-48 bg-amber-500/20 rounded-full blur-[90px] animate-amber-glow will-change-transform" />
           
           {/* Pulsing Rings */}
           <div className="absolute w-56 h-56 border border-amber-500/10 rounded-full animate-amber-ring will-change-transform" />
           <div className="absolute w-72 h-72 border border-amber-500/5 rounded-full animate-amber-ring-slow will-change-transform" />
           
           {/* The Core Orb */}
           <div className="w-40 h-40 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-[0_0_150px_rgba(245,158,11,0.5)] animate-amber-breathing will-change-transform overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.4)_0%,_transparent_70%)] opacity-50" />
              {/* Internal Texture */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           </div>
        </div>

        <div className="space-y-10">
          <p className="text-neutral-400 text-xl md:text-2xl leading-relaxed italic font-medium tracking-tight px-10">
             The analysis thread has been paused. <br />
             <span className="text-white font-bold not-italic mt-2 block">Stabilize the biological kernel.</span>
          </p>
          <div className="pt-10 flex flex-col items-center gap-4">
            <div className="w-px h-16 bg-gradient-to-b from-amber-500 to-transparent" />
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em] animate-pulse">Inhale • Exhale • Sync</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1) translateZ(0); }
          50% { opacity: 0.6; transform: scale(1.1) translateZ(0); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1) translateZ(0); }
          50% { opacity: 0.4; transform: scale(1.2) translateZ(0); }
        }
        @keyframes amber-glow {
          0%, 100% { transform: scale(1) translateZ(0); opacity: 0.4; }
          50% { transform: scale(1.4) translateZ(0); opacity: 0.8; }
        }
        @keyframes amber-breathing {
          0%, 100% { transform: scale(1) translateZ(0); box-shadow: 0 0 100px rgba(245,158,11,0.4); }
          50% { transform: scale(1.15) translateZ(0); box-shadow: 0 0 180px rgba(245,158,11,0.7); }
        }
        @keyframes amber-ring {
          0% { transform: scale(1) rotate(0deg) translateZ(0); opacity: 0.2; }
          100% { transform: scale(1.8) rotate(180deg) translateZ(0); opacity: 0; }
        }
        @keyframes amber-ring-slow {
          0% { transform: scale(1) rotate(0deg) translateZ(0); opacity: 0.1; }
          100% { transform: scale(2.2) rotate(-90deg) translateZ(0); opacity: 0; }
        }
        
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
        .animate-pulse-slower { animation: pulse-slower 12s infinite ease-in-out; }
        .animate-amber-glow { animation: amber-glow 8s infinite ease-in-out; }
        .animate-amber-breathing { animation: amber-breathing 6s infinite ease-in-out; }
        .animate-amber-ring { animation: amber-ring 5s infinite ease-out; }
        .animate-amber-ring-slow { animation: amber-ring-slow 12s infinite ease-out; }
        
        .will-change-transform { will-change: transform; }
        .no-flicker { -webkit-transform: translate3d(0,0,0); }
      `}</style>
    </div>
  );
};
