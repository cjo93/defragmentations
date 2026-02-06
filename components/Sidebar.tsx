
import React from 'react';
import { View, UserProfile } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: UserProfile;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Hub', icon: 'M4 6h16M4 12h16' },
    { id: View.LIVE_VOICE, label: 'Orb', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4' },
    { id: View.CHATBOT, label: 'Logic', icon: 'M9.663 17h4.673M12 3v1' },
    { id: View.IMAGE_STUDIO, label: 'Asset', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16' },
    { id: View.INTELLIGENCE, label: 'Intel', icon: 'M21 21l-6-6' },
    { id: View.SAFE_PLACE, label: 'SEDA', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364' },
  ];

  return (
    <aside className="w-20 md:w-64 border-r border-white/5 flex flex-col bg-neutral-950/80 backdrop-blur-3xl z-50 transition-all">
      <div className="p-6 md:p-10 text-center md:text-left">
        <h1 className="text-lg font-black italic tracking-tighter hidden md:block">DEFRAG</h1>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mx-auto md:mx-0 md:mt-1" />
      </div>
      
      <nav className="flex-1 px-2 md:px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex flex-col md:flex-row items-center gap-2 md:gap-4 px-3 md:px-6 py-4 rounded-2xl text-[8px] md:text-[10px] font-black tracking-widest uppercase transition-all ${
              currentView === item.id
                ? 'bg-white text-black shadow-lg'
                : 'text-neutral-500 hover:text-neutral-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
            </svg>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 md:p-8 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start gap-4 p-3 md:p-4 text-neutral-700 hover:text-red-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4 4H3" /></svg>
          <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Exit</span>
        </button>
      </div>
    </aside>
  );
};
