import { useEffect, useRef } from 'react';
import { Home } from './components/Home';
import { Table } from './components/Table';
import { CountCheck } from './components/CountCheck';
import { SessionSummary } from './components/SessionSummary';
import { useTrainer } from './state/useTrainer';
import { feedbackDelayMs } from './state/presets';
import { recordSession } from './state/stats';

export default function App() {
  const { state, start, choose, cont, submitCount, restart } = useTrainer();
  const recorded = useRef(false);

  // Auto-advance after feedback; allow space/enter to continue immediately.
  useEffect(() => {
    if (state.phase !== 'feedback' || !state.config) return;
    const t = setTimeout(cont, feedbackDelayMs(state.config.speed));
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        cont();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [state.phase, state.config, cont]);

  // Persist lifetime stats exactly once when a session ends.
  useEffect(() => {
    if (state.phase === 'summary' && !recorded.current) {
      recorded.current = true;
      recordSession(state);
    }
    if (state.phase === 'home') {
      recorded.current = false;
    }
  }, [state.phase, state]);

  if (state.phase === 'home') {
    return <Home onStart={start} />;
  }

  if (state.phase === 'summary') {
    return <SessionSummary state={state} onRestart={restart} />;
  }

  return (
    <>
      <Table
        state={state}
        onAction={choose}
        onContinue={cont}
        onQuit={restart}
      />
      {state.phase === 'countCheck' && (
        <CountCheck
          isFinal={state.pendingCheckIsFinal}
          correct={state.runningCount}
          decksRemaining={(state.shoe.length - state.shoePos) / 52}
          onSubmit={submitCount}
        />
      )}
    </>
  );
}
