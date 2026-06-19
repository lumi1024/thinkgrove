// SPDX-License-Identifier: MIT

import React from 'react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`rounded-2xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-6 ${className}`}>
      <div className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase mb-4">{title}</div>
      {children}
    </div>
  );
}
