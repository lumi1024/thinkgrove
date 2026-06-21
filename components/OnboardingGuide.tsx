// SPDX-License-Identifier: MIT

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Compass } from 'lucide-react';

export function OnboardingGuide({ onDismiss, show }: { onDismiss: () => void; show: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('tg:onboarding');
    if (!seen && show) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [show]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('tg:onboarding', '1');
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.25 } }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-[72px] left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[640px]"
        >
          <div className="relative rounded-2xl border border-slate-200/70 bg-white/92 backdrop-blur-xl shadow-[0_4px_40px_rgba(15,23,42,0.07),0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* decorative side accent */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#10b981] via-[#0ea5e9] to-[#a855f7] opacity-70" />

            <div className="px-6 py-5 pl-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Compass size={12} className="text-[#10b981]" strokeWidth={1.5} />
                    <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-slate-400">
                      欢迎来到知识森林
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-600 font-light leading-relaxed" style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontStyle: 'italic' }}>
                    8 个领域，每棵树上的节点都是前人帮你整理好的知识资产。
                    <br />
                    <span className="text-slate-400 text-[11px]" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
                      点击任意节点开始阅读，悬停探索领域全貌。
                    </span>
                  </p>
                </div>

                <button
                  onClick={dismiss}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X size={12} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={dismiss}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800 text-white text-[10px] font-medium tracking-widest uppercase cursor-pointer hover:bg-slate-700 transition-all"
                >
                  开始探索
                  <ArrowRight size={11} />
                </button>
                <Link
                  href="/about"
                  onClick={dismiss}
                  className="text-[10px] font-mono tracking-widest uppercase text-slate-400 hover:text-slate-600 transition-colors no-underline"
                >
                  了解更多 →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
