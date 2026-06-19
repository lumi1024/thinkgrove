// SPDX-License-Identifier: MIT

import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animate?: boolean;
}

export function GlassCard({ children, className = '', delay = 0, animate = true }: GlassCardProps) {
  const baseClass =
    'rounded-2xl border border-slate-200/60 bg-white/55 backdrop-blur-md ' +
    'shadow-[0_8px_40px_rgba(15,23,42,0.04)]';

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        className={`${baseClass} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={`${baseClass} ${className}`}>{children}</div>;
}
