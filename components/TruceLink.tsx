import React, { useState } from 'react';

export const TruceLink: React.FC = () => {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    // TODO: Generate real invite link
    setLink('https://defrag.app/invite/abc123');
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
  };

  return (
    <div className="bg-black/80 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col gap-4 max-w-md mx-auto mt-8">
      <h2 className="text-white text-xl font-bold">Invite to Conflict Room</h2>
      <div className="text-white/80 text-base">Send this link to your partner or family member so you can resolve a conflict together.</div>
      <button
        className="bg-white text-black font-bold py-3 rounded-xl hover:bg-white/80 transition"
        onClick={handleGenerate}
      >
        Generate Truce Link
      </button>
      {link && (
        <div className="flex items-center gap-2 mt-2">
          <input
            className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-white font-mono"
            value={link}
            readOnly
          />
          <button
            className="px-3 py-2 rounded bg-white/20 text-xs text-white hover:bg-white/40 transition"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
};
