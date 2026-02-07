
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DEFRAG_MANIFEST } from '../../constants/manifest';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // SIMULATED AUTH DELAY
    setTimeout(() => {
      localStorage.setItem('defrag_auth_token', 'session_active');
      localStorage.setItem('defrag_user_email', email);
      
      // Check if they have already entered birth data
      const hasData = localStorage.getItem('defrag_user_data');
      
      if (hasData) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding'); // Redirect new users here
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md p-8 bg-slate-900/50 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl text-white font-bold mb-2">{DEFRAG_MANIFEST.BRAND.NAME}</h2>
          <p className="text-slate-500 text-sm">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 focus:border-amber-500 outline-none text-white transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <a href="#" className="text-xs text-amber-500 hover:text-amber-400">Forgot Password?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 focus:border-amber-500 outline-none text-white transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-white text-black rounded-lg p-3 font-bold hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-600">
          Don't have an account? <Link to="/login" className="text-white hover:underline">Create Blueprint</Link>
        </div>
      </div>
    </div>
  );
};
