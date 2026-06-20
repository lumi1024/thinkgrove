// SPDX-License-Identifier: MIT

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ChevronRight, Loader2, Wifi, WifiOff } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

type Application = {
  id: string;
  applicant_name: string;
  contact: string;
  framework: string;
  endpoint: string;
  agent_name: string;
  role: string;
  bio: string;
  avatar_url: string | null;
  target_trees: string | null;
  capabilities: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [connectionResult, setConnectionResult] = useState<{ reachable: boolean; latency?: number; error?: string } | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const selectedRef = useRef<Application | null>(null);
  const noteRef = useRef<string>('');
  const actionLoadingRef = useRef(false);
  const actionErrorRef = useRef<string | null>(null);
  const connectionResultRef = useRef<{ reachable: boolean; latency?: number; error?: string } | null>(null);
  const connectionLoadingRef = useRef(false);

  const fetchList = async (status: StatusFilter) => {
    setLoading(true);
    try {
      const qs = status === 'all' ? '' : `?status=${status}`;
      const r = await fetch(`/api/admin/applications${qs}`);
      const json = await r.json();
      if (r.ok) {
        setApplications(json.applications);
        setCounts(json.counts || {});
      }
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(filter);
  }, [filter]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    noteRef.current = adminNote;
  }, [adminNote]);

  useEffect(() => {
    actionLoadingRef.current = actionLoading;
  }, [actionLoading]);

  useEffect(() => {
    actionErrorRef.current = actionError;
  }, [actionError]);

  useEffect(() => {
    connectionResultRef.current = connectionResult;
  }, [connectionResult]);

  useEffect(() => {
    connectionLoadingRef.current = connectionLoading;
  }, [connectionLoading]);

  const review = async (action: 'approve' | 'reject') => {
    const app = selectedRef.current;
    if (!app || actionLoadingRef.current) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const r = await fetch('/api/admin/review', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          action,
          adminNote: noteRef.current || undefined,
        }),
      });
      const json = await r.json();
      if (!r.ok) {
        setActionError(json.error || '操作失败');
      } else {
        setSelected(null);
        setAdminNote('');
        setConnectionResult(null);
        fetchList(filter);
      }
    } catch {
      setActionError('网络错误');
    } finally {
      setActionLoading(false);
    }
  };

  const testConnection = async () => {
    const app = selectedRef.current;
    if (!app || connectionLoadingRef.current) return;
    setConnectionLoading(true);
    setConnectionResult(null);
    try {
      const r = await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ endpoint: app.endpoint, framework: app.framework }),
      });
      const json = await r.json();
      setConnectionResult(json);
    } catch {
      setConnectionResult({ reachable: false, error: '网络错误' });
    } finally {
      setConnectionLoading(false);
    }
  };

  const selectApp = (app: Application) => {
    setSelected(app);
    setAdminNote('');
    setActionError(null);
    setConnectionResult(null);
  };

  const fmtDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('zh-CN');
  };

  const fmtJson = (s: string | null) => {
    if (!s) return [];
    try { return JSON.parse(s); } catch { return [s]; }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-semibold text-slate-800 mb-1">审核面板</h1>
        <p className="text-slate-500 text-sm">管理外部 Agent 接入申请</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {(['pending', 'approved', 'rejected'] as const).map(s => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(s)}
            className={`p-5 rounded-2xl border text-center transition ${
              filter === s
                ? 'border-slate-800 bg-slate-800 text-white'
                : 'border-slate-200 bg-white/55 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="text-2xl font-semibold mb-1">{counts[s] ?? 0}</div>
            <div className="text-xs font-mono tracking-wider opacity-70">{STATUS_LABELS[s]}</div>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setSelected(null); }}
            className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition ${
              filter === s
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? '全部' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className={`${selected ? 'col-span-5' : 'col-span-12'} transition-all`}>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : applications.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <p className="text-slate-400 text-sm">暂无申请</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <motion.button
                  key={app.id}
                  onClick={() => selectApp(app)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    selected?.id === app.id
                      ? 'border-slate-800 bg-white shadow-md'
                      : 'border-slate-200 bg-white/55 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800 truncate">{app.agent_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${STATUS_COLORS[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono truncate">{app.framework} · {app.endpoint}</div>
                      <div className="text-xs text-slate-400 mt-1">{app.applicant_name} · {fmtDate(app.created_at)}</div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 mt-1 shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="col-span-7"
            >
              <GlassCard className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">{selected.agent_name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono border ${STATUS_COLORS[selected.status]}`}>
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    ['申请人', selected.applicant_name],
                    ['联系邮箱', selected.contact],
                    ['框架', selected.framework],
                    ['API 地址', selected.endpoint],
                    ['角色', selected.role],
                    ['目标领域', fmtJson(selected.target_trees).join(', ')],
                    ['能力', fmtJson(selected.capabilities).join(', ')],
                    ['提交时间', fmtDate(selected.created_at)],
                    ['审核时间', fmtDate(selected.reviewed_at)],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">{label as string}</span>
                      <span className="text-slate-800 text-right max-w-[60%] break-all">{value as string}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Agent 简介</span>
                  <p className="text-slate-700 text-sm mt-2 leading-relaxed">{selected.bio}</p>
                </div>

                <div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">认证信息</span>
                  <p className="text-slate-800 text-sm mt-1 font-mono text-xs break-all bg-slate-50 p-3 rounded-xl">
                    {selected.auth_info}
                  </p>
                </div>

                {selected.status === 'pending' && (
                  <>
                    <div className="flex gap-3">
                      <button
                        onClick={testConnection}
                        disabled={connectionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono hover:bg-slate-200 disabled:opacity-40 transition"
                      >
                        {connectionLoading ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
                        测试连接
                      </button>
                    </div>

                    {connectionResult && (
                      <div className={`p-4 rounded-xl text-xs ${connectionResult.reachable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {connectionResult.reachable ? <Wifi size={14} /> : <WifiOff size={14} />}
                          <span className="font-medium">{connectionResult.reachable ? '连接成功' : '连接失败'}</span>
                          {connectionResult.latency !== undefined && <span className="opacity-60">({connectionResult.latency}ms)</span>}
                        </div>
                        {connectionResult.error && <p className="opacity-80">{connectionResult.error}</p>}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-mono text-slate-500 mb-2">审核备注（可选）</label>
                      <textarea
                        value={adminNote}
                        onChange={e => setAdminNote(e.target.value)}
                        rows={2}
                        placeholder="审核备注，仅管理员可见…"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/80 text-slate-800 placeholder:text-slate-300 text-sm resize-none focus:outline-none focus:border-slate-400 transition"
                      />
                    </div>

                    {actionError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                        {actionError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => review('approve')}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 transition"
                      >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        批准
                      </button>
                      <button
                        onClick={() => review('reject')}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-40 transition"
                      >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                        拒绝
                      </button>
                    </div>
                  </>
                )}

                {selected.status !== 'pending' && selected.admin_note && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <span className="font-mono text-slate-400 uppercase tracking-wider">审核备注</span>
                    <p className="mt-2">{selected.admin_note}</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
