
import React from 'react';
import { View, UserProfile } from '../types';

interface DashboardProps {
  onNavigate: (view: View) => void;
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  const tools = [
    { id: View.LIVE_VOICE, title: 'Live Defrag', desc: 'Real-time truth for your interactions.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: View.CHATBOT, title: 'Deep Logic', desc: 'Detailed analysis of complex behavior.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636' },
    { id: View.IMAGE_STUDIO, title: 'Asset Forge', desc: 'Visualize the manual with precise images.', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16' },
    { id: View.VIDEO_LAB, title: 'Motion Lab', desc: 'Simulate motion and patterns in 4K.', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764' },
    { id: View.INTELLIGENCE, title: 'Intel', desc: 'Research grounded in global facts.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0' },
    { id: View.SAFE_PLACE, title: 'Safe Place', desc: 'The override for your nervous system.', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364' },
  ];

  return (
    <div className="p-6 md:p-20 max-w-7xl mx-auto space-y-16">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-neutral-500 tracking-widest uppercase">
          Online • {user}
        </div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">
          THE HUB.
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {tools.map(tool => (
          <button 
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className="group p-10 bg-neutral-900/30 border border-white/5 rounded-[40px] hover:border-white/20 hover:bg-neutral-900 transition-all text-left flex flex-col justify-between h-[320px] md:h-[380px]"
          >
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={tool.icon} />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">{tool.title}</h3>
                <p className="text-sm text-neutral-500 font-medium leading-snug">{tool.desc}</p>
              </div>
            </div>
            
            <div className="text-[9px] font-black text-neutral-700 uppercase tracking-widest group-hover:text-white transition-colors">
               Initialize Module
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
