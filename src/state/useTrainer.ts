import { useCallback, useEffect, useReducer } from 'react';
import { buildShoe, hiLoValue, shuffle } from '../lib/cards';
import type { Card } from '../lib/cards';
import { getStrategy } from '../lib/strategy';
import type { Action } from '../lib/strategy';
import { isPair } from '../lib/hand';
import { CHECK_EVERY_ROUNDS, SHOE_DECKS, dealDelayMs } from './presets';
import type {
  DealStep,
  Round,
  SessionConfig,
  TrainerState,
} from './types';

const initialState: TrainerState = {
  phase: 'home',
  config: null,
  shoe: [],
  shoePos: 0,
  round: null,
  visible: 0,
  runningCount: 0,
  cardsDealt: 0,
  roundsPlayed: 0,
  result: null,
  pendingCheckIsFinal: false,
  strategyCorrect: 0,
  strategyTotal: 0,
  streak: 0,
  bestStreak: 0,
  countChecks: [],
  scenarios: {},
};

type Act =
  | { type: 'START'; config: SessionConfig }
  | { type: 'REVEAL' }
  | { type: 'CHOOSE'; action: Action }
  | { type: 'CONTINUE' }
  | { type: 'SUBMIT_COUNT'; guess: number }
  | { type: 'RESTART' };

/** Build a round (player two cards + dealer upcard) from the shoe. */
function dealRound(shoe: Card[], pos: number): { round: Round; pos: number } {
  const p0 = shoe[pos];
  const up = shoe[pos + 1];
  const p1 = shoe[pos + 2];
  const sequence: DealStep[] = [
    { target: 'player', card: p0 },
    { target: 'dealer', card: up },
    { target: 'player', card: p1 },
  ];
  return {
    round: { sequence, player: [p0, p1], dealerUp: up },
    pos: pos + 3,
  };
}

function startNextRound(state: TrainerState): TrainerState {
  let { shoe, shoePos } = state;
  // Reshuffle a fresh shoe if we are running low.
  if (shoePos + 3 > shoe.length) {
    shoe = shuffle(buildShoe(SHOE_DECKS));
    shoePos = 0;
  }
  const { round, pos } = dealRound(shoe, shoePos);
  return {
    ...state,
    shoe,
    shoePos: pos,
    round,
    visible: 0,
    phase: 'dealing',
    result: null,
  };
}

function reducer(state: TrainerState, action: Act): TrainerState {
  switch (action.type) {
    case 'START': {
      const shoe = shuffle(buildShoe(SHOE_DECKS));
      const base: TrainerState = {
        ...initialState,
        phase: 'dealing',
        config: action.config,
        shoe,
        shoePos: 0,
      };
      return startNextRound(base);
    }

    case 'REVEAL': {
      if (state.phase !== 'dealing' || !state.round) return state;
      const idx = state.visible;
      const step = state.round.sequence[idx];
      if (!step) return state;
      const visible = state.visible + 1;
      const runningCount = state.runningCount + hiLoValue(step.card.rank);
      const cardsDealt = state.cardsDealt + 1;
      const done = visible >= state.round.sequence.length;
      return {
        ...state,
        visible,
        runningCount,
        cardsDealt,
        phase: done ? 'deciding' : 'dealing',
      };
    }

    case 'CHOOSE': {
      if (state.phase !== 'deciding' || !state.round) return state;
      const { player, dealerUp } = state.round;
      const strat = getStrategy(player, dealerUp, {
        canDouble: true,
        canSurrender: true,
        canSplit: isPair(player),
      });
      const isCorrect = action.action === strat.action;
      const scenarios = { ...state.scenarios };
      const prev = scenarios[strat.scenarioLabel] ?? { wrong: 0, total: 0 };
      scenarios[strat.scenarioLabel] = {
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        total: prev.total + 1,
      };
      const streak = isCorrect ? state.streak + 1 : 0;
      return {
        ...state,
        phase: 'feedback',
        result: {
          chosen: action.action,
          correct: strat.action,
          isCorrect,
          reason: strat.reason,
          scenarioLabel: strat.scenarioLabel,
        },
        strategyCorrect: state.strategyCorrect + (isCorrect ? 1 : 0),
        strategyTotal: state.strategyTotal + 1,
        roundsPlayed: state.roundsPlayed + 1,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        scenarios,
      };
    }

    case 'CONTINUE': {
      if (state.phase !== 'feedback' || !state.config) return state;
      const sessionOver = state.cardsDealt >= state.config.preset.cards;
      if (sessionOver) {
        return { ...state, phase: 'countCheck', pendingCheckIsFinal: true };
      }
      if (
        state.config.periodicChecks &&
        state.roundsPlayed % CHECK_EVERY_ROUNDS === 0
      ) {
        return { ...state, phase: 'countCheck', pendingCheckIsFinal: false };
      }
      return startNextRound(state);
    }

    case 'SUBMIT_COUNT': {
      if (state.phase !== 'countCheck') return state;
      const checks = [
        ...state.countChecks,
        {
          guess: action.guess,
          correct: state.runningCount,
          isFinal: state.pendingCheckIsFinal,
        },
      ];
      if (state.pendingCheckIsFinal) {
        return { ...state, countChecks: checks, phase: 'summary' };
      }
      return startNextRound({ ...state, countChecks: checks });
    }

    case 'RESTART':
      return { ...initialState };

    default:
      return state;
  }
}

export function useTrainer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Drive the deal animation: reveal one card at a time at the chosen speed.
  useEffect(() => {
    if (state.phase !== 'dealing' || !state.config) return;
    const delay = state.visible === 0 ? 250 : dealDelayMs(state.config.speed);
    const t = setTimeout(() => dispatch({ type: 'REVEAL' }), delay);
    return () => clearTimeout(t);
  }, [state.phase, state.visible, state.config]);

  const start = useCallback(
    (config: SessionConfig) => dispatch({ type: 'START', config }),
    [],
  );
  const choose = useCallback(
    (a: Action) => dispatch({ type: 'CHOOSE', action: a }),
    [],
  );
  const cont = useCallback(() => dispatch({ type: 'CONTINUE' }), []);
  const submitCount = useCallback(
    (guess: number) => dispatch({ type: 'SUBMIT_COUNT', guess }),
    [],
  );
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return { state, start, choose, cont, submitCount, restart };
}
