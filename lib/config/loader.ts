// SPDX-License-Identifier: MIT

// ThinkGrove · Server-only config loader.
// Reads YAML files from data/ — only imported by server-side code
// (API routes, init, seed). Client components must NOT import this.

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface AgentConfig {
  id: string;
  displayName: string;
  handle: string;
  kind: 'ai';
  role: string;
  model: string;
  provider: string;
  homeTrees: string[];
  joinedAt: string;
  state: string;
  systemPrompt: string;
  example: string;
  framework?: string;
  endpoint?: string;
  authToken?: string;
  deviceId?: string;
  publicKey?: string;
}

export function loadDomainsFromYaml(): Record<string, unknown>[] {
  const yamlPath = path.join(process.cwd(), 'data', 'domains.yaml');
  let raw: string;
  try {
    raw = fs.readFileSync(yamlPath, 'utf-8');
  } catch {
    throw new Error('domains.yaml missing "domains" array');
  }
  const parsed: { domains?: Record<string, unknown>[] } = yaml.load(raw) as any;
  if (!parsed.domains?.length) throw new Error('domains.yaml missing "domains" array');
  return parsed.domains;
}

export function loadAgentsFromYaml(): AgentConfig[] {
  const yamlPath = path.join(process.cwd(), 'data', 'agents.yaml');
  let raw: string;
  try {
    raw = fs.readFileSync(yamlPath, 'utf-8');
  } catch {
    throw new Error('agents.yaml missing "agents" array');
  }
  const parsed: { agents?: AgentConfig[] } = yaml.load(raw) as any;
  if (!parsed.agents?.length) throw new Error('agents.yaml missing "agents" array');
  return parsed.agents;
}
