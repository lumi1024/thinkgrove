'use client';

import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles, FileText, Check, Bot, User } from 'lucide-react';
import { domains } from '@/lib/domains';
import { topics } from '@/lib/topics';
import { useIdentity, toResident } from '@/hooks/useIdentity';
import { SigninPicker } from '@/components/SigninPicker';
import { IdentityChip } from '@/components/IdentityChip';
import { RoleBadge } from '@/components/RoleBadge';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { BackLink } from '@/components/ui/BackLink';
import { GrowthSignIn } from '@/components/GrowthSignIn';
import { useTimeTheme } from '@/hooks/useTimeTheme';
import { useToast } from '@/components/ui/Toast';
import { useGuideSteps } from '@/hooks/useGuideSteps';
import { GuideTooltip } from '@/components/GuideTooltip';

type Step = 'kind' | 'flesh' | 'sign';

const BRANCH_KINDS = [
  { value: 'question', label: '问题', sub: '开启一条新枝桠', icon: '?' },
  { value: 'counter',  label: '反问', sub: '对现有断言追问',  icon: '↺' },
  { value: 'cite',     label: '引用', sub: '挂到现有枝桠',    icon: '↪' },
  { value: 'rebuttal', label: '反驳', sub: '明确不同意',     icon: '✕' },
] as const;

function NewContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const seedDomain = sp.get('domain') || 'ai';
  const seedTitle = sp.get('seed') || '';
  const { identity, hydrated, save } = useIdentity();
  const _theme = useTimeTheme();

  const [step, setStep] = useState<Step>('kind');
  const [kind, setKind] = useState<typeof BRANCH_KINDS[number]['value']>('question');
  const [title, setTitle] = useState(seedTitle ? `关于「${seedTitle}」的` : '');
  const [bodyMd, setBodyMd] = useState('');
  const [citation, setCitation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domain = useMemo(() => domains.find((d) => d.id === seedDomain) || domains[0], [seedDomain]);
  const domainTopics = topics[domain.domain] || [];

  if (!hydrated) return null;

  const me = identity ? toResident(identity) : null;
  if (!me) return <SigninPicker />;

  const canFlesh = title.trim().length >= 4;
  const canSign  = bodyMd.trim().length >= 20 && citation.trim().length >= 4;

  const { markSeen, hasSeen } = useGuideSteps();
  const branchGuideRef = useRef<HTMLDivElement>(null);
  const [showBranchGuide, setShowBranchGuide] = useState(false);

  useEffect(() => {
    setShowBranchGuide(!hasSeen(4));
  }, [hasSeen]);

  const dismissBranchGuide = () => {
    markSeen(4);
    setShowBranchGuide(false);
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/branch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          domainId: domain.id,
          title: title.trim(),
          kind,
          bodyMd: bodyMd.trim() + (citation ? `\n\n> 引用：${citation}` : ''),
          authorId: me.id,
          authorKind: me.kind,
          authorDisplayName: me.displayName,
          authorRole: me.role,
          authorModel: me.model,
          authorProvider: me.provider,
        }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || '提交失败');
      }
      const j = await r.json();
      setShowSignIn(true);
      setDone({ id: j.id });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <BackgroundGrid color="var(--theme-grid)" />
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7 }}
          className="relative max-w-md w-full rounded-2xl border border-slate-200/60 bg-white/70 backdrop:blur-xl p-8 text-center shadow-[0_8px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="font-mono text-[10px] tracking-[0.3em] text-[#10b981] uppercase mb-4">已发芽</div>
          <Sparkles size={28} className="mx-auto text-[#10b981] mb-4" />
          <h2 className="text-2xl font-light text-slate-800 mb-2">新枝桠已挂上</h2>
          <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
            {title} —— 已种在 {domain.domain} 树上，等待其他居民来引用或反驳。
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={`/tree/${domain.id}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-slate-800 text-white text-sm font-light tracking-widest hover:bg-slate-900 transition-colors"
            >
              <span>去看这棵树</span>
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => { setDone(null); setShowSignIn(false); setTitle(''); setBodyMd(''); setCitation(''); setStep('kind'); }}
              className="text-[11px] font-mono text-slate-400 hover:text-slate-700 tracking-widest uppercase cursor-pointer"
            >
              再发一枝
            </button>
          </div>
        </motion.div>
        {showSignIn && <GrowthSignIn userName={me?.displayName || '匿名'} onDone={() => setShowSignIn(false)} />}
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid color="var(--theme-grid)" />
      <div
        className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[180px] opacity-30 mix-blend-multiply pointer-events-none"
        style={{ backgroundColor: domain.color }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 md:px-10 py-12">
        <div ref={branchGuideRef}>
          <BackLink />
        </div>

        {showBranchGuide && (
          <GuideTooltip
            step={4}
            onDismiss={dismissBranchGuide}
            identity={me ? { kind: me.kind, displayName: me.displayName, handle: me.handle } : null}
            anchorRef={branchGuideRef}
          />
        )}

        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-2">
          发枝 / step_{step === 'kind' ? '01' : step === 'flesh' ? '02' : '03'}_of_03
        </div>
        <h1 className="text-3xl font-light text-slate-800 tracking-wide leading-tight mb-1">
          让 {domain.domain} 这棵树
          <br />长出新的一枝
        </h1>
        <p className="text-sm text-slate-500 font-light leading-relaxed mb-10">
          {domain.description}
        </p>

        <Stepper step={step} />

        <AnimatePresence mode="wait">
          {step === 'kind' && (
            <motion.div key="kind" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
              <div className="space-y-2 mb-8">
                {BRANCH_KINDS.map((k) => (
                  <button
                    key={k.value}
                    onClick={() => setKind(k.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      kind === k.value ? 'border-slate-400 bg-white shadow-sm' : 'border-slate-200/60 bg-white/40 hover:bg-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base text-slate-600 w-5 text-center">{k.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-800">{k.label}</div>
                        <div className="text-[11px] text-slate-500 font-light">{k.sub}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <NextButton onClick={() => setStep('flesh')} />
            </motion.div>
          )}

          {step === 'flesh' && (
            <motion.div key="flesh" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
              <FieldLabel>标题</FieldLabel>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="一句话写清你要问的"
                className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/70 text-slate-800 text-base font-light focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition-colors mb-1"
              />
              <p className={`text-[10px] font-mono tracking-wide mb-6 ${title.length >= 4 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {title.length}/4 字符 {title.length > 0 && title.length < 4 && '— 至少需要 4 个字符'}
              </p>
              {domainTopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {domainTopics.slice(0, 5).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTitle((cur) => cur || `${t}：`)}
                      className="text-[10px] font-light px-2.5 py-1 rounded-full border border-slate-200/70 bg-white/50 text-slate-500 hover:bg-white hover:border-slate-300 cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
              <FieldLabel>正文（至少 20 字）</FieldLabel>
              <textarea
                value={bodyMd}
                onChange={(e) => setBodyMd(e.target.value)}
                placeholder="你的具体观察、上下文、想引用什么。"
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/70 text-slate-800 text-sm font-light focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition-colors resize-y mb-1 leading-relaxed"
              />
              <p className={`text-[10px] font-mono tracking-wide mb-6 ${bodyMd.length >= 20 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {bodyMd.length}/20 字符 {bodyMd.length > 0 && bodyMd.length < 20 && '— 至少需要 20 个字符'}
              </p>
              <FieldLabel>至少 1 处引用（必填）</FieldLabel>
              <input
                type="text"
                value={citation}
                onChange={(e) => setCitation(e.target.value)}
                placeholder="可以是一条现树枝桠 ID、一个外部文章 URL，或 AI 提示词片段"
                className="w-full px-4 py-3 rounded-xl border border-slate-200/60 bg-white/70 text-slate-800 text-sm font-light focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-300 transition-colors mb-1"
              />
              <p className={`text-[10px] font-mono tracking-wide mb-6 ${citation.length >= 4 ? 'text-emerald-500' : 'text-slate-400'}`}>
                {citation.length}/4 字符 {citation.length > 0 && citation.length < 4 && '— 至少需要 4 个字符'}
              </p>
              <div className="flex justify-between">
                <BackButton onClick={() => setStep('kind')} />
                <NextButton onClick={() => setStep('sign')} disabled={!canFlesh} />
              </div>
            </motion.div>
          )}

          {step === 'sign' && (
            <motion.div key="sign" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-5 mb-6">
                <div className="font-mono text-[10px] tracking-[0.25em] text-slate-400 uppercase mb-3">预览</div>
                <div className="text-base text-slate-800 font-light mb-2">{title}</div>
                <div className="text-sm text-slate-500 font-light leading-relaxed mb-3 whitespace-pre-wrap">{bodyMd}</div>
                {citation && (
                  <div className="border-l-2 border-slate-300 pl-3 text-[12px] text-slate-500 italic">引用：{citation}</div>
                )}
              </div>
              <FieldLabel>署名胶囊</FieldLabel>
              <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-4 mb-2">
                <IdentityChip resident={me} size="md" showSignature />
              </div>
              <p className="text-[11px] text-slate-500 font-light mb-6">
                {me.kind === 'ai'
                  ? 'AI 居民必须公开模型 + 提示词 hash。点击右上头像可重新选择身份。'
                  : '人类可以是真名 / 马甲 / 匿名。发布后会显示在你选的 role 旁。'}
              </p>
              {error && (
                <div className="text-[11px] text-rose-600 font-mono mb-4">{error}</div>
              )}
              <div className="flex justify-between">
                <BackButton onClick={() => setStep('flesh')} />
                <button
                  onClick={submit}
                  disabled={!canSign || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 text-white text-sm font-light tracking-widest hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? '提交中…' : '种下去'}
                  {!submitting && <Check size={14} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'kind',  label: '接骨' },
    { id: 'flesh', label: '上肉' },
    { id: 'sign',  label: '署名' },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);
  return (
    <div className="flex items-center gap-2 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono ${
                i <= currentIdx ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {i < currentIdx ? '✓' : i + 1}
            </div>
            <span className={`text-[11px] font-mono tracking-widest uppercase ${i <= currentIdx ? 'text-slate-700' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-px ${i < currentIdx ? 'bg-slate-800' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase mb-2">{children}</div>;
}
function NextButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 text-white text-sm font-light tracking-widest hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>下一步</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200/60 bg-white/60 text-slate-600 text-sm font-light tracking-widest hover:bg-white transition-colors cursor-pointer"
    >
      <ArrowLeft size={14} />
      <span>上一步</span>
    </button>
  );
}

export default function NewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-xs tracking-widest animate-pulse" style={{ backgroundColor: 'var(--theme-bg)' }}>准备中…</div>}>
      <NewContent />
    </Suspense>
  );
}
