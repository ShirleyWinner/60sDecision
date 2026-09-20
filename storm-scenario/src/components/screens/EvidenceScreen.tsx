import { evidence } from '@/data/evidence';
import type { Agent } from '@/data/types';
import { DockButton, ScreenFrame } from '../ScreenFrame';

interface EvidenceScreenProps {
  agent: Agent;
  index: number;
  verified: boolean[];
  onInspectSource: () => void;
  onAnswer: (trust: boolean) => void;
  inert?: boolean;
}

export function EvidenceScreen({
  agent,
  index,
  verified,
  onInspectSource,
  onAnswer,
  inert,
}: EvidenceScreenProps) {
  const item = evidence[index];
  const advice = agent.advice[index];

  return (
    <ScreenFrame
      screen="evidence"
      inert={inert}
      kicker={`${agent.name} / LIVE INTELLIGENCE`}
      title="Assess the evidence"
      subtitle="Check the source. Make your own call."
      dock={
        <>
          <div className="dual">
            <DockButton secondary onClick={() => onAnswer(false)}>
              × DON’T TRUST
            </DockButton>
            <DockButton onClick={() => onAnswer(true)}>✓ TRUST</DockButton>
          </div>
          <small>Your judgment is recorded. Next clue follows.</small>
        </>
      }
    >
      <div className="evidence-progress">
        {evidence.map((clue, i) => (
          <span
            key={clue.title}
            className={i < index ? 'complete' : i === index ? 'selected' : ''}
          />
        ))}
        <b>
          {index + 1}/{evidence.length}
        </b>
      </div>

      <article className="intel-card">
        <div className="intel-id">CLASSIFIED　/　E-0{index + 1}</div>
        <h2>{item.title}</h2>
        <p className="intel-claim">{item.claim}</p>

        <button className="source-button" onClick={onInspectSource}>
          <span>
            <small>INSPECT SOURCE {verified[index] ? '✓ REVIEWED' : ''}</small>
            {item.source}
          </span>
          <b>↗</b>
        </button>

        <div className="ai-radio">
          <div className="ai-avatar">{agent.symbol}</div>
          <div>
            <small>
              {agent.name} RECOMMENDS{' '}
              <b className={advice ? 'good' : 'bad'}>{advice ? 'TRUST' : 'DON’T TRUST'}</b>
            </small>
            <p>{advice ? item.yes : item.no}</p>
          </div>
        </div>
      </article>
    </ScreenFrame>
  );
}
