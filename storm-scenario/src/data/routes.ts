import type { Route } from './types';

export const routes: Route[] = [
  {
    name: 'Wait 1 hour',
    summary: 'Hold position for clearer weather',
    cost: '+60',
    risk: 'Exposure to the moving storm',
    text: 'Avoid an immediate maneuver, but the storm may reach the holding area.',
    out: 'storm',
    icon: '◷',
    minutes: 60,
  },
  {
    name: 'Minor Detour',
    summary: 'Take the eastern corridor',
    cost: '+20',
    risk: 'Pass near the storm edge',
    text: 'Use the open eastern corridor to proceed within vessel limits.',
    out: 'balanced',
    icon: '↗',
    minutes: 20,
  },
  {
    name: 'Major Detour',
    summary: 'Take the longer western route',
    cost: '+55',
    risk: 'Risk missing the delivery window',
    text: 'Trade extra travel time for a wider safety margin.',
    out: 'delayed',
    icon: '⇢',
    minutes: 55,
  },
];
