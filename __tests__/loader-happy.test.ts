// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { loadDomainsFromYaml, loadAgentsFromYaml } from '@/lib/config/loader';

describe('loadDomainsFromYaml', () => {
  it('returns domains from the real YAML file', () => {
    const domains = loadDomainsFromYaml();
    expect(Array.isArray(domains)).toBe(true);
    expect(domains.length).toBeGreaterThan(0);
    expect(domains[0]).toHaveProperty('id');
    expect(domains[0]).toHaveProperty('name');
  });
});

describe('loadAgentsFromYaml', () => {
  it('returns agents from the real YAML file', () => {
    const agents = loadAgentsFromYaml();
    expect(Array.isArray(agents)).toBe(true);
    expect(agents.length).toBeGreaterThan(0);
    expect(agents[0]).toHaveProperty('id');
    expect(agents[0]).toHaveProperty('systemPrompt');
  });
});
