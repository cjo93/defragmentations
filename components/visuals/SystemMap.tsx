
import React from 'react';

// DYNAMIC LINE RENDERER
const ConnectionLine = ({ type, x1, y1, x2, y2 }: any) => {
  // Calculate midpoint for curves if needed, simplified here for Bowen styles

  if (type === 'CONFLICT') {
    // RED ZIG-ZAG (Resistor Style)
    // We create a jagged path between points
    return (
      <path 
        d={`M${x1},${y1} L${x1 + (x2-x1)*0.25},${y1 + (y2-y1)*0.25 + 10} L${x1 + (x2-x1)*0.5},${y1 + (y2-y1)*0.5 - 10} L${x1 + (x2-x1)*0.75},${y1 + (y2-y1)*0.75 + 10} L${x2},${y2}`} 
        fill="none" 
        stroke="#F87171" 
        strokeWidth="2" 
        className="animate-pulse"
      />
    );
  }
  
  if (type === 'FUSION') {
    // AMBER TRIPLE LINE (Enmeshment)
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="6" opacity="0.15" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="2" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="0.5" transform="translate(0, -4)" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="0.5" transform="translate(0, 4)" />
      </g>
    );
  }

  if (type === 'DISTANCE') {
    // GREY DASHED (Cutoff)
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1" strokeDasharray="5,5" />;
  }

  // HEALTHY (Blue Solid)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38BDF8" strokeWidth="1" opacity="0.6" />;
};

const Node = ({ x, y, label, isSelf }: any) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={isSelf ? 25 : 18} fill="#020617" stroke={isSelf ? "#F59E0B" : "#475569"} strokeWidth="2" />
    <text y={isSelf ? 40 : 32} textAnchor="middle" fill="#94A3B8" fontSize="10" className="uppercase tracking-widest font-mono">
      {label}
    </text>
    {isSelf && <circle r="4" fill="#F59E0B" className="animate-ping" opacity="0.5" />}
  </g>
);

export const SystemMap = ({ dynamics = [] }: { dynamics: any[] }) => {
  const centerX = 200;
  const centerY = 150;
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/30 rounded-xl border border-white/5 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute top-4 left-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
        System Topology // Bowen Layer
      </div>
      
      <svg viewBox="0 0 400 300" className="w-full h-full max-w-lg">
        {/* DRAW LINES FIRST (So they are behind nodes) */}
        {dynamics.map((rel, i) => {
          const angle = (i / dynamics.length) * Math.PI * 2 - (Math.PI/2); // Start top
          const x = centerX + Math.cos(angle) * 110;
          const y = centerY + Math.sin(angle) * 110;
          return <ConnectionLine key={`line-${i}`} type={rel.type} x1={centerX} y1={centerY} x2={x} y2={y} />;
        })}

        {/* DRAW NODES */}
        {dynamics.map((rel, i) => {
          const angle = (i / dynamics.length) * Math.PI * 2 - (Math.PI/2);
          const x = centerX + Math.cos(angle) * 110;
          const y = centerY + Math.sin(angle) * 110;
          return <Node key={`node-${i}`} x={x} y={y} label={rel.name} />;
        })}

        {/* SELF NODE */}
        <Node x={centerX} y={centerY} label="YOU" isSelf />
      </svg>
    </div>
  );
};
