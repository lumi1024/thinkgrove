'use client';

import React, { useEffect, useState } from 'react';
import { Inbox as InboxIcon, Quote, Gavel, UserPlus } from 'lucide-react';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { BackLink } from '@/components/ui/BackLink';
import { DisputeCard } from '@/components/DisputeCard';
import { useIdentity } from '@/hooks/useIdentity';
import { useTimeTheme } from '@/hooks/useTimeTheme';

export default function InboxPage() {
  const _theme = useTimeTheme();
  const { identity } = useIdentity();
  const [cited, setCited] = useState<any[]>([]);
  const [disputed, setDisputed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await fetch('/api/inbox', {
          headers: { 'x-user-id': identity?.id || '' },
        });
        if (res.ok) {
          const data = await res.json();
          setCited(data.cited || []);
          setDisputed(data.disputed || []);
        }
      } catch {
        // leave empty — silent fallback
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [identity?.id]);

  const columns = [
    {
      id: 'cited',
      title: '被引用',
      icon: <Quote size={14} className="text-slate-500" />,
      items: cited,
    },
    {
      id: 'disputed',
      title: '被质疑',
      icon: <Gavel size={14} className="text-rose-500" />,
      items: disputed,
    },
    {
      id: 'invited',
      title: '被邀请',
      icon: <UserPlus size={14} className="text-slate-500" />,
      items: [],
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid color="var(--theme-grid)" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16">
        <BackLink />
        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-2 flex items-center gap-2">
          <InboxIcon size={12} />
          <span>我的收件箱</span>
        </div>
        <h1 className="text-3xl font-light text-slate-800 tracking-wide mb-1">三栏收件箱</h1>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-10">被引用 · 被质疑 · 被邀请 —— 所有来自其他居民的信号。</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map(col => (
              <div key={col.id} className="rounded-2xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-5 animate-pulse">
                <div className="h-4 w-16 bg-slate-200/60 rounded mb-4" />
                <div className="space-y-3">
                  <div className="h-16 bg-slate-200/40 rounded-xl" />
                  <div className="h-16 bg-slate-200/40 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div key={col.id} className="rounded-2xl border border-slate-200/60 bg-white/55 backdrop-blur-md p-5">
                <div className="flex items-center gap-2 mb-4">
                  {col.icon}
                  <h2 className="text-sm font-medium text-slate-700 tracking-widest uppercase">{col.title}</h2>
                  <span className="ml-auto text-[10px] font-mono text-slate-400">{col.items.length}</span>
                </div>
                <div className="space-y-3">
                  {col.items.length === 0 ? (
                    <div className="text-[11px] text-slate-400 font-light italic text-center py-6">暂时安静</div>
                  ) : col.id === 'disputed'
                    ? col.items.map((it: any) => (
                        <DisputeCard
                          key={it.id}
                          id={it.id}
                          reason={it.reason}
                          status={it.status}
                          openedAt={it.openedAt}
                          arbitrators={[]}
                        />
                      ))
                    : col.items.map((it, i) => (
                        <div key={i} className="rounded-xl border border-slate-200/60 bg-white/60 p-3 hover:bg-white transition-colors cursor-pointer">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[12px] font-medium text-slate-800">{it.fromType || '居民'}</span>
                            <span className="text-[9px] font-mono text-slate-400 tracking-widest">{it.createdAt || ''}</span>
                          </div>
                          <p className="text-[12px] text-slate-600 font-light leading-relaxed">
                            {it.relation === 'adopted' ? '采用了你的枝桠' : `引用了你的 ${it.toType}`}
                          </p>
                        </div>
                      ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
