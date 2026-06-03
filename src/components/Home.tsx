import { useState } from 'react';
import { SESSION_PRESETS } from '../state/presets';
import type { SessionConfig, SessionPreset } from '../state/types';
import { loadStats, resetStats } from '../state/stats';

interface Props {
  onStart: (config: SessionConfig) => void;
}

const SPEED_LABELS: Record<number, string> = {
  1: 'Leisurely',
  3: 'Relaxed',
  5: 'Steady',
  7: 'Brisk',
  10: 'Casino speed',
};

function speedLabel(s: number): string {
  const keys = Object.keys(SPEED_LABELS)
    .map(Number)
    .sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) if (s >= k) best = k;
  return SPEED_LABELS[best];
}

export function Home({ onStart }: Props) {
  const [presetId, setPresetId] = useState<string>(SESSION_PRESETS[1].id);
  const [speed, setSpeed] = useState(5);
  const [periodicChecks, setPeriodicChecks] = useState(true);
  const [stats, setStats] = useState(() => loadStats());

  const preset =
    SESSION_PRESETS.find((p) => p.id === presetId) ?? SESSION_PRESETS[0];

  const stratPct =
    stats.strategyTotal > 0
      ? Math.round((stats.strategyCorrect / stats.strategyTotal) * 100)
      : null;
  const countPct =
    stats.countChecks > 0
      ? Math.round((stats.countExact / stats.countChecks) * 100)
      : null;

  function handleStart() {
    onStart({ preset: preset as SessionPreset, speed, periodicChecks });
  }

  return (
    <div className="min-h-full flex flex-col items-center px-4 py-10">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="text-gold-400">Blackjack</span> Trainer
        </h1>
        <p className="mt-2 text-stone-300 max-w-md">
          Drill perfect basic strategy and keep a running Hi-Lo count, just like
          a real table.
        </p>
        <p className="mt-1 text-xs text-stone-400 uppercase tracking-widest">
          6 decks &middot; dealer hits soft 17 &middot; double after split &middot; late surrender
        </p>
      </header>

      <div className="w-full max-w-2xl bg-black/25 backdrop-blur rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gold-400 mb-3">
          Choose your round
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {SESSION_PRESETS.map((p) => {
            const active = p.id === presetId;
            return (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={`text-left rounded-xl p-3 border transition-all ${
                  active
                    ? 'border-gold-400 bg-gold-500/15 ring-1 ring-gold-400/40'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-2xl font-bold text-white">{p.cards}</div>
                <div className="text-xs font-semibold text-gold-400">
                  {p.label}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-stone-300">
                  {p.blurb}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gold-400">
              Deal speed
            </h2>
            <span className="text-sm text-stone-200">{speedLabel(speed)}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="speed-slider w-full"
          />
          <div className="flex justify-between text-[11px] text-stone-400 mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        <label className="flex items-center gap-3 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={periodicChecks}
            onChange={(e) => setPeriodicChecks(e.target.checked)}
            className="w-5 h-5 accent-[var(--color-gold-500)]"
          />
          <span className="text-sm text-stone-200">
            Ask for the running count partway through (not just at the end)
          </span>
        </label>

        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-950 font-bold text-lg tracking-wide transition-colors shadow-lg"
        >
          Deal me in
        </button>
      </div>

      {stats.sessions > 0 && (
        <div className="w-full max-w-2xl mt-6 bg-black/20 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-300">
              Lifetime stats &middot; {stats.sessions} session
              {stats.sessions === 1 ? '' : 's'}
            </h3>
            <button
              onClick={() => {
                resetStats();
                setStats(loadStats());
              }}
              className="text-[11px] text-stone-400 hover:text-rose-300 underline"
            >
              reset
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Strategy" value={stratPct === null ? '\u2014' : `${stratPct}%`} />
            <Stat label="Count exact" value={countPct === null ? '\u2014' : `${countPct}%`} />
            <Stat label="Best streak" value={String(stats.bestStreak)} />
          </div>
        </div>
      )}

      <p className="mt-8 text-[11px] text-stone-400 max-w-md text-center">
        Hi-Lo count: cards 2&ndash;6 are <span className="text-emerald-300">+1</span>,
        7&ndash;9 are <span className="text-stone-200">0</span>, and 10&ndash;A are{' '}
        <span className="text-rose-300">&minus;1</span>.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 py-3">
      <div className="text-2xl font-bold text-gold-400">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-stone-400">
        {label}
      </div>
    </div>
  );
}
