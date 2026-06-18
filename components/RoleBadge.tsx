'use client';

import React from 'react';
import { motion } from 'motion/react';
import type { ResidentRole } from '@/lib/roles';
import { getRoleStyle } from '@/lib/roles';

interface RoleBadgeProps {
  role: ResidentRole;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

// Compact role chip — used inside IdentityChip, dispute cards, contributor
// rows, etc. Visual language mirrors the existing monospace + tracking-widest
// labels used in the HUD, just with a role-specific tint.
export function RoleBadge({ role, size = 'sm', showDot = true, className = '' }: RoleBadgeProps) {
  const style = getRoleStyle(role);
  const sizing = size === 'md'
    ? 'text-[10px] px-2.5 py-1 tracking-[0.2em]'
    : 'text-[9px] px-2 py-0.5 tracking-[0.18em]';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono uppercase border ${sizing} ${className}`}
      style={{
        backgroundColor: style.tint,
        borderColor: style.border,
        color: style.fg,
      }}
    >
      {showDot && (
        <span
          className="w-1 h-1 rounded-full shrink-0"
          style={{ backgroundColor: style.base }}
        />
      )}
      {role}
    </span>
  );
}

interface RoleDotProps {
  role: ResidentRole;
  size?: number;
  pulse?: boolean;
}

// Tiny inline dot — for HUD lines and tiny inline identity.
export function RoleDot({ role, size = 6, pulse = false }: RoleDotProps) {
  const style = getRoleStyle(role);
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${pulse ? 'animate-pulse' : ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: style.base,
        boxShadow: pulse ? `0 0 ${size}px ${style.base}` : undefined,
      }}
    />
  );
}
