import React, { useEffect, useState } from 'react';

const steps = [
  { label: 'Accessing Natal Chart...', icon: '🪐' },
  { label: 'Analyzing HD Mechanics...', icon: '🧬' },
  { label: 'Mapping Gene Key Shadows...', icon: '🔑' },
  { label: 'Tracing Generational Lineage...', icon: '🌳' },
  { label: 'Pattern Identified.', icon: '✔️' }
];

export const SystemScanProgress: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < steps.length - 1) {
      const timeout = setTimeout(() => setStep(step + 1), 500);
      return () => clearTimeout(timeout);
    } else {
      const done = setTimeout(onComplete, 500);
      return () => clearTimeout(done);
    }
  }, [step, onComplete]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div className="w-80 max-w-full bg-black/80 border border-white/10 rounded-2xl shadow-xl p-6 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{steps[step].icon}</span>
          <span className="text-white text-lg font-semibold tracking-tight">System Scan</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-white/80 transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="text-white/80 text-sm font-mono tracking-wide text-center min-h-[32px]">
          {steps[step].label}
        </div>
      </div>
    </div>
  );
};
