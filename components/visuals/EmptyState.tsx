import React from 'react';
import { motion } from 'framer-motion';
import { Repeat, Users, Radio, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon: 'echo' | 'orbit' | 'signal' | 'generic';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  hint?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  hint
}) => {
  const iconMap = {
    echo: Repeat,
    orbit: Users,
    signal: Radio,
    generic: Sparkles
  };

  const Icon = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center text-center py-16 px-6"
    >
      {/* Animated Icon Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative mb-8"
      >
        {/* Backdrop glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#E2E2E8]/20 blur-3xl rounded-full"
        />
        
        {/* Icon container */}
        <div className="relative w-24 h-24 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-2xl flex items-center justify-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="w-12 h-12 text-[#E2E2E8]" strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="max-w-md space-y-4"
      >
        <h3 className="text-2xl font-light tracking-tight text-white">
          {title}
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed">
          {description}
        </p>
        
        {hint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-neutral-500"
          >
            <Sparkles className="w-3 h-3" />
            <span>{hint}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onClick={onAction}
          className="mt-8 px-8 py-3 rounded-xl bg-white text-black font-medium hover:bg-neutral-50 transition-all transform hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

// Preset empty states for common scenarios
export const EchoEmptyState = ({ onStart }: { onStart?: () => void }) => (
  <EmptyState
    icon="echo"
    title="No Echoes Yet"
    description="Start logging your experiences to detect recurring patterns. Echo watches for themes that repeat across time — habits, triggers, and loops that shape your architecture."
    hint="The system needs at least 3 entries to begin pattern detection"
    actionLabel={onStart ? "Create First Entry" : undefined}
    onAction={onStart}
  />
);

export const OrbitEmptyState = (_props: { onStart?: () => void }) => (
  <EmptyState
    icon="orbit"
    title="Define Your Orbit"
    description="Enter birth data for yourself and someone else to see how your blueprints interact. This reveals the electromagnetic pull between two architectures — where you align and where friction lives."
    hint="Both people's data required for relational geometry"
  />
);

export const SignalEmptyState = () => (
  <EmptyState
    icon="signal"
    title="No Signal Analyzed"
    description="Paste any text — messages, emails, or written communication — to scan for unconscious patterns. Signal reads beneath the words to reveal the architecture speaking through language."
    hint="Works best with 100+ words of authentic communication"
  />
);
