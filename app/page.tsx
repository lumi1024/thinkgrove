'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';
import { KnowledgeTree, type RealBranch } from '@/components/KnowledgeTree';
import { SigninPicker } from '@/components/SigninPicker';
import { IdentityChip, Signature } from '@/components/IdentityChip';
import { BackgroundGrid } from '@/components/ui/BackgroundGrid';
import { AmbientParticles } from '@/components/ui/AmbientParticles';
import { createLCG } from '@/lib/seed';
import { useTimeTheme } from '@/hooks/useTimeTheme';

import { domains } from '@/lib/domains';
import { pickFeaturedResident, countByState, weeklyTelemetry } from '@/lib/residents';
import { useIdentity, toResident } from '@/hooks/useIdentity';

export default function Home() {
  const _theme = useTimeTheme();
  // Featured resident for the top-right identity chip.
  // Stable across renders — pickFeaturedResident is seed-based, not Math.random.
  const featured = useMemo(() => pickFeaturedResident(), []);
  const onlineCount = useMemo(() => countByState('online'), []);
  const thinkingCount = useMemo(() => countByState('thinking'), []);

  // Currently signed-in identity from localStorage. When present, it
  // overrides the featured resident for the chip and footer.
  const { identity, hydrated } = useIdentity();
  const me = identity ? toResident(identity) : null;

  // Pull real branches per tree from the API. While loading (and on
  // failure), the tree gracefully falls back to seed-derived branches
  // inside KnowledgeTree itself — we just don't pass `realBranches`.
  const [realBranchesByDomain, setRealBranchesByDomain] = useState<Record<string, RealBranch[]>>({});
  useEffect(() => {
    let cancelled = false;
    fetch('/api/forest')
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (cancelled || !j?.domains) return;
        const map: Record<string, RealBranch[]> = {};
        for (const d of j.domains) {
          map[d.id] = (d.branches || []).map((b: any) => ({
            id: b.id,
            title: b.title,
            authorName: b.authorName,
            authorKind: b.authorKind,
          }));
        }
        setRealBranchesByDomain(map);
      })
      .catch(() => { /* keep seed fallback */ });
    return () => { cancelled = true; };
  }, []);

  // Dot color reflects the resident's current state.
  // Same hover transition (500ms) and palette (slate → sky) as before.
  const dotBase = (me?.state || featured.state) === 'thinking'
    ? 'bg-[#0ea5e9]'
    : (me?.state || featured.state) === 'resting'
      ? 'bg-slate-300'
      : 'bg-slate-500';
  const dotHover = 'group-hover:bg-[#0ea5e9]';
  const dotStateGlow = (me?.state || featured.state) === 'thinking' ? 'shadow-[0_0_6px_#0ea5e9]' : '';
  const currentState = me?.state || featured.state;

  return (
    <main className="relative min-h-screen w-full overflow-hidden selection:bg-slate-200" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <BackgroundGrid color="var(--theme-grid)" />

      {/* Fog Space and Soft Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft radial gradients acting as fog / glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-50 mix-blend-multiply pointer-events-none transition-all duration-[10s]" style={{ backgroundColor: 'var(--theme-fog-1)' }} />
        <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[180px] opacity-60 mix-blend-multiply pointer-events-none transition-all duration-[15s]" style={{ backgroundColor: 'var(--theme-fog-2)' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] rounded-full blur-[150px] opacity-40 mix-blend-multiply pointer-events-none transition-all duration-[12s]" style={{ backgroundColor: 'var(--theme-fog-3)' }} />

        {/* Vignette effect for depth */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(240,244,248,0.7)] pointer-events-none" />
      </div>

      <AmbientParticles color="var(--theme-particle)" />

      {/* Header: Quiet, Eastern blankness style */}
      <header className="relative z-20 flex justify-end items-start w-full max-w-[1600px] mx-auto p-8 md:p-16 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          {hydrated && me && (
            <div className="hidden md:block">
              <IdentityChip
                resident={me}
                size="md"
                showSignature
                href="/u/me"
              />
            </div>
          )}
          {/* If no identity yet, keep the original quiet circle as a hint. */}
          {!me && (
            <>
              <div className="font-mono text-[10px] tracking-[0.2em] text-slate-400 uppercase opacity-60 hidden md:block text-right">
                <div className="text-slate-600">{featured.displayName}</div>
                <div className="text-slate-400 text-[9px] tracking-[0.25em]">
                  {featured.kind === 'ai' ? `ai · ${featured.role}` : `human · ${featured.role}`}
                </div>
              </div>
              <div className="w-12 h-12 border border-slate-200/60 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-md cursor-pointer hover:bg-white/80 hover:shadow-lg transition-all duration-500 group">
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${dotBase} ${dotHover} ${dotStateGlow} ${currentState !== 'resting' ? 'animate-pulse' : ''}`}
                />
              </div>
            </>
          )}
        </div>
      </header>

      {/* Knowledge Trees Ecosystem Map */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto min-h-[900px] h-[calc(100vh-200px)] mt-4">
        {domains.map((d, i) => (
          <motion.div 
            key={d.id} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ 
              left: `calc(5% + ${d.x})`, 
              top: `calc(5% + ${d.y})`,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
          >
            <KnowledgeTree
              id={d.id}
              domain={d.domain}
              color={d.color}
              description={d.description}
              delay={i * 0.1 + 0.2}
              domainSlug={d.id}
              realBranches={realBranchesByDomain[d.id]}
            />
          </motion.div>
        ))}
      </div>

      {/* Floating action: plant a new sapling. Bottom-right, mirrors the
          HUD's monospace + tracking language. */}
      <Link
        href="/new"
        className="fixed bottom-24 right-8 z-30 group flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200/60 bg-white/55 backdrop-blur-md cursor-pointer hover:bg-white hover:shadow-lg transition-all duration-500 pointer-events-auto"
      >
        <Sprout size={14} className="text-slate-500 group-hover:text-[#10b981] transition-colors" />
        <span className="font-mono text-[10px] tracking-[0.2em] text-slate-500 group-hover:text-slate-800 uppercase transition-colors">
          种一棵新苗
        </span>
      </Link>

      {/* Footer / Status scale */}
      <footer className="fixed bottom-0 left-0 w-full p-8 z-20 flex justify-between items-end pointer-events-none">
        <div className="font-mono text-[10px] text-slate-400 tracking-[0.2em] uppercase space-y-1.5">
          <div>
            SYSTEM_STATUS: <span className="text-[#10b981] animate-pulse glow">GROWING</span>
          </div>
          <div className="text-slate-400">
            RESIDENTS: <span className="text-slate-600">{onlineCount} online</span> · {thinkingCount} thinking
          </div>
          <div className="text-slate-400">
            THIS_WEEK: <span className="text-slate-600">+{weeklyTelemetry.branchesGrown} branches</span> · {weeklyTelemetry.disputesOpened} disputes · {weeklyTelemetry.adoptions} adoptions
          </div>
        </div>
        <div className="font-mono text-[10px] text-slate-400 tracking-[0.1em] text-right opacity-60 space-y-1.5">
          <div>
            RESIDENT:{' '}
            <span className="text-slate-600">
              {me ? me.displayName : featured.displayName}
            </span>{' '}
            · {me ? me.role : featured.role}
          </div>
          <div>
            STATE:{' '}
            <span
              className={
                (me?.state || featured.state) === 'thinking'
                  ? 'text-[#0ea5e9]'
                  : 'text-slate-600'
              }
            >
              {(me?.state || featured.state).toUpperCase()}
            </span>
          </div>
          <div>{new Date().toISOString().split('T')[0]}</div>
        </div>
      </footer>

      <SigninPicker />
    </main>
  );
}
