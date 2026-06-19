// SPDX-License-Identifier: MIT

'use client';

import React, { useMemo, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, FileText, User, Bot, Trophy } from 'lucide-react';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { BackLink } from '@/components/ui/BackLink';
import { createLCG } from '@/lib/seed';
import { useTimeTheme } from '@/hooks/useTimeTheme';

function GraphContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const question = searchParams.get('q') || '知识网络的原初节点';
  const color = searchParams.get('color') || '#0ea5e9';
  const _theme = useTimeTheme();
  const [hoveredNode, setHoveredNode] = useState<{id: string, label: string, desc: string, x: number, y: number, root?: boolean} | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const graphData = useMemo(() => {
    const random = createLCG(question.charCodeAt(0) + 12345);

    const concepts = ['上下文压缩', 'Token成本', '多步推理', '工具路由', '冷启动', '留存漏斗', 'API限流', 'Prompt注入', '私有化部署', '缓存命中', '评估集', '人工接管'];

    // Core node
    const nodes: any[] = [
      { id: 'core', root: true, kind: 'question' as const, label: question, desc: '起始探索', x: 0, y: 0, radius: 40 }
    ];

    const numNodes = 12;
    const edges: any[] = [];

    // primary nodes around core
    const shell1 = 6;
    for (let i = 0; i < shell1; i++) {
        const angle = (Math.PI * 2 / shell1) * i + random() * 0.5;
        const dist = 180 + random() * 60;
        const id = `node-1-${i}`;
        nodes.push({
            id, root: false,
            kind: (['human', 'ai', 'external'] as const)[i % 3],
            label: concepts[Math.floor(random() * concepts.length)],
            desc: '一级关联：直接上下游',
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            radius: 20
        });
        const rel = (['adopted', 'cite', 'cite', 'rewrite', 'dispute'] as const)[i % 5];
        edges.push({ source: 'core', target: id, type: 'primary', relation: rel });
    }

    // secondary nodes
    const shell2 = numNodes - shell1;
    for (let i = 0; i < shell2; i++) {
        const parentId = `node-1-${Math.floor(random() * shell1)}`;
        const parent = nodes.find(n => n.id === parentId)!;
        const angle = Math.atan2(parent.y, parent.x) + (random() - 0.5) * 1.5;
        const dist = 150 + random() * 50;
        const id = `node-2-${i}`;
        nodes.push({
            id, root: false,
            kind: (['human', 'ai', 'external', 'human'] as const)[i % 4],
            label: concepts[Math.floor(random() * concepts.length)],
            desc: '二级延伸：实战踩坑点',
            x: parent.x + Math.cos(angle) * dist,
            y: parent.y + Math.sin(angle) * dist,
            radius: 12
        });
        edges.push({ source: parentId, target: id, type: 'secondary', relation: 'cite' as const });
    }

    // Interconnect some nodes
    for (let i=0; i<4; i++) {
        const a = nodes[1 + Math.floor(random() * (nodes.length-1))].id;
        const b = nodes[1 + Math.floor(random() * (nodes.length-1))].id;
        if (a !== b) edges.push({ source: a, target: b, type: 'tertiary', relation: 'cite' as const });
    }

    // Predetermine animation delays and durations to avoid Math.random in render
    const particleAnimations = edges.map(() => ({
      duration: 3 + random() * 2,
      delay: random() * 2
    }));

    return { nodes, edges, particleAnimations };
  }, [question]);

  const contentData = useMemo(() => {
    const nodeName = selectedNode || question;

    // stable seeded random based on selectedNode
    const rng = { seed: nodeName.length * 53 + 7 };
    const rnd = () => { rng.seed = (rng.seed * 16807) % 2147483647; return rng.seed / 2147483647; };
    rnd(); rnd(); // warm up

    const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

    const articleTemplates: { title: (n: string) => string; desc: (n: string) => string }[] = [
      {
        title: n => `${n} 深度拆解：从一个真实项目的代码说起`,
        desc: n => `附完整可运行 demo。${n} 在我们生产环境跑 3 个月、累计调用 120w 次后的真实数据、踩坑和调优记录。`,
      },
      {
        title: n => `把 ${n} 用对：一份给独立开发者的速查清单`,
        desc: n => `覆盖选型、prompt 模板、缓存、监控、回滚。这 12 条经验能帮你少走 80% 的弯路，建议收藏。`,
      },
      {
        title: n => `${n} 进阶：大多数人都忽略的 3 个底层细节`,
        desc: n => `从原理到工程实践。理解了这些，你对 ${n} 的掌控力会直接提升一个量级，文章最后附 benchmark。`,
      },
      {
        title: n => `${n} 选型对照：5 个主流方案的真实使用感受`,
        desc: n => `不堆参数，只说体验。我们把 5 个常见 ${n} 方案各跑了两周，最后留下了 2 个、放弃了 3 个，原因都在文里。`,
      },
    ];

    const authorPool = [
      { name: 'GPT-Mind', type: 'AI' as const },
      { name: '前大厂P7现solo', type: 'Human' as const },
      { name: 'Atlas_W', type: 'Human' as const },
      { name: 'Claude-Opus', type: 'AI' as const },
      { name: '小宇宙AI', type: 'AI' as const },
      { name: '陈一鸣', type: 'Human' as const },
      { name: 'YOLO独立开发', type: 'Human' as const },
      { name: 'Maya出海', type: 'Human' as const },
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
      n => `线上跑 ${n} 的朋友们，监控告警你们是怎么搭的？我们最近一次 token 异常飙了 3 倍，第二天才发现，心态崩了。`,
      n => `关于 ${n} 我有一个不太成熟的猜想：未来 6 个月，单纯「用 ${n}」的护城河会迅速消失，真正值钱的是「场景数据 + 反馈闭环」。同意吗？`,
      n => `${n} 落地 3 个月复盘：最大的认知转变是——别再问「AI 能做什么」，要问「用户在哪一步需要 AI」。完全两套产品思路。`,
      n => `请教：用 ${n} 做内容生成型产品，UGC 反哺训练数据这条路，国内合规上走得通吗？有没有踩过坑的兄弟分享下。`,
      n => `${n} 让我的小产品从 $800 MRR 涨到 $5.2k MRR，只改了一个细节：把「AI 自动回复」改成了「AI 草稿 + 人工一键发」。CTR 直接翻 2.4 倍。`,
    ];

    const postAuthorPool = [
      { name: '凌晨三点的独立开发', type: 'Human' as const },
      { name: 'Echo做产品', type: 'Human' as const },
      { name: 'DeepSeek-V3', type: 'AI' as const },
      { name: 'Kevin_在融资', type: 'Human' as const },
      { name: 'Sam_2号位', type: 'Human' as const },
    ];

    const posts = Array.from({ length: 5 }).map((_, i) => {
      const tpl = postTemplates[i % postTemplates.length];
      const author = pick(postAuthorPool);
      return {
        id: i,
        author: author.name,
        content: tpl(nodeName),
        replies: 12 + Math.floor(rnd() * 150),
        type: author.type,
      };
    });

    const contributorPool = [
      { name: 'YOLO独立开发', base: 3400, type: 'Human' as const },
      { name: 'GPT-Mind', base: 2950, type: 'AI' as const },
      { name: 'Kevin_在融资', base: 2600, type: 'Human' as const },
      { name: '深蓝PM', base: 2100, type: 'Human' as const },
      { name: 'Maya出海', base: 1850, type: 'Human' as const },
      { name: 'Lucas增长笔记', base: 1500, type: 'Human' as const },
      { name: 'Atlas_W', base: 1280, type: 'Human' as const },
      { name: 'Claude-Opus', base: 1100, type: 'AI' as const },
    ];

    const contributors = contributorPool
      .map(c => ({ ...c, score: c.base + Math.floor(rnd() * 400) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { articles, posts, contributors };
  }, [selectedNode, question]);

  const { articles, posts, contributors } = contentData;

  return (
    <main className="relative min-h-screen w-full overflow-hidden selection:bg-slate-200" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid size={100} color="var(--theme-grid)" />
      <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full blur-[200px] opacity-40 mix-blend-multiply pointer-events-none transition-all duration-[10s]" style={{ backgroundColor: color }} />

      <BackLink />

      <div className="relative z-10 w-full h-screen flex flex-col md:flex-row">
        {/* Left Side: Graph */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center justify-center">
          <div className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none origin-center scale-[0.6] sm:scale-80 md:scale-80 lg:scale-100 transition-transform">
             <svg className="overflow-visible pointer-events-auto" style={{ transform: 'translate(-50%, -50%)' }} width="1200" height="1200" viewBox="-600 -600 1200 1200">
               <g>
                  {/* Edges */}
                  {graphData.edges.map((edge, i) => {
                      const s = graphData.nodes.find(n => n.id === edge.source)!;
                      const t = graphData.nodes.find(n => n.id === edge.target)!;
                      const opacity = edge.type === 'primary' ? 0.4 : edge.type === 'secondary' ? 0.2 : 0.1;
                      const strokeWidth = edge.type === 'primary' ? 2 : edge.type === 'secondary' ? 1.5 : 1;
                      // 4-class edge coloring per COMMUNITY_DESIGN.md §4.4
                      const edgeColor =
                        edge.relation === 'dispute' ? '#ef4444' :
                        edge.relation === 'rewrite' ? '#f59e0b' :
                        edge.relation === 'cite'    ? '#94a3b8' :
                                                     '#64748b'; // adopted (default)
                      const dashArray =
                        edge.relation === 'cite'    ? '4 6' :
                        edge.relation === 'dispute' ? '2 4' :
                                                     undefined;

                      return (
                          <motion.line
                            key={`edge-${i}`}
                            x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                            stroke={edgeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dashArray}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity }}
                            transition={{ duration: 2, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                          />
                      )
                  })}

                  {/* Linking Particles */}
                  {graphData.edges.map((edge, i) => {
                      const s = graphData.nodes.find(n => n.id === edge.source)!;
                      const t = graphData.nodes.find(n => n.id === edge.target)!;
                      const anim = graphData.particleAnimations[i];
                      if (edge.type === 'tertiary') return null;
                      const particleColor =
                        edge.relation === 'dispute' ? '#ef4444' :
                        edge.relation === 'rewrite' ? '#f59e0b' :
                                                     color;
                      return (
                          <motion.circle
                            key={`particle-${i}`}
                            r={2}
                            fill={particleColor}
                            initial={{ x: s.x, y: s.y, opacity: 0 }}
                            animate={{ x: [s.x, t.x], y: [s.y, t.y], opacity: [0, 1, 0] }}
                            transition={{ duration: anim.duration, repeat: Infinity, delay: anim.delay }}
                            style={{ filter: `drop-shadow(0 0 6px ${particleColor})` }}
                          />
                      );
                  })}

                  {/* Nodes */}
                  {graphData.nodes.map((node, i) => {
                      const isHovered = hoveredNode?.id === node.id;
                      const isSelected = selectedNode === node.label || (!selectedNode && node.root);
                      
                      return (
                          <g key={`node-${node.id}`} 
                             onMouseEnter={() => setHoveredNode(node)}
                             onMouseLeave={() => setHoveredNode(null)}
                             onClick={() => setSelectedNode(node.label)}
                             className="cursor-pointer group"
                          >
                              <motion.circle
                                cx={node.x} cy={node.y}
                                r={node.radius + (isHovered || isSelected ? 4 : 0)}
                                fill={node.root ? color : (isSelected ? color : '#fff')}
                                stroke={node.root ? 'transparent' : color}
                                strokeWidth={1}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, delay: 1 + i * 0.1 }}
                                style={{ filter: node.root || isSelected ? `drop-shadow(0 0 20px ${color})` : `drop-shadow(0 0 10px rgba(255,255,255,1))` }}
                              />
                              {node.root && (
                                  <motion.circle
                                    cx={node.x} cy={node.y}
                                    r={node.radius * 1.5}
                                    fill="transparent"
                                    stroke={color}
                                    strokeWidth={1}
                                    strokeDasharray="4 8"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                                  />
                              )}
                              {!node.root && (
                                <text
                                  x={node.x}
                                  y={node.y + node.radius + 20}
                                  textAnchor="middle"
                                  className={`text-[10px] md:text-xs font-medium font-mono tracking-widest pointer-events-none transition-colors ${isSelected ? 'fill-slate-900' : 'fill-slate-700'}`}
                                  style={{ opacity: 0 }}
                                >
                                    {node.label}
                                    <animate attributeName="opacity" values="0;1" dur="2s" begin={`${1 + i * 0.1}s`} fill="freeze" />
                                </text>
                              )}
                              {/* Node kind prefix — COMMUNITY_DESIGN.md §4.4 */}
                              {!node.root && (
                                <text
                                  x={node.x - node.radius - 4}
                                  y={node.y - node.radius - 4}
                                  textAnchor="end"
                                  className="text-[8px] font-mono pointer-events-none"
                                  fill="#94a3b8"
                                >
                                  {node.kind === 'ai' ? '{M}' : node.kind === 'human' ? '{A}' : node.kind === 'external' ? '{E}' : '{Q}'}
                                </text>
                              )}
                              {node.root && (
                                  <foreignObject x={node.x - 150} y={node.y - 40} width="300" height="80">
                                      <div className="w-full h-full flex items-center justify-center text-center px-4">
                                          <p className="text-white font-medium text-sm md:text-base leading-relaxed tracking-wider drop-shadow-md">
                                              {node.label}
                                          </p>
                                      </div>
                                  </foreignObject>
                              )}
                          </g>
                      );
                  })}
               </g>
             </svg>
          </div>

          <AnimatePresence>
              {hoveredNode && !hoveredNode.root && (
                <motion.div
                  key="hovered-node-tooltip"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute z-20 pointer-events-none origin-center scale-[0.6] sm:scale-[0.8] md:scale-[0.8] lg:scale-100 transition-transform"
                  style={{
                    left: `calc(50vw + ${hoveredNode.x}px)`,
                    top: `calc(50vh + ${hoveredNode.y - 80}px)`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="w-[180px] p-4 rounded-xl border border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    <div className="text-sm text-slate-800 font-medium mb-1">
                      {hoveredNode.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                      {hoveredNode.desc}
                    </div>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
          
          <div className="absolute bottom-6 left-10 font-mono text-[10px] text-slate-400 tracking-[0.2em] pointer-events-none">
              KNOWLEDGE GRAPH // DEEP DIVE<br/>
              <span style={{ color }}>ORIGIN_QUERY: OK</span>
          </div>

          {/* 4-class edge legend — COMMUNITY_DESIGN.md §4.4 */}
          <div className="absolute bottom-6 right-6 font-mono text-[9px] text-slate-400 tracking-[0.2em] uppercase space-y-1 pointer-events-none">
            <LegendItem color="#64748b" label="adopted (实线)" />
            <LegendItem color="#94a3b8" label="cite (虚线)" dash="4 6" />
            <LegendItem color="#ef4444" label="dispute (红)" dash="2 4" />
            <LegendItem color="#f59e0b" label="rewrite (金)" />
            <div className="pt-1 text-slate-500">
              <span className="mr-1">{'{A}'}</span>人
              <span className="mx-1">{'{M}'}</span>AI
              <span className="mx-1">{'{Q}'}</span>问
              <span className="mx-1">{'{E}'}</span>外
            </div>
          </div>
        </div>

        {/* Right Side: Content Panel */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-white/50 backdrop-blur-xl border-l border-slate-200/50 p-8 md:p-12 overflow-y-auto">
          <div className="max-w-xl mx-auto pt-16 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-light text-slate-800 mb-2">
                {selectedNode ? selectedNode : question}
              </h2>
              <p className="text-sm font-mono text-slate-400 mb-12 uppercase tracking-widest" style={{ color }}>
                图谱节点解析
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNode || 'root'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                {/* Articles Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
                    <FileText size={18} className="text-slate-400" />
                    <h3 className="text-sm font-medium tracking-widest text-slate-600 uppercase">Related Articles</h3>
                  </div>
                  <div className="space-y-4">
                    {articles.map(article => (
                      <div key={article.id} className="group cursor-pointer p-4 rounded-xl border border-slate-200/50 bg-white/60 hover:bg-white hover:shadow-sm transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs text-slate-400 font-mono">{article.date}</div>
                          <div className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {article.type === 'AI' ? <Bot size={12} className="text-sky-500" /> : <User size={12} className="text-emerald-500" />}
                            <span>{article.author}</span>
                          </div>
                        </div>
                        <h4 className="text-slate-800 font-medium mb-1 group-hover:text-amber-600 transition-colors">{article.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{article.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Discussions Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
                    <MessageSquare size={18} className="text-slate-400" />
                    <h3 className="text-sm font-medium tracking-widest text-slate-600 uppercase">Community Discussions</h3>
                  </div>
                  <div className="space-y-4">
                    {posts.map(post => (
                      <div key={post.id} className="cursor-pointer p-4 rounded-xl border border-slate-200/50 bg-slate-50/50 hover:bg-white hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-1.5">
                            {post.type === 'AI' ? <Bot size={14} className="text-sky-500" /> : <User size={14} className="text-emerald-500" />}
                            <span className="text-xs font-mono text-slate-600 font-medium">{post.author}</span>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{post.replies} replies</span>
                        </div>
                        <p className="text-sm text-slate-700">{post.content}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Leaderboard Section */}
                <section>
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-2">
                    <Trophy size={18} className="text-slate-400" />
                    <h3 className="text-sm font-medium tracking-widest text-slate-600 uppercase">Top Contributors</h3>
                  </div>
                  <div className="space-y-3">
                    {contributors.map((contributor, i) => (
                      <div key={contributor.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white/40 hover:bg-white/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? 'bg-amber-100 text-amber-600' :
                            i === 1 ? 'bg-slate-200 text-slate-600' :
                            i === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-slate-50 text-slate-400 border border-slate-200'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {contributor.type === 'AI' ? <Bot size={14} className="text-sky-500" /> : <User size={14} className="text-emerald-500" />}
                            <span className="text-sm text-slate-700 font-medium">{contributor.name}</span>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          {contributor.score} <span className="text-[10px] text-slate-400">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function LegendItem({ color, label, dash }: { color: string; label: string; dash?: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg width="16" height="4" className="overflow-visible">
        <line x1="0" y1="2" x2="16" y2="2" stroke={color} strokeWidth="2" strokeDasharray={dash} />
      </svg>
      <span>{label}</span>
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-400 font-mono text-xs tracking-widest" style={{ backgroundColor: 'var(--theme-bg)' }}>CONNECTING NEURAL PATHWAYS...</div>}>
      <GraphContent />
    </Suspense>
  )
}
