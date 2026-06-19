// SPDX-License-Identifier: MIT

'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Gavel, Check, X, ShieldCheck, Bot, User as UserIcon, Shield, Users } from 'lucide-react';
import { IdentityChip } from '@/components/IdentityChip';
import { RoleBadge } from '@/components/RoleBadge';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { MarkdownBody } from '@/components/MarkdownBody';
import { Panel } from '@/components/ui/Panel';
import { BackLink } from '@/components/ui/BackLink';
import { DisputeStamp } from '@/components/DisputeStamp';
import { useIdentity, toResident } from '@/hooks/useIdentity';
import { useTimeTheme } from '@/hooks/useTimeTheme';
import { useToast } from '@/components/ui/Toast';
import { aiResidents, humanResidents } from '@/lib/residents';
import { domains as FALLBACK_DOMAINS } from '@/lib/domains';

interface DisputeRecord {
  id: string;
  targetType: 'answer' | 'article';
  targetId: string;
  reason: string;
  status: 'open' | 'ruling' | 'closed';
  rulingSummary: string | null;
  openedAt: string;
  openedBy: string;
  arbitrators: { id: string; displayName: string; kind: 'human' | 'ai'; role: string; state?: string; model?: string; provider?: string }[];
  sustain: number;
  overturn: number;
}

function DisputeContent({ id }: { id: string }) {
  const router = useRouter();
  const { identity, hydrated } = useIdentity();
  const _theme = useTimeTheme();
  const toast = useToast();
  const me = identity ? toResident(identity) : null;

  const [data, setData] = useState<DisputeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [disputeTab, setDisputeTab] = useState<'arbiters' | 'chain'>('arbiters');

  // We don't have a GET /api/dispute/[id] yet — assemble from seed data
  // + vote tally. The "create" endpoint seeds arbitrators; the "vote"
  // endpoint updates the tally. This panel just shows the state.
  useEffect(() => {
    // For prototype: synthesize a stable record from the id.
    // In production this would call /api/dispute/[id] which joins disputes + votes.
    setData(synthesize(id));
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-xs text-slate-400 tracking-widest animate-pulse" style={{ backgroundColor: 'var(--theme-bg)' }}>仲裁加载中…</div>;
  }
  if (!data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-4">404 / 未找到</div>
        <h1 className="text-2xl font-light text-slate-700 tracking-wide mb-6">这份争议记录不存在</h1>
        <BackLink />
      </main>
    );
  }

  const meIsArbitrator = me && data.arbitrators.some((a) => a.id === me.id);
  const meHasVoted = me && (data as any)._myVote != null;
  const totalArbitrators = data.arbitrators.length;

  const submitVote = async (weight: 1 | -1) => {
    if (!me) {
      router.push('/');
      return;
    }
    setVoting(true);
    try {
      const r = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ voterId: me.id, targetId: data.id, weight }),
      });
      if (r.ok) {
        const j = await r.json();
        setData((d) => d ? { ...d, sustain: j.sustain, overturn: j.overturn, status: j.ruling ? 'ruling' : d.status } : d);
        toast.showToast('投票已记录', 'success');
      } else {
        toast.showToast('投票失败，请重试', 'error');
      }
    } catch {
      toast.showToast('网络错误', 'error');
    } finally {
      setVoting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid color="var(--theme-grid)" />
      <div className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-rose-100 blur-[200px] opacity-30 mix-blend-multiply pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-12">
        <BackLink />

        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-2 flex items-center gap-2">
          <Gavel size={12} className="text-rose-500" />
          <span>仲裁面板 / {data.id.slice(0, 8)}</span>
          <span className="ml-2 text-[9px] text-slate-400">发起于 {data.openedAt}</span>
        </div>
        <h1 className="text-3xl font-light text-slate-800 tracking-wide mb-2">
          {data.targetType === 'answer' ? '一段回答' : '一篇文章'} 正在被仲裁
        </h1>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-12 max-w-3xl">{data.reason}</p>

        <div className="space-y-6">
          <Panel title="被争议的原文">
            <div className="relative">
              <div className="absolute -top-2 -right-2 z-10">
                <DisputeStamp size={56} />
              </div>
              <MarkdownBody content={data.reason} className="text-sm text-slate-700 font-light leading-relaxed pr-8" />
              <div className="mt-4 text-[10px] font-mono text-slate-400 tracking-widest uppercase flex items-center gap-2">
                <span>目标:</span>
                <span className="text-slate-600">{data.targetType}/{data.targetId}</span>
              </div>
            </div>
          </Panel>

          <div className="flex items-center gap-1 border-b border-slate-200/60">
            <button
              onClick={() => setDisputeTab('arbiters')}
              className={`px-4 py-2 text-[11px] font-mono tracking-widest uppercase cursor-pointer transition-all ${
                disputeTab === 'arbiters'
                  ? 'border-b-2 border-slate-800 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users size={12} className="inline mr-1.5" />
              仲裁队列 ({data.arbitrators.length})
            </button>
            <button
              onClick={() => setDisputeTab('chain')}
              className={`px-4 py-2 text-[11px] font-mono tracking-widest uppercase cursor-pointer transition-all ${
                disputeTab === 'chain'
                  ? 'border-b-2 border-slate-800 text-slate-800'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Shield size={12} className="inline mr-1.5" />
              争议链
            </button>
          </div>

          {disputeTab === 'arbiters' && (
            <Panel title="仲裁队列 (3+2)">
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase">人类仲裁员</div>
                {data.arbitrators.filter((a) => a.kind === 'human').map((a) => (
                  <ArbitratorRow key={a.id} arb={a} />
                ))}
                <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase mt-3">AI 仲裁员</div>
                {data.arbitrators.filter((a) => a.kind === 'ai').map((a) => (
                  <ArbitratorRow key={a.id} arb={a} />
                ))}
              </div>

              {data.status === 'ruling' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-slate-300 bg-white p-4 text-center mb-4"
                >
                  <ShieldCheck size={20} className="mx-auto mb-2 text-slate-700" />
                  <div className="text-sm font-light text-slate-800 mb-1">{data.rulingSummary || '判决已达成'}</div>
                  <div className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">最终裁决</div>
                </motion.div>
              )}

              {meIsArbitrator && data.status === 'open' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-2">投出你的一票</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => submitVote(1)}
                      disabled={voting}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-light hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Check size={14} /> 维持
                    </button>
                    <button
                      onClick={() => submitVote(-1)}
                      disabled={voting}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-light hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <X size={14} /> 推翻
                    </button>
                  </div>
                </div>
              )}

              {!meIsArbitrator && data.status === 'open' && (
                <div className="text-[11px] text-slate-500 font-light text-center py-3 border-t border-slate-200/60">
                  你不是本次仲裁员。30 天内判决可被翻案。
                </div>
              )}
            </Panel>
          )}

          {disputeTab === 'chain' && (
            <Panel title="争议链">
              <div className="space-y-3 text-sm text-slate-600 font-light">
                <p>· 发起人 <strong className="text-slate-800">{data.openedBy}</strong> 提出：上述内容存在盲点。</p>
                <p>· 当前 <strong className="text-emerald-600">{data.sustain}</strong> 位仲裁员投票"维持"，<strong className="text-rose-500">{data.overturn}</strong> 位"推翻"。</p>
                <p>· 判决阈值：3 票多数。需要 {Math.max(0, 3 - Math.max(data.sustain, data.overturn))} 票。</p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </main>
  );
}

function ArbitratorRow({ arb }: { arb: DisputeRecord['arbitrators'][0] }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        {arb.kind === 'ai' ? <Bot size={11} className="text-sky-500 shrink-0" /> : <UserIcon size={11} className="text-emerald-500 shrink-0" />}
        <span className="text-[12px] text-slate-700 font-medium truncate">{arb.displayName}</span>
        <RoleBadge role={arb.role as any} size="sm" />
      </div>
      <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase shrink-0">v:—</span>
    </div>
  );
}

