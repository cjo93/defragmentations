
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View } from '../types';

interface BottomBarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

/* ─── Primary tabs (always visible) ─────────────────────────── */
const PRIMARY_TABS: { id: View; label: string; icon: string }[] = [
  { id: View.DASHBOARD, label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { id: View.CHATBOT, label: 'The Forge', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { id: View.MANUAL, label: 'Blueprint', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: View.ORBIT, label: 'Orbit', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

/* ─── Tools overflow ─────────────────────────────────────────── */
const MORE_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: View.SIGNAL, label: 'Signal', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: View.ECHO, label: 'Echo', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { id: View.SAFE_PLACE, label: 'Ground', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

const MORE_ICON = 'M4 6h16M4 12h16M4 18h16';

export const BottomBar: React.FC<BottomBarProps> = ({ currentView, onNavigate, onLogout }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const isMoreActive = MORE_ITEMS.some(m => m.id === currentView);

  return (
    <>
      {/* Overflow tray */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMoreOpen(false)}
            />
            {/* Tray */}
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 left-0 right-0 z-[95] bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/[0.06] rounded-t-3xl px-6 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:hidden"
            >
              <div className="w-10 h-1 rounded-full bg-white/[0.1] mx-auto mb-5" />
              <div className="grid grid-cols-3 gap-3">
                {MORE_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { onNavigate(item.id); setMoreOpen(false); }}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${currentView === item.id ? 'bg-white/[0.08] border border-white/[0.1]' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'}`}
                  >
                    <svg className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <span className={`text-[10px] font-medium ${currentView === item.id ? 'text-white' : 'text-neutral-500'}`}>{item.label}</span>
                  </button>
                ))}
              </div>
              {/* Sign out */}
              <button
                onClick={() => { onLogout(); setMoreOpen(false); }}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/[0.04] text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.02] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs font-medium">Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-[80] md:hidden" aria-label="Main navigation">
        <div className="bg-[#050505]/90 backdrop-blur-2xl border-t border-white/[0.04]">
          <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            {PRIMARY_TABS.map((tab) => {
              const active = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { onNavigate(tab.id); setMoreOpen(false); }}
                  className="relative flex flex-col items-center gap-1 min-w-[56px] py-1.5 transition-all active:scale-95"
                  aria-label={tab.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.div
                      layoutId="bottomTabActive"
                      className="absolute -top-2 w-5 h-0.5 rounded-full bg-white/60"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <svg
                    className={`w-[22px] h-[22px] transition-colors duration-200 ${active ? 'text-white' : 'text-white/25'}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                  </svg>
                  <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-200 ${active ? 'text-white/90' : 'text-white/20'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}

            {/* More button */}
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="relative flex flex-col items-center gap-1 min-w-[56px] py-1.5 transition-all active:scale-95"
              aria-label="Tools"
            >
              {isMoreActive && (
                <motion.div
                  layoutId="bottomTabActive"
                  className="absolute -top-2 w-5 h-0.5 rounded-full bg-white/60"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <svg
                className={`w-[22px] h-[22px] transition-colors duration-200 ${isMoreActive || moreOpen ? 'text-white' : 'text-white/25'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={MORE_ICON} />
              </svg>
              <span className={`text-[9px] font-semibold tracking-wide transition-colors duration-200 ${isMoreActive || moreOpen ? 'text-white/90' : 'text-white/20'}`}>
                Tools
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
