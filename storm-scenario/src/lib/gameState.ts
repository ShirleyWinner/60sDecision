import { evidence } from '@/data/evidence';
import { routes } from '@/data/routes';
import type { OutcomeId, ScreenId } from '@/data/types';

export const EVIDENCE_COUNT = evidence.length;

export interface GameState {
  screen: ScreenId;
  /** Index into `agents`, or null before an advisor is linked. */
  agent: number | null;
  /** Index of the evidence item currently being judged. */
  index: number;
  /** Player judgments, in order. true = TRUST. */
  answers: boolean[];
  /** verified[i] is true once the player has opened evidence i's source record. */
  verified: boolean[];
  /** Index into `routes`, or null before the final order. */
  decision: number | null;
  outcome: OutcomeId | null;
}

export type GameAction =
  | { type: 'reset' }
  | { type: 'start' }
  | { type: 'consult' }
  | { type: 'selectAgent'; index: number }
  | { type: 'verify' }
  | { type: 'answer'; trust: boolean }
  | { type: 'chooseRoute'; index: number }
  | { type: 'debrief' };

export const initialState: GameState = {
  screen: 'brief',
  agent: null,
  index: 0,
  answers: [],
  verified: [],
  decision: null,
  outcome: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'reset':
      return initialState;

    case 'start':
      return state.screen === 'brief' ? { ...state, screen: 'situation' } : state;

    case 'consult':
      return state.screen === 'situation' ? { ...state, screen: 'agents' } : state;

    case 'selectAgent':
      // An advisor is linked exactly once per run.
      if (state.screen !== 'agents' || state.agent !== null) return state;
      return { ...state, agent: action.index, screen: 'evidence' };

    case 'verify': {
      if (state.screen !== 'evidence') return state;
      const verified = [...state.verified];
      verified[state.index] = true;
      return { ...state, verified };
    }

    case 'answer': {
      if (state.screen !== 'evidence') return state;
      const answers = [...state.answers, action.trust];
      const index = state.index + 1;
      return {
        ...state,
        answers,
        index,
        screen: index === EVIDENCE_COUNT ? 'decision' : 'evidence',
      };
    }

    case 'chooseRoute':
      if (state.screen !== 'decision') return state;
      return {
        ...state,
        decision: action.index,
        outcome: routes[action.index].out,
        screen: 'outcome',
      };

    case 'debrief':
      return state.screen === 'outcome' ? { ...state, screen: 'debrief' } : state;

    default:
      return state;
  }
}

/** Debrief tallies, derived from the finished run. */
export function scoreRun(state: GameState, advice: boolean[] | null) {
  const correct = state.answers.filter((value, i) => value === evidence[i].truth).length;
  const verified = state.verified.filter(Boolean).length;
  const agreed = advice ? state.answers.filter((value, i) => value === advice[i]).length : 0;
  return { correct, verified, agreed };
}
