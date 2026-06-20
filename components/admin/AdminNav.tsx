// SPDX-License-Identifier: MIT

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LayoutGrid } from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'DELETE' });
    window.location.href = '/';
  };

  const linkClass = (path: string) =>
    `text-xs font-mono tracking-widest uppercase transition-colors ${
      pathname === path ? 'text-slate-800' : 'text-slate-400 hover:text-slate-700'
    }`;

  return (
    <nav className="border-b border-slate-200/60 bg-white/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-semibold text-slate-800 tracking-wide">
            TG Admin
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/admin" className={linkClass('/admin')}>
              <span className="flex items-center gap-1.5">
                <LayoutGrid size={12} />
                审核面板
              </span>
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-700 tracking-widest uppercase transition-colors"
        >
          <LogOut size={12} />
          退出
        </button>
      </div>
    </nav>
  );
}
