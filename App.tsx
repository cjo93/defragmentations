
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { DEFRAG_MANIFEST } from './constants/manifest';
import { LivingBackground } from './components/visuals/LivingBackground';

const Landing = () => (
  <div className="min-h-screen bg-black text-white relative font-sans overflow-hidden">
    <LivingBackground mode="idle" />
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-6xl font-bold mb-6 tracking-tighter">{DEFRAG_MANIFEST.BRAND.NAME}</h1>
      <p className="text-xl text-slate-400 mb-8 max-w-2xl">{DEFRAG_MANIFEST.LANDING.HERO_SUB}</p>
      <a href="/dashboard" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-amber-400 transition transform hover:-translate-y-1">
        {DEFRAG_MANIFEST.LANDING.CTA_PRIMARY}
      </a>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
