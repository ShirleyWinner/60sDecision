/**
 * Original procedural score and UI cues, built live with Web Audio.
 * No audio files are downloaded and no third-party music is used.
 */
import type { OutcomeId } from '@/data/types';

export type CueName =
  | 'tap'
  | 'switch'
  | 'source'
  | 'trust'
  | 'reject'
  | 'link'
  | 'warning'
  | 'critical'
  | 'success'
  | 'delayed'
  | 'failure'
  | 'timeout';

export type AudioChannel = 'music' | 'effects';

/** [frequency, delay, length] triples making up each cue. */
const phrases: Record<CueName, [number, number, number][]> = {
  tap: [[500, 0, 0.07]],
  switch: [
    [280, 0, 0.08],
    [420, 0.07, 0.1],
  ],
  source: [
    [660, 0, 0.1],
    [880, 0.1, 0.14],
  ],
  trust: [
    [440, 0, 0.12],
    [660, 0.1, 0.2],
  ],
  reject: [
    [330, 0, 0.13],
    [247, 0.1, 0.2],
  ],
  link: [
    [220, 0, 0.12],
    [440, 0.12, 0.12],
    [660, 0.24, 0.22],
  ],
  warning: [[760, 0, 0.1]],
  critical: [
    [950, 0, 0.08],
    [950, 0.14, 0.08],
  ],
  success: [
    [293.66, 0, 0.35],
    [369.99, 0.17, 0.35],
    [440, 0.34, 0.35],
    [587.33, 0.51, 0.7],
  ],
  delayed: [
    [293.66, 0, 0.4],
    [349.23, 0.2, 0.4],
    [440, 0.4, 0.6],
  ],
  failure: [
    [220, 0, 0.4],
    [164.81, 0.25, 0.5],
    [146.83, 0.5, 0.8],
  ],
  timeout: [
    [440, 0, 0.15],
    [440, 0.2, 0.15],
    [220, 0.45, 0.65],
  ],
};

const outcomeCues: Record<OutcomeId, CueName> = {
  balanced: 'success',
  delayed: 'delayed',
  storm: 'failure',
  timeout: 'timeout',
};

