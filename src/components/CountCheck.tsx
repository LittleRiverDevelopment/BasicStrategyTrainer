import { useEffect, useRef, useState } from 'react';

interface Props {
  isFinal: boolean;
  /** The true running count, revealed only after the user commits a guess. */
  correct: number;
  /** Decks still left in the shoe, used to derive the true count. */
  decksRemaining: number;
  onSubmit: (guess: number) => void;
}

function fmt(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

export function CountCheck({
  isFinal,
  correct,
  decksRemaining,
  onSubmit,
}: Props) {
  const [value, setValue] = useState('0');
  const [committed, setCommitted] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function commit() {
    if (committed !== null) return;
    const guess = parseInt(value, 10);
    if (Number.isNaN(guess)) return;
    setCommitted(guess);
  }

  const isCorrect = committed === correct;
  const trueCount =
    decksRemaining > 0 ? correct / decksRemaining : correct;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-emerald-950 border border-gold-400/30 rounded-2xl p-6 shadow-2xl text-center animate-pop">
        <h2 className="text-gold-400 text-xs font-semibold uppercase tracking-widest">
          {isFinal ? 'Final count check' : 'Count check'}
        </h2>
        <p className="mt-2 text-lg text-white font-medium">
          What&rsquo;s the running count?
        </p>

        {committed === null ? (
          <>
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commit()}
              className="mt-4 w-32 text-center text-3xl font-bold bg-black/40 border border-white/20 rounded-xl py-3 text-white focus:border-gold-400 outline-none"
            />
            <button
              onClick={commit}
              className="mt-4 w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-950 font-bold transition-colors"
            >
              Lock it in
            </button>
          </>
        ) : (
          <>
            <div className="mt-4 flex items-stretch justify-center gap-3">
              <div className="flex-1 rounded-xl bg-black/40 border border-white/10 py-3">
                <div className="text-[10px] uppercase tracking-widest text-stone-400">
                  Your count
                </div>
                <div className="text-3xl font-bold text-white">
                  {fmt(committed)}
                </div>
              </div>
              <div
                className={`flex-1 rounded-xl py-3 border ${
                  isCorrect
                    ? 'bg-emerald-500/15 border-emerald-400/40'
                    : 'bg-rose-500/15 border-rose-400/40'
                }`}
              >
                <div className="text-[10px] uppercase tracking-widest text-stone-300">
                  Actual count
                </div>
                <div
                  className={`text-3xl font-bold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}
                >
                  {fmt(correct)}
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm">
              {isCorrect ? (
                <span className="text-emerald-300 font-semibold">
                  Spot on! Your count was exact.
                </span>
              ) : (
                <span className="text-stone-300">
                  Off by{' '}
                  <span className="font-semibold text-white">
                    {Math.abs(committed - correct)}
                  </span>
                  .
                </span>
              )}
            </p>

            <p className="mt-1 text-xs text-stone-400">
              True count &asymp;{' '}
              <span className="text-gold-400 font-semibold">
                {trueCount > 0 ? '+' : ''}
                {trueCount.toFixed(1)}
              </span>{' '}
              ({fmt(correct)} &divide; {decksRemaining.toFixed(1)} decks left)
            </p>

            <button
              onClick={() => onSubmit(committed)}
              autoFocus
              className="mt-5 w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-950 font-bold transition-colors"
            >
              {isFinal ? 'See results' : 'Keep playing'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
