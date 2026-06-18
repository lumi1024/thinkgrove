import React from 'react';

interface BackgroundGridProps {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
}

export function BackgroundGrid({ size = 80, color = '#64748b', opacity = 0.04, className = '' }: BackgroundGridProps) {
  const resolvedColor = color.startsWith('var(') ? color : color;
  const style: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${resolvedColor} 1px, transparent 1px), linear-gradient(to bottom, ${resolvedColor} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
  };

  return (
    <div
      className={`absolute inset-0 z-0 mix-blend-multiply pointer-events-none ${className}`}
      style={{ ...style, opacity }}
    />
  );
}
