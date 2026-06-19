// SPDX-License-Identifier: MIT

'use client';

import React from 'react';
import { motion } from 'motion/react';

// Decorative red seal that floats above a disputed sentence.
// "被争议的" 的视觉符号 — 半透明朱红 3° 旋转 SVG 印。
// Real text below is never hidden; the stamp is intentionally noisy.

export function DisputeStamp({ size = 64, label = 'DISPUTED' }: { size?: number; label?: string }) {
  return (
    <motion.div
      className="pointer-events-none inline-block"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
      animate={{ opacity: 0.85, scale: 1, rotate: -3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} className="overflow-visible">
        {/* Outer ring */}
        <circle cx="32" cy="32" r="28" fill="none" stroke="#dc2626" strokeWidth="2" />
        {/* Inner solid seal */}
        <circle cx="32" cy="32" r="22" fill="#dc2626" opacity="0.18" />
        {/* Cross-hatch grain */}
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="32" y1="10"
            x2="32" y2="54"
            stroke="#dc2626"
            strokeWidth="0.5"
            transform={`rotate(${i * 22.5} 32 32)`}
            opacity="0.4"
          />
        ))}
        {/* Label text along the bottom arc */}
        <text
          x="32" y="38"
          textAnchor="middle"
          fontSize="9"
          fontFamily="ui-monospace, SFMono-Regular, monospace"
          fontWeight="700"
          fill="#dc2626"
          letterSpacing="0.15em"
        >
          {label}
        </text>
      </svg>
    </motion.div>
  );
}
