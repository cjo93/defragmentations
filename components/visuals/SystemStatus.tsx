import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { assembleGlobalContext } from '../../services/globalContext';

export const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState({
    blueprint: false,
    echo: false,
    transits: false,
    seda: false,
    lastRefresh: '',
  });

  useEffect(() => {
    const ctx = assembleGlobalContext();
    setStatus({
      blueprint: !!ctx.blueprint,
      echo: !!ctx.echo && ctx.echo.loops.length > 0,
      transits: !!ctx.transits && ctx.transits.aspects.length > 0,
      seda: !!ctx.seda,
      lastRefresh: new Date(ctx.lastRefresh).toLocaleTimeString(),
    });
  }, []);

  const modules = [
    { key: 'blueprint', name: 'The Map', icon: '◉', desc: 'Your 9-center blueprint' },
    { key: 'echo', name: 'The Memory', icon: '◈', desc: 'Pattern detection active' },
    { key: 'transits', name: 'The Weather', icon: '⬡', desc: 'Live transit overlay' },
    { key: 'seda', name: 'Stability', icon: '◇', desc: 'Safety monitoring' },
  ];

  const activeCount = Object.values(status).filter(v => v === true).length;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 block mb-1">System Status</span>
          <span className="text-xs text-neutral-600">Last refresh: {status.lastRefresh}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeCount === 4 ? 'bg-emerald-500' : activeCount > 1 ? 'bg-amber-500' : 'bg-neutral-600'} animate-breathe`} />
          <span className="text-xs font-semibold text-neutral-400">{activeCount}/4 Active</span>
        </div>
      </div>

      <div className="space-y-2">
        {modules.map((mod, i) => {
          const active = status[mod.key as keyof typeof status] === true;
          return (
            <motion.div
              key={mod.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white/[0.01] border border-white/[0.02] opacity-40'}`}
            >
              <span className={`text-lg ${active ? 'text-white' : 'text-neutral-700'}`}>{mod.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{mod.name}</div>
                <div className="text-xs text-neutral-600 truncate">{mod.desc}</div>
              </div>
              {active ? (
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 text-neutral-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </motion.div>
          );
        })}
      </div>

      {activeCount < 4 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div>
              <div className="text-xs font-semibold text-amber-400 mb-0.5">Partial Context</div>
              <div className="text-xs text-amber-500/60">Add more data to enable full unified memory</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
