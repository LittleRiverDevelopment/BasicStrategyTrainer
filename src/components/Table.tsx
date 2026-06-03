import { evaluateHand } from '../lib/hand';
import { isPair } from '../lib/hand';
import { ACTION_LABEL } from '../lib/strategy';
import type { Action } from '../lib/strategy';
import type { Card } from '../lib/cards';
import type { TrainerState } from '../state/types';
import { PlayingCard } from './PlayingCard';
import { ActionButtons } from './ActionButtons';

interface Props {
  state: TrainerState;
  onAction: (a: Action) => void;
  onContinue: () => void;
  onQuit: () => void;
}

function handLabel(cards: Card[]): string {
  if (cards.length === 0) return '';
  const hv = evaluateHand(cards);
  if (hv.isBlackjack) return 'Blackjack!';
  if (isPair(cards)) return `Pair \u00b7 ${hv.total}`;
  return `${hv.soft ? 'Soft ' : ''}${hv.total}`;
}

export function Table({ state, onAction, onContinue, onQuit }: Props) {
  const { round, visible, config, result, phase } = state;
  if (!round || !config) return null;

  const revealed = round.sequence.slice(0, visible);
  const playerCards = revealed
    .filter((s) => s.target === 'player')
    .map((s) => s.card);
  const dealerCards = revealed
    .filter((s) => s.target === 'dealer')
    .map((s) => s.card);
  const dealerShown = dealerCards.length > 0;

  const target = config.preset.cards;
  const progress = Math.min(100, (state.cardsDealt / target) * 100);
  const accuracy =
    state.strategyTotal > 0
      ? Math.round((state.strategyCorrect / state.strategyTotal) * 100)
      : 100;

  const deciding = phase === 'deciding';
  const showingFeedback = phase === 'feedback' && result;

  return (
    <div className="felt min-h-full flex flex-col">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <button
          onClick={onQuit}
          className="text-stone-300 hover:text-white text-xs uppercase tracking-wide"
        >
          &larr; Quit
        </button>
        <div className="flex items-center gap-4">
          <HudStat label="Accuracy" value={`${accuracy}%`} />
          <HudStat
            label="Streak"
            value={String(state.streak)}
            highlight={state.streak >= 3}
          />
          <HudStat
            label="Cards"
            value={`${Math.min(state.cardsDealt, target)}/${target}`}
          />
        </div>
      </div>
      <div className="h-1 bg-black/30">
        <div
          className="h-full bg-gold-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dealer */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-6">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-widest text-stone-300 mb-2">
            Dealer
          </div>
          <div className="flex gap-2 justify-center min-h-[7rem]">
            {dealerCards.map((c) => (
              <PlayingCard key={c.id} card={c} dealt />
            ))}
            {dealerShown && <PlayingCard faceDown />}
          </div>
        </div>

        {/* Player */}
        <div className="text-center">
          <div className="flex gap-2 justify-center min-h-[7rem] items-end">
            {playerCards.map((c) => (
              <PlayingCard key={c.id} card={c} dealt />
            ))}
          </div>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-black/30 text-sm font-semibold text-white min-h-[1.75rem]">
            {handLabel(playerCards)}
          </div>
          <div className="text-[11px] uppercase tracking-widest text-stone-300 mt-1">
            You
          </div>
        </div>
      </div>

      {/* Controls / feedback */}
      <div className="px-4 pb-8 pt-2 min-h-[150px] flex flex-col items-center justify-end">
        {deciding && (
          <ActionButtons
            canSplit={isPair(round.player)}
            onAction={onAction}
          />
        )}
        {showingFeedback && (
          <FeedbackBanner result={result!} onContinue={onContinue} />
        )}
      </div>
    </div>
  );
}

function HudStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center leading-tight">
      <div
        className={`text-base font-bold ${highlight ? 'text-gold-400' : 'text-white'}`}
      >
        {value}
        {highlight && label === 'Streak' ? ' \uD83D\uDD25' : ''}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-stone-400">
        {label}
      </div>
    </div>
  );
}

function FeedbackBanner({
  result,
  onContinue,
}: {
  result: NonNullable<TrainerState['result']>;
  onContinue: () => void;
}) {
  const good = result.isCorrect;
  return (
    <div
      onClick={onContinue}
      className={`w-full max-w-xl rounded-2xl border p-4 cursor-pointer animate-pop ${
        good
          ? 'bg-emerald-600/20 border-emerald-400/50'
          : 'bg-rose-600/20 border-rose-400/50 animate-shake'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`text-2xl font-bold ${good ? 'text-emerald-300' : 'text-rose-300'}`}
        >
          {good ? '\u2713' : '\u2717'}
        </div>
        <div className="flex-1">
          {good ? (
            <div className="font-bold text-emerald-200">
              Correct &mdash; {ACTION_LABEL[result.correct]}
            </div>
          ) : (
            <div className="font-bold text-rose-200">
              You chose {ACTION_LABEL[result.chosen]} &middot; correct play was{' '}
              <span className="underline">{ACTION_LABEL[result.correct]}</span>
            </div>
          )}
          <div className="text-sm text-stone-200 mt-0.5">{result.reason}</div>
        </div>
      </div>
      <div className="text-center text-[11px] text-stone-300 mt-2 uppercase tracking-wide">
        tap or press space to continue
      </div>
    </div>
  );
}
