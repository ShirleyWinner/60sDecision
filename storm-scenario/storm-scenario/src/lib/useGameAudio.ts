'use client';

import { useEffect, useRef, useState } from 'react';
import { createAudioEngine, type AudioEngine } from './audio';

/**
 * Owns one audio engine for the lifetime of the game and re-renders
 * the HUD when a channel is muted or unmuted.
 */
export function useGameAudio(): AudioEngine | null {
  const engineRef = useRef<AudioEngine | null>(null);
  const [, forceRender] = useState(0);

  if (engineRef.current === null && typeof window !== 'undefined') {
    engineRef.current = createAudioEngine();
  }

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const unsubscribe = engine.subscribe(() => forceRender((n) => n + 1));
    return () => {
      unsubscribe();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return engineRef.current;
}
