// Lifetime stats persisted to localStorage.

import type { TrainerState } from './types';

const KEY = 'bjt:lifetime:v1';

export interface LifetimeStats {
  sessions: number;
  strategyCorrect: number;
  strategyTotal: number;
  countChecks: number;
  countExact: number;
  bestStreak: number;
  /** scenarioLabel -> { wrong, total } aggregated across sessions. */
  scenarios: Record<string, { wrong: number; total: number }>;
}

const empty: LifetimeStats = {
  sessions: 0,
  strategyCorrect: 0,
  strategyTotal: 0,
  countChecks: 0,
  countExact: 0,
  bestStreak: 0,
  scenarios: {},
};

export function loadStats(): LifetimeStats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    return { ...empty, ...(JSON.parse(raw) as LifetimeStats) };
  } catch {
    return { ...empty };
  }
}

export function recordSession(state: TrainerState): LifetimeStats {
  const cur = loadStats();
  const exact = state.countChecks.filter((c) => c.guess === c.correct).length;
  const scenarios = { ...cur.scenarios };
  for (const [label, s] of Object.entries(state.scenarios)) {
    const prev = scenarios[label] ?? { wrong: 0, total: 0 };
    scenarios[label] = {
      wrong: prev.wrong + s.wrong,
      total: prev.total + s.total,
    };
  }
  const next: LifetimeStats = {
    sessions: cur.sessions + 1,
    strategyCorrect: cur.strategyCorrect + state.strategyCorrect,
    strategyTotal: cur.strategyTotal + state.strategyTotal,
    countChecks: cur.countChecks + state.countChecks.length,
    countExact: cur.countExact + exact,
    bestStreak: Math.max(cur.bestStreak, state.bestStreak),
    scenarios,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private-mode failures
  }
  return next;
}

export function resetStats() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
