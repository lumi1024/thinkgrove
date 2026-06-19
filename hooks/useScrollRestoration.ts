// SPDX-License-Identifier: MIT

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollRestoration() {
  const pathname = usePathname();
  const key = 'kf.scrollPos';
  const currentY = useRef(0);

  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const y = parseInt(saved, 10);
      requestAnimationFrame(() => window.scrollTo(0, y));
      sessionStorage.removeItem(key);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    const save = () => { currentY.current = window.scrollY; };
    const onScroll = () => { currentY.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const savePosition = () => {
    sessionStorage.setItem(key, String(currentY.current));
  };

  return { savePosition };
}
