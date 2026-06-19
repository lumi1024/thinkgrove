// SPDX-License-Identifier: MIT

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackLink({ href = '/', label = 'back_to_forest', className = '' }: BackLinkProps) {
  const baseClass = 'flex items-center gap-2 text-[11px] font-mono text-slate-400 hover:text-slate-700 tracking-widest uppercase transition-colors';
  const merged = `${baseClass} ${className}`;

  if (href === '/') {
    return (
      <Link href="/" className={merged}>
        <ArrowLeft size={12} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className={merged}>
      <ArrowLeft size={12} />
      <span>{label}</span>
    </Link>
  );
}
