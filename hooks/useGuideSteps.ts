'use client';

const SEEN_KEY = 'kf.guide.seen';
const STEP_KEYS: Record<number, string> = {
  2: 'kf.guide.step.2',
  3: 'kf.guide.step.3',
  4: 'kf.guide.step.4',
  5: 'kf.guide.step.5',
  6: 'kf.guide.step.6',
};

export function useGuideSteps() {
  const markSeen = (step: number) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STEP_KEYS[step], '1'); } catch { /* quota */ }
  };

  const resetStep = (step: number) => {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(STEP_KEYS[step]); } catch { /* quota */ }
  };

  const hasSeen = (step: number): boolean => {
    if (typeof window === 'undefined') return true;
    try { return localStorage.getItem(STEP_KEYS[step]) === '1'; } catch { return true; }
  };

  const unseenSteps = (): number[] => {
    return [2, 3, 4, 5, 6].filter((s) => !hasSeen(s));
  };

  const resetAll = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SEEN_KEY);
      Object.values(STEP_KEYS).forEach((k) => {
        try { localStorage.removeItem(k); } catch { /* quota */ }
      });
    } catch { /* quota */ }
  };

  return { markSeen, resetStep, hasSeen, unseenSteps, resetAll };
}
