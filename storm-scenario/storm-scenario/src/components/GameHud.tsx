import { stageNames } from '@/data/outcomes';
import type { AudioEngine } from '@/lib/audio';
import type { ScreenId } from '@/data/types';

interface GameHudProps {
  screen: ScreenId;
  audio: AudioEngine | null;
  onToggleImmersive: () => void;
  inert?: boolean;
}

export function GameHud({ screen, audio, onToggleImmersive, inert }: GameHudProps) {
  const music = audio?.music ?? true;
  const effects = audio?.effects ?? true;

  return (
    <header className="game-hud">
      <div className="hud-brand">
        ◈{' '}
        <span>
          MERIDIAN<small>{stageNames[screen]}</small>
        </span>
      </div>
      <div className="timer">
        {/* The countdown is disabled, so the clock reads OFF instead of a time. */}
        <div className="clock" role="status" aria-label="Countdown disabled">
          OFF
        </div>
      </div>
      <div className="hud-controls" inert={inert}>
        <button
          className="icon-btn audio-toggle"
          onClick={() => audio?.toggle('music')}
          aria-label={music ? 'Mute music' : 'Enable music'}
          aria-pressed={music}
        >
          <span>♫</span>
          <small>MUSIC</small>
        </button>
        <button
          className="icon-btn audio-toggle"
          onClick={() => audio?.toggle('effects')}
          aria-label={effects ? 'Mute effects' : 'Enable effects'}
          aria-pressed={effects}
        >
          <span>◖))</span>
          <small>SFX</small>
        </button>
        <button className="icon-btn" onClick={onToggleImmersive} aria-label="Toggle immersive mode">
          ⛶
        </button>
      </div>
    </header>
  );
}
