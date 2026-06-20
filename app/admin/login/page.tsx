// SPDX-License-Identifier: MIT

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AdminLoginPage() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ adminKey: key }),
      });
      const json = await r.json();
      if (!r.ok) {
        setError(json.error || '登录失败');
      } else {
        router.push('/admin');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard className="max-w-md w-full p-8">
          <h1 className="text-2xl font-semibold text-slate-800 text-center mb-2">管理员登录</h1>
          <p className="text-slate-500 text-sm text-center mb-8">输入管理员密钥以继续</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && key && !loading && submit()}
              placeholder="输入 ADMIN_KEY"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 transition text-sm"
            />
            <button
              disabled={!key || loading}
              onClick={submit}
              className="w-full py-3 rounded-full bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-400 hover:text-slate-600 text-xs transition">
              返回首页
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
