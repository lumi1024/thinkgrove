// ThinkGrove · reputation system.
// Implements COMMUNITY_DESIGN.md §6.1 formula:
//
//   reputation = 0.4 * citedCount
//              + 0.25 * gateAccuracy
//              + 0.20 * tenureScore
//              + 0.15 * crossDomainCited
//
// Weights are unchanged for humans; AI gets a 1.2x multiplier on the
// cross-domain term (per design doc). Gate accuracy is computed from
// dispute votes + appeal-window reversals.

export interface ReputationInput {
  userId: string;
  kind: 'human' | 'ai';
  citedCount: number;
  crossDomainCited: number;
  gateAccuracy: number;     // 0..1
  tenureDays: number;       // capped at 365 in the formula
  isCrossDomain: boolean;   // whether the user spans multiple trees
}

export interface ReputationOutput {
  components: {
    cited: number;
    gate: number;
    tenure: number;
    crossDomain: number;
  };
  total: number;
  // 4 bars (0..1) for the UI chart
  normalized: {
    cited: number;
    gate: number;
    tenure: number;
    crossDomain: number;
  };
}

const W_CITED = 0.40;
const W_GATE  = 0.25;
const W_TENURE = 0.20;
const W_CROSS = 0.15;
const AI_CROSS_BOOST = 1.2;

function clamp01(n: number): number { return Math.max(0, Math.min(1, n)); }

export function computeReputation(r: ReputationInput): ReputationOutput {
  // Normalize each input to a 0..1 scale using reasonable ceilings.
  // Ceilings chosen so a "stellar" contributor lands near 1.0 on each axis.
  const citedN        = clamp01(r.citedCount / 200);
  const gateN         = clamp01(r.gateAccuracy);
  const tenureN       = clamp01(r.tenureDays / 365);
  const crossN        = clamp01(r.crossDomainCited / 50);
  const crossWeighted = r.kind === 'ai' ? crossN * AI_CROSS_BOOST : crossN;

  const citedScore   = W_CITED * citedN * 100;
  const gateScore    = W_GATE  * gateN  * 100;
  const tenureScore  = W_TENURE * tenureN * 100;
  const crossScore   = W_CROSS * Math.min(1, crossWeighted) * 100;

  return {
    components: {
      cited:      Math.round(citedScore * 10) / 10,
      gate:       Math.round(gateScore * 10) / 10,
      tenure:     Math.round(tenureScore * 10) / 10,
      crossDomain: Math.round(crossScore * 10) / 10,
    },
    total: Math.round((citedScore + gateScore + tenureScore + crossScore) * 10) / 10,
    normalized: {
      cited:      citedN,
      gate:       gateN,
      tenure:     tenureN,
      crossDomain: Math.min(1, crossWeighted),
    },
  };
}

// Seed-derived demo data for residents — so the profile page has
// something to show even before the user accumulates real activity.
// Numbers are picked to be plausible and to span the spectrum.
export function demoReputation(userId: string): ReputationInput {
  const seed = Array.from(userId).reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };
  return {
    userId,
    kind: userId.startsWith('ai_') ? 'ai' : 'human',
    citedCount: Math.floor(rng(1) * 180) + 20,
    crossDomainCited: Math.floor(rng(2) * 40) + 5,
    gateAccuracy: 0.55 + rng(3) * 0.4,
    tenureDays: Math.floor(rng(4) * 280) + 30,
    isCrossDomain: rng(5) > 0.5,
  };
}
