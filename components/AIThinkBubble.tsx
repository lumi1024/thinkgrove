'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { createLCG } from '@/lib/seed';

// "AI thinking" particle bubble. Reused on:
//   - the AI resident capsule (small, inline)
//   - the /disputes/[id] panel (large, when a dispute is being arbitrated)
//
// Visual contract: slow drift + opacity pulse on tiny dots, 6s loop.
// In REST mode, the bubble collapses to a 4s gray breath via `resting` prop.
export function AIThinkBubble({
  size = 'sm',
  color = '#0ea5e9',
  resting = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  resting?: boolean;
  className?: string;
}) {
  const dims = SIZES[size];
  const particleCount = size === 'sm' ? 6 : size === 'md' ? 10 : 16;

  // Stable seed-based positions so SSR matches client.
  const particles = useMemo(() => {
    const random = createLCG(99001 + particleCount);
    const round = (n: number) => Math.round(n * 100) / 100;
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      angle: (Math.PI * 2 * i) / particleCount + random() * 0.4,
      radius: dims.radius * (0.55 + random() * 0.35),
      size: 1 + random() * 1.5,
      delay: random() * 2,
      duration: 4 + random() * 3,
    }));
  }, [particleCount, dims.radius]);

  // REST mode uses a slower, paler breath; thinking mode pulses the color.
  const dotColor = resting ? '#94a3b8' : color;
  const loopDuration = resting ? 4 : 6;
  const glowOpacity = resting ? 0.15 : 0.4;

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: dims.outer, height: dims.outer }}
    >
      {/* Outer soft glow — slightly larger than the particle ring */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: dotColor, filter: 'blur(6px)' }}
        animate={{ opacity: [glowOpacity * 0.5, glowOpacity, glowOpacity * 0.5] }}
        transition={{ duration: loopDuration, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting particles */}
      <motion.span
        className="absolute inset-0"
        animate={{ rotate: resting ? 0 : 360 }}
        transition={{ duration: loopDuration * 2, repeat: Infinity, ease: 'linear' }}
      >
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: dotColor,
              transform: `translate(-50%, -50%) rotate(${p.angle}rad) translateY(-${p.radius}px)`,
              opacity: 0.7,
            }}
          />
        ))}
      </motion.span>

      {/* Center pip — the "thinking" core */}
      <motion.span
        className="relative rounded-full"
        style={{
          width: dims.core,
          height: dims.core,
          backgroundColor: dotColor,
          boxShadow: `0 0 ${dims.core * 1.5}px ${dotColor}`,
        }}
        animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: loopDuration / 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </span>
  );
}

const SIZES = {
  sm: { outer: 16, radius: 6,  core: 3 },
  md: { outer: 28, radius: 11, core: 5 },
  lg: { outer: 48, radius: 18, core: 8 },
} as const;
