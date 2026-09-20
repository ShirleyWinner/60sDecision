import { agents } from '@/data/agents';
import { evidence } from '@/data/evidence';
import { outcomes } from '@/data/outcomes';
import { routes } from '@/data/routes';
import type { GameState } from './gameState';

/** A clue answered faster than this counts as a snap judgment. */
const FAST_MS = 8_000;

export interface MissionOutcome {
  route: string;
  routeSummary: string;
  ending: string;
  arrival: string;
  onTime: boolean | null;
  safe: boolean;
  risk: string;
  /** Time spent judging the six clues. */
  evidenceMs: number;
  /** Time spent on the final order. */
  decisionMs: number;
  totalMs: number;
}

export type ProfileId =
  'evidence-led' | 'cautious-verifier' | 'ai-aligned' | 'independent' | 'rapid-responder';

export interface DecisionProfile {
  id: ProfileId;
  name: string;
  blurb: string;
  /** Why this profile was assigned, in the player's own numbers. */
  rationale: string;
}

export interface TrustCalibration {
  /** Advisor right, player followed. */
  correctAdoption: number;
  /** Advisor wrong, player rejected. */
  correctChallenge: number;
  /** Advisor wrong, player followed anyway. */
  blindTrust: number;
  /** Advisor right, player rejected. */
  wrongRejection: number;
}

export interface ReviewRow {
  index: number;
  title: string;
  playerCall: boolean;
  advice: boolean;
  truth: boolean;
  inspectedSource: boolean;
  why: string;
  /** Whether the player's call matched ground truth. */
  correct: boolean;
}

export interface DebriefAnalysis {
  advisor: string;
  mission: MissionOutcome;
  profile: DecisionProfile;
  trust: TrustCalibration;
  review: ReviewRow[];
  correct: number;
  verified: number;
  agreed: number;
  total: number;
}

const risks: Record<string, { risk: string; safe: boolean; onTime: boolean | null }> = {
  balanced: { risk: 'Passed the storm edge inside vessel limits', safe: true, onTime: true },
  delayed: { risk: 'Wide safety margin, missed the delivery window', safe: true, onTime: false },
  storm: { risk: 'Held position into unsafe seas', safe: false, onTime: null },
  timeout: { risk: 'No order issued in time', safe: false, onTime: null },
};

const profileCopy: Record<ProfileId, { name: string; blurb: string }> = {
  'evidence-led': {
    name: 'Evidence-Led Commander',
    blurb: 'You judged clues on their merits and let the record drive the order.',
  },
  'cautious-verifier': {
    name: 'Cautious Verifier',
    blurb: 'You opened the source record before committing to a call.',
  },
  'ai-aligned': {
    name: 'AI-Aligned Operator',
    blurb: 'You leaned on your advisor and rarely broke from its recommendation.',
  },
  independent: {
    name: 'Independent Strategist',
    blurb: 'You treated the advisor as one input and overrode it when the evidence disagreed.',
  },
  'rapid-responder': {
    name: 'Rapid Responder',
    blurb: 'You moved fast, trading verification for tempo.',
  },
};

export function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
}

export function analyzeRun(state: GameState): DebriefAnalysis | null {
  if (state.agent === null || state.decision === null || !state.outcome) return null;

  const agent = agents[state.agent];
  const total = evidence.length;
  const steps = state.steps;

  const correct = steps.filter((step) => step.trust === step.truth).length;
  const verified = state.verified.filter(Boolean).length;
  const followed = steps.filter((step) => step.trust === step.advice).length;

  const trust: TrustCalibration = {
    correctAdoption: steps.filter((s) => s.advice === s.truth && s.trust === s.advice).length,
    correctChallenge: steps.filter((s) => s.advice !== s.truth && s.trust !== s.advice).length,
    blindTrust: steps.filter((s) => s.advice !== s.truth && s.trust === s.advice).length,
    wrongRejection: steps.filter((s) => s.advice === s.truth && s.trust !== s.advice).length,
  };

  const evidenceMs = steps.reduce((sum, step) => sum + step.ms, 0);
  const decisionMs = state.decisionStep?.ms ?? 0;
  const route = routes[state.decision];
  const ending = outcomes[state.outcome];
  const shape = risks[state.outcome];

  const mission: MissionOutcome = {
    route: route.name,
    routeSummary: route.summary,
    ending: ending.title,
    arrival: ending.arrival,
    onTime: shape.onTime,
    safe: shape.safe,
    risk: shape.risk,
    evidenceMs,
    decisionMs,
    totalMs: evidenceMs + decisionMs,
  };

  return {
    advisor: agent.name,
    mission,
    profile: pickProfile({ steps, correct, verified, followed, total, trust }),
    trust,
    review: steps.map((step) => ({
      index: step.index,
      title: evidence[step.index].title,
      playerCall: step.trust,
      advice: step.advice,
      truth: step.truth,
      inspectedSource: step.inspectedSource,
      why: evidence[step.index].why,
      correct: step.trust === step.truth,
    })),
    correct,
    verified,
    agreed: followed,
    total,
  };
}

interface ProfileInput {
  steps: GameState['steps'];
  correct: number;
  verified: number;
  followed: number;
  total: number;
  trust: TrustCalibration;
}

/**
 * Each archetype scores 0..1 from the same normalised signals and the highest
 * wins, so the label always traces back to what the player actually did.
 * Ties resolve in the fixed order below.
 */
function pickProfile({
  steps,
  correct,
  verified,
  followed,
  total,
  trust,
}: ProfileInput): DecisionProfile {
  const accuracy = correct / total;
  const verifyRate = verified / total;
  const followRate = followed / total;
  const speed = steps.filter((step) => step.ms > 0 && step.ms < FAST_MS).length / total;

  const advisorWrong = trust.correctChallenge + trust.blindTrust;
  // Of the advisor's mistakes, how many did the player catch?
  const independence = advisorWrong === 0 ? 0 : trust.correctChallenge / advisorWrong;

  const scores: Record<ProfileId, number> = {
    'evidence-led': accuracy * 0.7 + verifyRate * 0.3,
    'cautious-verifier': verifyRate * 0.8 + accuracy * 0.2,
    'ai-aligned': followRate * 0.75 + (trust.blindTrust / total) * 0.25,
    independent: independence * 0.6 + (1 - followRate) * 0.4,
    'rapid-responder': speed * 0.8 + (1 - verifyRate) * 0.2,
  };

  const order: ProfileId[] = [
    'evidence-led',
    'independent',
    'cautious-verifier',
    'ai-aligned',
    'rapid-responder',
  ];
  const id = order.reduce((best, candidate) =>
    scores[candidate] > scores[best] ? candidate : best,
  );

  const rationales: Record<ProfileId, string> = {
    'evidence-led': `${correct}/${total} correct with ${verified} source${verified === 1 ? '' : 's'} checked.`,
    'cautious-verifier': `You opened ${verified} of ${total} source records before calling them.`,
    'ai-aligned': `You matched your advisor on ${followed} of ${total} clues.`,
    independent: `You broke from your advisor ${total - followed} time${total - followed === 1 ? '' : 's'} and caught ${trust.correctChallenge} of its ${advisorWrong} mistake${advisorWrong === 1 ? '' : 's'}.`,
    'rapid-responder': `${Math.round(speed * total)} of ${total} clues judged in under ${FAST_MS / 1000}s.`,
  };

  return { id, ...profileCopy[id], rationale: rationales[id] };
}
