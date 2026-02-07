
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFRAG_MANIFEST } from '../constants/manifest';
import { processBirthData } from '../services/engine';
import { SystemMap } from './visuals/SystemMap';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Load Demo Data immediately so preview isn't blank
    const demo = processBirthData("1993-07-26", "20:00");
    setUserData(demo);
  }, []);

  if (!userData) return <div className="bg-transparent text-white p-10 font-mono text-xs">INITIALIZING KERNEL...</div>;

  return (
    <div className="relative text-slate-200 font-sans overflow-hidden h-full">
      
      {/* HEADER */}
      <header className="relative z-10 flex justify-between items-center p-6 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="font-bold text-lg tracking-tight">{DEFRAG_MANIFEST.BRAND.NAME}</div>
        <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono uppercase">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          System Stable
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT: SYSTEM MAP (The Visuals) */}
        <div className="md:col-span-5 space-y-6">
          <div className="h-[350px] bg-black/40 border border-white/10 rounded-2xl p-2 shadow-2xl relative backdrop-blur-sm">
            <SystemMap dynamics={userData.relationalDynamics} />
          </div>
          
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-md">
             <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">Operating Specs</h3>
             <div className="space-y-3 text-sm">
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-slate-500">Type</span>
                 <span className="font-mono">{userData.type}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-slate-500">Strategy</span>
                 <span className="font-mono">{userData.strategy}</span>
               </div>
               <div className="flex justify-between border-b border-white/5 pb-2">
                 <span className="text-slate-500">Authority</span>
                 <span className="font-mono">{userData.authority}</span>
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT: CHAT (Placeholder) */}
        <div className="md:col-span-7 h-[600px] bg-slate-900/20 border border-white/10 rounded-2xl flex items-center justify-center text-slate-500 backdrop-blur-sm">
           <div className="text-center">
             <div className="w-16 h-16 border-2 border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <div className="w-2 h-2 bg-white/20 rounded-full"></div>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest">[INTELLIGENCE HUB READY]</p>
           </div>
        </div>

      </main>
    </div>
  );
};
