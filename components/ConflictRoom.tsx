import React, { useState, useEffect } from 'react';
import { SystemScanProgress } from './SystemScanProgress';
import { InsightCard } from './InsightCard';
import { generateResolution } from '../services/Resolver';

export const ConflictRoom: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showScan, setShowScan] = useState(false);
  const [pendingScan, setPendingScan] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowScan(true);
    setLoading(true);
    setResult(null);
    setPendingScan(true);
  };

  useEffect(() => {
    let isMounted = true;
    if (pendingScan) {
      const timeout = setTimeout(async () => {
        // TODO: Replace with real user/family/context
        const dummyProfile = { tags: ['needs_solitude'] };
        const dummyFamily = { tags: ['critical'] };
        const dummyContext = { conflict: input };
        const res = await generateResolution(dummyProfile, dummyFamily, dummyContext);
        if (isMounted) {
          setResult(res);
          setShowScan(false);
          setLoading(false);
          setPendingScan(false);
        }
      }, 2500);
      return () => {
        isMounted = false;
        clearTimeout(timeout);
      };
    }
  }, [pendingScan, input]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-4 p-8">
        <label className="text-white text-lg font-semibold">Describe your conflict:</label>
        <textarea
          className="bg-black/80 border border-white/10 rounded-xl p-4 text-white min-h-[80px]"
          value={input}
          onChange={e => setInput(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-white text-black font-bold py-3 rounded-xl hover:bg-white/80 transition"
          disabled={loading || !input.trim()}
        >
          Resolve
        </button>
      </form>
      {showScan && <SystemScanProgress onComplete={() => {}} />}
      {result && (
        <div className="mt-8">
          <InsightCard
            status="high"
            header="Pattern Identified"
            body={result.root_cause}
            script={result.resolution_script}
          />
        </div>
      )}
    </div>
  );
};
