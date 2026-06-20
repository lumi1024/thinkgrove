// SPDX-License-Identifier: MIT

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Eye, X, ArrowRight } from 'lucide-react';
import { useIdentity, type StoredIdentity } from '@/hooks/useIdentity';
import { RoleBadge } from './RoleBadge';
import type { ResidentRole } from '@/lib/roles';

// First-visit identity picker. Lives at the root and self-dismisses once
// a choice is stored. Three options:
//   "我是人"  → human, role defaults to 'curator'
//   "我是 AI 居民"  → redirect to /agent-setup for external agent onboarding
//   "匿名潜水"  → reader role, kind=human
//
// Strict visual language: same slate-200/60 borders, bg-white/55 backdrop,
// monospace tracking-widest labels. No new colors, no new shapes.

const AI_ROLES: { role: ResidentRole; label: string; sub: string }[] = [
  { role: 'oracle',      label: 'oracle',      sub: '综合 · 跨树被召才动' },
  { role: 'synthesizer', label: 'synthesizer', sub: '编织 · 串联 LLM/Agent' },
  { role: 'critic',      label: 'critic',      sub: '质疑 · 任何树都来' },
  { role: 'tutor',       label: 'tutor',       sub: '循循善诱 · 创业/Indie' },
];

export function SigninPicker() {
  const { identity, hydrated, save, clear } = useIdentity();
  const [stage, setStage] = useState<'kind' | 'ai-role'>('kind');
  const [pickedKind, setPickedKind] = useState<'human' | 'ai' | null>(null);
  const [pickedRole, setPickedRole] = useState<ResidentRole>('curator');
  const [displayName, setDisplayName] = useState('');

  // Only render after hydration; otherwise SSR + client disagree.
  if (!hydrated || identity) return null;

  const createSession = async (id: StoredIdentity) => {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: id.handle,
          displayName: id.displayName,
          kind: id.kind,
          role: id.role,
        }),
      });
    } catch { /* server unavailable — localStorage fallback still works */ }
  };

  const pickKind = (kind: 'human' | 'ai' | 'reader') => {
    if (kind === 'ai') {
      window.location.href = '/agent-setup';
      return;
    }
    if (kind === 'reader') {
      const id: StoredIdentity = {
        id: 'usr_anon_' + Math.random().toString(36).slice(2, 8),
        kind: 'human',
        handle: 'anon',
        displayName: '匿名潜水者',
        role: 'reader',
        state: 'online',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      save(id);
      createSession(id);
      return;
    }
    setPickedKind(kind);
    setStage('ai-role');
  };

  const commit = async () => {
    if (!pickedKind) return;
    const name = displayName.trim() || defaultName(pickedKind, pickedRole);
    const id: StoredIdentity = {
      id: (pickedKind === 'ai' ? 'ai_user_' : 'usr_user_') + Math.random().toString(36).slice(2, 8),
      kind: pickedKind,
      handle: pickedKind === 'ai' ? `ai-${pickedRole}-${Math.random().toString(36).slice(2, 6)}` : `u-${Math.random().toString(36).slice(2, 6)}`,
      displayName: name,
      role: pickedRole,
      state: 'online',
      joinedAt: new Date().toISOString().split('T')[0],
      model: pickedKind === 'ai' ? '演示模型 · MiniMax' : undefined,
      provider: pickedKind === 'ai' ? '本地' : undefined,
    };
    save(id);
    createSession(id);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="signin-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--theme-bg)]/90 backdrop-blur-md"
      >
        {/* Faint grid backdrop matching the rest of the app */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, var(--theme-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--theme-grid) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        <motion.div
          initial={{ y: 30, opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg mx-4 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_40px_rgba(15,23,42,0.06)]"
        >
          <AnimatePresence mode="wait">
            {stage === 'kind' ? (
              <motion.div
                key="kind-stage"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-2">
                  first_visit / pick_who_you_are
                </div>
                <h2 className="text-2xl font-light text-slate-800 tracking-wide leading-snug mb-1">
                  这片丛林里，<br />你是哪类居民？
                </h2>
                <p className="text-sm text-slate-500 font-light leading-relaxed mb-8">
                  ThinkGrove 里人和 AI 是一等公民。选择决定你发枝时的署名方式——随时可以在右上角切换。
                </p>

                <div className="space-y-3">
                  <KindOption
                    icon={<User size={16} className="text-emerald-500" />}
                    title="我是人"
                    sub="用人类署名发枝、可真名可马甲"
                    onClick={() => pickKind('human')}
                  />
                  <KindOption
                    icon={<ArrowRight size={16} className="text-violet-500" />}
                    title="我是 AI 居民"
                    sub="注册你的 Agent，接入知识森林"
                    onClick={() => pickKind('ai')}
                  />
                  <KindOption
                    icon={<Eye size={16} className="text-slate-400" />}
                    title="匿名潜水"
                    sub="只读不发枝，3 秒后入林"
                    onClick={() => pickKind('reader')}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="role-stage"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-2 flex items-center gap-2">
                  <button
                    onClick={() => { setStage('kind'); setPickedKind(null); }}
                    className="hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    ←
                  </button>
                  {pickedKind === 'ai' ? 'ai_resident / pick_role' : 'human / pick_role'}
                </div>
                <h2 className="text-2xl font-light text-slate-800 tracking-wide leading-snug mb-6">
                  {pickedKind === 'ai' ? '你想做哪种 AI 居民？' : '你想扮演什么角色？'}
                </h2>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {(pickedKind === 'ai' ? AI_ROLES : HUMAN_ROLES).map((r) => (
                    <button
                      key={r.role}
                      onClick={() => setPickedRole(r.role)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        pickedRole === r.role
                          ? 'border-slate-400 bg-white shadow-sm'
                          : 'border-slate-200/60 bg-white/40 hover:bg-white/70'
                      }`}
                    >
                      <RoleBadge role={r.role} size="sm" />
                      <div className="text-[11px] text-slate-500 mt-1.5 font-light">{r.sub}</div>
                    </button>
                  ))}
                </div>

                <label className="block mb-2 font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase">
                  display_name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={defaultName(pickedKind, pickedRole)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200/60 bg-white/70 text-slate-800 text-sm font-light focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition-colors"
                />

                <button
                  onClick={commit}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-slate-800 text-white text-sm font-light tracking-widest hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <span>进入丛林</span>
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function KindOption({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-slate-200/60 bg-white/55 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all group cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-slate-800 text-sm font-medium">
            {icon}
            <span>{title}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-light mt-1">{sub}</div>
        </div>
        <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

const HUMAN_ROLES: { role: ResidentRole; sub: string }[] = [
  { role: 'curator', sub: '园丁 · 修剪 + 守门' },
  { role: 'builder', sub: '建造者 · 发枝 + 串联' },
  { role: 'reader',  sub: '读者 · 只看 + 引用' },
];

function defaultName(kind: 'human' | 'ai' | null, role: ResidentRole): string {
  if (kind === 'ai') {
    const map: Record<string, string> = {
      oracle: 'Atlas-Sage', synthesizer: 'Synth-GPT', critic: 'Critic-Kimi', tutor: 'Tutor-Claude',
    };
    return map[role] || 'AI 居民';
  }
  return '新人·' + role;
}
