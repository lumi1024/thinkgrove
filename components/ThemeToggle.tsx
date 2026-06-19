// SPDX-License-Identifier: MIT

'use client';

import { useState, useEffect } from 'react';
import { useTimeTheme } from '@/hooks/useTimeTheme';

const THEMES: { key: 'dawn' | 'day' | 'dusk' | 'night'; icon: string; label: string }[] = [
  { key: 'dawn', icon: '🌅', label: '晨' },
  { key: 'day',  icon: '☀️', label: '昼' },
  { key: 'dusk', icon: '🌇', label: '昏' },
  { key: 'night',icon: '🌙', label: '夜' },
];

export function ThemeToggle() {
  const { override, setOverride } = useTimeTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const current = override;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-1 rounded-full border border-slate-200/60 bg-white/70 backdrop-blur-md px-1.5 py-1 shadow-lg">
      {THEMES.map((t) => {
        const active = mounted && current === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setOverride(current === t.key ? null : t.key)}
            title={t.label}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
              active
                ? 'bg-slate-800 text-white shadow-md scale-110'
                : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            {t.icon}
          </button>
        );
      })}
      {mounted && current && (
        <button
          onClick={() => setOverride(null)}
          className="ml-1 text-[9px] font-mono text-slate-400 hover:text-slate-600 tracking-widest uppercase cursor-pointer"
          title="恢复自动"
        >
          AUTO
        </button>
      )}
    </div>
  );
}
