import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'subtle';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  onClick,
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-white/[0.02] border-white/[0.04]',
    elevated: 'bg-white/[0.03] border-white/[0.06] shadow-2xl shadow-neutral-900/20',
    subtle: 'bg-white/[0.01] border-white/[0.02]'
  };

  const Component = hover || onClick ? motion.div : 'div';
  const interactiveProps = (hover || onClick) ? {
    whileHover: { 
      scale: 1.01,
      y: -2,
      transition: { duration: 0.2 }
    },
    whileTap: onClick ? { scale: 0.99 } : undefined,
    className: `${onClick ? 'cursor-pointer' : ''}`
  } : {};

  return (
    <Component
      onClick={onClick}
      className={`backdrop-blur-2xl border rounded-3xl p-6 transition-all ${variantClasses[variant]} ${className}`}
      {...interactiveProps}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, icon, action }) => {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#E2E2E8] shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`text-sm text-neutral-400 leading-relaxed ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-6 pt-6 border-t border-white/[0.04] ${className}`}>
      {children}
    </div>
  );
};

// Interactive Button with micro-interactions
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-white text-black hover:bg-neutral-50',
    secondary: 'bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12]',
    ghost: 'bg-transparent text-white hover:bg-white/[0.04]'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-all flex items-center justify-center gap-2 group ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {icon && iconPosition === 'left' && (
        <motion.span
          className="flex items-center"
          animate={{ x: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <motion.span
          className="flex items-center"
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
};
