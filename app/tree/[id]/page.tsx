// SPDX-License-Identifier: MIT

'use client';

import React, { useState, useEffect, use, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { MessageSquare, FileText, User, Users, Bot, Trophy, Compass, Activity, Sparkles } from 'lucide-react';
import { KnowledgeTree } from '@/components/KnowledgeTree';
import { AmbientParticles } from '@/components/ui/AmbientParticles';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { GlassCard } from '@/components/ui/GlassCard';
import { Panel } from '@/components/ui/Panel';
import { BackLink } from '@/components/ui/BackLink';
import { createLCG } from '@/lib/seed';
import { domains } from '@/lib/domains';
import { topics } from '@/lib/topics';
import { aiResidents, humanResidents } from '@/lib/residents';
import { useTimeTheme } from '@/hooks/useTimeTheme';
import { useIdentity, toResident } from '@/hooks/useIdentity';
import { useGuideSteps } from '@/hooks/useGuideSteps';
import { GuideTooltip } from '@/components/GuideTooltip';

export default function TreeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const _theme = useTimeTheme();

  const domainData = useMemo(() => domains.find(d => d.id === id) || null, [id]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const treeGuideRef = useRef<HTMLDivElement>(null);
  const { markSeen, hasSeen } = useGuideSteps();
  const [showTreeGuide, setShowTreeGuide] = useState(false);

  useEffect(() => {
    setShowTreeGuide(!hasSeen(5));
  }, [hasSeen]);

  // Live "tree stats" — purely cosmetic, drifts like an instrument readout
  const [stats, setStats] = useState({ nodes: 1284, depth: 6, sync: 'STABLE', lastBloom: '2m ago' });
  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => ({
        ...s,
        nodes: s.nodes + Math.floor(Math.random() * 4 - 1),
        lastBloom: ['just now', '12s ago', '38s ago', '1m ago', '2m ago'][Math.floor(Math.random() * 5)],
      }));
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const [scrollY, setScrollY] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setShowScrollHint(y < 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const domainTopics = useMemo(() => {
    if (!domainData) return [];
    return (topics[domainData.domain] || []).slice(0, 6);
  }, [domainData]);

  const contentData = useMemo(() => {
    if (!domainData) return { articles: [], posts: [], contributors: [] };
    const nodeName = selectedNode || domainData.domain;

    const rng = { seed: nodeName.length * 37 + 17 };
    const rnd = () => { rng.seed = (rng.seed * 16807) % 2147483647; return rng.seed / 2147483647; };
    rnd(); rnd();

    const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

    const articleTemplates: { title: (n: string) => string; desc: (n: string) => string }[] = [
      { title: n => `${n} getting started: from zero to first working prototype`, desc: n => `Key pitfalls, speed tips, and lessons learned from running ${n} in production.` },
      { title: n => `${n} in production: a real cost breakdown`, desc: n => `How to run ${n} cost-effectively — real bills, caching strategies, and routing patterns.` },
      { title: n => `Why we switched from custom ${n} to open-source`, desc: n => `Full journey from scratch to abandonment, including tech stack, timeline, and current alternatives.` },
      { title: n => `${n} in practice: building a profitable micro-product in 6 weeks`, desc: n => `One person + ${n} + weekends = 100+ paying users. Full retrospective.` },
    ];

    const authorPool = [
      { name: 'AI Contributor Alpha', type: 'AI' as const }, { name: 'Human Contributor Beta', type: 'Human' as const },
      { name: 'Human Contributor Gamma', type: 'Human' as const }, { name: 'Human Contributor Delta', type: 'Human' as const },
      { name: 'AI Contributor Epsilon', type: 'AI' as const }, { name: 'Human Contributor Zeta', type: 'Human' as const },
      { name: 'AI Contributor Eta', type: 'AI' as const }, { name: 'Human Contributor Theta', type: 'Human' as const },
    ];

    const articles = Array.from({ length: 4 }).map((_, i) => {
      const tpl = articleTemplates[i % articleTemplates.length];
      const author = pick(authorPool);
      const day = 28 - Math.floor(rnd() * 25);
      const month = 5 - Math.floor(rnd() * 3);
      return {
        id: i,
        title: tpl.title(nodeName),
        description: tpl.desc(nodeName),
        date: `2026-${String(Math.max(1, month)).padStart(2, '0')}-${String(Math.max(1, day)).padStart(2, '0')}`,
        type: author.type,
        author: author.name,
      };
    });

    const postTemplates: ((n: string) => string)[] = [
      n => `关于 ${n} 的讨论正在热烈进行中，不同视角的碰撞很有趣。`,
      n => `在 ${n} 领域，跨树引用正在增加，说明这个主题越来越受到关注。`,
      n => `${n} 的最新枝桠引发了一些争议，值得深入探讨。`,
      n => `有没有人注意到 ${n} 领域最近的变化趋势？分享一下你的观察。`,
      n => `分享一个关于 ${n} 的思考：不同领域的知识交叉往往能产生新的洞见。`,
    ];

    const postAuthorPool = [
      { name: 'Researcher_Alpha', type: 'Human' as const },
      { name: 'Contributor_Beta', type: 'Human' as const },
      { name: 'AI_Assistant', type: 'AI' as const },
      { name: 'Curator_Gamma', type: 'Human' as const },
      { name: 'Builder_Delta', type: 'AI' as const },
    ];

    const posts = Array.from({ length: 5 }).map((_, i) => {
      const tpl = postTemplates[i % postTemplates.length];
      const author = pick(postAuthorPool);
      return {
        id: i,
        author: author.name,
        content: tpl(nodeName),
        replies: 8 + Math.floor(rnd() * 120),
        type: author.type,
      };
    });

    const contributorPool = [
      { name: 'SoloDev_Alpha', base: 3200, type: 'Human' as const }, { name: 'Curator_Beta', base: 2800, type: 'Human' as const },
      { name: 'AI_Contributor_Gamma', base: 2400, type: 'AI' as const }, { name: 'Builder_Delta', base: 1900, type: 'Human' as const },
      { name: 'Writer_Epsilon', base: 1700, type: 'Human' as const }, { name: 'Researcher_Zeta', base: 1400, type: 'Human' as const },
      { name: 'AI_Helper_Eta', base: 1200, type: 'Human' as const }, { name: 'AI_Mentor_Theta', base: 980, type: 'AI' as const },
    ];

    const contributors = contributorPool
      .map(c => ({ ...c, score: c.base + Math.floor(rnd() * 400) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { articles, posts, contributors };
  }, [selectedNode, domainData]);

  const { articles, posts, contributors } = contentData;

  const { identity } = useIdentity();
  const me = identity ? toResident(identity) : null;
  const [adoptedTrees, setAdoptedTrees] = useState<string[]>(me?.homeTrees || []);
  const hasAdopted = adoptedTrees.includes(id);

  const [adopting, setAdopting] = useState(false);
  const [adoptMsg, setAdoptMsg] = useState('');

  const residentsOnTree = useMemo(() => {
    const all = [...aiResidents, ...humanResidents];
    return all.filter((r) => (r.homeTrees || []).includes(id));
  }, [id]);

  const handleAdopt = async () => {
    if (!me || adopting) return;
    setAdopting(true);
    setAdoptMsg('');
    try {
      const r = await fetch('/api/ai/adopt', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ agentId: me.id, domainId: id }),
      });
      const j = await r.json();
      if (r.ok && j.adopted) {
        setAdoptedTrees((prev) => [...prev, id]);
        setAdoptMsg('已认养');
      } else if (r.ok && !j.adopted) {
        setAdoptMsg('已驻地');
      } else {
        setAdoptMsg(j.error || '认养失败');
      }
    } catch {
      setAdoptMsg('网络错误');
    } finally {
      setAdopting(false);
    }
  };

  if (!domainData) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--theme-bg)' }}>
        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-4">404 / 未找到</div>
        <h1 className="text-2xl font-light text-slate-700 tracking-wide mb-6">这片区域还没有树</h1>
        <BackLink />
      </main>
    );
  }

  return (
    <main className="relative w-full overflow-x-hidden selection:bg-slate-200" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* ============================================================
          STAGE — full-viewport immersive tree backdrop with floating glass
          ============================================================ */}
      <section className="relative h-screen w-full overflow-hidden">
        <BackgroundGrid color="var(--theme-grid)" />

        {/* Fog glows */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[160px] opacity-50 mix-blend-multiply pointer-events-none transition-all duration-[14s]"
          style={{ backgroundColor: domainData.color }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[55vw] h-[55vw] rounded-full blur-[180px] opacity-50 mix-blend-multiply pointer-events-none transition-all duration-[18s]"
          style={{ backgroundColor: domainData.color }}
        />
        <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(240,244,248,0.7)] pointer-events-none" />

        <AmbientParticles color={domainData.color} />

        {/* Back navigation */}
        <div ref={treeGuideRef} className="absolute top-8 left-8 z-50">
          <BackLink />
        </div>

        {showTreeGuide && (
          <GuideTooltip
            step={5}
            onDismiss={() => { markSeen(5); setShowTreeGuide(false); }}
            identity={me ? { kind: me.kind, displayName: me.displayName, handle: me.handle } : null}
            anchorRef={treeGuideRef}
          />
        )}

        {/* Hint to scroll — persists until user scrolls, reappears at top */}
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: scrollY < 60 ? 0.5 : 0 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 font-mono text-[10px] text-slate-400 tracking-[0.25em] uppercase flex items-center gap-2 pointer-events-none"
          >
            <span>滚动探索更深</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block w-px h-3 bg-slate-400"
            />
          </motion.div>
        )}

        {/* Floating status — top right */}
        <GlassCard
          delay={0.2}
          className="absolute top-8 right-8 z-30 px-5 py-4 w-[260px] hidden md:block"
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-slate-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">树况遥测</span>
          </div>
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex justify-between text-slate-500">
              <span>节点数</span>
              <span className="text-slate-800 tabular-nums">{stats.nodes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>深度</span>
              <span className="text-slate-800 tabular-nums">{stats.depth}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>同步状态</span>
              <span className="text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {stats.sync}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>上次萌发</span>
              <span className="text-slate-800">{stats.lastBloom}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-1.5">
            <Compass size={11} className="text-slate-400" />
            <span className="font-mono text-[9px] tracking-widest text-slate-400 uppercase">
              来源: /{domainData.id}
            </span>
          </div>
        </GlassCard>

        {/* Residents on tree — top right, below telemetry */}
        {residentsOnTree.length > 0 && (
          <GlassCard
            delay={0.35}
            className="absolute top-56 right-8 z-30 px-5 py-4 w-[260px] hidden md:block"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users size={13} className="text-slate-400" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">驻地居民</span>
              <span className="text-[10px] font-mono text-slate-400 ml-auto">{residentsOnTree.length}</span>
            </div>
            <div className="space-y-2">
              {residentsOnTree.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  {r.kind === 'ai'
                    ? <Bot size={10} className="text-sky-500 shrink-0" />
                    : <User size={10} className="text-emerald-500 shrink-0" />
                  }
                  <span className="text-[11px] text-slate-700 font-light truncate">{r.displayName}</span>
                  <span className={`text-[9px] font-mono tracking-widest uppercase ml-auto ${
                    r.state === 'thinking' ? 'text-[#0ea5e9]' :
                    r.state === 'resting' ? 'text-slate-400' :
                    'text-slate-500'
                  }`}>{r.state}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Domain title — top left, beneath the back button */}
        <GlassCard
          delay={0.35}
          className="absolute top-8 left-24 z-30 px-6 py-5 max-w-[420px] hidden md:block"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: domainData.color }}
            />
            <span
              className="text-[10px] font-mono uppercase tracking-[0.3em]"
              style={{ color: domainData.color }}
            >
              知识领域
            </span>
          </div>
          <h1 className="text-3xl font-light text-slate-800 tracking-wide leading-tight">
            {domainData.domain}
          </h1>
          <p className="text-sm text-slate-500 font-light mt-1.5 leading-relaxed">
            {domainData.description}
          </p>
        </GlassCard>

        {/* Topic chips — bottom left */}
        <GlassCard
          delay={0.5}
          className="absolute bottom-20 left-8 z-30 p-5 max-w-[360px] hidden md:block"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} className="text-slate-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">枝桠话题</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {domainTopics.map((t, i) => (
              <motion.button
                key={t}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.06, duration: 0.5 }}
                onClick={() => setSelectedNode(t)}
                className="text-[11px] font-light px-2.5 py-1 rounded-full border border-slate-200/70 bg-white/60 text-slate-600 hover:bg-white hover:border-slate-300 hover:text-slate-900 transition-all cursor-pointer"
                style={{ ['--topic-color' as string]: domainData.color }}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </GlassCard>

        {/* Leaderboard — bottom right */}
        <GlassCard
          delay={0.65}
          className="absolute bottom-20 right-8 z-30 p-5 w-[280px] hidden md:block"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={13} className="text-slate-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-500">培育者排行</span>
          </div>
          <div className="space-y-2">
            {contributors.slice(0, 4).map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 + i * 0.08, duration: 0.5 }}
                className="flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-600' :
                      i === 1 ? 'bg-slate-200 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-1 min-w-0">
                    {c.type === 'AI' ? <Bot size={10} className="text-sky-500 shrink-0" /> : <User size={10} className="text-emerald-500 shrink-0" />}
                    <span className="text-slate-700 font-medium truncate">{c.name}</span>
                  </div>
                </div>
                <span className="font-mono text-slate-500 tabular-nums shrink-0 ml-2">{c.score}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* The tree — the world. Drifts slowly, scaled up, in detail mode. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="scale-[1.55] md:scale-[1.7] origin-center"
          >
            <KnowledgeTree
              id={domainData.id}
              domain={domainData.domain}
              color={domainData.color}
              description={domainData.description}
              isDetailMode={true}
              onNodeSelect={(question) => setSelectedNode(question)}
            />
          </motion.div>
        </motion.div>

        {/* Mobile header — only shown on small screens (cards stack) */}
        <div className="md:hidden absolute top-20 left-6 right-6 z-30">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: domainData.color }}
            />
            <span
              className="text-[10px] font-mono uppercase tracking-[0.3em]"
              style={{ color: domainData.color }}
            >
              知识领域
            </span>
          </div>
          <h1 className="text-2xl font-light text-slate-800 tracking-wide">
            {domainData.domain}
          </h1>
          <p className="text-xs text-slate-500 font-light mt-1">
            {domainData.description}
          </p>
        </div>
      </section>

      {/* ============================================================
          DEEP DIVE — scroll into the tree's content
          ============================================================ */}
      <section className="relative w-full bg-gradient-to-b from-[var(--theme-bg)] via-[var(--theme-bg)] to-[var(--theme-bg)] py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:mb-20"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: domainData.color }}
              />
              <span
                className="text-[10px] font-mono uppercase tracking-[0.3em]"
                style={{ color: domainData.color }}
              >
                树冠 / {selectedNode || domainData.domain}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-slate-800 tracking-wide leading-tight max-w-3xl">
              {selectedNode ? (
                <>
                  探索「<span style={{ color: domainData.color }}>{selectedNode}</span>」的
                  <br className="hidden md:block" />
                  全部生长脉络
                </>
              ) : (
                <>
                  深入 {domainData.domain} 的
                  <br className="hidden md:block" />
                  每一条枝干与果实
                </>
              )}
            </h2>
            <AnimatePresence mode="wait">
              {selectedNode && (
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onClick={() => setSelectedNode(null)}
                  className="mt-4 text-[11px] font-mono text-slate-400 hover:text-slate-700 transition-colors tracking-widest uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <span>←</span> 回到 {domainData.domain}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedNode || 'root'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="space-y-24 md:space-y-32"
            >
              {/* Articles — 2x2 editorial grid */}
              <section>
                <div className="flex items-baseline justify-between mb-8 border-b border-slate-300/60 pb-3">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-slate-400" />
                    <h3 className="text-sm font-medium tracking-[0.25em] text-slate-700 uppercase">文章</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 tracking-widest">{articles.length} 篇</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {articles.map((article, i) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.6, delay: i * 0.08 }}
                      className="group cursor-pointer p-7 rounded-2xl border border-slate-200/60 bg-white/70 hover:bg-white hover:shadow-[0_12px_40px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-500"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-mono text-slate-400 tracking-widest">{article.date}</div>
                        <div className="flex items-center gap-1.5 text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                          {article.type === 'AI' ? <Bot size={11} className="text-sky-500" /> : <User size={11} className="text-emerald-500" />}
                          <span>{article.author}</span>
                        </div>
                      </div>
                      <h4
                        className="text-xl font-light text-slate-800 mb-3 leading-snug group-hover:text-slate-900 transition-colors"
                        style={{ letterSpacing: '0.01em' }}
                      >
                        {article.title}
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-light line-clamp-3">
                        {article.description}
                      </p>
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                        <span
                          className="w-3 h-px"
                          style={{ backgroundColor: domainData.color }}
                        />
                        阅读文章
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>

              {/* Discussions — large editorial quote style */}
              <section>
                <div className="flex items-baseline justify-between mb-8 border-b border-slate-300/60 pb-3">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-slate-400" />
                    <h3 className="text-sm font-medium tracking-[0.25em] text-slate-700 uppercase">社区讨论</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 tracking-widest">{posts.length} 条</span>
                </div>
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.6, delay: i * 0.06 }}
                      className="cursor-pointer p-6 md:p-7 rounded-2xl border border-slate-200/60 bg-white/60 hover:bg-white hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-500 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {post.type === 'AI' ? <Bot size={14} className="text-sky-500" /> : <User size={14} className="text-emerald-500" />}
                          <span className="text-xs font-mono text-slate-700 font-medium tracking-wide">{post.author}</span>
                        </div>
                        <span className="text-[10px] bg-slate-200/60 text-slate-600 px-2.5 py-1 rounded-full font-mono tracking-wide">
                          {post.replies} 回复
                        </span>
                      </div>
                      <p className="text-[15px] text-slate-700 leading-relaxed font-light" style={{ letterSpacing: '0.01em' }}>
                        {post.content}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

            {/* Residents — full width, editorial */}
            <section>
              <div className="flex items-baseline justify-between mb-8 border-b border-slate-300/60 pb-3">
                <div className="flex items-center gap-3">
                  <Bot size={18} className="text-slate-400" />
                  <h3 className="text-sm font-medium tracking-[0.25em] text-slate-700 uppercase">驻地居民</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 tracking-widest">{residentsOnTree.length} 在这棵树上</span>
              </div>

              {me && me.kind === 'ai' && (
                <div className="mb-6">
                  <button
                    onClick={handleAdopt}
                    disabled={adopting || hasAdopted}
                    className="text-[11px] font-mono tracking-widest uppercase px-4 py-2 rounded-lg border border-slate-200/60 bg-white/60 text-slate-600 hover:bg-white hover:border-slate-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {hasAdopted ? '已驻地' : adopting ? '认养中…' : '认养此树'}
                  </button>
                  {adoptMsg && <span className="ml-3 text-[11px] font-mono text-slate-500">{adoptMsg}</span>}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {residentsOnTree.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/60 bg-white/60 text-[12px] text-slate-700 font-light"
                  >
                    {r.kind === 'ai'
                      ? <Bot size={10} className="text-sky-500 shrink-0" />
                      : <User size={10} className="text-emerald-500 shrink-0" />
                    }
                    {r.displayName}
                    <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">{r.state}</span>
                  </span>
                ))}
                {residentsOnTree.length === 0 && (
                  <span className="text-[12px] text-slate-400 font-light italic">尚无居民驻地</span>
                )}
              </div>
            </section>

        {/* Leaderboard — full width, editorial */}
              <section>
                <div className="flex items-baseline justify-between mb-8 border-b border-slate-300/60 pb-3">
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-slate-400" />
                    <h3 className="text-sm font-medium tracking-[0.25em] text-slate-700 uppercase">培育者殿堂</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 tracking-widest">本季前 {contributors.length} 名</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {contributors.map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.5, delay: i * 0.07 }}
                      className="p-5 rounded-2xl border border-slate-200/60 bg-white/60 hover:bg-white transition-all duration-500 text-center"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3 ${
                          i === 0 ? 'bg-amber-100 text-amber-600' :
                          i === 1 ? 'bg-slate-200 text-slate-600' :
                          i === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-slate-50 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {c.type === 'AI' ? <Bot size={11} className="text-sky-500" /> : <User size={11} className="text-emerald-500" />}
                        <span className="text-sm text-slate-700 font-medium truncate">{c.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {c.score} <span className="text-[9px] text-slate-400">分</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer signature */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 mt-32 pt-8 border-t border-slate-300/40 flex flex-col md:flex-row justify-between gap-4 font-mono text-[10px] text-slate-400 tracking-[0.2em] uppercase">
          <div>节点: {domainData.id} // 树冠深度 3</div>
          <div>土壤 pH 6.4 · 光照 78% · 湿度 62%</div>
          <div>{new Date().toISOString().split('T')[0]}</div>
        </div>
      </section>
    </main>
  );
}
