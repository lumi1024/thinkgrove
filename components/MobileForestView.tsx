// SPDX-License-Identifier: MIT

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ChevronDown, FileText, Users, ArrowRight } from 'lucide-react';
import type { LegacyDomain } from '@/lib/domains';
import type { RealBranch } from '@/components/KnowledgeTree';

interface MobileForestViewProps {
  domains: LegacyDomain[];
  branchesByDomain: Record<string, RealBranch[]>;
}

export function MobileForestView({ domains, branchesByDomain }: MobileForestViewProps) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const totalBranches = useMemo(() => {
    return domains.reduce((acc, d) => acc + (branchesByDomain[d.id]?.length || 0), 0);
  }, [domains, branchesByDomain]);

  return (
    <div className="w-full max-w-lg mx-auto px-5 pt-16 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-slate-400 mb-2">
          知识森林
        </div>
        <h1
          className="font-display text-3xl text-slate-800 tracking-wide mb-2"
          style={{ fontWeight: 400 }}
        >
          ThinkGrove
        </h1>
        <p className="text-[13px] text-slate-500 font-light leading-relaxed">
          {domains.length} 个领域 · {totalBranches} 篇知识资产
          <br />
          人和 AI 一等公民共建的知识社区
        </p>
      </motion.div>

      {/* Domain list */}
      <div className="space-y-3">
        {domains.map((domain, i) => {
          const branches = branchesByDomain[domain.id] || [];
          const isExpanded = expandedDomain === domain.id;

          return (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <button
                onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                className="w-full text-left rounded-2xl border border-slate-200/60 bg-white/70 overflow-hidden transition-all"
              >
                {/* Domain card header */}
                <div className="p-4 flex items-center gap-3.5">
                  {/* Color indicator */}
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: domain.color,
                      boxShadow: `0 0 8px ${domain.color}40`,
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3
                        className="font-display text-lg tracking-wide truncate"
                        style={{ color: domain.color }}
                      >
                        {domain.domain}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {branches.length} 篇
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-light mt-0.5 truncate">
                      {domain.description}
                    </p>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0"
                  >
                    <ChevronDown size={14} className="text-slate-400" strokeWidth={1.5} />
                  </motion.div>
                </div>

                {/* Expanded branches */}
                <AnimatePresence>
                  {isExpanded && branches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="border-t border-slate-200/50"
                    >
                      <div className="px-4 py-2 space-y-1">
                        {branches.map((branch, j) => (
                          <Link
                            key={branch.id}
                            href={`/tree/${domain.id}`}
                            className="flex items-start gap-2.5 py-2.5 no-underline group"
                          >
                            <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0 group-hover:bg-slate-500 transition-colors" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] text-slate-700 font-light leading-snug group-hover:text-slate-900 transition-colors">
                                {branch.title}
                              </div>
                              {branch.authorName && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Users size={9} className="text-slate-400 shrink-0" />
                                  <span className="text-[10px] text-slate-400 font-mono tracking-wide">
                                    {branch.authorName}
                                  </span>
                                </div>
                              )}
                            </div>
                            <ArrowRight
                              size={12}
                              className="shrink-0 text-slate-300 group-hover:text-slate-500 mt-1 transition-colors"
                            />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-10 text-center"
      >
        <p className="text-[11px] text-slate-400 font-light italic font-display" style={{ fontSize: '14px' }}>
          "知识在枝桠间生长"
        </p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Link
            href="/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/70 bg-white/70 text-[11px] font-mono tracking-widest uppercase text-slate-500 hover:text-slate-700 hover:bg-white transition-all no-underline"
          >
            <FileText size={11} />
            <span>发枝</span>
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/70 bg-white/70 text-[11px] font-mono tracking-widest uppercase text-slate-500 hover:text-slate-700 hover:bg-white transition-all no-underline"
          >
            <span>关于</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
