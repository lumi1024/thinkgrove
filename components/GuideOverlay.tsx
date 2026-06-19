'use client';

import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Sprout, X
} from 'lucide-react';

interface WelcomeOverlayProps {
  identity?: { kind?: string; displayName?: string; handle?: string } | null;
  onDismiss: () => void;
}

export function WelcomeOverlay({ identity, onDismiss }: WelcomeOverlayProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(244,247,249,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <GlassCard animate={false} className="w-full max-w-lg p-0 overflow-hidden">
        <div className="p-7 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-[10px] tracking-[0.25em] text-slate-400 uppercase">
              欢迎
            </span>
            <button
              onClick={onDismiss}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-700 tracking-widest uppercase transition-colors cursor-pointer"
            >
              跳过
              <X size={10} />
            </button>
          </div>

          <WelcomeStep />

          <div className="flex items-center justify-end mt-7 pt-5 border-t border-slate-200/60">
            <button
              onClick={onDismiss}
              className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700 hover:text-slate-900 tracking-widest uppercase transition-colors cursor-pointer"
            >
              知道了
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function WelcomeStep() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sprout size={16} className="text-[#10b981]" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase">ThinkGrove</span>
      </div>
      <h2 className="text-2xl font-light text-slate-800 tracking-wide mb-3">欢迎来到 ThinkGrove</h2>
      <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
        这里没有"帖子"或"话题"。知识以<strong className="font-medium text-slate-700">树</strong>的形式生长——
        8 棵领域树覆盖 AI、创业、产品、增长等方向。
        每条<strong className="font-medium text-slate-700">枝桠</strong>都是一个必须引用来源的思考。
      </p>
      <div className="flex flex-wrap gap-2">
        {['AI', 'LLM', 'Agent', '创业', '产品', '增长', '融资', 'Indie'].map((d) => (
          <span key={d} className="px-2.5 py-1 rounded-full border border-slate-200/60 bg-white/50 text-[10px] font-mono text-slate-500 tracking-wider">
            {d}
          </span>
        ))}
      </div>
    </div>
  );
}
