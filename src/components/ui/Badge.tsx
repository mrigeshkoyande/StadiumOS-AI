import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-accent-green/10 text-accent-green',
    warning: 'bg-accent-amber/10 text-accent-amber',
    error: 'bg-accent-red/10 text-accent-red',
    info: 'bg-primary-500/10 text-primary-600',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
