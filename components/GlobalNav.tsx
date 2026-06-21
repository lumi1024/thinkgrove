// SPDX-License-Identifier: MIT

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
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-8 border-b transition-all duration-500 ${
        scrolled
          ? 'h-11 bg-[var(--theme-bg)]/85 backdrop-blur-xl border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
          : 'h-14 bg-transparent border-transparent'
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5 group no-underline">
        <span className={`font-display italic transition-all duration-500 ${scrolled ? 'text-lg text-slate-800' : 'text-xl text-slate-700'}`}>
          ThinkGrove
        </span>
        <span className={`text-[9px] font-mono tracking-[0.2em] uppercase transition-all duration-500 ${scrolled ? 'text-slate-400' : 'text-slate-400/70'}`}>
          协作思想丛林
        </span>
      </Link>

      <div className="flex items-center gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-body font-medium tracking-[0.08em] transition-all cursor-pointer no-underline ${
                active
                  ? 'bg-slate-200/70 text-slate-800'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/40'
              }`}
            >
              <Icon size={12} strokeWidth={1.5} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center">
        {identity?.handle ? (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-200/40 transition-all cursor-pointer"
            >
              <User size={12} strokeWidth={1.5} />
              <span className="hidden md:inline max-w-[80px] truncate">{identity.displayName || identity.handle}</span>
              <ChevronDown size={9} className={`transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200/60">
                  <div className="text-xs text-slate-800 font-medium truncate font-body">{identity.displayName || identity.handle}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">@{identity.handle}</div>
                </div>
                {identity.kind === 'reader' && onSwitchIdentity && (
                  <button onClick={() => { setMenuOpen(false); onSwitchIdentity(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-emerald-600 hover:bg-emerald-50/80 transition-colors cursor-pointer font-body">
                    <User size={12} strokeWidth={1.5} /><span>创建身份</span>
                  </button>
                )}
                {identity.kind !== 'reader' && onSwitchIdentity && (
                  <button onClick={() => { setMenuOpen(false); onSwitchIdentity(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-100/80 transition-colors cursor-pointer font-body">
                    <LogOut size={12} strokeWidth={1.5} /><span>切换身份</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono tracking-widest text-slate-400 hover:text-slate-700 hover:bg-slate-200/40 transition-all cursor-pointer no-underline">
            <User size={12} strokeWidth={1.5} />
            <span className="hidden md:inline">登入</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
