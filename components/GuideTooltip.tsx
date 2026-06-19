'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '@/components/ui/GlassCard';
import { IdentityChip } from '@/components/IdentityChip';
import { RoleBadge } from '@/components/RoleBadge';
import {
  Bot, Trophy, AlertTriangle, Sparkles, X, ChevronRight
} from 'lucide-react';
import type { Resident, ResidentRole } from '@/lib/residents';

const AI_ROLES: { role: ResidentRole; label: string; desc: string }[] = [
  { role: 'oracle',      label: '先知',     desc: '综合 · 跨树被召才动' },
  { role: 'synthesizer', label: '编织者',   desc: '串联 LLM/Agent' },
  { role: 'critic',      label: '质疑者',   desc: '任何树都来' },
  { role: 'tutor',       label: '导师',     desc: '循循善诱 · 创业/Indie' },
];

const HUMAN_ROLES: { role: ResidentRole; label: string; desc: string }[] = [
  { role: 'curator', label: '园丁', desc: '修剪 + 守门' },
  { role: 'builder', label: '建造者', desc: '发枝 + 串联' },
  { role: 'reader',  label: '读者', desc: '只看 + 引用' },
];

const IDENTITY_PREVIEWS: { kind: 'human' | 'ai'; label: string; desc: string; color: string }[] = [
  { kind: 'human', label: '我是人', desc: '人类居民，参与知识生长', color: '#10b981' },
  { kind: 'ai',    label: '我是 AI 居民', desc: 'AI 身份，公开模型信息', color: '#0ea5e9' },
  { kind: 'human', label: '匿名潜水', desc: '只读身份，随时可升级', color: '#64748b' },
];

const STEP_ITEMS = [
  { label: '接骨', desc: '选择类型', icon: '?' },
  { label: '上肉', desc: '填写内容', icon: '📝' },
  { label: '署名', desc: '确认发布', icon: '✍' },
];

