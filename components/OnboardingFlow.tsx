import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const OnboardingFlow: React.FC = () => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save user profile to backend
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-black/80 border border-white/10 rounded-2xl shadow-xl p-8 flex flex-col gap-6 w-full max-w-md">
        <h2 className="text-white text-2xl font-bold">Set Up Your Profile</h2>
        <div className="text-white/80 text-sm mb-2">We use your precise birth data to calculate your <b>Baseline Personality</b>—who you were before your family history influenced you.</div>
        <input
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white"
          type="date"
          value={birthDate}
          onChange={e => setBirthDate(e.target.value)}
          required
        />
        <input
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white"
          type="time"
          value={birthTime}
          onChange={e => setBirthTime(e.target.value)}
          required
        />
        <input
          className="bg-white/10 border border-white/20 rounded-lg p-3 text-white"
          placeholder="Birth Location"
          value={birthLocation}
          onChange={e => setBirthLocation(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-white text-black font-bold py-3 rounded-xl hover:bg-white/80 transition"
        >
          Continue
        </button>
      </form>
    </div>
  );
};
