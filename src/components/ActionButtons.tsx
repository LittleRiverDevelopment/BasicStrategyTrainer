import { useEffect } from 'react';
import type { Action } from '../lib/strategy';

interface Props {
  canSplit: boolean;
  disabled?: boolean;
  onAction: (a: Action) => void;
}

const BUTTONS: { action: Action; label: string; key: string; cls: string }[] = [
  { action: 'hit', label: 'Hit', key: 'H', cls: 'bg-sky-600 hover:bg-sky-500' },
  {
    action: 'stand',
    label: 'Stand',
    key: 'S',
    cls: 'bg-rose-600 hover:bg-rose-500',
  },
  {
    action: 'double',
    label: 'Double',
    key: 'D',
    cls: 'bg-amber-500 hover:bg-amber-400 text-emerald-950',
  },
  {
    action: 'split',
    label: 'Split',
    key: 'P',
    cls: 'bg-violet-600 hover:bg-violet-500',
  },
  {
    action: 'surrender',
    label: 'Surrender',
    key: 'R',
    cls: 'bg-stone-600 hover:bg-stone-500',
  },
];

export function ActionButtons({ canSplit, disabled, onAction }: Props) {
  useEffect(() => {
    if (disabled) return;
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      const map: Record<string, Action> = {
        h: 'hit',
        s: 'stand',
        d: 'double',
        p: 'split',
        r: 'surrender',
      };
      const a = map[k];
      if (!a) return;
      if (a === 'split' && !canSplit) return;
      e.preventDefault();
      onAction(a);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canSplit, disabled, onAction]);

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {BUTTONS.map((b) => {
        const hidden = b.action === 'split' && !canSplit;
        if (hidden) return null;
        return (
          <button
            key={b.action}
            disabled={disabled}
            onClick={() => onAction(b.action)}
            className={`${b.cls} disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-4 sm:px-5 py-3 rounded-xl shadow-lg transition-all active:scale-95 min-w-[84px]`}
          >
            <span>{b.label}</span>
            <span className="ml-1.5 text-[10px] opacity-70 font-mono">
              {b.key}
            </span>
          </button>
        );
      })}
    </div>
  );
}
