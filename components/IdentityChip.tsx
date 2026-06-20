// SPDX-License-Identifier: MIT

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Bot, User, ShieldCheck } from 'lucide-react';
import type { Resident, ResidentRole, ResidentState } from '@/lib/residents';
import { RoleBadge } from './RoleBadge';

interface IdentityChipProps {
  resident: Pick<Resident, 'kind' | 'displayName' | 'role' | 'state' | 'model' | 'provider' | 'handle' | 'id'>;
  size?: 'sm' | 'md' | 'lg';
  showSignature?: boolean;
  href?: string; // when set, wraps in a Link
  className?: string;
}

// Core identity capsule used across the HUD, header, dispute cards,
// inbox, and any other place where a person or AI needs to be visible.
// Replaces the bare 12px Bot/User icon pair scattered through the codebase.
export function IdentityChip({
  resident,
  size = 'md',
  showSignature = false,
  href,
  className = '',
}: IdentityChipProps) {
  const dims = SIZES[size];

  const inner = (
    <motion.div
      initial={false}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/55 backdrop-blur-md ${dims.wrap} ${className}`}
    >
      <AvatarBubble state={resident.state} kind={resident.kind} size={dims.avatar} />
      <div className="flex flex-col min-w-0 leading-none">
        <span className={`font-mono ${dims.name} text-slate-800 truncate`}>
          {resident.displayName}
        </span>
        {showSignature && (
          <span className={`font-mono ${dims.meta} text-slate-400 uppercase tracking-[0.2em] mt-0.5 truncate`}>
            {resident.kind === 'ai' ? `ai · ${resident.role}` : `${resident.role}`}
          </span>
        )}
      </div>
      {resident.kind === 'ai' && (
        <>
          <RoleBadge role={resident.role as ResidentRole} size={size === 'lg' ? 'md' : 'sm'} />
          {(resident as any).framework && (
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono">
              {(resident as any).framework}
            </span>
          )}
        </>
      )}
    </motion.div>
  );

  if (href) {
    return <Link href={href} className="inline-block cursor-pointer">{inner}</Link>;
  }
  return inner;
}

interface AvatarBubbleProps {
  state: ResidentState;
  kind: 'human' | 'ai';
  size: number;
}

function AvatarBubble({ state, kind, size }: AvatarBubbleProps) {
  // Status dot color follows the same convention as the home chip:
  //   thinking -> sky-500 + glow
  //   online   -> slate-500
  //   resting  -> slate-300 (no pulse)
  const dotClass =
    state === 'thinking' ? 'bg-[#0ea5e9] shadow-[0_0_6px_#0ea5e9]'
    : state === 'resting' ? 'bg-slate-300'
    : state === 'offline' ? 'bg-slate-300 opacity-50'
    : 'bg-slate-500';
  const animate = state !== 'resting' && state !== 'offline' ? 'animate-pulse' : '';

  return (
    <span
      className="relative inline-flex items-center justify-center rounded-full bg-white/70 border border-slate-200/70 shrink-0"
      style={{ width: size, height: size }}
    >
      {kind === 'ai' ? (
        <Bot size={size * 0.5} className="text-slate-600" strokeWidth={1.5} />
      ) : (
        <User size={size * 0.5} className="text-slate-600" strokeWidth={1.5} />
      )}
      <span
        className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${dotClass} ${animate}`}
      />
    </span>
  );
}

const SIZES: Record<NonNullable<IdentityChipProps['size']>, { wrap: string; name: string; meta: string; avatar: number }> = {
  sm: { wrap: 'px-2 py-1',  name: 'text-[10px]', meta: 'text-[8px]',  avatar: 18 },
  md: { wrap: 'px-2.5 py-1.5', name: 'text-[11px]', meta: 'text-[9px]', avatar: 22 },
  lg: { wrap: 'px-3 py-2',  name: 'text-sm',    meta: 'text-[10px]', avatar: 28 },
};

interface SignatureProps {
  resident: Resident;
}

// Extended signature line — what appears when hovering the chip on the HUD.
// Lives as a separate component because some surfaces (e.g. the home chip)
// only want the signature on hover, not baked into the chip itself.
export function Signature({ resident }: SignatureProps) {
  const ai = resident.kind === 'ai';
  return (
    <div className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase space-y-0.5">
      <div className="flex items-center gap-1.5">
        {ai ? <Bot size={10} className="text-sky-500" /> : <User size={10} className="text-emerald-500" />}
        <span className="text-slate-700 normal-case tracking-normal">{resident.displayName}</span>
        <span>· {resident.role}</span>
      </div>
      {ai && (
        <div className="flex items-center gap-1 text-slate-400 text-[9px] tracking-[0.25em]">
          <ShieldCheck size={9} />
          <span>由 {resident.model} 辅助生成</span>
        </div>
      )}
    </div>
  );
}
