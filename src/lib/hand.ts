import type { Card, Rank } from './cards';
import { cardValue } from './cards';

export interface HandValue {
  /** Best total <= 21 when possible. */
  total: number;
  /** True when an Ace is counted as 11 in `total`. */
  soft: boolean;
  isBust: boolean;
  isBlackjack: boolean;
}

/** Evaluate the total of a hand, treating Aces optimally. */
export function evaluateHand(cards: Card[]): HandValue {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces += 1;
  }
  // Demote Aces from 11 to 1 while we are over 21.
  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces -= 1;
  }
  const soft = softAces > 0;
  return {
    total,
    soft,
    isBust: total > 21,
    isBlackjack: cards.length === 2 && total === 21,
  };
}

/** True if the two cards form a pair eligible for splitting (by value). */
export function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cardValue(cards[0].rank) === cardValue(cards[1].rank);
}

/** The rank used for pair-strategy lookups (face cards map to '10'). */
export function pairRank(card: Card): Rank | '10' {
  const v = cardValue(card.rank);
  if (v === 10) return '10';
  return card.rank;
}

/** Dealer upcard value used for strategy columns (Ace = 11). */
export function upcardValue(card: Card): number {
  return cardValue(card.rank);
}
