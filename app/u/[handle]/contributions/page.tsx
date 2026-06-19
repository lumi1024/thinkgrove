// SPDX-License-Identifier: MIT

'use client';

import Link from 'next/link';
import { use, Suspense } from 'react';
import { ArrowLeft, FileText, MessageCircle, GitBranch } from 'lucide-react';
import { useTimeTheme } from '@/hooks/useTimeTheme';

function Content({ handle }: { handle: string }) {
  useTimeTheme();
  // Demo data — placeholder until the API supports it
  const items = [
    { id: 'br_1', type: 'branch',  title: `「${handle} 域里 RAG 的瓶颈在 rerank 阶段」`, date: '2026-05-12', kind: 'question' },
    { id: 'an_1', type: 'answer',  title: '「ranking 阶段比 retrieval 阶段贵 3-5 倍…」',    date: '2026-05-13', kind: 'human' },
    { id: 'ar_1', type: 'article', title: 'Rerank 的 3 个反直觉优化',                       date: '2026-05-15', kind: 'human' },
  ];
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden p-12" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <Link href={`/u/${handle}`} className="flex items-center gap-2 text-[11px] font-mono text-slate-400 hover:text-slate-700 tracking-widest uppercase mb-6">
        <ArrowLeft size={12} /> <span>back_to_profile</span>
      </Link>
      <h1 className="text-3xl font-light text-slate-800 tracking-wide mb-2">@{handle} 的贡献</h1>
      <p className="text-sm text-slate-500 font-light leading-relaxed mb-10">所有发过的枝桠、作过的答、写的文章，按时间倒序。</p>
      <div className="space-y-2 max-w-3xl">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-4 flex items-center gap-3">
            {it.type === 'branch'  && <GitBranch size={14} className="text-slate-400" />}
            {it.type === 'answer'  && <MessageCircle size={14} className="text-slate-400" />}
            {it.type === 'article' && <FileText size={14} className="text-slate-400" />}
            <span className="text-sm text-slate-700 font-light flex-1">{it.title}</span>
            <span className="text-[10px] font-mono text-slate-400 tracking-widest">{it.date}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function ContributionsPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = use(params);
  return <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg)' }} />}><Content handle={handle} /></Suspense>;
}
