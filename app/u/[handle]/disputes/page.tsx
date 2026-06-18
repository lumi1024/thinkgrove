'use client';

import Link from 'next/link';
import { use, Suspense } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useTimeTheme } from '@/hooks/useTimeTheme';

function Content({ handle }: { handle: string }) {
  useTimeTheme();
  const items = [
    { id: 'dp_demo_1', reason: `针对 ${handle} 在「prompt 缓存的 3 个反直觉」一文中的关键断言发起质疑`, status: 'open',   date: '2026-05-22' },
    { id: 'dp_demo_2', reason: `对 ${handle} 关于 RAG 评估的回答发起争议`,                            status: 'ruling', date: '2026-05-10' },
  ];
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden p-12" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <Link href={`/u/${handle}`} className="flex items-center gap-2 text-[11px] font-mono text-slate-400 hover:text-slate-700 tracking-widest uppercase mb-6">
        <ArrowLeft size={12} /> <span>back_to_profile</span>
      </Link>
      <h1 className="text-3xl font-light text-slate-800 tracking-wide mb-2">@{handle} 参与的争议</h1>
      <p className="text-sm text-slate-500 font-light leading-relaxed mb-10">所有发起过 / 被卷入的 Dispute。</p>
      <div className="space-y-2 max-w-3xl">
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/disputes/${it.id}`}
            className="block rounded-xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-4 hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={12} className="text-rose-500" />
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">{it.status}</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400 tracking-widest">{it.date}</span>
            </div>
            <p className="text-sm text-slate-700 font-light">{it.reason}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default function DisputesSubPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  return <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg)' }} />}><Content handle={handle} /></Suspense>;
}
