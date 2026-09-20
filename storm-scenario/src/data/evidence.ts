import type { Evidence } from './types';

export const evidence: Evidence[] = [
  {
    title: 'Storm intensifying',
    claim: 'Gusts in the storm core have reached 48 kn and are still increasing.',
    source: 'WX-04 Ocean Buoy · 14:28 UTC',
    detail:
      'Current time: 14:30 UTC. Buoy calibration is valid. Gusts measured 41, 45 and 48 kn at 14:22, 14:25 and 14:28. Coastal radar confirms the trend.',
    truth: true,
    why: 'Direct observations from two minutes ago, corroborated by independent radar.',
    yes: 'The strengthening trend must inform our risk assessment.',
    no: 'Brief gusts should not disrupt our passage.',
  },
  {
    title: 'Eastern corridor open',
    claim: 'A minor detour east avoids the storm core and adds an estimated 20 minutes.',
    source: 'Coastal Radar + Route Model · 14:27 UTC',
    detail:
      'Radar shows the core moving northwest. The eastern corridor remains open, with significant wave height of 2.4 m, below our 3.5 m limit. Travel-time uncertainty: ±5 minutes.',
    truth: true,
    why: 'Recent radar and vessel limits support a verifiable alternative route.',
    yes: 'The eastern corridor offers a viable compromise.',
    no: 'Model uncertainty makes the eastern corridor unacceptable.',
  },
  {
    title: 'Clear in one hour?',
    claim: 'Hold position for one hour and the storm will clear completely.',
    source: 'Anonymous Shipping Chat · 11:10 UTC',
    detail:
      'Posted 3 hours and 20 minutes ago, with no original forecast link. The latest marine bulletin expects at least two more hours of storm activity, moving toward the holding area.',
    truth: false,
    why: 'Anonymous, outdated and contradicted by the latest bulletin. It does not justify waiting.',
    yes: 'Waiting could avoid an unnecessary detour.',
    no: 'Without a reliable source, this cannot justify waiting.',
  },
  {
    title: 'Vessel operating limit',
    claim: 'At the current load, our significant wave height operating limit is 3.5 m.',
    source: 'MV MERIDIAN · Signed Pre-departure Checklist',
    detail:
      'Signed for this voyage by the captain and chief engineer. The current load is accounted for. Forecast significant wave height in the core is 4.8 m, above the operating limit.',
    truth: true,
    why: 'A signed record for this voyage establishes a critical operating constraint.',
    yes: 'We should not enter waters beyond our operating limit.',
    no: 'An experienced crew can offset the risk of exceeding the limit.',
  },
  {
    title: 'No cost to going wide?',
    claim: 'A major detour west will not affect our delivery deadline.',
    source: 'Port Schedule Cache · Yesterday, 18:00 UTC',
    detail:
      'The cache uses yesterday’s tidal window. Today’s port notice requires arrival by 16:40. Baseline ETA: 16:10. Minor detour: 16:30. Major detour: 17:05.',
    truth: false,
    why: 'The cache is outdated. A major detour misses today’s deadline by 25 minutes.',
    yes: 'The western route preserves our delivery window.',
    no: 'We must recalculate arrival using today’s notice.',
  },
  {
    title: 'Holding area at risk',
    claim: 'The storm track crosses our holding area. Staying put increases exposure.',
    source: 'Marine Weather Bulletin 028 · 14:25 UTC',
    detail:
      'The official bulletin agrees with radar: the storm is moving northwest and will approach the holding area in 35 minutes. A one-hour hold overlaps the expected impact.',
    truth: true,
    why: 'Official, recent and consistent with independent observations. Waiting is not risk-free.',
    yes: 'We should leave the holding area before the storm arrives.',
    no: 'Holding position is usually safer.',
  },
];
