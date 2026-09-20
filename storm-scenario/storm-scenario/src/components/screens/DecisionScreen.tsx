import { routes } from '@/data/routes';
import type { Agent } from '@/data/types';
import { ScreenFrame } from '../ScreenFrame';

interface DecisionScreenProps {
  agent: Agent;
  onChoose: (index: number) => void;
  inert?: boolean;
}

export function DecisionScreen({ agent, onChoose, inert }: DecisionScreenProps) {
  return (
    <ScreenFrame
      screen="decision"
      inert={inert}
      kicker="FINAL ORDER / YOU HAVE COMMAND"
      title="Issue your orders"
      subtitle="One route. One final decision."
      dock={<small>Tap a route to issue your final order.</small>}
    >
      <div className="route-options">
        {routes.map((route, i) => (
          <button key={route.name} className="route-choice" onClick={() => onChoose(i)}>
            <span className={`route-thumbnail art ${i===0?'art-vessel':'art-storm'}`} aria-hidden="true"><span>{route.icon}</span></span>
            <span>
              <b>{route.name}</b>
              <small>{route.summary}</small>
              <em>{route.risk}</em>
            </span>
            <strong>
              +{route.minutes}
              <small>MIN</small>
            </strong>
          </button>
        ))}
      </div>
      <div className="radio">
        <i>{agent.symbol}</i>
        <p>
          <b>{agent.name} RECOMMENDS</b>
          {agent.route}. The final call is yours.
        </p>
      </div>
    </ScreenFrame>
  );
}
