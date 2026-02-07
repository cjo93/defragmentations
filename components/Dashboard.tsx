
import React from 'react';
import { FileText, Users, ArrowRight, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import CinemaLayout from './layout/CinemaLayout';

export const Dashboard: React.FC = () => {
  return (
    <CinemaLayout intensity="low">
      <div className="min-h-full flex flex-col items-center justify-center py-20">
        
        <main className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center">
          
          {/* MANIFESTO / HEADER */}
          <header className="text-center mb-16 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-6">
              We are the hardware store <br/> for the <span className="text-amber-500">human psyche</span>.
            </h1>
            <p className="text-[#94A3B8] text-lg font-light leading-relaxed">
              Defrag is not therapy. It is not spiritual. It is mechanical. <br/>
              We believe that human friction—anger, burnout, confusion—is just <strong>physics</strong>. <br/>
              You are trying to run high-voltage energy through a low-voltage wire. <br/>
              We just show you the wire.
            </p>
          </header>

          {/* CARDS GRID (Floating Glass) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            
            {/* 1. THE MANUAL */}
            <Link 
              to="/manual"
              className="group studio-panel p-10 flex flex-col h-64 justify-between text-left"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:border-amber-500 group-hover:bg-amber-500/20 transition-all duration-500">
                  <FileText className="w-8 h-8 text-amber-500" />
                </div>
                <ArrowRight className="w-6 h-6 text-[#444746] group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <div>
                <h3 className="text-2xl font-medium text-white mb-2 group-hover:text-amber-400 transition-colors">The Manual</h3>
                <p className="text-[#94A3B8] group-hover:text-[#E3E3E3] transition-colors">
                  Generate your operating documentation.
                </p>
                <p className="text-[10px] font-bold text-amber-500 mt-2 tracking-widest">$29.00</p>
              </div>
            </Link>

            {/* 2. ORBIT */}
            <Link 
              to="/orbit"
              className="group studio-panel p-10 flex flex-col h-64 justify-between text-left"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:border-amber-500 group-hover:bg-amber-500/20 transition-all duration-500">
                  <Users className="w-8 h-8 text-amber-500" />
                </div>
                <ArrowRight className="w-6 h-6 text-[#444746] group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <div>
                <h3 className="text-2xl font-medium text-white mb-2 group-hover:text-amber-400 transition-colors">Orbit</h3>
                <p className="text-[#94A3B8] group-hover:text-[#E3E3E3] transition-colors">
                  Relational friction analysis.
                </p>
                <p className="text-[10px] font-bold text-amber-500 mt-2 tracking-widest">$19.00</p>
              </div>
            </Link>

            {/* 3. LIVE VOICE */}
            <Link 
              to="/live"
              className="group studio-panel p-10 flex flex-col h-64 justify-between text-left md:col-span-2"
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 group-hover:border-amber-500 group-hover:bg-amber-500/20 transition-all duration-500">
                  <Mic className="w-8 h-8 text-amber-500" />
                </div>
                <ArrowRight className="w-6 h-6 text-[#444746] group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <div>
                <h3 className="text-2xl font-medium text-white mb-2 group-hover:text-amber-400 transition-colors">Live Voice</h3>
                <p className="text-[#94A3B8] group-hover:text-[#E3E3E3] transition-colors">
                  Real-time logic processing and audio stream.
                </p>
                <p className="text-[10px] font-bold text-amber-500 mt-2 tracking-widest">ACCESS GRANTED</p>
              </div>
            </Link>

          </div>
          
        </main>
      </div>
    </CinemaLayout>
  );
};
