import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { createLCG } from '@/lib/seed';

interface AmbientParticlesProps {
  color?: string;
  count?: number;
  className?: string;
}

const DEFAULT_COLOR = '#dbe8e9';

export function AmbientParticles({ color = DEFAULT_COLOR, count = 40, className = '' }: AmbientParticlesProps) {
  const particles = useMemo(() => {
    const random = createLCG(12345);
    const round = (n: number) => Math.round(n * 100) / 100;

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: round(random() * 100),
      y: round(random() * 100),
      size: round(random() * 3 + 1),
      duration: round(random() * 20 + 20),
      delay: round(random() * 10),
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            filter: 'blur(1px)',
            opacity: 0.2,
          }}
          animate={{
            y: [`${p.y}%`, `${p.y - 10}%`, `${p.y}%`],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
