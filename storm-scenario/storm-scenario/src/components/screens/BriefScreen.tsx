import { DockButton, ScreenFrame } from '../ScreenFrame';

export function BriefScreen({ onStart, inert }: { onStart: () => void; inert?: boolean }) {
  return (
    <ScreenFrame
      screen="brief"
      inert={inert}
      kicker="60s DECISIONS / EPISODE 01"
      title={
        <>
          <em>60s</em>
          <br />
          <span>DECISIONS</span>
        </>
      }
      subtitle="SAME OCEAN. DIFFERENT MINDS. YOUR CHOICE."
      dock={
        <>
          <DockButton onClick={onStart}>BEGIN OPERATION　→</DockButton>
          <small>No time limit · Music &amp; SFX controls in the top bar</small>
        </>
      }
    >
      <div className="cover-art art art-bridge" aria-hidden="true" />
      <div className="cover-note">High stakes.<br />Real consequences.</div>
      <div className="brief-dossier">
        <h2>Storm Corridor</h2>
        <p>You command the MV MERIDIAN. A severe storm blocks the planned route to Port Helios. Consult an AI advisor, inspect six clues, and make the call.</p>
        <small>UNTIMED OPERATION / 3 ADVISORS / 6 CLUES</small>
      </div>
    </ScreenFrame>
  );
}
