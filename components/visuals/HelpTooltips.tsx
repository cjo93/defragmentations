import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Lightbulb } from 'lucide-react';

interface TooltipProps {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  showOnce?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  id,
  title,
  content,
  position = 'top',
  children,
  showOnce = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    if (showOnce) {
      const shown = localStorage.getItem(`tooltip_${id}_shown`);
      setHasBeenShown(!!shown);
    }
  }, [id, showOnce]);

  const handleClose = () => {
    setIsVisible(false);
    if (showOnce) {
      localStorage.setItem(`tooltip_${id}_shown`, 'true');
      setHasBeenShown(true);
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-white/[0.08] border-t-8 border-x-transparent border-x-8 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-white/[0.08] border-b-8 border-x-transparent border-x-8 border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-white/[0.08] border-l-8 border-y-transparent border-y-8 border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-white/[0.08] border-r-8 border-y-transparent border-y-8 border-l-0'
  };

  if (showOnce && hasBeenShown) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="backdrop-blur-2xl bg-neutral-900/95 border border-white/[0.08] rounded-2xl p-4 shadow-2xl min-w-[250px] max-w-[320px]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#E2E2E8]/10 border border-[#E2E2E8]/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-[#E2E2E8]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{content}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-neutral-500 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className={`absolute w-0 h-0 ${arrowClasses[position]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// First-time user onboarding tooltips
interface OnboardingStep {
  id: string;
  selector: string;
  title: string;
  content: string;
}

export const useOnboardingTour = (steps: OnboardingStep[], tourId: string) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`tour_${tourId}_completed`);
    if (!completed) {
      setIsActive(true);
    }
  }, [tourId]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem(`tour_${tourId}_completed`, 'true');
  };

  return {
    isActive,
    currentStep: steps[currentStep],
    stepNumber: currentStep + 1,
    totalSteps: steps.length,
    nextStep,
    skipTour
  };
};

// Inline help icon with tooltip
export const HelpIcon: React.FC<{ tooltip: string; className?: string }> = ({ tooltip, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={`text-neutral-500 hover:text-neutral-300 transition-colors ${className}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
          >
            <div className="backdrop-blur-2xl bg-neutral-900/95 border border-white/[0.08] rounded-xl p-3 shadow-2xl max-w-[200px]">
              <p className="text-xs text-neutral-300 leading-relaxed">{tooltip}</p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-t-white/[0.08] border-t-8 border-x-transparent border-x-8 border-b-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
