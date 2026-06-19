// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';

// ── hoistable mock factory ───────────────────────────────────────────────────
let _readFileSync = (_path: string, _enc: string) => {
  // real fs - fallback (not used in error tests)
  throw new Error('should be overridden');
};

vi.mock('fs', () => ({
  readFileSync: (...args: any[]) => _readFileSync(...args),
}));

describe('loadDomainsFromYaml — error paths', () => {
  it('throws when domains.yaml does not exist', async () => {
    _readFileSync = () => { throw new Error('ENOENT: no such file or directory'); };
    vi.resetModules();
    const { loadDomainsFromYaml } = await import('@/lib/config/loader');
    expect(() => loadDomainsFromYaml()).toThrow('domains.yaml missing "domains" array');
  });
});

describe('loadAgentsFromYaml — error paths', () => {
  it('throws when agents.yaml does not exist', async () => {
    _readFileSync = () => { throw new Error('ENOENT: no such file or directory'); };
    vi.resetModules();
    const { loadAgentsFromYaml } = await import('@/lib/config/loader');
    expect(() => loadAgentsFromYaml()).toThrow('agents.yaml missing "agents" array');
  });
});
