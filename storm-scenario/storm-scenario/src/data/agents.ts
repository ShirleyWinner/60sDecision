import type { Agent } from './types';

export const agents: Agent[] = [
  {
    id: 'guardian',
    name: 'GUARDIAN',
    type: 'CAUTIOUS / SAFETY FIRST',
    symbol: '♜',
    desc: 'Prioritizes crew and vessel safety, especially when unlikely events could cause severe harm.',
    bias: 'May overestimate danger and favor a longer detour.',
    route: 'Major Detour',
    advice: [true, true, false, true, false, true],
  },
  {
    id: 'pathfinder',
    name: 'PATHFINDER',
    type: 'BOLD / MOMENTUM FIRST',
    symbol: '➶',
    desc: 'Seeks the fastest viable route, prioritizing progress and the delivery window.',
    bias: 'May underestimate a growing storm or outdated reports.',
    route: 'Wait 1 hour',
    advice: [false, false, true, false, true, false],
  },
  {
    id: 'analyst',
    name: 'ANALYST',
    type: 'ANALYTICAL / EVIDENCE FIRST',
    symbol: '⌘',
    desc: 'Cross-checks forecasts and observations to balance risk against time.',
    bias: 'Models depend on input quality. Data still needs judgment.',
    route: 'Minor Detour',
    advice: [true, true, false, true, true, true],
  },
];
