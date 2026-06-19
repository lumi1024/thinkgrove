'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sprout, Inbox, FileText, BookOpen, User, LogOut, ChevronDown, GitBranch } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '主林', icon: Sprout },
  { href: '/inbox', label: '收件箱', icon: Inbox },
  { href: '/new', label: '发枝', icon: FileText },
  { href: '/guide', label: '指引', icon: BookOpen },
  { href: '/graph', label: '图谱', icon: GitBranch },
];

export function GlobalNav({ identity, onSwitchIdentity }: { identity?: { handle?: string; displayName?: string; kind?: string } | null; onSwitchIdentity?: () => void }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-12 flex items-center justify-between px-4 md:px-6 border-b border-slate-200/40 bg-[var(--theme-bg)]/80 backdrop-blur-md">
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-widest uppercase transition-all cursor-pointer ${
                active
                  ? 'bg-slate-200/60 text-slate-800'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
              }`}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {identity?.handle ? (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-widest uppercase text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 transition-all cursor-pointer"
            >
              <User size={12} />
              <span className="hidden md:inline max-w-[80px] truncate">{identity.displayName || identity.handle}</span>
              <ChevronDown size={10} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200/60">
                  <div className="text-xs text-slate-800 font-medium truncate">{identity.displayName || identity.handle}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">@{identity.handle}</div>
                </div>
                {identity.kind === 'reader' && onSwitchIdentity && (
                  <button
                    onClick={() => { setMenuOpen(false); onSwitchIdentity(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-emerald-600 hover:bg-emerald-50/80 transition-colors cursor-pointer"
                  >
                    <User size={12} />
                    <span>创建身份</span>
                  </button>
                )}
                {identity.kind !== 'reader' && onSwitchIdentity && (
                  <button
                    onClick={() => { setMenuOpen(false); onSwitchIdentity(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <LogOut size={12} />
                    <span>切换身份</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/"
            onClick={() => {/* SigninPicker auto-shows on first visit */}}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono tracking-widest uppercase text-slate-400 hover:text-slate-700 hover:bg-slate-100/60 transition-all cursor-pointer"
          >
            <User size={12} />
            <span className="hidden md:inline">登入</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
