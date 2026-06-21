// SPDX-License-Identifier: MIT

'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { KnowledgeTree, type RealBranch } from '@/components/KnowledgeTree';
import { SigninPicker } from '@/components/SigninPicker';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { AmbientParticles } from '@/components/ui/AmbientParticles';
import { OnboardingGuide } from '@/components/OnboardingGuide';
import { DomainHoverCard } from '@/components/DomainHoverCard';
import { MobileForestView } from '@/components/MobileForestView';
import { createLCG } from '@/lib/seed';
import { useTimeTheme } from '@/hooks/useTimeTheme';
import { useGuideSteps } from '@/hooks/useGuideSteps';
import { GuideTooltip } from '@/components/GuideTooltip';
import { domains } from '@/lib/domains';
import { pickFeaturedResident, countByState, weeklyTelemetry } from '@/lib/residents';

const GUIDE_STEPS_ON_HOMEPAGE = [2, 3];

export default function Home() {
  const _theme = useTimeTheme();
  const featured = useMemo(() => pickFeaturedResident(), []);
  const onlineCount = useMemo(() => countByState('online'), []);
  const thinkingCount = useMemo(() => countByState('thinking'), []);

  const [showAll, setShowAll] = useState(false);
  const visibleDomains = showAll ? domains : domains.slice(0, 4);

  const [realBranchesByDomain, setRealBranchesByDomain] = useState<Record<string, RealBranch[]>>({});
  const [newBranchTitles, setNewBranchTitles] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  const { markSeen, hasSeen } = useGuideSteps();

  const guideAnchorRef = useRef<HTMLDivElement>(null);
  const [firstUnseenStep, setFirstUnseenStep] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const unseen = GUIDE_STEPS_ON_HOMEPAGE.find((s) => !hasSeen(s)) || null;
    setFirstUnseenStep(unseen);
  }, [hasSeen]);

  const loadBranches = useCallback(() => {
    fetch('/api/forest')
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (!j?.domains) return;
        const map: Record<string, RealBranch[]> = {};
        for (const d of j.domains) {
          map[d.id] = (d.branches || []).map((b: any) => ({
            id: b.id,
            title: b.title,
            authorName: b.authorName,
            authorKind: b.authorKind,
            isNew: newBranchTitles.has(b.title),
          }));
        }
        setRealBranchesByDomain(map);
      })
      .catch(() => {});
  }, [newBranchTitles]);

  useEffect(() => { loadBranches(); }, [loadBranches]);

  useEffect(() => {
    const channel = new BroadcastChannel('kf.branch-created');
    const handler = (e: MessageEvent) => {
      const { title } = e.data || {};
      if (title) {
        setNewBranchTitles(prev => new Set([...prev, title]));
        setTimeout(() => {
          setNewBranchTitles(prev => {
            const next = new Set(prev);
            next.delete(title);
            return next;
          });
        }, 6000);
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }, []);

  const homeGuideTooltip = firstUnseenStep ? (
    <GuideTooltip
      key={firstUnseenStep}
      step={firstUnseenStep}
      onDismiss={() => { markSeen(firstUnseenStep); setFirstUnseenStep(null); }}
      identity={null}
      anchorRef={guideAnchorRef}
    />
  ) : null;

  return (
    <main className="relative min-h-screen w-full overflow-hidden selection:bg-slate-200" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid color="var(--theme-grid)" />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-50 mix-blend-multiply pointer-events-none transition-all duration-[10s]" style={{ backgroundColor: 'var(--theme-fog-1)' }} />
        <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[180px] opacity-60 mix-blend-multiply pointer-events-none transition-all duration-[15s]" style={{ backgroundColor: 'var(--theme-fog-2)' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full blur-[150px] opacity-40 mix-blend-multiply pointer-events-none transition-all duration-[12s]" style={{ backgroundColor: 'var(--theme-fog-3)' }} />
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(240,244,248,0.7)] pointer-events-none" />
      </div>

      <AmbientParticles color="var(--theme-particle)" />

      <OnboardingGuide onDismiss={() => {}} show={true} />

      {isMobile && (
        <MobileForestView
          domains={visibleDomains}
          branchesByDomain={realBranchesByDomain}
        />
      )}

      {!isMobile && (
        <>
          <div className="relative z-10 w-full max-w-[1600px] mx-auto min-h-[900px] h-[calc(100vh-200px)] mt-4">
            {visibleDomains.map((d, i) => {
              const branchCount = realBranchesByDomain[d.id]?.length || 0;
              return (
                <motion.div
                  key={d.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(5% + ${d.x_pct})`,
                    top: `calc(5% + ${d.y_pct})`,
                  }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                >
                  <DomainHoverCard
                    domain={d}
                    branchCount={branchCount}
                    containerRef={guideAnchorRef}
                  />
                  <div ref={i === 0 ? guideAnchorRef : undefined}>
                    <KnowledgeTree
                      id={d.id}
                      domain={d.domain}
                      color={d.color}
                      description={d.description}
                      delay={i * 0.1 + 0.2}
                      domainSlug={d.id}
                      realBranches={realBranchesByDomain[d.id]}
                      sproutDomainId={newBranchTitles.size > 0 ? d.id : undefined}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {!showAll && domains.length > 4 && (
            <button
              onClick={() => setShowAll(true)}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full border border-slate-200/60 bg-white/55 backdrop-blur-md text-[10px] font-mono text-slate-500 tracking-widest uppercase cursor-pointer hover:bg-white hover:text-slate-700 transition-all"
            >
              展开全部 {domains.length} 棵树
            </button>
          )}

          <Link
            href="/new"
            className="fixed bottom-24 right-8 z-30 group flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/60 bg-white/55 backdrop-blur-md cursor-pointer hover:bg-white hover:shadow-lg transition-all duration-500"
          >
            <Sprout size={14} className="text-slate-500 group-hover:text-[#10b981] transition-colors" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500 group-hover:text-slate-800 uppercase transition-colors">
              种一棵新苗
            </span>
          </Link>
        </>
      )}

      {!isMobile && (
        <footer className="fixed bottom-0 left-0 w-full p-8 z-20 flex justify-between items-end pointer-events-none">
          <div className="font-mono text-[10px] text-slate-400 tracking-[0.2em] uppercase space-y-1.5">
            <div>
              系统状态: <span className="text-[#10b981] animate-pulse">生长中</span>
            </div>
            <div className="text-slate-400">
              居民: <span className="text-slate-600">{onlineCount} 在线</span> · {thinkingCount} 思考中
            </div>
            <div className="text-slate-400">
              本周: <span className="text-slate-600">+{weeklyTelemetry.branchesGrown} 枝桠</span> · {weeklyTelemetry.disputesOpened} 争议 · {weeklyTelemetry.adoptions} 认养
            </div>
          </div>
          <div className="font-mono text-[10px] text-slate-400 tracking-[0.1em] text-right opacity-60 space-y-1.5">
            <div>
              居民: <span className="text-slate-600">{featured.displayName}</span> · {featured.role}
            </div>
            <div>
              状态:{' '}
              <span className={(featured.state === 'thinking' ? 'text-[#0ea5e9]' : 'text-slate-600')}>
                {(featured.state === 'thinking' ? '思考中' : featured.state === 'resting' ? '休眠' : '在线')}
              </span>
            </div>
            <div>{new Date().toISOString().split('T')[0]}</div>
          </div>
        </footer>
      )}

      <SigninPicker />
      {homeGuideTooltip}
    </main>
  );
}
