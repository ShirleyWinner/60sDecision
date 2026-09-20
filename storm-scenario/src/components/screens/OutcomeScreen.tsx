import { outcomes } from '@/data/outcomes';
import type { OutcomeId } from '@/data/types';
import { DockButton, ScreenFrame } from '../ScreenFrame';

interface OutcomeScreenProps {
  outcome: OutcomeId;
  onDebrief: () => void;
  inert?: boolean;
}

export function OutcomeScreen({ outcome, onDebrief, inert }: OutcomeScreenProps) {
  const copy = outcomes[outcome];

  return (
    <ScreenFrame
      screen="outcome"
      inert={inert}
      kicker={copy.kicker}
      title={copy.title}
      dock={<DockButton onClick={onDebrief}>OPEN DEBRIEF　→</DockButton>}
    >
      <div className={`result-medal ${outcome !== 'balanced' ? 'warning' : ''}`}>{copy.medal}</div>
      <p className="result-copy">{copy.copy}</p>
      <div className="result-stats">
        <div>
          <small>ARRIVAL</small>
          <b>{copy.arrival}</b>
        </div>
        <div>
          <small>MISSION STATUS</small>
          <b>{copy.status}</b>
        </div>
      </div>
    </ScreenFrame>
  );
}