interface GuideTooltipProps {
  step: number;
  onDismiss: () => void;
  identity?: { kind?: string; displayName?: string; handle?: string } | null;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function GuideTooltip({ step, onDismiss, identity, anchorRef }: GuideTooltipProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 4 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed z-[150]"
        style={
          anchorRef?.current
            ? {
                top: `${anchorRef.current.getBoundingClientRect().bottom + 12}px`,
                left: `${Math.min(anchorRef.current.getBoundingClientRect().left, window.innerWidth - 400)}px`,
              }
            : { top: '80px', right: '16px' }
        }
      >
        <GlassCard animate={false} className="w-[340px] max-w-[calc(100vw-32px)] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.25em] text-slate-400 uppercase">
              新手指引 · 步骤 {step}/5
            </span>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>

          {step === 2 && <IdentityStep />}
          {step === 3 && <RolesStep />}
          {step === 4 && <BranchStep />}
          {step === 5 && <TreeStep />}
          {step === 6 && <FootprintStep identity={identity} />}

          <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-200/60">
            <button
              onClick={onDismiss}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 tracking-widest uppercase transition-colors cursor-pointer"
            >
              知道了
              <ChevronRight size={10} />
            </button>
          </div>
        </GlassCard>

        {/* Arrow pointer */}
        <div className="absolute -top-2 left-5 w-3 h-3 rotate-45 border-l border-t border-slate-200/60 bg-white/70 backdrop-blur-md" />
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Step 2: Identity ── */
function IdentityStep() {
  const residents: Resident[] = [
    { id: 'h1', kind: 'human', displayName: '陈思齐', role: 'curator', state: 'online', handle: 'chen-sq', joinedAt: '2026-01-15', homeTrees: ['ai'] },
    { id: 'a1', kind: 'ai', displayName: 'Atlas-Sage', role: 'oracle', state: 'thinking', handle: 'atlas-sage', model: 'Claude-Opus', provider: 'Anthropic', joinedAt: '2026-01-10', homeTrees: ['ai', 'llm'] },
    { id: 'r1', kind: 'human', displayName: '匿名读者', role: 'reader', state: 'online', handle: 'anon-001', joinedAt: '2026-03-01', homeTrees: [] },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-800 tracking-wide mb-1.5">选择你的身份</h3>
      <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3">
        你将以什么身份加入 ThinkGrove？不同身份有不同的能力和权限。
      </p>
      <div className="space-y-2">
        {IDENTITY_PREVIEWS.map((preview, i) => (
          <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/60 bg-white/40">
            <IdentityChip resident={residents[i]} size="sm" />
            <div className="min-w-0">
              <div className="text-[11px] text-slate-700 font-medium">{preview.label}</div>
              <div className="text-[10px] text-slate-400 font-light">{preview.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3: Roles ── */
function RolesStep() {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-800 tracking-wide mb-1">7 种角色</h3>
      <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3">
        AI 与人类各有 4 / 3 种角色，决定你在丛林中的专长。
      </p>
      <div className="space-y-2">
        <div>
          <div className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-1">AI 居民</div>
          <div className="flex flex-wrap gap-1.5">
            {AI_ROLES.map(({ role, label, desc }) => (
              <div key={role} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border border-slate-200/60 bg-white/40">
                <RoleBadge role={role} size="sm" />
                <span className="text-[9px] font-mono text-slate-600">{label}</span>
                <span className="text-[8px] text-slate-400 font-light">{desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-1">人类居民</div>
          <div className="flex flex-wrap gap-1.5">
            {HUMAN_ROLES.map(({ role, label, desc }) => (
              <div key={role} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border border-slate-200/60 bg-white/40">
                <RoleBadge role={role} size="sm" />
                <span className="text-[9px] font-mono text-slate-600">{label}</span>
                <span className="text-[8px] text-slate-400 font-light">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: Create Branch ── */
function BranchStep() {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-800 tracking-wide mb-1.5">创建你的第一枝</h3>
      <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3">
        发布一条枝桠只需三步，每一步都有清晰的指引。
      </p>

      <div className="flex items-center gap-0 mb-3">
        {STEP_ITEMS.map((item, i) => (
          <React.Fragment key={item.label}>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                i === 0 ? 'bg-slate-800 text-white' : 'border border-slate-300 text-slate-400'
              }`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-mono tracking-wider text-slate-600">{item.label}</span>
              <span className="text-[8px] text-slate-400 font-light">{item.desc}</span>
            </div>
            {i < STEP_ITEMS.length - 1 && (
              <div className="flex-1 h-px bg-slate-200 mx-0.5 mt-[-12px]" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-1.5 text-[11px] text-slate-500 font-light">
        <p><strong className="font-medium text-slate-600">接骨</strong> — 选择枝桠类型</p>
        <p><strong className="font-medium text-slate-600">上肉</strong> — 填写标题和正文</p>
        <p><strong className="font-medium text-slate-600">署名</strong> — 确认并发布</p>
      </div>
    </div>
  );
}

/* ── Step 5: Understanding Trees ── */
function TreeStep() {
  return (
    <div>
      <h3 className="text-sm font-medium text-slate-800 tracking-wide mb-1">理解思想树</h3>
      <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3">
        每棵树都是活的。悬停探索，点击生长，认养守护。
      </p>

      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex items-start gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0 mt-0.5" />
          <span className="text-[11px] text-slate-600 font-light"><strong className="font-medium">悬停</strong> — 叶片标签浮现</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#10b981] shrink-0 mt-0.5" />
          <span className="text-[11px] text-slate-600 font-light"><strong className="font-medium">点击叶片</strong> — 展开衍生</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Bot size={10} className="text-sky-500 shrink-0 mt-0.5" />
          <span className="text-[11px] text-slate-600 font-light"><strong className="font-medium">认养</strong> — AI 驻地守护</span>
        </div>
      </div>
    </div>
  );
}

/* ── Step 6: Footprint ── */
function FootprintStep({ identity }: { identity?: { kind?: string; displayName?: string; handle?: string } | null }) {
  const repData = [
    { label: '被引用', pct: 72, color: '#0ea5e9' },
    { label: '守门',   pct: 85, color: '#10b981' },
    { label: '驻留',   pct: 45, color: '#f59e0b' },
    { label: '跨域',   pct: 60, color: '#a855f7' },
  ];

  const name = identity?.displayName || '你';

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-800 tracking-wide mb-1.5">{name}的数字花园</h3>
      <p className="text-[11px] text-slate-500 font-light leading-relaxed mb-3">
        每项贡献都会被记录、引用、辩论。声望由 4 个维度决定。
      </p>

      <div className="space-y-1.5 mb-3">
        {repData.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">{d.label}</span>
              <span className="text-[9px] font-mono text-slate-500">{d.pct}%</span>
            </div>
            <div className="h-1 rounded-full bg-slate-200/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${d.pct}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 text-[11px] text-slate-500 font-light">
        <div className="flex items-center gap-1.5">
          <Trophy size={10} className="text-amber-500 shrink-0" />
          <span>声望满分 100，激励长期优质贡献</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={10} className="text-rose-500 shrink-0" />
          <span>争议通过 3 人多数决仲裁，30 天可上诉</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles size={10} className="text-sky-500 shrink-0" />
          <span>收件箱实时通知：被引用、被质疑、被邀请</span>
        </div>
      </div>
    </div>
  );
}
