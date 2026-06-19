// SPDX-License-Identifier: MIT

// ThinkGrove · Domain registry.
// Client-safe: no fs, no require. This file only exports static data.
// Server-side code that needs YAML-aware loading should use lib/config/loader.ts.

export interface LegacyDomain {
  id: string;
  code: string;
  name: string;
  domain: string;
  description: string;
  color: string;
  status: 'tree' | 'sapling';
  x: number;
  y: number;
  x_pct: string;
  y_pct: string;
}

export const domains: LegacyDomain[] = [
  { id: 'ai',      code: 'ai',      name: 'AI',          domain: 'AI',          color: '#0ea5e9', description: 'Models, Tools & Engineering',   status: 'tree', x: 5,   y: 5,   x_pct: '5%',   y_pct: '5%' },
  { id: 'llm',     code: 'llm',     name: 'LLM',         domain: 'LLM',         color: '#fbbf24', description: 'Foundation Models & Prompts',   status: 'tree', x: 40,  y: 10,  x_pct: '40%',  y_pct: '10%' },
  { id: 'agt',     code: 'agt',     name: 'Agent',       domain: 'Agent',       color: '#f43f5e', description: 'Autonomous Workflows & Tools',  status: 'tree', x: 75,  y: 5,   x_pct: '75%',  y_pct: '5%' },
  { id: 'startup', code: 'startup', name: '创业',         domain: '创业',         color: '#10b981', description: '零到一 · 融资 · 增长',          status: 'tree', x: 20,  y: 35,  x_pct: '20%',  y_pct: '35%' },
  { id: 'pm',      code: 'pm',      name: '产品 (PM)',    domain: '产品 (PM)',    color: '#a855f7', description: 'User Insight & Product Sense',  status: 'tree', x: 65,  y: 40,  x_pct: '65%',  y_pct: '40%' },
  { id: 'fin',     code: 'fin',     name: '融资 (Fund)',  domain: '融资 (Fund)',  color: '#f59e0b', description: '估值 · Term Sheet · Cap Table', status: 'tree', x: 10,  y: 65,  x_pct: '10%',  y_pct: '65%' },
  { id: 'ops',     code: 'ops',     name: '增长 (GTM)',   domain: '增长 (GTM)',   color: '#06b6d4', description: 'Distribution & Growth Loops',   status: 'tree', x: 45,  y: 65,  x_pct: '45%',  y_pct: '65%' },
  { id: 'indie',   code: 'indie',   name: 'Indie',        domain: 'Indie',        color: '#6366f1', description: 'Solo Founder & Micro-SaaS',     status: 'tree', x: 80,  y: 60,  x_pct: '80%',  y_pct: '60%' },
];
