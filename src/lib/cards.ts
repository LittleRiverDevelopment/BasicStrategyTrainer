// Card model, shoe generation, and Hi-Lo count values.

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

// Rank as it appears on the card. "T/J/Q/K" all count as a value of 10.
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

export const RED_SUITS: Suit[] = ['hearts', 'diamonds'];

export const SUIT_SYMBOL: Record<Suit, string> = {
  spades: '\u2660',
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
};

/** Blackjack point value of a rank (Ace returned as 11; soft handling elsewhere). */
export function cardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return parseInt(rank, 10);
}

/** Hi-Lo running-count contribution for a single card. */
export function hiLoValue(rank: Rank): number {
  const v = cardValue(rank);
  if (v >= 2 && v <= 6) return 1; // low cards
  if (v === 7 || v === 8 || v === 9) return 0; // neutral
  return -1; // 10/face/Ace
}

/** Build a shoe of `decks` standard 52-card decks. */
export function buildShoe(decks: number): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < decks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({ id: `${d}-${suit}-${rank}`, rank, suit });
      }
    }
  }
  return shoe;
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}
