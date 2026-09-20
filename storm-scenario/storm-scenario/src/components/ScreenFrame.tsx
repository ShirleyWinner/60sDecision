import type { ReactNode } from 'react';
import type { ScreenId } from '@/data/types';

interface ScreenFrameProps {
  screen: ScreenId;
  kicker: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Fixed bottom action area. */
  dock: ReactNode;
  /** Set while a bottom sheet owns focus. */
  inert?: boolean;
}

/** Shared phone-style layout: title block, scrolling content, docked actions. */
export function ScreenFrame({
  screen,
  kicker,
  title,
  subtitle,
  children,
  dock,
  inert,
}: ScreenFrameProps) {
  return (
    <section className={`game-screen ${screen}`} inert={inert}>
      <div className="screen-title">
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="play-content">{children}</div>
      <div className="game-dock">{dock}</div>
    </section>
  );
}

interface DockButtonProps {
  children: ReactNode;
  onClick: () => void;
  secondary?: boolean;
}

export function DockButton({ children, onClick, secondary }: DockButtonProps) {
  return (
    <button className={`btn ${secondary ? 'secondary' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}
