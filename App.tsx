
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveVoice } from './components/LiveVoice';
import { ImageStudio } from './components/ImageStudio';
import { VideoLab } from './components/VideoLab';
import { IntelligenceHub } from './components/IntelligenceHub';
import { Chatbot } from './components/Chatbot';
import { Transcriber } from './components/Transcriber';
import { SpeechLab } from './components/SpeechLab';
import { SafePlace } from './components/SafePlace';
import { View, UserProfile } from './types';

const LandingPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center selection:bg-white selection:text-black overflow-x-hidden scroll-smooth pb-20">
      {/* Cinematic Background Gradients */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.01)_0%,_transparent_100%)] pointer-events-none" />
      <div className="fixed top-[-5%] left-[-5%] w-[50%] h-[50%] bg-white/[0.01] blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
      
      {/* Persistent Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] ios-glass border-b border-white/5 safe-top px-6 py-4 md:px-12 md:py-6 flex justify-between items-center backdrop-blur-3xl">
        <div className="flex items-center gap-3">
          <div className="text-xl md:text-2xl font-black italic tracking-tighter">DEFRAG</div>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hidden md:block">Architecture v1.1</div>
        </div>
        
        <button 
          onClick={onEnter}
          className="group relative flex items-center gap-3 bg-white/5 border border-white/10 pl-5 pr-2 py-2 rounded-full hover:bg-white hover:border-white transition-all duration-500 active:scale-95 shadow-lg shadow-white/0 hover:shadow-white/5"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-black transition-colors">Initialize</span>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
        </button>
      </nav>

      {/* Hero Section - Dominant Typography */}
      <section className="relative z-10 w-full max-w-7xl px-6 pt-36 pb-24 text-left md:pt-64 md:pb-48">
        <div className="mb-20 md:mb-32">
          {/* Main Headline: Highest Dominance */}
          <h1 className="text-[17vw] md:text-[16rem] font-black tracking-tighter text-white uppercase italic leading-[0.65] mb-8 will-change-transform">
            RELATIONSHIPS <br className="hidden md:block"/> ARE LOGIC.
          </h1>
          
          {/* Subtext Block: Clearly defined hierarchy */}
          <div className="mt-12 ml-4 md:ml-20 border-l-4 md:border-l-[12px] border-white/10 pl-8 md:pl-20 py-4 md:py-8 space-y-4 md:space-y-6">
            <div className="text-[10vw] md:text-[8rem] font-black text-white uppercase tracking-tighter italic leading-none">
              DEFRAG.
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-[4.5vw] md:text-5xl font-black text-white/40 uppercase tracking-[0.15em] italic leading-tight">
                The User Manual.
              </div>
              <div className="text-[4vw] md:text-4xl font-black text-white/20 uppercase tracking-[0.15em] italic leading-tight">
                For You and Your People.
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl space-y-16 pl-2">
          <div className="space-y-4">
             <p className="text-4xl md:text-7xl font-medium text-white tracking-tighter leading-[0.85] italic">
               Understand people. <br />
               Stop guessing.
             </p>
          </div>
          
          <div className="space-y-8 pl-6 md:pl-12 border-l-2 border-white/10">
            <p className="text-2xl md:text-4xl text-neutral-400 leading-tight font-medium tracking-tight">
              Behavior isn't random. 
            </p>
            <p className="text-2xl md:text-4xl text-neutral-400 leading-tight font-medium tracking-tight">
              Emotions aren't bugs. 
            </p>
            <p className="text-2xl md:text-4xl text-white leading-relaxed font-bold tracking-tight">
              The interaction code is waiting to be read. 
            </p>
          </div>
        </div>

        <div className="mt-32 md:mt-48 flex flex-col items-start gap-12 pl-2">
          <button 
            onClick={onEnter}
            className="group relative inline-flex items-center gap-10 px-16 py-10 md:px-24 md:py-12 bg-white text-black font-black rounded-full text-base tracking-[0.5em] uppercase transition-all hover:scale-110 active:scale-95 shadow-[0_30px_100px_rgba(255,255,255,0.1)]"
          >
            ENTER SYSTEM
            <svg className="w-6 h-6 transition-transform group-hover:translate-x-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 12h14" />
            </svg>
          </button>
          <div className="flex items-center gap-5 pl-8 opacity-40">
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
             <div className="text-[10px] text-white font-bold uppercase tracking-[0.8em]">KERNEL_ONLINE // v1.1.0</div>
          </div>
        </div>
      </section>

      {/* Feature Section - The Orb & Cards */}
      <section className="relative z-10 w-full max-w-7xl px-6 py-32 space-y-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
          <div className="bg-neutral-900 border border-white/5 rounded-[64px] p-12 md:p-20 space-y-12 flex flex-col justify-between h-[600px] md:h-[800px] group overflow-hidden">
            <div className="space-y-8">
              <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.6em]">INTERFACE 01</span>
              <h3 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white leading-none">THE ORB.</h3>
              <p className="text-xl md:text-2xl text-neutral-500 font-medium">Instant truth for your connections. Direct, Splenic logic for every interaction.</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
               <div className="w-56 h-56 md:w-72 md:h-72 bg-white rounded-full shadow-[0_0_150px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-1000 animate-orb-breathing" />
            </div>
          </div>

          <div className="bg-white rounded-[64px] p-12 md:p-20 space-y-12 flex flex-col justify-between h-[600px] md:h-[800px] text-black group overflow-hidden shadow-2xl">
            <div className="space-y-8">
              <span className="text-[12px] font-black text-black/20 uppercase tracking-[0.6em]">INTERFACE 02</span>
              <h3 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">CARDS.</h3>
              <p className="text-xl md:text-2xl text-neutral-600 font-medium">Read the hidden code. We provide the manual entries for the humans you love.</p>
            </div>
            <div className="space-y-6 pt-10">
               <div className="p-8 md:p-10 bg-neutral-50 rounded-[40px] border border-neutral-100 transform -rotate-2 group-hover:rotate-0 transition-all duration-700">
                  <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">PROTOCOL: DEFENSE</div>
                  <p className="text-2xl md:text-3xl font-black italic leading-tight">"Withdrawal is not rejection. It is a system hibernation sequence."</p>
               </div>
               <div className="p-8 md:p-10 bg-black text-white rounded-[40px] transform rotate(3deg) group-hover:rotate-0 transition-all duration-700 shadow-xl">
                  <div className="text-[10px] font-black text-neutral-700 uppercase tracking-widest mb-4">INSTRUCTION: SYNC</div>
                  <p className="text-2xl md:text-3xl font-black leading-tight">"Lower the firewall with validation. It is the master key."</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEDA SAFE PLACE */}
      <section className="relative z-10 w-full py-56 bg-neutral-950 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.08)_0%,_transparent_60%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center text-center space-y-16">
           <div className="space-y-6">
             <h2 className="text-amber-500 text-[12px] font-black uppercase tracking-[1em]">SYSTEM_STABILIZATION</h2>
             <h3 className="text-7xl md:text-[12rem] font-black italic text-white uppercase tracking-tighter leading-none">SAFE PLACE</h3>
           </div>
           
           <div className="relative h-64 w-full flex items-center justify-center">
              <div className="absolute w-40 h-40 bg-amber-500/10 rounded-full blur-[100px] animate-amber-glow" />
              <div className="w-48 h-48 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-[0_0_120px_rgba(245,158,11,0.5)] animate-amber-breathing" />
           </div>

           <div className="max-w-2xl space-y-8">
             <p className="text-3xl md:text-5xl text-neutral-400 font-medium tracking-tight italic">Analysis is heavy.</p>
             <p className="text-xl text-neutral-500 leading-relaxed font-medium">Warm amber stabilization for the human operating system. No logic logs. Just the breath required to stay online.</p>
           </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="relative z-10 w-full max-w-7xl px-6 py-40">
        <div className="mb-24 space-y-8">
          <h2 className="text-8xl md:text-[15rem] font-black italic uppercase tracking-tighter text-white leading-none">ACCESS.</h2>
          <p className="text-neutral-500 text-3xl font-medium tracking-tight pl-6 italic">The kernel is open.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { tier: "FREE", price: "$0", features: ["Manual Access", "Logic Inversion", "Safe Place"], cta: "INITIALIZE", dark: true },
            { tier: "CORE", price: "$11/mo", features: ["The Voice Orb", "Partner Sync", "Kernel Logs", "Priority Compute"], cta: "UPGRADE", dark: false, best: true },
            { tier: "PRO", price: "$44/mo", features: ["Architecture API", "Multi-User Sync", "Motion Synthesis", "24/7 Intel"], cta: "GO PRO", dark: true }
          ].map((item, idx) => (
            <div key={idx} className={`p-16 rounded-[72px] border flex flex-col justify-between space-y-12 transition-all ${
              item.dark ? 'bg-neutral-900 border-white/5 hover:border-white/10' : 'bg-white border-neutral-200 text-black shadow-2xl'
            } ${item.best ? 'md:scale-105 relative z-20' : ''}`}>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                   <h4 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{item.tier}</h4>
                   {item.best && <span className="bg-black text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">STABLE</span>}
                </div>
                <p className={`text-base font-black uppercase tracking-[0.4em] ${item.dark ? 'text-neutral-500' : 'text-neutral-400'}`}>{item.price}</p>
                <ul className="space-y-6 pt-10">
                  {item.features.map((f, i) => (
                    <li key={i} className={`text-lg font-bold flex gap-4 ${item.dark ? 'text-neutral-400' : 'text-neutral-800'}`}>
                      <span className={item.dark ? 'text-white/20' : 'text-neutral-300'}>//</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={onEnter} 
                className={`w-full py-10 rounded-[40px] text-xs font-black tracking-[0.5em] uppercase transition-all active:scale-95 ${
                  item.dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:opacity-90'
                }`}
              >
                {item.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 w-full max-w-7xl px-6 pt-32 pb-40 text-left safe-bottom">
         <div className="space-y-24">
            <h2 className="text-8xl md:text-[18rem] font-black italic uppercase tracking-tighter text-white leading-[0.65]">
              ENOUGH <br /> CONFUSION.
            </h2>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-16">
               <button 
                onClick={onEnter}
                className="group flex items-center gap-10 bg-white px-24 py-12 rounded-full hover:scale-110 transition-all duration-700"
               >
                 <span className="text-black text-xl font-black uppercase tracking-[0.6em]">OPEN MANUAL</span>
                 <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                 </div>
               </button>
               
               <div className="space-y-8 flex-1">
                 <div className="flex flex-wrap gap-12 text-[12px] font-black text-neutral-500 uppercase tracking-[0.8em]">
                    <a href="#" className="hover:text-white transition-colors">Manifesto</a>
                    <a href="#" className="hover:text-white transition-colors">Protocol</a>
                    <a href="#" className="hover:text-white transition-colors">Sovereignty</a>
                 </div>
                 <p className="text-[12px] text-neutral-800 font-bold uppercase tracking-[0.6em]">© 2025 DEFRAG ARCHITECTURE • BUILT FOR HUMANITY</p>
               </div>
            </div>
         </div>
      </footer>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes orb-breathing {
          0%, 100% { transform: scale(1); box-shadow: 0 0 100px rgba(255,255,255,0.1); }
          50% { transform: scale(1.08); box-shadow: 0 0 200px rgba(255,255,255,0.25); }
        }
        @keyframes amber-glow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 0.8; }
        }
        @keyframes amber-breathing {
          0%, 100% { transform: scale(1); box-shadow: 0 0 100px rgba(245,158,11,0.4); }
          50% { transform: scale(1.2); box-shadow: 0 0 180px rgba(245,158,11,0.7); }
        }
        .animate-orb-breathing { animation: orb-breathing 8s infinite ease-in-out; }
        .animate-amber-glow { animation: amber-glow 10s infinite ease-in-out; }
        .animate-amber-breathing { animation: amber-breathing 7s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse-slow 12s infinite ease-in-out; }
        .will-change-transform { will-change: transform; }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user] = useState<UserProfile>('PILLAR_USER');

  useEffect(() => {
    const savedInit = localStorage.getItem('defrag_initialized');
    if (savedInit === 'true') setIsInitialized(true);
  }, []);

  const handleEnter = () => {
    setIsInitialized(true);
    localStorage.setItem('defrag_initialized', 'true');
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setIsInitialized(false);
    localStorage.removeItem('defrag_initialized');
    setCurrentView(View.DASHBOARD);
  };

  if (!isInitialized) {
    return <LandingPage onEnter={handleEnter} />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden fixed inset-0">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={user} 
        onLogout={handleReset} 
      />
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col bg-neutral-950/20 safe-bottom">
        {(() => {
          switch (currentView) {
            case View.DASHBOARD: return <Dashboard onNavigate={setCurrentView} user={user} />;
            case View.LIVE_VOICE: return <LiveVoice user={user} />;
            case View.IMAGE_STUDIO: return <ImageStudio />;
            case View.VIDEO_LAB: return <VideoLab />;
            case View.CHATBOT: return <Chatbot user={user} />;
            case View.TRANSCRIBER: return <Transcriber />;
            case View.SPEECH_LAB: return <SpeechLab />;
            case View.INTELLIGENCE: return <IntelligenceHub />;
            case View.SAFE_PLACE: return <SafePlace />;
            default: return <Dashboard onNavigate={setCurrentView} user={user} />;
          }
        })()}
      </main>
    </div>
  );
};

export default App;