export interface AudioEngine {
  toggle(channel: AudioChannel): void;
  cue(kind: CueName): void;
  /** Play the sting for a finished run, once per outcome. */
  playOutcome(outcome: OutcomeId | null): void;
  /** Reset the once-per-run latches when a new run starts. */
  resetRun(): void;
  /**
   * Drive countdown urgency and warning cues.
   * The shipped game runs with the timer disabled, so this stays at null.
   */
  setCountdown(secondsRemaining: number | null): void;
  readonly music: boolean;
  readonly effects: boolean;
  subscribe(listener: () => void): () => void;
  destroy(): void;
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | undefined;
  let master: GainNode;
  let musicBus: GainNode;
  let fxBus: GainNode;
  let timer: ReturnType<typeof setInterval> | undefined;
  let nextBeat = 0;
  let step = 0;
  let lastSecond = -1;
  let secondsRemaining: number | null = null;
  let music = true;
  let effects = true;
  let unlocked = false;
  let lastOutcome: OutcomeId | null = null;

  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  function note(
    frequency: number,
    time: number,
    duration: number,
    volume: number,
    bus: GainNode,
    type: OscillatorType = 'sine',
    endFrequency?: number,
  ) {
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    if (endFrequency)
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain);
    gain.connect(bus);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.03);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  function initialize(): boolean {
    if (ctx) return true;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;

    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.65;

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -18;
    limiter.ratio.value = 8;
    master.connect(limiter);
    limiter.connect(ctx.destination);

    musicBus = ctx.createGain();
    fxBus = ctx.createGain();
    musicBus.connect(master);
    fxBus.connect(master);
    musicBus.gain.value = music ? 0.5 : 0;
    fxBus.gain.value = effects ? 0.65 : 0;

    nextBeat = ctx.currentTime + 0.08;
    timer = setInterval(schedule, 80);
    return true;
  }

  /** Browsers only allow audio to start from a user gesture. */
  function unlock() {
    try {
      if (!initialize()) return;
      unlocked = true;
      ctx?.resume().catch(() => {});
    } catch {
      /* audio is optional; never break the game for it */
    }
  }

  function schedule() {
    if (!ctx || !unlocked || ctx.state !== 'running' || document.hidden) return;
    const urgent = secondsRemaining !== null && secondsRemaining <= 10;
    if (nextBeat < ctx.currentTime) nextBeat = ctx.currentTime + 0.04;

    while (nextBeat < ctx.currentTime + 0.16) {
      if (music) {
        // D minor / B-flat / F / C: slow pads beneath a restrained sonar pulse.
        const roots = [73.416, 58.27, 87.307, 65.406];
        const root = roots[Math.floor(step / 16) % 4];
        if (step % 16 === 0) {
          [1, 1.5, 2.3784].forEach((ratio, i) =>
            note(root * ratio, nextBeat, 6.8, 0.035 - i * 0.004, musicBus, 'sine'),
          );
        }
        const pattern = [2, 3, 4, 3, 2, 3, 2.3784, 3];
        if (step % 2 === 0)
          note(root * pattern[(step / 2) % 8], nextBeat, 0.75, 0.035, musicBus, 'triangle');
        if (step % 4 === 0 || urgent)
          note(70, nextBeat, 0.14, urgent ? 0.065 : 0.04, musicBus, 'sine', 38);
      }
      nextBeat += 0.45;
      step++;
    }

    const second = secondsRemaining === null ? -1 : Math.ceil(secondsRemaining);
    if (second !== lastSecond) {
      lastSecond = second;
      if (second > 0 && second <= 10) cue(second <= 3 ? 'critical' : 'warning');
    }
  }

  function cue(kind: CueName) {
    if (!effects || !ctx || ctx.state !== 'running' || document.hidden) return;
    const t = ctx.currentTime + 0.005;
    for (const [frequency, delay, length] of phrases[kind] ?? phrases.tap) {
      note(frequency, t + delay, length, 0.09, fxBus, 'sine');
    }
  }

  function toggle(channel: AudioChannel) {
    unlock();
    if (channel === 'music') music = !music;
    else effects = !effects;

    if (ctx) {
      const bus = channel === 'music' ? musicBus : fxBus;
      const target = channel === 'music' ? (music ? 0.5 : 0) : effects ? 0.65 : 0;
      bus.gain.cancelScheduledValues(ctx.currentTime);
      bus.gain.setTargetAtTime(target, ctx.currentTime, 0.04);
    }
    if (channel === 'effects' && effects) cue('tap');
    emit();
  }

  function playOutcome(outcome: OutcomeId | null) {
    if (!outcome || outcome === lastOutcome) return;
    lastOutcome = outcome;
    cue(outcomeCues[outcome]);
  }

  function resetRun() {
    lastOutcome = null;
    lastSecond = -1;
  }

  function setCountdown(next: number | null) {
    secondsRemaining = next;
  }

  const onVisibility = () => {
    if (!ctx) return;
    if (document.hidden) {
      ctx.suspend().catch(() => {});
    } else if (unlocked) {
      nextBeat = ctx.currentTime + 0.1;
      ctx.resume().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  function destroy() {
    document.removeEventListener('visibilitychange', onVisibility);
    if (timer) clearInterval(timer);
    ctx?.close().catch(() => {});
    ctx = undefined;
    listeners.clear();
  }

  return {
    toggle,
    cue: (kind: CueName) => {
      // Any cue is triggered by a user gesture, which is also our unlock point.
      unlock();
      cue(kind);
    },
    playOutcome,
    resetRun,
    setCountdown,
    get music() {
      return music;
    },
    get effects() {
      return effects;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy,
  };
}
