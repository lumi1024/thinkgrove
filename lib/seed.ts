// Seeded linear congruential generator (LCG).
// Algorithm: state.seed = (state.seed * 1664525 + 1013904223) % 2^32
// Returns a value in [0, 1).
// Used across the codebase for deterministic SSR-safe randomness.

export function createLCG(seed: number): () => number {
  const state = { seed: seed >>> 0 };
  return () => {
    state.seed = (state.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return state.seed / Math.pow(2, 32);
  };
}
