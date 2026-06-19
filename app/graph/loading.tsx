// SPDX-License-Identifier: MIT

export default function Loading() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-[var(--theme-bg)]">
      <div className="font-mono text-xs tracking-widest text-slate-400 animate-pulse">
        CONNECTING PATHWAYS...
      </div>
    </div>
  );
}
