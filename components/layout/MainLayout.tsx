
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { View } from '../../types';
import { LivingBackground } from '../visuals/LivingBackground';

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
      default: navigate('/dashboard'); break;
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-slate-200 font-sans overflow-hidden">
      <LivingBackground mode="calm" />
      
      {/* Sidebar is fixed on left */}
      <div className="relative z-50 h-full border-r border-white/5 bg-black">
        <Sidebar 
          currentView={getCurrentView()} 
          onNavigate={handleNavigate} 
          user="PILLAR_USER"
          onLogout={() => navigate('/')}
        />
      </div>

      {/* Content Area */}
      <main className="flex-1 relative z-10 overflow-y-auto h-screen w-full">
        <Outlet /> 
      </main>
    </div>
  );
};
