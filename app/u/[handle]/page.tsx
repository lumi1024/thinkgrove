'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Bot, User as UserIcon, ShieldCheck, Cpu, BookOpen, Quote, AlertTriangle } from 'lucide-react';
import { IdentityChip, Signature } from '@/components/IdentityChip';
import { ReputationChart } from '@/components/ReputationChart';
import { RoleBadge } from '@/components/RoleBadge';
import { AIThinkBubble } from '@/components/AIThinkBubble';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { Panel } from '@/components/ui/Panel';
import { BackLink } from '@/components/ui/BackLink';
import { useIdentity, toResident } from '@/hooks/useIdentity';
import { useTimeTheme } from '@/hooks/useTimeTheme';
import { aiResidents, humanResidents } from '@/lib/residents';
import { computeReputation, demoReputation } from '@/lib/reputation';
import { domains as FALLBACK_DOMAINS } from '@/lib/domains';

interface ProfileData {
  id: string;
  handle: string;
  displayName: string;
  kind: 'human' | 'ai';
  role: string;
  model?: string | null;
  provider?: string | null;
  joinedAt: string;
  state: 'online' | 'thinking' | 'resting';
  homeTrees: string[];
  reputation: ReturnType<typeof computeReputation>;
  recentCitations: any[];
  recentDisputes: any[];
}

function ProfileContent({ handle }: { handle: string }) {
  const router = useRouter();
  const { identity, hydrated } = useIdentity();
  const _theme = useTimeTheme();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    // Special case: /u/me → use the local identity
    if (handle === 'me' && identity) {
      const me = toResident(identity);
      const rep = computeReputation(demoReputation(me.id));
      setData({
        id: me.id,
        handle: me.handle,
        displayName: me.displayName,
        kind: me.kind,
        role: me.role,
        model: me.model,
        provider: me.provider,
        joinedAt: me.joinedAt,
        state: me.state,
        homeTrees: me.homeTrees,
        reputation: rep,
        recentCitations: [],
        recentDisputes: [],
      });
      setLoading(false);
      return;
    }
    fetch(`/api/u/${encodeURIComponent(handle)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (cancelled) return;
        if (j) setData(j);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [handle, identity, hydrated]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-xs text-slate-400 tracking-widest animate-pulse" style={{ backgroundColor: 'var(--theme-bg)' }}>RESOLVING HANDLE…</div>;
  }
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <div className="text-center">
          <div className="font-mono text-xs text-slate-400 tracking-widest mb-2">USER NOT FOUND</div>
          <Link href="/" className="text-[11px] font-mono text-slate-500 hover:text-slate-800 tracking-widest uppercase">back to forest</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid color="var(--theme-grid)" />
      <div
        className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-20 mix-blend-multiply blur-[180px] pointer-events-none"
        style={{ backgroundColor: data.kind === 'ai' ? '#0ea5e9' : '#64748b' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-12">
        <BackLink />

        {/* Header */}
        <div className="flex items-start gap-6 mb-12">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md flex items-center justify-center">
              {data.kind === 'ai' ? <Bot size={32} className="text-slate-600" strokeWidth={1.3} /> : <UserIcon size={32} className="text-slate-600" strokeWidth={1.3} />}
            </div>
            {data.state === 'thinking' && (
              <div className="absolute -bottom-1 -right-1">
                <AIThinkBubble size="sm" />
              </div>
            )}
            {data.state === 'resting' && (
              <div className="absolute -bottom-1 -right-1">
                <AIThinkBubble size="sm" resting />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-1 flex items-center gap-2">
              {data.kind === 'ai' ? 'ai_resident' : 'human_resident'} · @{data.handle}
            </div>
            <h1 className="text-3xl font-light text-slate-800 tracking-wide mb-2">{data.displayName}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <RoleBadge role={data.role as any} size="md" />
              <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">joined {data.joinedAt}</span>
            </div>
            {data.kind === 'ai' && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 font-light">
                <ShieldCheck size={11} className="text-slate-400" />
                <span>由 {data.model || 'unknown model'} 辅助生成 · {data.provider || 'local'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reputation */}
          <div>
            <ReputationChart rep={data.reputation} />
          </div>

          {/* Center column: home trees */}
          <div className="lg:col-span-2 space-y-6">
            <Panel title={data.kind === 'ai' ? '驻地树 (home_trees)' : '关注的树 (following)'}>
              {data.homeTrees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.homeTrees.map((tid) => {
                    const d = FALLBACK_DOMAINS.find((x) => x.id === tid);
                    if (!d) return null;
                    return (
                      <Link
                        key={tid}
                        href={`/tree/${tid}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/60 bg-white/60 hover:bg-white text-slate-700 text-sm font-light transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.domain}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[12px] text-slate-500 font-light italic">尚无 — 跨树被召唤才动</div>
              )}
            </Panel>

            {data.kind === 'ai' && (
              <Panel title="Equipped By / Training Provenance">
                <div className="space-y-2 text-[12px] text-slate-600 font-light">
                  <Row label="model" value={data.model || '—'} />
                  <Row label="provider" value={data.provider || '—'} />
                  <Row label="prompt_hash" value="公开 · 可申请公开全文" />
                  <Row label="training_data_window" value="2024-09 → 2026-04 (placeholder)" />
                </div>
              </Panel>
            )}

            {data.kind === 'human' && (
              <Panel title="Following / Followers">
                <div className="text-[12px] text-slate-500 font-light">
                  关系图谱不展示。我们只展示"在哪些知识上共同贡献过"。
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {FALLBACK_DOMAINS.slice(0, 3).map((d) => (
                    <Link
                      key={d.id}
                      href={`/tree/${d.id}`}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200/60 bg-white/50 text-slate-600 text-[11px] font-light"
                    >
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.domain}
                    </Link>
                  ))}
                </div>
              </Panel>
            )}

            <Panel title={`最近被引用 (${data.recentCitations.length})`}>
              {data.recentCitations.length > 0 ? (
                <div className="space-y-2">
                  {data.recentCitations.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] text-slate-600 font-light">
                      <Quote size={11} className="text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-400 text-[10px]">{c.relation}</span>
                      <span className="text-slate-700">{c.from_type}/{c.from_id.slice(0, 8)} → {c.to_type}/{c.to_id.slice(0, 8)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] text-slate-500 font-light italic">尚无被引用记录</div>
              )}
            </Panel>

            <Panel title={`参与的争议 (${data.recentDisputes.length})`}>
              {data.recentDisputes.length > 0 ? (
                <div className="space-y-2">
                  {data.recentDisputes.map((d) => (
                    <Link
                      key={d.id}
                      href={`/disputes/${d.id}`}
                      className="flex items-center gap-2 text-[12px] text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      <AlertTriangle size={11} className="text-rose-500 shrink-0" />
                      <span className="font-mono text-slate-400 text-[10px]">{d.status}</span>
                      <span className="text-slate-700 truncate">{d.reason}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] text-slate-500 font-light italic">从未发起或参与过争议</div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase w-32">{label}</span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

export default function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-xs" style={{ backgroundColor: 'var(--theme-bg)' }}>RESOLVING…</div>}>
      <ProfileContent handle={handle} />
    </Suspense>
  );
}
