
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import Manual from './components/Manual';
import Orbit from './components/Orbit';
import { LiveVoice } from './components/LiveVoice';

// The new flow uses direct routing instead of state based navigation for the main product flow.
// Other tools can be added as routes if needed, but for now we lock in the Golden Soul experience.

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/orbit" element={<Orbit />} />
        <Route path="/live" element={<LiveVoice user="PILLAR_USER" />} />
        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
