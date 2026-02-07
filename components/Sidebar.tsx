
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
    { id: View.MANUAL, label: 'Blueprint', icon: 'M9.663 17h4.673M12 3v1' },
    { id: View.ORBIT, label: 'Dynamics', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: View.LIVE_VOICE, label: 'Insights', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4' },
    { id: View.INTELLIGENCE, label: 'Research', icon: 'M21 21l-6-6' },
    { id: View.IMAGE_STUDIO, label: 'Visuals', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16' },
    { id: View.SAFE_PLACE, label: 'Rest', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364' },
  ];

  return (
    <aside className="w-20 md:w-64 border-r border-[#444746] flex flex-col bg-[#0A0A0A] z-50 transition-all">
      <div className="p-6 md:p-10 text-center md:text-left">
        <h1 className="text-lg font-bold tracking-tight text-white hidden md:block">DEFRAG</h1>
        <div className="w-1.5 h-1.5 rounded-full bg-soul-DEFAULT mx-auto md:mx-0 md:mt-1 opacity-80 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
      </div>
      
      <nav className="flex-1 px-2 md:px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex flex-col md:flex-row items-center gap-2 md:gap-4 px-3 md:px-6 py-4 rounded-lg text-[10px] md:text-xs font-medium transition-all ${
              currentView === item.id
                ? 'bg-[#1E1F20] text-[#E3E3E3] border border-white/5'
                : 'text-[#767779] hover:text-[#E3E3E3]'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="hidden md:inline">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 md:p-8 border-t border-[#444746]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start gap-4 p-3 md:p-4 text-[#767779] hover:text-[#E3E3E3] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4 4H3" /></svg>
          <span className="hidden md:inline text-xs font-medium">Exit</span>
        </button>
      </div>
    </aside>
  );
};
