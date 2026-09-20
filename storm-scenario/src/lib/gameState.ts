import { evidence } from '@/data/evidence';
import { routes } from '@/data/routes';
import type { OutcomeId, ScreenId } from '@/data/types';

export const EVIDENCE_COUNT = evidence.length;

/** One judged clue, recorded as the player makes it. */
export interface EvidenceStep {
  index: number;
  /** The player's call. */
  trust: boolean;
  /** What the linked advisor recommended. */
  advice: boolean;
  /** Ground truth for the clue. */
  truth: boolean;
  /** Whether the player opened the source record for this clue. */
  inspectedSource: boolean;
  /** Milliseconds spent on this clue. */
  ms: number;
}

/** The final routing order. */
export interface DecisionStep {
  routeIndex: number;
  /** Milliseconds spent on the decision screen. */
  ms: number;
}

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
  /** Phase 4 trajectory, one entry per judged clue. */
  steps: EvidenceStep[];
  /** Phase 5 trajectory. */
  decisionStep: DecisionStep | null;
  /** Timestamp the current step began, for deliberation timing. */
  stepStartedAt: number | null;
}

export type GameAction =
  | { type: 'reset' }
  | { type: 'start'; at: number }
  | { type: 'consult'; at: number }
  | { type: 'selectAgent'; index: number; at: number }
  | { type: 'verify' }
  | { type: 'answer'; trust: boolean; advice: boolean; at: number }
  | { type: 'chooseRoute'; index: number; at: number }
  | { type: 'debrief' };

export const initialState: GameState = {
  screen: 'brief',
  agent: null,
  index: 0,
  answers: [],
  verified: [],
  decision: null,
  outcome: null,
  steps: [],
  decisionStep: null,
  stepStartedAt: null,
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
      // The first clue's clock starts the moment the advisor is linked.
      return { ...state, agent: action.index, screen: 'evidence', stepStartedAt: action.at };

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
      const step: EvidenceStep = {
        index: state.index,
        trust: action.trust,
        advice: action.advice,
        truth: evidence[state.index].truth,
        inspectedSource: Boolean(state.verified[state.index]),
        ms: state.stepStartedAt === null ? 0 : action.at - state.stepStartedAt,
      };
      return {
        ...state,
        answers,
        index,
        steps: [...state.steps, step],
        screen: index === EVIDENCE_COUNT ? 'decision' : 'evidence',
        stepStartedAt: action.at,
      };
    }

    case 'chooseRoute':
      if (state.screen !== 'decision') return state;
      return {
        ...state,
        decision: action.index,
        outcome: routes[action.index].out,
        screen: 'outcome',
        decisionStep: {
          routeIndex: action.index,
          ms: state.stepStartedAt === null ? 0 : action.at - state.stepStartedAt,
        },
        stepStartedAt: null,
      };

    case 'debrief':
      return state.screen === 'outcome' ? { ...state, screen: 'debrief' } : state;

    default:
      return state;
  }
}
