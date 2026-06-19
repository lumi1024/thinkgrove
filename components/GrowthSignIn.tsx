'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// 生长签到 — 发表成功后：头像沿枝桠路径滑动，留下金色尾迹。
// 1.2s 动画，与 spec §8.2.1 一致。

interface GrowthSignInProps {
  userName: string;
  color?: string;
  onDone?: () => void;
}

export function GrowthSignIn({ userName, color = '#f59e0b', onDone }: GrowthSignInProps) {
  const [visible, setVisible] = useState(false);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(() => setArrived(true), 1500);
    return () => { cancelAnimationFrame(t); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (arrived) onDone?.();
  }, [arrived, onDone]);

  // 枝桠路径的关键帧（沿贝塞尔曲线采样）
  const frames = [
    { x: 150, y: 260 },
    { x: 143, y: 235 },
    { x: 147, y: 210 },
    { x: 150, y: 185 },
    { x: 144, y: 155 },
    { x: 148, y: 130 },
    { x: 150, y: 105 },
    { x: 147, y: 80 },
    { x: 150, y: 60 },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
            {/* Branch path line */}
            <motion.path
              d="M 150 260 C 140 220, 160 200, 150 160 C 140 120, 160 100, 150 60"
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />

            {/* Golden trail dots — each animates to its position along the path */}
            {frames.map((pt, i) => (
              <motion.circle
                key={`trail-${i}`}
                r={4 - i * 0.4}
                fill={color}
                initial={{ cx: frames[0].x, cy: frames[0].y, opacity: 0, scale: 0 }}
                animate={{
                  cx: pt.x,
                  cy: pt.y,
                  opacity: i < 5 ? [0, 0.8, 0] : 0,
                  scale: i < 5 ? [0, 1.2, 0.3] : 1,
                }}
                transition={{
                  duration: 1.0,
                  delay: (i / (frames.length - 1)) * 1.2,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Traveling avatar dot — follows all keyframes */}
            <motion.circle
              r={7}
              fill={color}
              style={{ filter: `drop-shadow(0 0 10px ${color})` }}
              initial={{ cx: frames[0].x, cy: frames[0].y }}
              animate={{
                cx: frames.map(f => f.x),
                cy: frames.map(f => f.y),
              }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
                times: frames.map((_, i) => i / (frames.length - 1)),
              }}
            />

            {/* Label at destination */}
            <motion.text
              x={150}
              y={48}
              textAnchor="middle"
              className="font-mono"
              fill={color}
              fontSize="10"
              letterSpacing="0.15em"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: arrived ? 1 : 0, y: arrived ? 0 : 6 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              {userName}
            </motion.text>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
