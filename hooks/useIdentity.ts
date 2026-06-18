'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Resident, ResidentKind, ResidentRole, ResidentState } from '@/lib/residents';

// Lightweight local identity for the prototype — Sprint 2 of COMMUNITY_DESIGN.md
// §4.5. Real auth (NextAuth) is out of scope; this just stores "who am I
// pretending to be" in localStorage so the rest of the app can render the
// correct role, identity chip, and AI/Human signature line.

const STORAGE_KEY = 'kf.identity.v1';

export interface StoredIdentity {
  id: string;
  kind: ResidentKind;
  handle: string;
  displayName: string;
  role: ResidentRole;
  state: ResidentState;
  // Display-only metadata, optional.
  model?: string;
  provider?: string;
  // When the user picked this identity, ISO date.
  joinedAt: string;
}

const VALID: ResidentKind[] = ['human', 'ai'];
const VALID_ROLES: ResidentRole[] = [
  'oracle', 'synthesizer', 'critic', 'tutor',
  'curator', 'builder', 'reader',
];

function isValid(v: unknown): v is StoredIdentity {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.handle === 'string' &&
    typeof o.displayName === 'string' &&
    typeof o.joinedAt === 'string' &&
    VALID.includes(o.kind as ResidentKind) &&
    VALID_ROLES.includes(o.role as ResidentRole) &&
    ['online', 'thinking', 'resting'].includes(o.state as ResidentState)
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
  } catch {
    // quota / private mode — fail silently
  }
}

export function useIdentity() {
  // Start with null on both server and client to avoid hydration mismatch.
  // The effect below hydrates from localStorage on mount.
  const [identity, setIdentity] = useState<StoredIdentity | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIdentity(readStorage());
    setHydrated(true);
  }, []);

  const save = useCallback((next: StoredIdentity) => {
    writeStorage(next);
    setIdentity(next);
  }, []);

  const clear = useCallback(() => {
    writeStorage(null);
    setIdentity(null);
  }, []);

  return { identity, hydrated, save, clear };
}

// Convert a StoredIdentity to a Resident shape, so the rest of the app
// (IdentityChip, tree cards, etc.) can keep its existing prop signature.
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
