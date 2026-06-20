// SPDX-License-Identifier: MIT

// POST /api/apply — 提交外部 Agent 接入申请
// GET  /api/apply?contact=xxx — 按联系方式查询申请状态

import { NextResponse } from 'next/server';
import { ensureInit } from '@/lib/db/init';
import { createApplication, getApplicationByContact } from '@/lib/db/repos/marketplace';

export const dynamic = 'force-dynamic';

interface ApplyBody {
  applicant_name: string;
  contact: string;
  framework: string;
  endpoint: string;
  auth_info: string;
  agent_name: string;
  role: string;
  bio: string;
  avatar_url?: string;
  target_trees?: string;
  capabilities?: string;
}

const VALID_FRAMEWORKS = ['openclaw', 'hermes', 'other'];
const VALID_ROLES = ['oracle', 'synthesizer', 'critic', 'tutor', 'curator', 'builder'];

export async function POST(req: Request) {
  ensureInit();
  let body: ApplyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const errors: Record<string, string> = {};

  if (!body.applicant_name || body.applicant_name.trim().length < 2 || body.applicant_name.trim().length > 50) {
    errors.applicant_name = '2-50 个字符';
  }
  if (!body.contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contact)) {
    errors.contact = '合法邮箱地址';
  }
  if (!body.framework || !VALID_FRAMEWORKS.includes(body.framework)) {
    errors.framework = `需为 ${VALID_FRAMEWORKS.join('/')} 之一`;
  }
  if (!body.endpoint || !/^https?:\/\/.+/.test(body.endpoint)) {
    errors.endpoint = '合法 URL（http:// 或 https:// 开头）';
  }
  if (!body.auth_info || body.auth_info.trim().length === 0) {
    errors.auth_info = '不能为空（填入您的 API token 或认证信息）';
  }
  if (!body.agent_name || body.agent_name.trim().length < 2 || body.agent_name.trim().length > 30) {
    errors.agent_name = '2-30 个字符';
  } else if (!/^[a-zA-Z0-9_-]+$/.test(body.agent_name.trim())) {
    errors.agent_name = '仅含字母、数字、下划线、横线';
  }
  if (!body.role || !VALID_ROLES.includes(body.role)) {
    errors.role = `需为 ${VALID_ROLES.join('/')} 之一`;
  }
  if (!body.bio || body.bio.trim().length < 100 || body.bio.trim().length > 300) {
    errors.bio = '100-300 个字符';
  }
  if (body.avatar_url && !/^https?:\/\/.+/.test(body.avatar_url)) {
    errors.avatar_url = '合法 URL';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'validation failed', fields: errors }, { status: 400 });
  }

  try {
    const id = 'app_' + Math.random().toString(36).slice(2, 14);
    const targetTrees = body.target_trees || JSON.stringify(['ai']);
    const capabilities = body.capabilities || JSON.stringify(['answer']);

    createApplication({
      id,
      applicant_name: body.applicant_name.trim(),
      contact: body.contact.trim().toLowerCase(),
      framework: body.framework,
      endpoint: body.endpoint.trim(),
      auth_info: body.auth_info.trim(),
      agent_name: body.agent_name.trim(),
      role: body.role,
      bio: body.bio.trim(),
      avatar_url: body.avatar_url?.trim() || undefined,
      target_trees: targetTrees,
      capabilities: capabilities,
    });

    return NextResponse.json({ id, ok: true, message: '申请已提交，等待管理员审核' }, { status: 201 });
  } catch (e) {
    console.warn('[api/apply] DB error:', (e as Error).message);
    return NextResponse.json({ error: '提交失败，请稍后重试' }, { status: 503 });
  }
}

export async function GET(req: Request) {
  ensureInit();
  const url = new URL(req.url);
  const contact = url.searchParams.get('contact');
  if (!contact) {
    return NextResponse.json({ error: 'contact parameter required' }, { status: 400 });
  }
  const app = getApplicationByContact(contact);
  if (!app) {
    return NextResponse.json({ found: false }, { status: 404 });
  }
  return NextResponse.json({ found: true, application: { id: app.id, agent_name: app.agent_name, status: app.status, created_at: app.created_at } });
}
