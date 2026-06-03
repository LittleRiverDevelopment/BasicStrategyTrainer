import type { SessionPreset } from './types';

export const SESSION_PRESETS: SessionPreset[] = [
  {
    id: 'quick',
    label: 'Quick Drill',
    cards: 20,
    blurb: '20 cards \u00b7 ~7 hands. A fast warm-up.',
  },
  {
    id: 'medium',
    label: 'Medium Set',
    cards: 40,
    blurb: '40 cards \u00b7 ~13 hands. Build your rhythm.',
  },
  {
    id: 'deck',
    label: 'Full Deck',
    cards: 52,
    blurb: '52 cards \u00b7 the classic single-deck count-down.',
  },
  {
    id: 'shoe',
    label: 'Full Shoe',
    cards: 156,
    blurb: '156 cards \u00b7 a deep run for stamina & true count.',
  },
];

/** Map the speed slider (1..10) to a delay between dealt cards (ms). */
export function dealDelayMs(speed: number): number {
  // speed 1 -> 720ms, speed 10 -> 130ms
  const clamped = Math.min(10, Math.max(1, speed));
  return Math.round(720 - (clamped - 1) * (590 / 9));
}

/** Delay before auto-advancing after feedback (ms), also scaled by speed. */
export function feedbackDelayMs(speed: number): number {
  const clamped = Math.min(10, Math.max(1, speed));
  return Math.round(1700 - (clamped - 1) * (900 / 9));
}

/** Ask for the running count every N rounds when periodic checks are on. */
export const CHECK_EVERY_ROUNDS = 5;

/** Number of decks in the shoe (rules baseline). */
export const SHOE_DECKS = 6;
