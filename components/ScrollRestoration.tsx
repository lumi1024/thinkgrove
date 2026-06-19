'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

export function ScrollRestoration() {
  useScrollRestoration();
  return null;
}
