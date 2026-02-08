import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LivingBackground from '../components/visuals/LivingBackground';
import { DEFRAG_MANIFEST } from '../constants/manifest';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden flex items-center justify-center">
      <LivingBackground mode="calm" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="relative z-10 text-center px-6"
      >
        <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-8">
          <span className="text-2xl font-bold text-neutral-600">404</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Route not found.</h1>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto mb-10">
          This path doesn't exist in the architecture. It may have been moved or removed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-lg hover:bg-neutral-200 transition"
          >
            Return Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 rounded-lg border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/[0.15] transition"
          >
            Report Issue
          </Link>
        </div>

        <p className="text-[10px] text-neutral-700 mt-16">{DEFRAG_MANIFEST.BRAND.NAME}</p>
      </motion.div>
    </div>
  );
};
