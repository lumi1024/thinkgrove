// SPDX-License-Identifier: MIT

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Gavel, Clock, Check, X } from 'lucide-react';
import { IdentityChip } from './IdentityChip';

// Compact dispute card used in tree pages and inbox.
// Shows the dispute reason, current ruling status, and the 3+2 arbitrator avatars.

interface DisputeCardProps {
  id: string;
  reason: string;
  status: 'open' | 'ruling' | 'closed';
  openedAt: string;
  arbitrators: {
    id: string;
    displayName: string;
    kind: 'human' | 'ai';
    role: string;
    state?: 'online' | 'thinking' | 'resting';
  }[];
  votes?: { sustain: number; overturn: number };
}

export function DisputeCard({ id, reason, status, openedAt, arbitrators, votes }: DisputeCardProps) {
  const humans = arbitrators.filter((a) => a.kind === 'human');
  const ais    = arbitrators.filter((a) => a.kind === 'ai');

  return (
    <Link
      href={`/disputes/${id}`}
      className="block group rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-md p-5 hover:bg-white hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-3">
        <Gavel size={14} className="text-rose-500" />
        <span className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">争议</span>
        <StatusBadge status={status} />
        <span className="ml-auto font-mono text-[9px] text-slate-400 tracking-widest flex items-center gap-1">
          <Clock size={9} />
          {openedAt}
        </span>
      </div>
      <p className="text-sm text-slate-700 font-light leading-relaxed line-clamp-3 mb-4">{reason}</p>

      {votes && (
        <div className="flex items-center gap-3 mb-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-600">
            <Check size={11} />
            {votes.sustain} 维持
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <X size={11} />
            {votes.overturn} 推翻
          </span>
        </div>
      )}

      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {arbitrators.slice(0, 5).map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] text-slate-500"
              title={`${a.displayName} (${a.role})`}
            >
              {a.displayName.slice(0, 2)}
            </motion.div>
          ))}
        </div>
        <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          {humans.length} 人 · {ais.length} ai
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: 'open' | 'ruling' | 'closed' }) {
  if (status === 'open')   return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 tracking-widest uppercase">待裁决</span>;
  if (status === 'ruling') return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200/60 tracking-widest uppercase">裁决中</span>;
  return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60 tracking-widest uppercase">已结束</span>;
}
