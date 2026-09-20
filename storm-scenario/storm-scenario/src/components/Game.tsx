'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { agents } from '@/data/agents';
import { evidence } from '@/data/evidence';
import { gameReducer, initialState } from '@/lib/gameState';
import { registerStatusTool } from '@/lib/modelContext';
import { useGameAudio } from '@/lib/useGameAudio';
import { GameHud } from './GameHud';
import { BriefScreen } from './screens/BriefScreen';
import { SituationScreen } from './screens/SituationScreen';
import { AgentsScreen } from './screens/AgentsScreen';
import { EvidenceScreen } from './screens/EvidenceScreen';
import { DecisionScreen } from './screens/DecisionScreen';
import { OutcomeScreen } from './screens/OutcomeScreen';
import { DebriefScreen } from './screens/DebriefScreen';
import { SourceSheet } from './sheets/SourceSheet';
import { ReviewSheet } from './sheets/ReviewSheet';

export function Game() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [advisorPreview, setAdvisorPreview] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [immersive, setImmersive] = useState(false);

  const audio = useGameAudio();
  const deviceRef = useRef<HTMLDivElement>(null);

  // `read_operation_status` reads live state without re-registering per render.
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => registerStatusTool(() => stateRef.current), []);

  // Sheets belong to a single step; any advance closes them.
  useEffect(() => {
    setSourceOpen(false);
    setReviewOpen(false);
  }, [state.screen, state.index]);

  // Outcome stings play once per run.
  useEffect(() => {
    if (state.screen === 'brief') audio?.resetRun();
    if (state.screen === 'outcome') audio?.playOutcome(state.outcome);
  }, [state.screen, state.outcome, audio]);

  useEffect(() => {
    document.body.classList.toggle('immersive', immersive);
  }, [immersive]);

  const sheetOpen = sourceOpen || reviewOpen;

  // Esc closes a sheet; Tab is trapped on its close button, matching the prototype.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSourceOpen(false);
        setReviewOpen(false);
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        document.querySelector<HTMLElement>('.bottom-sheet button')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sheetOpen]);

  const toggleImmersive = useCallback(() => {
    const next = !immersive;
    setImmersive(next);
    if (!next && document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (next && document.fullscreenEnabled) {
      deviceRef.current?.requestFullscreen?.().catch(() => {});
    }
  }, [immersive]);

  const stepAdvisor = useCallback(
    (delta: 1 | -1) => {
      setAdvisorPreview((current) => (current + delta + agents.length) % agents.length);
      audio?.cue('switch');
    },
    [audio],
  );

  const agent = state.agent === null ? null : agents[state.agent];

  function renderScreen() {
    switch (state.screen) {
      case 'brief':
        return (
          <BriefScreen
            inert={sheetOpen}
            onStart={() => {
              audio?.cue('tap');
              dispatch({ type: 'start', at: Date.now() });
            }}
          />
        );

      case 'situation':
        return (
          <SituationScreen
            inert={sheetOpen}
            onConsult={() => {
              audio?.cue('tap');
              dispatch({ type: 'consult', at: Date.now() });
            }}
          />
        );

      case 'agents':
        return (
          <AgentsScreen
            inert={sheetOpen}
            preview={advisorPreview}
            onPreview={(index) => {
              setAdvisorPreview(index);
              audio?.cue('switch');
            }}
            onStep={stepAdvisor}
            onSelect={(index) => {
              audio?.cue('link');
              dispatch({ type: 'selectAgent', index, at: Date.now() });
            }}
          />
        );

      case 'evidence':
        if (!agent) return null;
        return (
          <EvidenceScreen
            inert={sheetOpen}
            agent={agent}
            index={state.index}
            verified={state.verified}
            onInspectSource={() => {
              audio?.cue('source');
              dispatch({ type: 'verify' });
              setSourceOpen(true);
            }}
            onAnswer={(trust) => {
              audio?.cue(trust ? 'trust' : 'reject');
              dispatch({
                type: 'answer',
                trust,
                advice: agent.advice[state.index],
                at: Date.now(),
              });
            }}
          />
        );

      case 'decision':
        if (!agent) return null;
        return (
          <DecisionScreen
            inert={sheetOpen}
            agent={agent}
            onChoose={(index) => {
              audio?.cue('tap');
              dispatch({ type: 'chooseRoute', index, at: Date.now() });
            }}
          />
        );

      case 'outcome':
        if (!state.outcome) return null;
        return (
          <OutcomeScreen
            inert={sheetOpen}
            outcome={state.outcome}
            onDebrief={() => {
              audio?.cue('tap');
              dispatch({ type: 'debrief' });
            }}
          />
        );

      case 'debrief':
        return (
          <DebriefScreen
            inert={sheetOpen}
            state={state}
            onReview={() => {
              audio?.cue('tap');
              setReviewOpen(true);
            }}
            onReset={() => {
              audio?.cue('tap');
              setAdvisorPreview(0);
              dispatch({ type: 'reset' });
            }}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="game-device" ref={deviceRef}>
      <div className="sea-background">
        <div className="radar-sweep" />
        <div className="sea-grid" />
      </div>

      <GameHud
        screen={state.screen}
        audio={audio}
        onToggleImmersive={toggleImmersive}
        inert={sheetOpen}
      />

      {renderScreen()}

      {sourceOpen && state.screen === 'evidence' ? (
        <SourceSheet item={evidence[state.index]} onClose={() => setSourceOpen(false)} />
      ) : null}
      {reviewOpen && state.screen === 'debrief' ? (
        <ReviewSheet state={state} onClose={() => setReviewOpen(false)} />
      ) : null}

      <div className="home-indicator" />
    </div>
  );
}
