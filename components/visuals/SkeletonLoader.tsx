import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}) => {
  const variantClasses = {
    text: 'rounded-lg h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.6, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-white/[0.04] ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton width="200px" height="32px" />
          <Skeleton width="150px" height="16px" variant="text" />
        </div>
        <Skeleton variant="circular" width="40px" height="40px" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Large Card */}
          <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.04] rounded-3xl p-8">
            <Skeleton width="150px" height="24px" className="mb-4" />
            <div className="grid grid-cols-3 gap-4 my-8">
              <Skeleton variant="circular" width="80px" height="80px" />
              <Skeleton variant="circular" width="80px" height="80px" />
              <Skeleton variant="circular" width="80px" height="80px" />
            </div>
            <div className="space-y-3">
              <Skeleton width="100%" height="12px" variant="text" />
              <Skeleton width="80%" height="12px" variant="text" />
              <Skeleton width="90%" height="12px" variant="text" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6">
                <Skeleton width="120px" height="16px" className="mb-4" />
                <Skeleton width="100%" height="80px" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6">
              <Skeleton width="100px" height="20px" className="mb-4" />
              <div className="space-y-3">
                <Skeleton width="100%" height="12px" variant="text" />
                <Skeleton width="85%" height="12px" variant="text" />
                <Skeleton width="70%" height="12px" variant="text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="backdrop-blur-2xl bg-white/[0.02] border border-white/[0.04] rounded-3xl p-6">
      <Skeleton width="120px" height="20px" className="mb-4" />
      <div className="space-y-3">
        <Skeleton width="100%" height="12px" variant="text" />
        <Skeleton width="90%" height="12px" variant="text" />
        <Skeleton width="75%" height="12px" variant="text" />
      </div>
    </div>
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[70%] backdrop-blur-2xl bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4`}>
            <Skeleton width="200px" height="12px" variant="text" className="mb-2" />
            <Skeleton width="150px" height="12px" variant="text" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
