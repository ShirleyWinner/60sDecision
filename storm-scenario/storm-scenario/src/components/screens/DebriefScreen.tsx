'use client';

import { useMemo } from 'react';
import { analyzeRun, formatDuration } from '@/lib/debrief';
import { useFeedback } from '@/lib/useFeedback';
import type { GameState } from '@/lib/gameState';
import { DockButton, ScreenFrame } from '../ScreenFrame';

interface DebriefScreenProps {
  state: GameState;
  onReview: () => void;
  onReset: () => void;
  inert?: boolean;
}

const call = (value: boolean) => (value ? 'TRUST' : 'DON’T TRUST');

export function DebriefScreen({ state, onReview, onReset, inert }: DebriefScreenProps) {
  // Memoised so the feedback request fires once per run, not once per render.
  const analysis = useMemo(() => analyzeRun(state), [state]);
  const { text: feedback, status } = useFeedback(analysis);

  if (!analysis) return null;
  const { mission, profile, trust, review, correct, verified, agreed, total } = analysis;

  const quadrants = [
    {
      label: 'Correct adoption',
      hint: 'Advisor right, you agreed',
      value: trust.correctAdoption,
      tone: 'good',
    },
    {
      label: 'Correct challenge',
      hint: 'Advisor wrong, you refused',
      value: trust.correctChallenge,
      tone: 'good',
    },
    {
      label: 'Blind trust',
      hint: 'Advisor wrong, you agreed',
      value: trust.blindTrust,
      tone: 'bad',
    },
    {
      label: 'Wrong rejection',
      hint: 'Advisor right, you refused',
      value: trust.wrongRejection,
      tone: 'bad',
    },
  ];

  return (
    <ScreenFrame
      screen="debrief"
      inert={inert}
      kicker="AFTER ACTION / Debrief"
      title="AI Analysis"
      subtitle={`${analysis.advisor} · ${mission.route}`}
      dock={<DockButton onClick={onReset}>PLAY AGAIN　↻</DockButton>}
    >
      <div className="report-masthead"><div><strong>AFTER-ACTION DOSSIER</strong><span>Same ocean. Different minds.</span></div><div className="art art-analyst" aria-hidden="true" /></div>
      <section className="debrief-block">
        <h3>1 · Mission Outcome</h3>
        <div className="outcome-grid">
          <div>
            <small>FINAL ORDER</small>
            <b>{mission.route}</b>
          </div>
          <div>
            <small>RESULT</small>
            <b>{mission.ending}</b>
          </div>
          <div>
            <small>ARRIVAL</small>
            <b className={mission.onTime === false ? 'bad' : undefined}>
              {mission.arrival}
              {mission.onTime === null ? '' : mission.onTime ? ' · on time' : ' · late'}
            </b>
          </div>
          <div>
            <small>CREW</small>
            <b className={mission.safe ? 'good' : 'bad'}>{mission.safe ? 'SAFE' : 'AT RISK'}</b>
          </div>
        </div>
        <p className="debrief-note">{mission.risk}.</p>
        <p className="debrief-note">
          Deliberation: {formatDuration(mission.evidenceMs)} on clues ·{' '}
          {formatDuration(mission.decisionMs)} on the order. Countdown disabled.
        </p>
      </section>

      <section className="debrief-block">
        <h3>2 · Your Decision Profile</h3>
        <div className="profile-card">
          <b>{profile.name}</b>
          <p>{profile.blurb}</p>
          <small>{profile.rationale}</small>
        </div>
      </section>

      <section className="debrief-block">
        <h3>3 · AI Trust Calibration</h3>
        <div className="trust-grid">
          {quadrants.map((quadrant) => (
            <div key={quadrant.label}>
              <b className={quadrant.tone}>{quadrant.value}</b>
              <span>{quadrant.label}</span>
              <small>{quadrant.hint}</small>
            </div>
          ))}
        </div>
        <p className="debrief-note">
          {correct}/{total} correct · {verified}/{total} sources checked · {agreed}/{total} agreed
          with {analysis.advisor}.
        </p>
      </section>

      <section className="debrief-block">
        <h3>4 · Evidence Review</h3>
        <ul className="review-rows">
          {review.map((row) => (
            <li key={row.index}>
              <div className="review-head">
                <b>
                  0{row.index + 1} {row.title}
                </b>
                <em className={row.correct ? 'good' : 'bad'}>{row.correct ? '✓' : '✗'}</em>
              </div>
              <div className="review-calls">
                <span>You: {call(row.playerCall)}</span>
                <span>AI: {call(row.advice)}</span>
                <span className={row.truth ? 'good' : 'bad'}>
                  Fact: {row.truth ? 'Reliable' : 'Unreliable'}
                </span>
                <span>{row.inspectedSource ? 'Source checked' : 'Source skipped'}</span>
              </div>
              <p>{row.why}</p>
            </li>
          ))}
        </ul>
        <button className="audit-button" onClick={onReview}>
          OPEN FULL REVIEW　↗
        </button>
      </section>

      <section className="debrief-block">
        <h3>5 · Personalized Feedback</h3>
        <div className={`feedback-card ${status}`}>
          {status === 'loading' ? (
            <p className="feedback-loading">Analyzing your trajectory…</p>
          ) : (
            <p>{feedback}</p>
          )}
          {status === 'fallback' ? <small>Offline summary — OpenRouter unavailable.</small> : null}
        </div>
      </section>
    </ScreenFrame>
  );
}
