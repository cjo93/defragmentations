import React, { useState } from 'react';

export const PanicButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-black via-white/10 to-black border-2 border-white/20 flex items-center justify-center animate-pulse shadow-2xl"
        onClick={() => setOpen(true)}
        aria-label="De-escalate Now"
      >
        <span className="text-3xl text-white">🛑</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-2">De-escalate Now</h2>
            <div className="text-white/80 text-base text-center mb-4">Take a breath. Here’s a script to ask for a time out without making things worse:</div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-white font-mono text-base mb-4">“I need a few minutes to calm down so I don’t say something I regret. Let’s talk when I’m ready.”</div>
            <button
              className="px-4 py-2 rounded bg-white/20 text-white hover:bg-white/40 transition"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