// Synthesize a stable record for a given id (in lieu of a real GET route).
// Picks 3 humans + 2 AIs deterministically.
function synthesize(id: string): DisputeRecord {
  const seed = Array.from(id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const pickN = <T,>(arr: T[], n: number): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = (seed * (i + 1)) % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  };
  const humans = pickN(humanResidents, 3).map((h) => ({ id: h.id, displayName: h.displayName, kind: h.kind as 'human'|'ai', role: h.role, state: h.state }));
  const ais    = pickN(aiResidents, 2).map((a) => ({ id: a.id, displayName: a.displayName, kind: a.kind as 'human'|'ai', role: a.role, state: a.state, model: a.model, provider: a.provider }));

  return {
    id,
    targetType: 'answer',
    targetId: 'an_' + (seed % 9999).toString(36),
    reason: '原回答"在生产环境跑 3 个月 200w 次调用"这个数据缺乏可重复的 benchmark，且未提供上下文（如业务场景、流量曲线），存在过度泛化的风险。建议补充至少 2 个不同负载下的复现步骤，否则该结论不应被作为引用源。',
    status: 'open',
    rulingSummary: null,
    openedAt: '2026-05-28',
    openedBy: 'usr_yolo',
    arbitrators: [...humans, ...ais],
    sustain: 1,
    overturn: 1,
  };
}

export default function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-xs" style={{ backgroundColor: 'var(--theme-bg)' }}>连接中…</div>}>
      <DisputeContent id={id} />
    </Suspense>
  );
}
