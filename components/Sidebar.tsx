
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, UserProfile } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  user: UserProfile;
  onLogout: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: View.DASHBOARD, label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { id: View.CHATBOT, label: 'The Forge', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: View.MANUAL, label: 'Blueprint', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: View.ORBIT, label: 'Orbit', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

const TOOLS_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: View.SIGNAL, label: 'Signal', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: View.ECHO, label: 'Echo', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { id: View.SAFE_PLACE, label: 'Ground', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

const NavItem: React.FC<{ item: typeof NAV_ITEMS[0]; active: boolean; onClick: (view: View) => void; index: number }> = ({ item, active, onClick, index }) => (
  <motion.button
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.05 * index + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    onClick={() => onClick(item.id)}
    aria-label={item.label}
    aria-current={active ? 'page' : undefined}
    className="group relative flex items-center justify-center w-12 h-12 md:w-full md:h-auto md:justify-start md:px-5 md:py-3.5 mb-1 rounded-xl transition-all"
    whileHover={{ x: 2 }}
    whileTap={{ scale: 0.97 }}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-white/[0.06] rounded-xl border border-white/[0.08] shadow-[0_0_24px_-6px_rgba(226,226,232,0.08)]"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}

    <svg
      className={`w-[18px] h-[18px] relative z-10 transition-colors duration-300 shrink-0 ${active ? 'text-[#E2E2E8]' : 'text-white/30 group-hover:text-white/70'}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
    </svg>

    <span className={`hidden md:block ml-3 text-[13px] font-medium relative z-10 transition-colors duration-300 ${active ? 'text-white' : 'text-white/30 group-hover:text-white/70'}`}>
      {item.label}
    </span>

    <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </motion.button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  const [toolsOpen, setToolsOpen] = useState(() => TOOLS_ITEMS.some(t => t.id === currentView));

  return (
    <aside className="w-20 md:w-60 h-full flex flex-col items-center md:items-stretch py-6 px-2 md:px-3 border-r border-white/[0.04] bg-[#050505]/80 backdrop-blur-2xl transition-all">

      {/* Brand Mark */}
      <div className="mb-8 px-2 flex justify-center md:justify-start md:px-5">
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
            <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
            <circle cx="10" cy="10" r="2.5" fill="white" opacity="0.9" />
            <circle cx="10" cy="2.5" r="1" fill="white" opacity="0.4" />
            <circle cx="16.5" cy="6.5" r="1" fill="white" opacity="0.3" />
            <circle cx="16.5" cy="13.5" r="1" fill="white" opacity="0.25" />
            <circle cx="10" cy="17.5" r="1" fill="white" opacity="0.35" />
            <circle cx="3.5" cy="13.5" r="1" fill="white" opacity="0.3" />
            <circle cx="3.5" cy="6.5" r="1" fill="white" opacity="0.4" />
          </svg>
          <span className="hidden md:block text-[13px] font-bold tracking-[-0.01em] text-white">DEFRAG</span>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 w-full space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item, i) => (
          <NavItem key={item.id} item={item} active={currentView === item.id} onClick={onNavigate} index={i} />
        ))}

        {/* Tools Section — collapsible */}
        <div className="pt-3 mt-3 border-t border-white/[0.04]">
          <button
            onClick={() => setToolsOpen(!toolsOpen)}
            className="group w-full flex items-center justify-center md:justify-between md:px-5 py-2.5 mb-1 rounded-xl hover:bg-white/[0.03] transition-all"
          >
            <div className="flex items-center gap-3">
              <svg className={`w-[18px] h-[18px] shrink-0 transition-colors duration-300 ${toolsOpen || TOOLS_ITEMS.some(t => t.id === currentView) ? 'text-white/50' : 'text-white/20 group-hover:text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className={`hidden md:block text-[13px] font-medium transition-colors duration-300 ${toolsOpen || TOOLS_ITEMS.some(t => t.id === currentView) ? 'text-white/50' : 'text-white/20 group-hover:text-white/40'}`}>Tools</span>
            </div>
            <motion.svg
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="hidden md:block text-white/20"
              animate={{ rotate: toolsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {toolsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden space-y-0.5"
              >
                {TOOLS_ITEMS.map((item, i) => (
                  <NavItem key={item.id} item={item} active={currentView === item.id} onClick={onNavigate} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Exit */}
      <div className="mt-auto pt-4 border-t border-white/[0.04] w-full px-1">
        <button
          onClick={onLogout}
          aria-label="Sign out"
          className="group w-full flex items-center justify-center md:justify-start md:px-5 py-3 rounded-xl text-white/20 hover:text-white/50 transition-colors"
        >
          <svg className="w-[18px] h-[18px] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden md:block ml-3 text-[13px] font-medium">Exit</span>
        </button>
      </div>
    </aside>
  );
};
