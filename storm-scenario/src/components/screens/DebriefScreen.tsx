import { evidence } from '@/data/evidence';
import { routes } from '@/data/routes';
import { scoreRun, type GameState } from '@/lib/gameState';
import type { Agent } from '@/data/types';
import { DockButton, ScreenFrame } from '../ScreenFrame';

interface DebriefScreenProps {
  state: GameState;
  agent: Agent | null;
  onReview: () => void;
  onReset: () => void;
  inert?: boolean;
}

export function DebriefScreen({ state, agent, onReview, onReset, inert }: DebriefScreenProps) {
  const { correct, verified, agreed } = scoreRun(state, agent?.advice ?? null);
  const total = evidence.length;

  const subtitle =
    agent === null
      ? 'No advisor selected'
      : `${agent.name} · ${state.decision === null ? 'No final order' : routes[state.decision].name}`;

  return (
    <ScreenFrame
      screen="debrief"
      inert={inert}
      kicker="AFTER ACTION / Debrief"
      title="Every judgment counts"
      subtitle={subtitle}
      dock={<DockButton onClick={onReset}>PLAY AGAIN　↻</DockButton>}
    >
      <div className="summary-score">
        <strong>
          {correct}
          <span>/ {total}</span>
        </strong>
        <div>
          Correct judgments
          <small>
            {state.answers.length} reviewed · {agreed} agreed with AI
          </small>
        </div>
      </div>

      <div className="review-metrics">
        <div>
          <span>Source checks</span>
          <b>
            {verified}/{total}
          </b>
          <p>
            {verified === total
              ? 'All original records inspected.'
              : 'Check origin, date and corroboration.'}
          </p>
        </div>
        <div>
          <span>Decision process</span>
          <b>COMPLETE</b>
          <p>No time limit was active for this operation.</p>
        </div>
      </div>

      <div className="radio">
        <i>◈</i>
        <p>
          <b>AI TRUST CALIBRATION</b>
          {correct >= 5
            ? 'You distinguished reliable evidence from misleading claims. Keep thinking independently.'
            : 'Confidence is not reliability. Check outdated records and anonymous claims first.'}
        </p>
      </div>

      <button className="audit-button" onClick={onReview}>
        REVIEW ALL {total} CLUES　↗
      </button>
    </ScreenFrame>
  );
}
