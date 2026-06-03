// Basic strategy engine.
// Rule set: 6 decks, dealer HITS soft 17 (H17), double-after-split allowed (DAS),
// late surrender allowed (LS). This is the common Las Vegas Strip configuration.
//
// Strategy codes used in the tables:
//   H  = hit
//   S  = stand
//   D  = double if allowed, otherwise hit
//   Ds = double if allowed, otherwise stand
//   P  = split
//   Rh = surrender if allowed, otherwise hit
//   Rs = surrender if allowed, otherwise stand
//   Rp = surrender if allowed, otherwise split

import type { Card } from './cards';
import { evaluateHand, isPair, pairRank, upcardValue } from './hand';

export type Action = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

export const ACTION_LABEL: Record<Action, string> = {
  hit: 'Hit',
  stand: 'Stand',
  double: 'Double',
  split: 'Split',
  surrender: 'Surrender',
};

type Code = 'H' | 'S' | 'D' | 'Ds' | 'P' | 'Rh' | 'Rs' | 'Rp';

export interface StrategyOptions {
  canDouble: boolean;
  canSurrender: boolean;
  canSplit: boolean;
}

export interface StrategyResult {
  action: Action;
  /** Short human-readable rationale shown in feedback. */
  reason: string;
  /** Stable label for weak-spot tracking, e.g. "Hard 16 vs 9". */
  scenarioLabel: string;
}

// Dealer upcard index helper: maps a dealer value (2..11) to a 0..9 column.
function col(dealer: number): number {
  return dealer - 2; // 2 -> 0 ... 11(A) -> 9
}

// --- Hard totals (index by total) ---------------------------------------
function hardCode(total: number, dealer: number): Code {
  const c = col(dealer);
  if (total <= 8) return 'H';
  if (total === 9) return c >= col(3) && c <= col(6) ? 'D' : 'H';
  if (total === 10) return c >= col(2) && c <= col(9) ? 'D' : 'H';
  if (total === 11) return 'D'; // H17: double vs everything incl. Ace
  if (total === 12) return c >= col(4) && c <= col(6) ? 'S' : 'H';
  if (total >= 13 && total <= 14) return c <= col(6) ? 'S' : 'H';
  if (total === 15) {
    if (c <= col(6)) return 'S';
    if (dealer === 10 || dealer === 11) return 'Rh'; // surrender 15 vs 10 & A (H17)
    return 'H';
  }
  if (total === 16) {
    if (c <= col(6)) return 'S';
    if (dealer === 9 || dealer === 10 || dealer === 11) return 'Rh';
    return 'H';
  }
  if (total === 17) {
    if (dealer === 11) return 'Rs'; // H17: surrender hard 17 vs Ace
    return 'S';
  }
  return 'S'; // 18+
}

// --- Soft totals (index by total, total includes the Ace as 11) ----------
function softCode(total: number, dealer: number): Code {
  const c = col(dealer);
  switch (total) {
    case 13: // A,2
    case 14: // A,3
      return c >= col(5) && c <= col(6) ? 'D' : 'H';
    case 15: // A,4
    case 16: // A,5
      return c >= col(4) && c <= col(6) ? 'D' : 'H';
    case 17: // A,6
      return c >= col(3) && c <= col(6) ? 'D' : 'H';
    case 18: // A,7
      if (c <= col(6)) return 'Ds';
      if (dealer === 7 || dealer === 8) return 'S';
      return 'H';
    case 19: // A,8
      return dealer === 6 ? 'Ds' : 'S'; // H17: double A,8 vs 6
    default: // soft 20, 21
      return 'S';
  }
}

// --- Pairs ---------------------------------------------------------------
function pairCode(rank: string, dealer: number): Code {
  const c = col(dealer);
  switch (rank) {
    case 'A':
      return 'P';
    case '10':
      return 'S';
    case '9':
      if (dealer === 7 || dealer === 10 || dealer === 11) return 'S';
      return 'P'; // 2-6, 8, 9
    case '8':
      if (dealer === 11) return 'Rp'; // H17 LS: surrender 8,8 vs Ace
      return 'P';
    case '7':
      return c <= col(7) ? 'P' : 'H';
    case '6':
      return c <= col(6) ? 'P' : 'H';
    case '5':
      // Never split; play as hard 10.
      return c <= col(9) ? 'D' : 'H';
    case '4':
      return c >= col(5) && c <= col(6) ? 'P' : 'H'; // DAS
    case '3':
    case '2':
      return c <= col(7) ? 'P' : 'H';
    default:
      return 'H';
  }
}

function resolve(code: Code, opts: StrategyOptions): Action {
  switch (code) {
    case 'H':
      return 'hit';
    case 'S':
      return 'stand';
    case 'D':
      return opts.canDouble ? 'double' : 'hit';
    case 'Ds':
      return opts.canDouble ? 'double' : 'stand';
    case 'P':
      return opts.canSplit ? 'split' : 'hit';
    case 'Rh':
      return opts.canSurrender ? 'surrender' : 'hit';
    case 'Rs':
      return opts.canSurrender ? 'surrender' : 'stand';
    case 'Rp':
      return opts.canSurrender ? 'surrender' : opts.canSplit ? 'split' : 'hit';
  }
}

const REASONS: Record<Code, string> = {
  H: 'Take a card \u2014 the hand is too weak to stand here.',
  S: 'Stand \u2014 the dealer is likely to bust or you risk too much by hitting.',
  D: 'Double down \u2014 a strong position to put extra money out against this upcard.',
  Ds: 'Double if you can, otherwise stand \u2014 a favorable spot to press your bet.',
  P: 'Split \u2014 two separate hands play better than this pair combined.',
  Rh: 'Surrender if allowed \u2014 the hand loses too often to keep playing.',
  Rs: 'Surrender if allowed \u2014 even standing loses too often vs this upcard.',
  Rp: 'Surrender if allowed, otherwise split this pair.',
};

export function getStrategy(
  playerCards: Card[],
  dealerUpcard: Card,
  opts: StrategyOptions,
): StrategyResult {
  const dealer = upcardValue(dealerUpcard); // 2..11
  const hv = evaluateHand(playerCards);
  const dealerLabel = dealer === 11 ? 'A' : String(dealer);

  let code: Code;
  let scenarioLabel: string;

  if (opts.canSplit && isPair(playerCards)) {
    const pr = pairRank(playerCards[0]);
    code = pairCode(pr, dealer);
    scenarioLabel = `Pair ${pr === '10' ? '10s' : pr + 's'} vs ${dealerLabel}`;
  } else if (hv.soft && playerCards.length === 2) {
    code = softCode(hv.total, dealer);
    scenarioLabel = `Soft ${hv.total} vs ${dealerLabel}`;
  } else {
    code = hardCode(hv.total, dealer);
    scenarioLabel = `Hard ${hv.total} vs ${dealerLabel}`;
  }

  return {
    action: resolve(code, opts),
    reason: REASONS[code],
    scenarioLabel,
  };
}
