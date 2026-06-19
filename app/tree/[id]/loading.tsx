// SPDX-License-Identifier: MIT

export default function Loading() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-[var(--theme-bg)] relative overflow-hidden">
      {/* Match the page's gradient glow language */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full blur-[180px] opacity-30"
        style={{ backgroundColor: '#0ea5e9' }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase animate-pulse">
          ACCESSING NODE
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-slate-400 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
