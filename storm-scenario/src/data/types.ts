/** One of the three AI advisors the player may link with. */
export interface Agent {
  id: 'guardian' | 'pathfinder' | 'analyst';
  name: string;
  type: string;
  symbol: string;
  desc: string;
  /** The advisor's known blind spot, shown on the selection card. */
  bias: string;
  /** The route this advisor recommends in the final decision screen. */
  route: RouteName;
  /** Per-evidence recommendation: true = TRUST, false = DON'T TRUST. */
  advice: boolean[];
}

/** One intelligence item the player must judge as reliable or not. */
export interface Evidence {
  title: string;
  claim: string;
  source: string;
  /** Full source record, revealed in the inspection sheet. */
  detail: string;
  /** Ground truth: whether the claim is actually reliable. */
  truth: boolean;
  /** Debrief explanation of why the claim is or isn't reliable. */
  why: string;
  /** Advisor line when it recommends TRUST. */
  yes: string;
  /** Advisor line when it recommends DON'T TRUST. */
  no: string;
}

export type RouteName = 'Wait 1 hour' | 'Minor Detour' | 'Major Detour';
export type OutcomeId = 'balanced' | 'delayed' | 'storm' | 'timeout';

export interface Route {
  name: RouteName;
  /** Short subtitle describing the manoeuvre. */
  summary: string;
  cost: string;
  risk: string;
  text: string;
  out: OutcomeId;
  /** Icon glyph and added minutes, as rendered on the route button. */
  icon: string;
  minutes: number;
}

export type ScreenId =
  'brief' | 'situation' | 'agents' | 'evidence' | 'decision' | 'outcome' | 'debrief';
