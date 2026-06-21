// SPDX-License-Identifier: MIT

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { Users, FileText, ChevronRight } from 'lucide-react';
import type { LegacyDomain } from '@/lib/domains';

interface DomainHoverCardProps {
  domain: LegacyDomain;
  branchCount: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function DomainHoverCard({ domain, branchCount, containerRef }: DomainHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isHovered || !containerRef.current || !cardRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const card = cardRef.current.getBoundingClientRect();

    let x = container.left + container.width / 2 - card.width / 2;
    let y = container.top + container.height / 2 - card.height / 2 - 80;

    x = Math.max(12, Math.min(x, window.innerWidth - card.width - 12));
    y = Math.max(80, Math.min(y, window.innerHeight - card.height - 12));

    setPosition({ x, y });
  }, [isHovered, containerRef]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[60] w-[260px] rounded-xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(15,23,42,0.08),0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden pointer-events-none"
            style={{ left: position.x, top: position.y }}
          >
            {/* Color accent line */}
            <div className="h-[2px] w-full" style={{ backgroundColor: domain.color }} />

            <div className="p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h4
                  className="font-display text-lg tracking-wide"
                  style={{ color: domain.color }}
                >
                  {domain.domain}
                </h4>
                <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-slate-400">
                  {branchCount} 节点
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3.5">
                {domain.description}
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-200/50">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <FileText size={10} strokeWidth={1.5} />
                  <span>{branchCount} 篇知识资产</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Users size={10} strokeWidth={1.5} />
                  <span>AI + 人类 共同维护</span>
                </div>
              </div>

              <Link
                href={`/tree/${domain.id}`}
                className="flex items-center gap-1 mt-3 text-[10px] font-mono tracking-[0.12em] uppercase no-underline group"
                style={{ color: domain.color }}
              >
                <span className="group-hover:gap-2 flex items-center gap-1 transition-all">
                  进入领域
                  <ChevronRight size={10} strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
