'use client';

import { useEffect, useRef } from 'react';
import { agents } from '@/data/agents';
import { evidence } from '@/data/evidence';
import type { GameState } from '@/lib/gameState';

/** Debrief panel listing every clue with the player's call and the verdict. */
export function ReviewSheet({ state, onClose }: { state: GameState; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  return (
    <div className="scrim">
      <section
        className="bottom-sheet audit-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Evidence review"
      >
        <div className="sheet-handle" />
        <div className="sheet-title">
          <h2>Evidence review</h2>
          <button className="icon-btn" ref={closeRef} onClick={onClose} aria-label="Close review">
            ×
          </button>
        </div>
        <div className="audit-list">
          {evidence.map((item, i) => (
            <article key={item.title}>
              <small>
                0{i + 1} / {state.verified[i] ? 'Source inspected' : 'Source not inspected'}
              </small>
              <h3>{item.title}</h3>
              <p>
                Your call:{' '}
                {i < state.answers.length
                  ? state.answers[i]
                    ? 'TRUST'
                    : 'DON’T TRUST'
                  : 'Not reviewed'}{' '}
                ·{' '}
                <span className={item.truth ? 'good' : 'bad'}>
                  Verdict: {item.truth ? 'Reliable' : 'Unreliable'}
                </span>
              </p>
              <p>
                AI:{' '}
                {state.agent === null
                  ? 'No advisor'
                  : agents[state.agent].advice[i]
                    ? 'TRUST'
                    : 'DON’T TRUST'}
              </p>
              <p>{item.why}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
