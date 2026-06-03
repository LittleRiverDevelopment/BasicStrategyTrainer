import type { Card } from '../lib/cards';
import type { Action } from '../lib/strategy';

/** A preset session length (the "card count" the user picks). */
export interface SessionPreset {
  id: string;
  label: string;
  /** Number of cards revealed before the session ends. */
  cards: number;
  blurb: string;
}

export interface SessionConfig {
  preset: SessionPreset;
  /** 1 (slow) .. 10 (casino speed) controls deal pacing. */
  speed: number;
  /** Ask for the running count partway through, not just at the end. */
  periodicChecks: boolean;
}

export type Phase =
  | 'home'
  | 'dealing'
  | 'deciding'
  | 'feedback'
  | 'countCheck'
  | 'summary';

export interface DealStep {
  target: 'player' | 'dealer';
  card: Card;
}

export interface Round {
  sequence: DealStep[];
  player: Card[];
  dealerUp: Card;
}

export interface DecisionResult {
  chosen: Action;
  correct: Action;
  isCorrect: boolean;
  reason: string;
  scenarioLabel: string;
}

export interface CountCheck {
  guess: number;
  correct: number;
  isFinal: boolean;
}

export interface ScenarioStat {
  wrong: number;
  total: number;
}

export interface TrainerState {
  phase: Phase;
  config: SessionConfig | null;
  shoe: Card[];
  shoePos: number;
  round: Round | null;
  /** How many cards of the current round are face-up (0..3). */
  visible: number;
  runningCount: number;
  cardsDealt: number;
  roundsPlayed: number;
  result: DecisionResult | null;
  pendingCheckIsFinal: boolean;
  // session metrics
  strategyCorrect: number;
  strategyTotal: number;
  streak: number;
  bestStreak: number;
  countChecks: CountCheck[];
  scenarios: Record<string, ScenarioStat>;
}
