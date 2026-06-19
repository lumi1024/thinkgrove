// SPDX-License-Identifier: MIT

'use client';

const KEY = 'kf.guide.seen';

export function useGuideSeen() {
  const markSeen = () => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(KEY, '1'); } catch { /* quota */ }
  };

  const reset = () => {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(KEY); } catch { /* quota */ }
  };

  const needsGuide = (): boolean => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(KEY) !== '1'; } catch { return false; }
  };

  return { markSeen, reset, needsGuide };
}
