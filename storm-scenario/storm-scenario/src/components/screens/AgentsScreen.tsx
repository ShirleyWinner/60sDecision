'use client';

import { useRef } from 'react';
import { agents } from '@/data/agents';
import { DockButton, ScreenFrame } from '../ScreenFrame';

interface AgentsScreenProps {
  preview: number;
  onPreview: (index: number) => void;
  onStep: (delta: 1 | -1) => void;
  onSelect: (index: number) => void;
  inert?: boolean;
}

const SWIPE_THRESHOLD = 60;

export function AgentsScreen({ preview, onPreview, onStep, onSelect, inert }: AgentsScreenProps) {
  const agent = agents[preview];
  const touchStartX = useRef<number | null>(null);

  return (
    <div
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const distance = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(distance) > SWIPE_THRESHOLD) onStep(distance < 0 ? 1 : -1);
        touchStartX.current = null;
      }}
      style={{ display: 'contents' }}
    >
      <ScreenFrame
        screen="agents"
        inert={inert}
        kicker="ADVISOR LINK / CHOOSE ONE"
        title="Choose your advisor"
        subtitle="They advise. You command."
        dock={<DockButton onClick={() => onSelect(preview)}>SELECT {agent.name}</DockButton>}
      >
        <div className="advisor-roster" aria-label="AI advisors">
          {agents.map((candidate, i) => (
            <button key={candidate.id} className={`roster-card ${candidate.id} ${preview === i ? 'is-selected' : ''}`} aria-pressed={preview === i} onClick={() => onPreview(i)}>
              <span className={`roster-portrait art art-${candidate.id}`} aria-hidden="true" />
              <span className="roster-copy"><strong>{candidate.name}</strong><em>{['Safety first.', 'Keep moving.', 'Let the data speak.'][i]}</em><span>{candidate.desc}</span><small>{candidate.type}</small></span>
              <span className="selection-ring" aria-hidden="true">{preview === i ? '●' : '○'}</span>
            </button>
          ))}
        </div>
        <div className="selected-bias"><small>KNOWN BLIND SPOT / {agent.name}</small><p>{agent.bias}</p></div>
        <div className="advisor-carousel legacy-carousel">
          <button className="arrow" onClick={() => onStep(-1)} aria-label="Previous advisor">
            ‹
          </button>
          <article className="advisor-card">
            <div className={`portrait portrait-${agent.id}`}>
              <span>{agent.symbol}</span>
              <div className="orbit" />
              <small>NEURAL LINK / 0{preview + 1}</small>
            </div>
            <h2>{agent.name}</h2>
            <div className="advisor-type">{agent.type}</div>
            <p>{agent.desc}</p>
            <div className="bias">
              <small>KNOWN BLIND SPOT</small>
              {agent.bias}
            </div>
          </article>
          <button className="arrow" onClick={() => onStep(1)} aria-label="Next advisor">
            ›
          </button>
        </div>
        <div className="dots">
          {agents.map((candidate, i) => (
            <button
              key={candidate.id}
              onClick={() => onPreview(i)}
              className={i === preview ? 'selected' : ''}
              aria-label={`View ${candidate.name}`}
            />
          ))}
        </div>
      </ScreenFrame>
    </div>
  );
}
