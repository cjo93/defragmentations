
import React from 'react';

const AmbientBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0A0A0A]">
      {/* 1. The Dark Base */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />

      {/* 2. The Idle Light (Soft Blue Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
        <div className="w-full h-full rounded-full bg-blue-500/5 blur-[100px] opacity-50" />
      </div>

      {/* 3. The Grid (Subtle graph paper) */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(#E3E3E3 1px, transparent 1px),
            linear-gradient(90deg, #E3E3E3 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* 4. Vignette (Darken corners) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A0A0A_100%)]" />
    </div>
  );
};

export default AmbientBackground;
