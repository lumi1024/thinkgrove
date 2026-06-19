// SPDX-License-Identifier: MIT

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Resident, ResidentKind, ResidentRole, ResidentState } from '@/lib/residents';

// ThinkGrove · Identity hook.
// Primary: cookie-based session (/api/auth/session).
// Fallback: localStorage (offline / no-server mode).

const STORAGE_KEY = 'kf.identity.v1';

export interface StoredIdentity {
  id: string;
  kind: ResidentKind;
  handle: string;
  displayName: string;
  role: ResidentRole;
  state: ResidentState;
  model?: string;
  provider?: string;
  joinedAt: string;
}

const VALID_ROLES: ResidentRole[] = ['oracle', 'synthesizer', 'critic', 'tutor', 'curator', 'builder', 'reader'];

function isValid(v: unknown): v is StoredIdentity {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.handle === 'string' &&
    typeof o.displayName === 'string' &&
    typeof o.joinedAt === 'string' &&
    ['human', 'ai'].includes(o.kind as string) &&
    VALID_ROLES.includes(o.role as ResidentRole) &&
    ['online', 'thinking', 'resting'].includes(o.state as string)
  );
}

function readStorage(): StoredIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(identity: StoredIdentity | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (identity) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* quota / private mode — fail silently */ }
}

export function useIdentity() {
  const [identity, setIdentity] = useState<StoredIdentity | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      // 1. Try cookie session first.
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIdentity({
              id: data.user.id,
              kind: data.user.kind,
              handle: data.user.handle,
              displayName: data.user.displayName,
              role: data.user.role,
              state: data.user.state || 'online',
              joinedAt: new Date().toISOString().split('T')[0],
            });
            setHydrated(true);
            return;
          }
        }
      } catch { /* server unavailable — fall through to localStorage */ }

      // 2. Fallback to localStorage.
      const stored = readStorage();
      if (!cancelled) {
        setIdentity(stored);
        setHydrated(true);
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, []);

  const save = useCallback((next: StoredIdentity) => {
    writeStorage(next);
    setIdentity(next);
  }, []);

  const clear = useCallback(() => {
    writeStorage(null);
    setIdentity(null);
    fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
  }, []);

  return { identity, hydrated, save, clear };
}

export function toResident(id: StoredIdentity): Resident {
  return {
    id: id.id,
    handle: id.handle,
    displayName: id.displayName,
    kind: id.kind,
    role: id.role,
    state: id.state,
    homeTrees: [],
    joinedAt: id.joinedAt,
    model: id.model,
    provider: id.provider,
  };
}
