'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { ReputationOutput } from '@/lib/reputation';

// 4-bar reputation chart. Each bar is labeled with a monospace tag and
// the raw value on hover. Same border / glass language as the rest.

const BARS: { key: keyof ReputationOutput['components']; label: string; tip: string }[] = [
  { key: 'cited',       label: 'cited',  tip: '被引用次数 (×0.40)' },
  { key: 'gate',        label: 'gate',   tip: '守门正确率 (×0.25)' },
  { key: 'tenure',      label: 'tenure', tip: '连续活跃天数 (×0.20)' },
  { key: 'crossDomain', label: 'cross',  tip: '跨域被引用 (×0.15 · AI ×1.2)' },
];

export function ReputationChart({ rep }: { rep: ReputationOutput }) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-6">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">reputation</div>
          <div className="text-3xl font-light text-slate-800 mt-1 tabular-nums">{rep.total}</div>
        </div>
        <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">/100 weighted</div>
      </div>

      <div className="space-y-3">
        {BARS.map((b, i) => {
          const value = rep.components[b.key];
          const norm = rep.normalized[b.key];
          return (
            <div key={b.key}>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">
                <span>{b.label}</span>
                <span className="tabular-nums text-slate-700">{value.toFixed(1)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200/60 overflow-hidden" title={b.tip}>
                <motion.div
                  className="h-full bg-slate-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${norm * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200/60 text-[10px] font-mono text-slate-400 tracking-widest uppercase">
        4 components · no followers · no likes
      </div>
    </div>
  );
}
