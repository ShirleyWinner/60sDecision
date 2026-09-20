import type { OutcomeId } from './types';

export interface OutcomeCopy {
  medal: string;
  title: string;
  kicker: string;
  copy: string;
  arrival: string;
  status: string;
}

export const outcomes: Record<OutcomeId, OutcomeCopy> = {
  balanced: {
    medal: '◎',
    title: 'Safe passage',
    kicker: 'SAFE PASSAGE',
    copy: 'You cleared the storm core and reached Port Helios on time.',
    arrival: '16:30',
    status: 'ON TIME',
  },
  delayed: {
    medal: '◈',
    title: 'Safe, but late',
    kicker: 'SAFE, BUT LATE',
    copy: 'Your crew is safe. The longer route missed the delivery window by 25 minutes.',
    arrival: '17:05',
    status: '25 MIN LATE',
  },
  storm: {
    medal: '⚠',
    title: 'Caught in the storm',
    kicker: 'CAUGHT IN THE STORM',
    copy: 'The storm did not clear. Holding position exposed the vessel to unsafe seas. Mission aborted.',
    arrival: 'ABORTED',
    status: 'UNSAFE',
  },
  /** Reachable only if the countdown is re-enabled; kept for parity with the prototype. */
  timeout: {
    medal: '⌛',
    title: 'Time ran out',
    kicker: 'COMMAND WINDOW LOST',
    copy: 'No orders arrived in time. The vessel has begun emergency procedures.',
    arrival: 'NO ORDER',
    status: 'TIMEOUT',
  },
};

export const stageNames: Record<string, string> = {
  brief: 'Briefing',
  situation: 'Situation',
  agents: 'Advisor',
  evidence: 'Evidence',
  decision: 'Decision',
  outcome: 'Outcome',
  debrief: 'Debrief',
};
