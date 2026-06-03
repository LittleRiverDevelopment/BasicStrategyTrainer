import type { Card } from '../lib/cards';
import { SUIT_SYMBOL, isRed } from '../lib/cards';

interface Props {
  card?: Card;
  faceDown?: boolean;
  /** Apply the deal-in animation. */
  dealt?: boolean;
}

export function PlayingCard({ card, faceDown, dealt }: Props) {
  const base =
    'relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-xl select-none';

  if (faceDown || !card) {
    return (
      <div
        className={`${base} ${dealt ? 'animate-deal' : ''} border border-emerald-900/40`}
        style={{
          background:
            'repeating-linear-gradient(45deg, #7f1d1d 0 8px, #991b1b 8px 16px)',
        }}
      >
        <div className="absolute inset-1.5 rounded-lg border-2 border-rose-200/30" />
      </div>
    );
  }

  const red = isRed(card.suit);
  const color = red ? 'text-rose-600' : 'text-stone-900';
  const sym = SUIT_SYMBOL[card.suit];

  return (
    <div
      className={`${base} bg-white flex flex-col justify-between p-1.5 ${dealt ? 'animate-deal' : ''}`}
    >
      <div className={`text-left leading-none ${color}`}>
        <div className="text-sm sm:text-base font-bold">{card.rank}</div>
        <div className="text-xs sm:text-sm">{sym}</div>
      </div>
      <div className={`text-center text-2xl sm:text-3xl ${color}`}>{sym}</div>
      <div className={`text-right leading-none rotate-180 ${color}`}>
        <div className="text-sm sm:text-base font-bold">{card.rank}</div>
        <div className="text-xs sm:text-sm">{sym}</div>
      </div>
    </div>
  );
}
