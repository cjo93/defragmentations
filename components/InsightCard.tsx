import React from 'react';

interface InsightCardProps {
  status: 'high' | 'medium' | 'low';
  header: string;
  body: string;
  script: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ status, header, body, script }) => {
  const statusColor = status === 'high' ? 'bg-red-500' : status === 'medium' ? 'bg-yellow-400' : 'bg-green-500';
  return (
    <div className="bg-black/80 border border-white/10 rounded-2xl shadow-xl p-6 flex flex-col gap-4 max-w-xl mx-auto">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${statusColor}`} />
        <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">{header}</span>
      </div>
      <div className="text-white text-lg font-bold leading-snug">{body}</div>
      <div className="flex flex-col gap-2">
        <span className="text-white/60 text-xs uppercase tracking-wide">Say this:</span>
        <div className="bg-white/10 border border-white/20 rounded-lg p-3 text-white font-mono text-base flex items-center justify-between">
          <span>{script}</span>
          <button
            className="ml-3 px-2 py-1 rounded bg-white/20 text-xs text-white hover:bg-white/40 transition"
            onClick={() => navigator.clipboard.writeText(script)}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};
