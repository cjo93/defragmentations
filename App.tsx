
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DEFRAG_MANIFEST } from './constants/manifest';
import { LivingBackground } from './components/visuals/LivingBackground';
import { MainLayout } from './components/layout/MainLayout';
import { ToastProvider } from './components/visuals/Toast';

// Import Feature Components
import { Dashboard } from './components/Dashboard';
import { Manual } from './components/Manual';
import { Orbit } from './components/Orbit';
import { LiveVoice } from './components/LiveVoice';
import { ImageStudio } from './components/ImageStudio';
import { VideoLab } from './components/VideoLab';
import { Chatbot } from './components/Chatbot';
import { Transcriber } from './components/Transcriber';
import { SpeechLab } from './components/SpeechLab';
import { IntelligenceHub } from './components/IntelligenceHub';
import { SafePlace } from './components/SafePlace';
import { Signal } from './components/Signal';
import { Echo } from './components/Echo';
import { Login } from './components/auth/Login';
import { Onboarding } from './components/auth/Onboarding';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ManifestoPage } from './pages/ManifestoPage';

const App = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/manifesto" element={<ManifestoPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* PROTECTED APP ROUTES */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manual" element={<Manual />} />
          <Route path="/orbit" element={<Orbit />} />
          <Route path="/live" element={<LiveVoice user="PILLAR_USER" />} />
          <Route path="/image" element={<ImageStudio />} />
          <Route path="/video" element={<VideoLab />} />
          <Route path="/chatbot" element={<Chatbot user="PILLAR_USER" />} />
          <Route path="/transcriber" element={<Transcriber />} />
          <Route path="/speech" element={<SpeechLab />} />
          <Route path="/intelligence" element={<IntelligenceHub />} />
          <Route path="/safe-place" element={<SafePlace />} />
          <Route path="/signal" element={<Signal />} />
          <Route path="/echo" element={<Echo />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;
