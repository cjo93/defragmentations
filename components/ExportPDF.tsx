import React from 'react';
import { exportUserManualPDF } from '../services/exportPDF';

export const ExportPDF: React.FC = () => {
  return (
    <button
      className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-white/80 transition mt-6"
      onClick={exportUserManualPDF}
    >
      Download Relationship User Manual (PDF)
    </button>
  );
};
