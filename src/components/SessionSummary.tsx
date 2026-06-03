import type { TrainerState } from '../state/types';

interface Props {
  state: TrainerState;
  onRestart: () => void;
}

export function SessionSummary({ state, onRestart }: Props) {
  const stratPct =
    state.strategyTotal > 0
      ? Math.round((state.strategyCorrect / state.strategyTotal) * 100)
      : 0;

  const checks = state.countChecks;
  const exact = checks.filter((c) => c.guess === c.correct).length;
  const within1 = checks.filter(
    (c) => Math.abs(c.guess - c.correct) <= 1,
  ).length;
  const avgErr =
    checks.length > 0
      ? (
          checks.reduce((a, c) => a + Math.abs(c.guess - c.correct), 0) /
          checks.length
        ).toFixed(1)
      : '0';

  const weakSpots = Object.entries(state.scenarios)
    .filter(([, s]) => s.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, 5);

  const grade =
    stratPct >= 95
      ? { txt: 'Sharp', color: 'text-emerald-400' }
      : stratPct >= 85
        ? { txt: 'Solid', color: 'text-gold-400' }
        : stratPct >= 70
          ? { txt: 'Getting there', color: 'text-amber-400' }
          : { txt: 'Keep drilling', color: 'text-rose-400' };

  return (
    <div className="min-h-full flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold text-white">Session complete</h1>
      <p className={`mt-1 text-lg font-semibold ${grade.color}`}>{grade.txt}</p>

      <div className="w-full max-w-lg mt-6 grid grid-cols-2 gap-3">
        <BigStat
          label="Strategy accuracy"
          value={`${stratPct}%`}
          sub={`${state.strategyCorrect}/${state.strategyTotal} hands`}
        />
        <BigStat
          label="Best streak"
          value={String(state.bestStreak)}
          sub="hands in a row"
        />
        <BigStat
          label="Count checks exact"
          value={`${exact}/${checks.length || 0}`}
          sub={`${within1}/${checks.length || 0} within \u00b11`}
        />
        <BigStat
          label="Avg count error"
          value={avgErr}
          sub="per check"
        />
      </div>

      <div className="w-full max-w-lg mt-4 bg-black/25 rounded-2xl border border-white/10 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3">
          Where you slipped
        </h2>
        {weakSpots.length === 0 ? (
          <p className="text-sm text-emerald-300">
            No mistakes &mdash; flawless basic strategy. Nice.
          </p>
        ) : (
          <ul className="space-y-2">
            {weakSpots.map(([label, s]) => (
              <li
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-stone-200">{label}</span>
                <span className="text-rose-300 font-medium">
                  missed {s.wrong}/{s.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={onRestart}
        className="mt-6 px-8 py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-emerald-950 font-bold text-lg transition-colors shadow-lg"
      >
        Play again
      </button>
    </div>
  );
}

function BigStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-4 text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-gold-400 mt-1">
        {label}
      </div>
      <div className="text-[11px] text-stone-400 mt-0.5">{sub}</div>
    </div>
  );
}
