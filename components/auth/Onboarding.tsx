
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { processBirthData } from '../../services/engine';

export const Onboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '' // For now, location is simplified as we are using simplified engine logic
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // 1. RUN THE ENGINE
    // We process the raw data immediately to create the 'Blueprint'
    try {
      const blueprint = processBirthData(formData.date, formData.time);
      
      // 2. SAVE TO SESSION (Simulating Database Save)
      localStorage.setItem('defrag_user_data', JSON.stringify(blueprint));
      
      // 3. COMPLETE
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error("Engine Calculation Failed", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-lg p-8 bg-slate-900/50 rounded-2xl border border-white/10 backdrop-blur-xl">
        
        <div className="mb-8">
          <div className="h-1 w-full bg-slate-800 rounded-full mb-6 overflow-hidden">
            <div className={`h-full bg-amber-500 transition-all duration-1000 ${isProcessing ? 'w-full' : 'w-1/2'}`}></div>
          </div>
          <h2 className="text-2xl text-white font-bold mb-2">Initialize Blueprint</h2>
          <p className="text-slate-400">To understand your mechanics, we need your manufacturing date.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Date of Birth</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Time of Birth</label>
              <input 
                type="time" 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Location</label>
             <input 
               type="text" 
               placeholder="City, Country"
               value={formData.location}
               onChange={(e) => setFormData({...formData, location: e.target.value})}
               className="w-full bg-black/50 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
               // Note: Actual lat/long lookup requires an external API; we are simulating for MVP
             />
             <p className="text-xs text-slate-600 mt-2">Required to calculate your specific planetary alignment.</p>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-white text-black rounded-lg p-4 font-bold hover:bg-amber-400 transition mt-4"
          >
            {isProcessing ? 'Calculating Blueprint...' : 'Generate Analysis'}
          </button>
        </form>
      </div>
    </div>
  );
};
