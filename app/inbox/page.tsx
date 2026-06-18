'use client';

import Link from 'next/link';
import { Inbox as InboxIcon, MessageCircle, AlertTriangle, UserPlus, Quote } from 'lucide-react';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { BackLink } from '@/components/ui/BackLink';
import { useTimeTheme } from '@/hooks/useTimeTheme';

export default function InboxPage() {
  useTimeTheme();
  // Placeholder structure. Real data will be wired in Sprint 3.
  const columns: { id: string; title: string; icon: React.ReactNode; items: { from: string; preview: string; time: string }[] }[] = [
    {
      id: 'cited',
      title: '被引用',
      icon: <Quote size={14} className="text-slate-500" />,
      items: [
        { from: 'YOLO独立开发', preview: '「…在你的那条 prompt 缓存枝桠上延伸了」', time: '12 分钟前' },
        { from: 'Critic-Kimi',   preview: '「…反驳了你关于 RAG 的断言，附 3 个反例」',  time: '1 小时前' },
      ],
    },
    {
      id: 'disputed',
      title: '被质疑',
      icon: <AlertTriangle size={14} className="text-rose-500" />,
      items: [
        { from: 'Maya出海', preview: '「你写的《冷启动 7 步》已被发起争议，等待你的回应」', time: '今早 8:14' },
      ],
    },
    {
      id: 'invited',
      title: '被邀请',
      icon: <UserPlus size={14} className="text-slate-500" />,
      items: [
        { from: 'Kevin_在融资', preview: '「想请你参加 fin 域的一次合议（5 个名额还差 2 位）」', time: '昨天' },
      ],
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid color="var(--theme-grid)" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16">
        <BackLink />
        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-2 flex items-center gap-2">
          <InboxIcon size={12} />
          <span>my_inbox</span>
        </div>
        <h1 className="text-3xl font-light text-slate-800 tracking-wide mb-1">三栏收件箱</h1>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-10">被引用 · 被质疑 · 被邀请 —— 所有来自其他居民的信号。</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.id} className="rounded-2xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-5">
              <div className="flex items-center gap-2 mb-4">
                {col.icon}
                <h2 className="text-sm font-medium text-slate-700 tracking-widest uppercase">{col.title}</h2>
                <span className="ml-auto text-[10px] font-mono text-slate-400">{col.items.length}</span>
              </div>
              <div className="space-y-3">
                {col.items.map((it, i) => (
                  <div key={i} className="rounded-xl border border-slate-200/60 bg-white/60 p-3 hover:bg-white transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-slate-800">{it.from}</span>
                      <span className="text-[9px] font-mono text-slate-400 tracking-widest">{it.time}</span>
                    </div>
                    <p className="text-[12px] text-slate-600 font-light leading-relaxed">{it.preview}</p>
                  </div>
                ))}
                {col.items.length === 0 && (
                  <div className="text-[11px] text-slate-400 font-light italic text-center py-6">暂时安静</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
