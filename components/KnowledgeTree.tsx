// SPDX-License-Identifier: MIT

'use client';
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createLCG } from '@/lib/seed';
import { topics } from '@/lib/topics';
import { aiResidents, humanResidents } from '@/lib/residents';

// Shape of a real branch from the database / API.
// Optional here so that callers can pass an empty list and the tree
// gracefully falls back to the seed-derived rendering.
export interface RealBranch {
  id: string;
  title: string;
  authorName?: string;
  authorKind?: 'human' | 'ai';
  isNew?: boolean;
}

interface TreeProps {
  domain: string;
  color?: string;
  description: string;
  id: string;
  delay?: number;
  isDetailMode?: boolean;
  onNodeSelect?: (question: string) => void;
  realBranches?: RealBranch[];
  disableBranchCreator?: boolean;
  domainSlug?: string;
  restingResidents?: string[];
  sproutDomainId?: string;
}


export function KnowledgeTree({ domain, color, description, id, delay = 0, isDetailMode = false, onNodeSelect, realBranches, disableBranchCreator, domainSlug, restingResidents, sproutDomainId }: TreeProps) {
  const treeColor = color || '#10b981';
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [activeNode, setActiveNode] = useState<{x: number, y: number, type: string, id: string, label?: string} | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, { id: string, text: string, angle: number }[]>>({});

  // Use a fixed random seed essentially or just memoize so it doesn't change on re-render,
  // but we want stable rendering across SSR/Client or just rely on client-side mounting if we use motion well.
  // To avoid hydration mismatch with Math.random, we can use a simple seeded random or just build it deterministically.
  const treeData = useMemo(() => {
    const random = createLCG(Array.from(domain).reduce((acc, char) => acc + char.charCodeAt(0), 0) + 12345);
    const round = (n: number) => Math.round(n * 100) / 100;

    // If we have real branches, walk only the leaves (no recursion deeper)
    // and assign one real branch title per leaf, in spatial order. This keeps
    // the existing geometry while swapping the source of leaf labels.
    const realLeaves = realBranches && realBranches.length > 0 ? realBranches : null;

    const generateSeededTree = (depth: number, maxDepth: number, x: number, y: number, angle: number, size: number, idPrefix: string, leafIndex: { i: number }): any[] => {
      if (depth > maxDepth) return [];

      const childrenCount = depth === 0 ? (random() > 0.5 ? 3 : 2) : (random() > 0.4 ? 2 : 1);
      const children = [];

      for (let i = 0; i < childrenCount; i++) {
        const spreadMultiplier = depth === 0 ? 2 : 1.2;
        const angleOffset = (random() - 0.5) * spreadMultiplier;
        const newAngle = angle + angleOffset;
        const branchLength = size * (0.6 + random() * 0.5);

        const cx = round(x + Math.cos(angle) * (branchLength * 0.5));
        const cy = round(y + Math.sin(angle) * (branchLength * 0.5));

        const nx = round(x + Math.cos(newAngle) * branchLength);
        const ny = round(y + Math.sin(newAngle) * branchLength);

        const childId = `${idPrefix}-${i}`;
        const type = depth === maxDepth ? (random() > 0.7 ? 'fruit' : 'leaf') : 'branch';

        // Label source: real branch title if available, otherwise topics[].
        let label: string | undefined;
        let authorName: string | undefined;
        let authorKind: 'human' | 'ai' | undefined;
        if (type !== 'branch') {
          if (realLeaves) {
            const real = realLeaves[leafIndex.i % realLeaves.length];
            label = real.title;
            authorName = real.authorName;
            authorKind = real.authorKind;
            leafIndex.i += 1;
          } else {
            label = topics[domain]?.[Math.floor(random() * (topics[domain]?.length || 0))] || '核心节点';
          }
        }

        const childNodes = generateSeededTree(depth + 1, maxDepth, nx, ny, newAngle, branchLength * 0.85, childId, leafIndex);

        children.push({
          id: childId,
          x: nx, y: ny,
          cx, cy,
          px: round(x), py: round(y), // parent x, y
          type,
          label,
          authorName,
          authorKind,
          angle: newAngle,
          children: childNodes
        });
      }
      return children;
    };

    return generateSeededTree(0, 3, 200, 350, -Math.PI / 2, 70, id, { i: 0 });
  }, [domain, id, realBranches]);

  const restingNames = useMemo(() => {
    if (!restingResidents?.length) return new Set<string>();
    const all = [...aiResidents, ...humanResidents];
    return new Set(all.filter((r) => restingResidents.includes(r.id)).map((r) => r.displayName));
  }, [restingResidents]);

  const isRestingLeaf = (node: any) => restingNames.has(node.authorName || '');

  const handleNodeClick = (node: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'branch') return;

    if (onNodeSelect) {
      onNodeSelect(node.label || domain);
    }

    if (expandedNodes[node.id]) {
      const next = { ...expandedNodes };
      delete next[node.id];
      setExpandedNodes(next);
    } else {
      const label = node.label || '此节点';
      const qTemplates = [
        `${label} 的核心局限与突破点是什么？`,
        `${label} 会如何改变未来的社会形态？`,
        `${label} 的底层逻辑与数学本质`,
        `当 ${label} 与其他学科交叉时会发生什么？`,
        `${label} 的代表性生态应用是什么？`
      ];
      
      let qs: string[] = [];
      if (node.label === 'Domain A') {
         qs = ['这个领域的核心问题是什么？', '有哪些关键概念需要理解？', '最常见的误解有哪些？'];
      } else {
         const rng = createLCG(node.id.charCodeAt(node.id.length-1) + 123);
         qs = qTemplates.sort(() => rng() - 0.5).slice(0, 3);
      }

      const newNodes = qs.map((qText, i) => {
        const spread = qs.length === 1 ? 0 : (i - (qs.length - 1) / 2) * 0.8;
        return {
          id: `${node.id}-q-${i}`,
          text: qText,
          angle: node.angle + spread,
        }
      });
      setExpandedNodes({ ...expandedNodes, [node.id]: newNodes });
    }
  };

  const renderBranches = (nodes: any[], depth: number) => {
    return nodes.map((node) => {
      return (
        <g key={`branch-${node.id}`}>
          {/* Branch Path */}
          <motion.path
            d={`M ${node.px} ${node.py} Q ${node.cx} ${node.cy} ${node.x} ${node.y}`}
            fill="transparent"
            stroke={treeColor}
            strokeWidth={Math.max(0.5, 4 - depth * 1.2)}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: isHovered || isDetailMode ? 0.8 : 0.3 }}
            transition={{ 
              duration: 1 + depth * 0.3, 
              ease: "easeOut",
              delay: delay + depth * 0.15
            }}
            style={{
              filter: isHovered || isDetailMode ? `drop-shadow(0 0 8px ${treeColor})` : 'none',
              transition: 'filter 1s ease'
            }}
          />

          {/* Node Point */}
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={node.type === 'fruit' ? 4 : (node.type === 'leaf' ? 2 : 1.5)}
            fill={node.type === 'fruit' ? '#fff' : color}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: (isHovered || isDetailMode) && node.type !== 'branch' ? 1.5 : 1,
              opacity: (isHovered || isDetailMode) ? 1 : (node.type === 'branch' ? 0.3 : isRestingLeaf(node) ? 0.3 : 0.6)
            }}
            transition={{
              duration: 0.6,
              delay: delay + depth * 0.15 + (1 + depth * 0.3) * 0.5
            }}
            style={{
              filter: `drop-shadow(0 0 6px ${treeColor})`,
              pointerEvents: 'none'
            }}
          />

          {/* Sprout glow for newly created branches */}
          {node.type !== 'branch' && node.label && sproutDomainId === id && (
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="14"
              fill="none"
              stroke={treeColor}
              strokeWidth="1.5"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.7, 0], scale: [0.5, 1.8, 2.5] }}
              transition={{ duration: 2.5, repeat: 3, ease: 'easeOut' }}
              style={{ pointerEvents: 'none' }}
            />
          )}
          
          {/* Label for node */}
          <AnimatePresence>
            {(isHovered || isDetailMode) && node.type !== 'branch' && (
              <motion.text
                key={`label-${node.id}`}
                initial={{ opacity: 0, x: node.x + 2 }}
                animate={{ opacity: 1, x: node.x + 6 }}
                exit={{ opacity: 0, x: node.x + 2 }}
                y={node.y + 2.5}
                fontSize="6"
                fill="#fff"
                className="font-medium pointer-events-none"
                style={{ textShadow: `0 1px 3px rgba(0,0,0,0.8), 0 2px 6px ${treeColor}` }}
              >
                {node.label || 'Node'}
              </motion.text>
            )}
          </AnimatePresence>

          {/* Invisible Hit Area for Leaves/Fruits */}
          {node.type !== 'branch' && (
            <circle
              cx={node.x} cy={node.y} r={15} fill="transparent"
              className="cursor-pointer pointer-events-auto"
              onClick={(e) => handleNodeClick(node, e)}
            />
          )}

          {/* Render Questions (sub-nodes) */}
          <AnimatePresence>
            {!!expandedNodes[node.id] && expandedNodes[node.id].map((q) => {
              const qx = node.x + Math.cos(q.angle) * 70;
              const qy = node.y + Math.sin(q.angle) * 70;
              const cx = node.x + Math.cos(node.angle) * 35;
              const cy = node.y + Math.sin(node.angle) * 35;
              
              return (
                <g key={q.id}>
                  <motion.path
                    d={`M ${node.x} ${node.y} Q ${cx} ${cy} ${qx} ${qy}`}
                    fill="transparent"
                    stroke={treeColor}
                    strokeWidth={0.8}
                    strokeDasharray="2 4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.circle
                    cx={qx} cy={qy} r={2.5} fill="#fff"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{ pointerEvents: 'none', filter: `drop-shadow(0 0 6px ${treeColor})` }}
                  />
                  <AnimatePresence>
                    {(isHovered || isDetailMode) && (
                      <motion.text
                        key={`q-text-${q.id}`}
                        initial={{ opacity: 0, x: qx + 2 }}
                        animate={{ opacity: 1, x: qx + 5 }}
                        exit={{ opacity: 0, x: qx + 2 }}
                        y={qy + 2}
                        fontSize="5"
                        fill="#fff"
                        className="font-medium pointer-events-none"
                        style={{ textShadow: `0 1px 3px rgba(0,0,0,0.8), 0 2px 6px ${treeColor}` }}
                      >
                        {q.text}
                      </motion.text>
                    )}
                  </AnimatePresence>
                  <circle
                    cx={qx} cy={qy} r={15} fill="transparent"
                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/graph?q=${encodeURIComponent(q.text)}&color=${encodeURIComponent(treeColor)}`);
                    }}
                  />
                </g>
              )
            })}
          </AnimatePresence>

          {node.children && node.children.length > 0 && renderBranches(node.children, depth + 1)}
        </g>
      );
    });
  };

  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center group pointer-events-none"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay }}
    >
      <div 
        className="relative w-[400px] h-[400px] flex items-center justify-center pointer-events-auto"
        onMouseEnter={() => !isDetailMode && setIsHovered(true)} 
        onMouseLeave={() => { if (!isDetailMode) { setIsHovered(false); setActiveNode(null); } }}
      >
        {/* Glow behind tree */}
        <div 
          className="absolute inset-0 rounded-full blur-[80px] opacity-20 transition-opacity duration-1000 pointer-events-none"
          style={{ backgroundColor: color, opacity: isHovered || isDetailMode ? 0.3 : 0.1 }}
        />
        
        <svg width="400" height="400" viewBox="0 0 400 400" className="absolute inset-0 z-10 overflow-visible pointer-events-none">
          <motion.g 
            className="pointer-events-auto" 
            animate={{ scale: isHovered || isDetailMode ? 2 : 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "200px 350px" }}
          >
            {/* Tree hit area to prevent hover flicker */}
            <circle cx="200" cy="250" r="130" fill="transparent" 
              className="pointer-events-none"
            />
            
            {/* Base Root / Flow */}
            <motion.circle
              cx="200" cy="350" r="4" fill={treeColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered || isDetailMode ? 1 : 0.5 }}
              style={{ filter: `drop-shadow(0 0 10px ${treeColor})` }}
            />
            {renderBranches(treeData, 0)}
          </motion.g>
        </svg>

        <AnimatePresence>
          {!isDetailMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="absolute z-50 pointer-events-auto flex flex-col items-center gap-2"
              style={{ top: '65%' }}
            >
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/tree/${id}`);
                }}
                className="cursor-pointer block px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-slate-700 text-[10px] font-medium tracking-widest transition-all shadow-sm border border-white/20 pointer-events-auto"
              >
                查看详情
              </motion.button>
              {!disableBranchCreator && (
                <motion.button
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/new?domain=${encodeURIComponent(domainSlug || id)}&seed=${encodeURIComponent(domain)}`);
                  }}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md text-slate-700 text-[10px] font-medium tracking-widest transition-all shadow-sm border pointer-events-auto"
                  style={{
                    backgroundColor: `${treeColor}22`,
                    borderColor: `${treeColor}55`,
                  }}
                >
                  <Plus size={10} />
                  <span>让它长出新枝</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center mt-[-40px] z-10">
        <h3 
          className="text-xl md:text-2xl font-light tracking-widest transition-colors duration-700"
          style={{ color: isHovered || isDetailMode ? '#1e293b' : '#64748b' }}
        >
          {domain}
        </h3>
        <AnimatePresence>
          {(isHovered || isDetailMode) && (
            <motion.p 
              key={`desc-${id}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs md:text-sm text-slate-500 font-light text-center mt-2 max-w-[200px]"
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
