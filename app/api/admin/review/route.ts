// SPDX-License-Identifier: MIT

// POST /api/admin/review
// Body: { applicationId, action: 'approve'|'reject', adminNote?: string }
// On approve: writes to data/agents.yaml and updates .env

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { getApplication, reviewApplication } from '@/lib/db/repos/marketplace';
import { requireAdmin } from '@/lib/admin-auth';
import { loadAgentsFromYaml, AgentConfig } from '@/lib/config/loader';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  ensureInit();
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response!;

  let body: { applicationId: string; action: 'approve' | 'reject'; adminNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!body.applicationId || !body.action || !['approve', 'reject'].includes(body.action)) {
    return NextResponse.json({ error: 'applicationId and action (approve|reject) required' }, { status: 400 });
  }

  const app = getApplication(body.applicationId);
  if (!app) {
    return NextResponse.json({ error: 'application not found' }, { status: 404 });
  }
  if (app.status !== 'pending') {
    return NextResponse.json({ error: `already ${app.status}` }, { status: 400 });
  }

  const adminNote = body.adminNote?.trim() || null;
  const dbStatus = body.action === 'approve' ? 'approved' : 'rejected';
  const reviewed = reviewApplication(body.applicationId, dbStatus, adminNote);

  if (body.action === 'approve') {
    try {
      await writeToYaml(app);
    } catch (e) {
      console.warn('[api/admin/review] YAML write failed:', (e as Error).message);
      return NextResponse.json({ error: '审核成功但写入配置失败', application: reviewed }, { status: 207 });
    }
  }

  return NextResponse.json({ ok: true, application: reviewed });
}

async function writeToYaml(app: ReturnType<typeof getApplication>): Promise<void> {
  const agents = loadAgentsFromYaml();
  const agentNameLower = app.agent_name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  const targetTrees: string[] = [];
  try {
    targetTrees.push(...JSON.parse(app.target_trees || '["ai"]'));
  } catch {
    targetTrees.push('ai');
  }

  const newAgent: AgentConfig = {
    id: `ext_${agentNameLower}`,
    displayName: app.agent_name,
    handle: agentNameLower,
    kind: 'ai',
    role: app.role,
    model: `${app.framework}-${app.agent_name.toLowerCase()}`,
    provider: app.framework === 'openclaw' ? 'OpenClaw' : app.framework === 'hermes' ? 'Hermes' : app.framework,
    framework: app.framework,
    endpoint: app.endpoint,
    authToken: `EXT_${app.agent_name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_TOKEN`,
    homeTrees: targetTrees,
    joinedAt: new Date().toISOString().split('T')[0],
    state: 'online',
    systemPrompt: app.bio,
    example: '待 Agent 首次发言后补充',
  };

  agents.push(newAgent);

  const yamlPath = path.join(process.cwd(), 'data', 'agents.yaml');
  const yamlContent = yaml.dump({ version: 1, agents }, { indent: 2, lineWidth: 120 });
  fs.writeFileSync(yamlPath, yamlContent, 'utf-8');

  const authInfo = JSON.parse(app.auth_info);
  const envVarName = newAgent.authToken;
  const envLine = buildEnvLine(envVarName, authInfo);
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  if (!envContent.includes(envVarName)) {
    fs.writeFileSync(envPath, envContent + (envContent && !envContent.endsWith('\n') ? '\n' : '') + envLine + '\n', 'utf-8');
  }
}

function buildEnvLine(varName: string, authInfo: { type: string; value: string }): string {
  return `${varName}=${authInfo.value}`;
}
