// SPDX-License-Identifier: MIT

// Minimal quality scoring helpers for question definitions.
// These helpers are intentionally framework-level and do not impose
// a fixed product scoring policy.

export interface QualityScores {
  quality_score: number;
  precision?: number;
  answerability?: number;
  verifiability?: number;
  non_redundancy?: number;
  scope_fit?: number;
}

export function clamp(value: number | undefined, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function averageScores(scores: (number | undefined)[]): number {
  const valid = scores.filter((value): value is number => value !== undefined && Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

export function computeQualityScore(scores: Partial<QualityScores> = {}): number {
  const weighted = [
    scores.precision ?? 0.5,
    scores.answerability ?? 0.5,
    scores.verifiability ?? 0.5,
    scores.non_redundancy ?? 0.5,
    scores.scope_fit ?? 0.5,
  ];
  const score = weighted.reduce((sum, value) => sum + value, 0) / weighted.length;
  return Math.round(score * 100) / 100;
}

export function applyQualityScores(quality: Partial<QualityScores> = {}): QualityScores {
  const precision = clamp(quality.precision, 0, 1);
  const answerability = clamp(quality.answerability, 0, 1);
  const verifiability = clamp(quality.verifiability, 0, 1);
  const non_redundancy = clamp(quality.non_redundancy, 0, 1);
  const scope_fit = clamp(quality.scope_fit, 0, 1);
  const quality_score = computeQualityScore({ precision, answerability, verifiability, non_redundancy, scope_fit });

  return {
    quality_score,
    precision,
    answerability,
    verifiability,
    non_redundancy,
    scope_fit,
  };
}
