
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/visuals/Toast';
import { ErrorBoundary } from './components/visuals/ErrorBoundary';
import { AuthGuard } from './components/auth/AuthGuard';
import { MainLayout } from './components/layout/MainLayout';

// Public routes — eagerly loaded
import { Login } from './components/auth/Login';
import { Onboarding } from './components/auth/Onboarding';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ManifestoPage } from './pages/ManifestoPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected routes — lazy loaded for code-splitting
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Manual = lazy(() => import('./components/Manual').then(m => ({ default: m.Manual })));
const Orbit = lazy(() => import('./components/Orbit').then(m => ({ default: m.Orbit })));
const LiveVoice = lazy(() => import('./components/LiveVoice').then(m => ({ default: m.LiveVoice })));
const ImageStudio = lazy(() => import('./components/ImageStudio').then(m => ({ default: m.ImageStudio })));
const VideoLab = lazy(() => import('./components/VideoLab').then(m => ({ default: m.VideoLab })));
const Chatbot = lazy(() => import('./components/Chatbot').then(m => ({ default: m.Chatbot })));
const Transcriber = lazy(() => import('./components/Transcriber').then(m => ({ default: m.Transcriber })));
const SpeechLab = lazy(() => import('./components/SpeechLab').then(m => ({ default: m.SpeechLab })));
const IntelligenceHub = lazy(() => import('./components/IntelligenceHub').then(m => ({ default: m.IntelligenceHub })));
const SafePlace = lazy(() => import('./components/SafePlace').then(m => ({ default: m.SafePlace })));
const Signal = lazy(() => import('./components/Signal').then(m => ({ default: m.Signal })));
const Echo = lazy(() => import('./components/Echo').then(m => ({ default: m.Echo })));

// Suspense fallback
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full bg-transparent gap-4">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border border-white/[0.06] animate-ping" />
      <div className="absolute inset-2 rounded-full bg-white/[0.06] animate-pulse" />
      <div className="absolute inset-[14px] rounded-full bg-white animate-breathe" />
    </div>
    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 animate-pulse">Loading...</span>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/manifesto" element={<ManifestoPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* PROTECTED APP ROUTES */}
            <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
              <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
              <Route path="/manual" element={<Suspense fallback={<LoadingFallback />}><Manual /></Suspense>} />
              <Route path="/orbit" element={<Suspense fallback={<LoadingFallback />}><Orbit /></Suspense>} />
              <Route path="/live" element={<Suspense fallback={<LoadingFallback />}><LiveVoice user="PILLAR_USER" /></Suspense>} />
              <Route path="/image" element={<Suspense fallback={<LoadingFallback />}><ImageStudio /></Suspense>} />
              <Route path="/video" element={<Suspense fallback={<LoadingFallback />}><VideoLab /></Suspense>} />
              <Route path="/chatbot" element={<Suspense fallback={<LoadingFallback />}><Chatbot user="PILLAR_USER" /></Suspense>} />
              <Route path="/transcriber" element={<Suspense fallback={<LoadingFallback />}><Transcriber /></Suspense>} />
              <Route path="/speech" element={<Suspense fallback={<LoadingFallback />}><SpeechLab /></Suspense>} />
              <Route path="/intelligence" element={<Suspense fallback={<LoadingFallback />}><IntelligenceHub /></Suspense>} />
              <Route path="/safe-place" element={<Suspense fallback={<LoadingFallback />}><SafePlace /></Suspense>} />
              <Route path="/signal" element={<Suspense fallback={<LoadingFallback />}><Signal /></Suspense>} />
              <Route path="/echo" element={<Suspense fallback={<LoadingFallback />}><Echo /></Suspense>} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
