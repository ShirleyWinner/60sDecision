import { TacticalMap } from '../TacticalMap';
import { DockButton, ScreenFrame } from '../ScreenFrame';

export function SituationScreen({ onConsult, inert }: { onConsult: () => void; inert?: boolean }) {
  return (
    <ScreenFrame
      screen="situation"
      inert={inert}
      kicker="MV MERIDIAN / 14:30 UTC"
      title="Storm closing in"
      subtitle="Keep the crew safe. Protect the delivery window."
      dock={<DockButton onClick={onConsult}>CONSULT AI ADVISOR　→</DockButton>}
    >
      <div className="mini-stats">
        <div>
          <small>GUSTS</small>
          <b>
            48 <em>kn</em>
          </b>
        </div>
        <div>
          <small>WAVES / LIMIT 3.5 m</small>
          <b className="bad">
            4.8 <em>m</em>
          </b>
        </div>
        <div>
          <small>TIME MARGIN</small>
          <b>
            30 <em>min</em>
          </b>
        </div>
      </div>
      <div className="tactical-window">
        <TacticalMap />
      </div>
      <div className="radio">
        <i>◉</i>
        <p>
          <b>BRIDGE REPORT</b>
          Storm moving northwest. The eastern corridor is open. Holding position may put us in its
          path.
        </p>
      </div>
    </ScreenFrame>
  );
}
