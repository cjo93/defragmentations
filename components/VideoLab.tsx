import React from 'react';

export const VideoLab: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tighter">Video Lab</h2>
        <p className="text-neutral-500">Motion synthesis from static frames.</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-lg w-full text-center space-y-8 p-12">
          <div className="w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">Coming Soon</h3>
            <p className="text-sm text-[#A3A3A3] leading-relaxed max-w-sm mx-auto">
              Video generation is being calibrated for the next architecture release.
              Image synthesis, voice, and all analytical modules are fully operational.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-neutral-300 shadow-[0_0_8px_rgba(226,226,232,0.5)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-300/60">Status</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The Architect is migrating to open-source inference. Video synthesis requires compute resources
              not yet available on the free tier. This module will activate when the infrastructure is ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
