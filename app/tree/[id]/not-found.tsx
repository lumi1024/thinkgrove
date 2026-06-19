import Link from 'next/link';
import { BackLink } from '@/components/ui/BackLink';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="font-mono text-[10px] tracking-[0.3em] text-slate-400 uppercase mb-4">
        404 / not_found
      </div>
      <h1 className="text-2xl font-light text-slate-700 tracking-wide mb-6">
        这片区域还没有树
      </h1>
      <BackLink />
    </main>
  );
}
