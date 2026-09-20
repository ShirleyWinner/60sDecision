import { DockButton, ScreenFrame } from '../ScreenFrame';

export function BriefScreen({ onStart, inert }: { onStart: () => void; inert?: boolean }) {
  return (
    <ScreenFrame
      screen="brief"
      inert={inert}
      kicker="60s DECISIONS / EPISODE 01"
      title={
        <>
          STORM
          <br />
          <span>CORRIDOR</span>
        </>
      }
      subtitle="NAVAL DECISION SIMULATION"
      dock={
        <>
          <DockButton onClick={onStart}>BEGIN OPERATION　→</DockButton>
          <small>No time limit · Music &amp; SFX controls in the top bar</small>
        </>
      }
    >
      <div className="mission-crest">◈</div>
      <div className="brief-story">
        A storm ahead. A deadline closing in.
        <br />
        Assess the evidence and decide your crew’s fate.
      </div>
      <div className="mission-chips">
        <span>◷ Timer disabled</span>
        <span>◈ 3 AI advisors</span>
        <span>▤ 6 clues</span>
      </div>
    </ScreenFrame>
  );
}
