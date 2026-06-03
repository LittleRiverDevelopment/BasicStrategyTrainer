import type { Card, Rank, Suit } from './src/lib/cards.ts';
import { getStrategy } from './src/lib/strategy.ts';

let id = 0;
function c(rank: Rank, suit: Suit = 'spades'): Card {
  return { id: `t${id++}`, rank, suit };
}

const opts = { canDouble: true, canSurrender: true, canSplit: true };

interface T {
  player: Card[];
  up: Card;
  expect: string;
  note: string;
}

const tests: T[] = [
  { player: [c('10'), c('6')], up: c('9'), expect: 'surrender', note: 'hard 16 vs 9 -> R' },
  { player: [c('10'), c('6')], up: c('6'), expect: 'stand', note: 'hard 16 vs 6 -> S' },
  { player: [c('10'), c('5')], up: c('10'), expect: 'surrender', note: 'hard 15 vs 10 -> R' },
  { player: [c('9'), c('2')], up: c('A'), expect: 'double', note: '11 vs A -> D (H17)' },
  { player: [c('5'), c('4')], up: c('5'), expect: 'double', note: '9 vs 5 -> D' },
  { player: [c('5'), c('4')], up: c('2'), expect: 'hit', note: '9 vs 2 -> H' },
  { player: [c('A'), c('7')], up: c('2'), expect: 'double', note: 'soft 18 vs 2 -> Ds (H17)' },
  { player: [c('A'), c('7')], up: c('9'), expect: 'hit', note: 'soft 18 vs 9 -> H' },
  { player: [c('A'), c('8')], up: c('6'), expect: 'double', note: 'soft 19 vs 6 -> Ds (H17)' },
  { player: [c('A'), c('8')], up: c('5'), expect: 'stand', note: 'soft 19 vs 5 -> S' },
  { player: [c('8'), c('8')], up: c('A'), expect: 'surrender', note: '8,8 vs A -> R (H17 LS)' },
  { player: [c('8'), c('8')], up: c('10'), expect: 'split', note: '8,8 vs 10 -> P' },
  { player: [c('9'), c('9')], up: c('7'), expect: 'stand', note: '9,9 vs 7 -> S' },
  { player: [c('9'), c('9')], up: c('9'), expect: 'split', note: '9,9 vs 9 -> P' },
  { player: [c('A'), c('A')], up: c('5'), expect: 'split', note: 'A,A -> P' },
  { player: [c('5'), c('5')], up: c('9'), expect: 'double', note: '5,5 vs 9 -> D (as 10)' },
  { player: [c('2'), c('2')], up: c('7'), expect: 'split', note: '2,2 vs 7 -> P' },
  { player: [c('2'), c('2')], up: c('8'), expect: 'hit', note: '2,2 vs 8 -> H' },
  { player: [c('10'), c('7')], up: c('A'), expect: 'surrender', note: 'hard 17 vs A -> R (H17)' },
  { player: [c('10'), c('10')], up: c('6'), expect: 'stand', note: '10,10 -> S' },
  { player: [c('6'), c('6')], up: c('2'), expect: 'split', note: '6,6 vs 2 -> P (DAS)' },
  { player: [c('4'), c('4')], up: c('5'), expect: 'split', note: '4,4 vs 5 -> P (DAS)' },
];

let pass = 0;
for (const t of tests) {
  const r = getStrategy(t.player, t.up, opts);
  const ok = r.action === t.expect;
  if (ok) pass++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${t.note}  =>  got ${r.action}${ok ? '' : ` (expected ${t.expect})`}`);
}
console.log(`\n${pass}/${tests.length} passed`);
if (pass !== tests.length) process.exit(1);
