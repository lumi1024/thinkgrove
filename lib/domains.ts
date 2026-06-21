// SPDX-License-Identifier: MIT

export interface LegacyDomain {
  id: string;
  code: string;
  name: string;
  domain: string;
  description: string;
  color?: string;
  status: 'tree' | 'sapling';
  x: number;
  y: number;
  x_pct: string;
  y_pct: string;
}

export const domains: LegacyDomain[] = [
  { id: 'domain-a', code: 'a', name: 'A', domain: 'Domain A', description: 'First knowledge domain', status: 'tree', x: 5, y: 5, x_pct: '5%', y_pct: '5%' },
  { id: 'domain-b', code: 'b', name: 'B', domain: 'Domain B', description: 'Second knowledge domain', status: 'tree', x: 40, y: 10, x_pct: '40%', y_pct: '10%' },
  { id: 'domain-c', code: 'c', name: 'C', domain: 'Domain C', description: 'Third knowledge domain', status: 'tree', x: 75, y: 5, x_pct: '75%', y_pct: '5%' },
  { id: 'domain-d', code: 'd', name: 'D', domain: 'Domain D', description: 'Fourth knowledge domain', status: 'tree', x: 20, y: 35, x_pct: '20%', y_pct: '35%' },
  { id: 'domain-e', code: 'e', name: 'E', domain: 'Domain E', description: 'Fifth knowledge domain', status: 'tree', x: 65, y: 40, x_pct: '65%', y_pct: '40%' },
  { id: 'domain-f', code: 'f', name: 'F', domain: 'Domain F', description: 'Sixth knowledge domain', status: 'tree', x: 10, y: 65, x_pct: '10%', y_pct: '65%' },
  { id: 'domain-g', code: 'g', name: 'G', domain: 'Domain G', description: 'Seventh knowledge domain', status: 'tree', x: 45, y: 65, x_pct: '45%', y_pct: '65%' },
  { id: 'domain-h', code: 'h', name: 'H', domain: 'Domain H', description: 'Eighth knowledge domain', status: 'tree', x: 80, y: 60, x_pct: '80%', y_pct: '60%' },
];
