
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '../Sidebar';
import { BottomBar } from '../BottomBar';
import { View } from '../../types';
import LivingBackground from '../visuals/LivingBackground';

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentView = (): View => {
    const path = location.pathname;
    if (path.includes('manual')) return View.MANUAL;
    if (path.includes('orbit')) return View.ORBIT;
    if (path.includes('live')) return View.LIVE_VOICE;
    if (path.includes('image')) return View.IMAGE_STUDIO;
    if (path.includes('video')) return View.VIDEO_LAB;
    if (path.includes('chatbot')) return View.CHATBOT;
    if (path.includes('transcriber')) return View.TRANSCRIBER;
    if (path.includes('speech')) return View.SPEECH_LAB;
    if (path.includes('intelligence')) return View.INTELLIGENCE;
    if (path.includes('safe-place')) return View.SAFE_PLACE;
    if (path.includes('signal')) return View.SIGNAL;
    if (path.includes('echo')) return View.ECHO;
    return View.DASHBOARD;
  };

  const handleNavigate = (view: View) => {
    switch (view) {
      case View.DASHBOARD: navigate('/dashboard'); break;
      case View.MANUAL: navigate('/manual'); break;
      case View.ORBIT: navigate('/orbit'); break;
      case View.LIVE_VOICE: navigate('/live'); break;
      case View.IMAGE_STUDIO: navigate('/image'); break;
      case View.VIDEO_LAB: navigate('/video'); break;
      case View.CHATBOT: navigate('/chatbot'); break;
      case View.TRANSCRIBER: navigate('/transcriber'); break;
      case View.SPEECH_LAB: navigate('/speech'); break;
      case View.INTELLIGENCE: navigate('/intelligence'); break;
      case View.SAFE_PLACE: navigate('/safe-place'); break;
      case View.SIGNAL: navigate('/signal'); break;
      case View.ECHO: navigate('/echo'); break;
      default: navigate('/dashboard'); break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('defrag_auth_token');
    navigate('/');
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#050505] text-white overflow-hidden font-sans selection:bg-[#E2E2E8]/20">
      {/* Persistent Ambient World */}
      <LivingBackground mode="calm" />

      {/* Sidebar — desktop only */}
      <div className="relative z-50 h-full flex-shrink-0 hidden md:flex">
        <Sidebar
          currentView={getCurrentView()}
          onNavigate={handleNavigate}
          user="PILLAR_USER"
          onLogout={handleLogout}
        />
      </div>

      {/* Content Area — scrollable with page transition */}
      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden scroll-smooth pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Bar — mobile only */}
      <BottomBar
        currentView={getCurrentView()}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </div>
  );
};
