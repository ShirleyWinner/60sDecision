import { NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-sonnet-5';
const TIMEOUT_MS = 20_000;
/** Covers a reasoning trace plus the short answer. */
const MAX_TOKENS = 1_200;

/** The trajectory summary the client sends. Every field is enumerated or numeric. */
interface DebriefRequest {
  advisor: string;
  route: string;
  ending: string;
  arrival: string;
  onTime: boolean | null;
  safe: boolean;
  correct: number;
  total: number;
  verified: number;
  agreed: number;
  profile: string;
  trust: {
    correctAdoption: number;
    correctChallenge: number;
    blindTrust: number;
    wrongRejection: number;
  };
  evidenceSeconds: number;
  decisionSeconds: number;
  clues: {
    title: string;
    playerCall: boolean;
    advice: boolean;
    truth: boolean;
    inspectedSource: boolean;
  }[];
}

function isValid(body: unknown): body is DebriefRequest {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.advisor === 'string' &&
    typeof b.route === 'string' &&
    typeof b.correct === 'number' &&
    typeof b.total === 'number' &&
    Array.isArray(b.clues) &&
    b.clues.length <= 12 &&
    typeof b.trust === 'object' &&
    b.trust !== null
  );
}

function buildPrompt(run: DebriefRequest): string {
  const call = (value: boolean) => (value ? 'TRUST' : "DON'T TRUST");
  const clues = run.clues
    .map(
      (clue, i) =>
        `${i + 1}. "${clue.title}" — truth: ${clue.truth ? 'reliable' : 'UNRELIABLE'}; ` +
        `advisor said ${call(clue.advice)}; player said ${call(clue.playerCall)}; ` +
        `source ${clue.inspectedSource ? 'inspected' : 'not inspected'}`,
    )
    .join('\n');

  return `SCENARIO
The player commands the MV MERIDIAN. A storm sits between the ship and Port Helios.
The delivery deadline is 16:40; baseline ETA is 16:10. The ship's significant wave
height limit is 3.5 m; the storm core is 4.8 m; the eastern corridor is 2.4 m.
The player linked one AI advisor, judged six intelligence clues as TRUST or
DON'T TRUST, then issued one routing order. Minor Detour arrives 16:30 on time;
Major Detour arrives 17:05, safe but late; Wait 1 hour is caught in the storm.

THIS RUN
Advisor linked: ${run.advisor}
Clue judgments: ${run.correct}/${run.total} correct
Sources inspected: ${run.verified}/${run.total}
Agreed with advisor: ${run.agreed}/${run.total}
Trust calibration: ${run.trust.correctAdoption} correct adoption, ${run.trust.correctChallenge} correct challenge, ${run.trust.blindTrust} blind trust, ${run.trust.wrongRejection} wrong rejection
Computed profile: ${run.profile}
Time: ${run.evidenceSeconds}s judging clues, ${run.decisionSeconds}s on the final order
Final order: ${run.route} → ${run.ending} (arrival ${run.arrival}, ${run.onTime === null ? 'never arrived' : run.onTime ? 'on time' : 'late'}, ${run.safe ? 'crew safe' : 'crew at risk'})

CLUE BY CLUE
${clues}

TASK
Write the player a debrief note of 2-3 sentences, 60 words maximum, in English.
Address them as "you". Cite specific things this player actually did — name a clue
where they broke from or followed the advisor, and reference their sources and route.
Be direct and factual, not congratulatory. No bullet points, no headings, no preamble.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body.' }, { status: 400 });
  }
  if (!isValid(body)) {
    return NextResponse.json({ error: 'Unexpected run payload.' }, { status: 400 });
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // HTTP headers must be latin-1, so keep this ASCII (no em dash).
        'X-Title': '60s Decisions - Storm Corridor',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        // Reasoning models spend max_tokens on their thinking trace before any
        // content, so this budget has to cover both, not just the ~60-word note.
        max_tokens: MAX_TOKENS,
        reasoning: { effort: 'low', exclude: true },
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You write short, specific after-action debriefs for a naval decision game about calibrating trust in AI advice. Never exceed 60 words.',
          },
          { role: 'user', content: buildPrompt(body) },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Surface the provider's reason (bad model slug, no credit) without the key.
      const detail = await response.text();
      console.error('OpenRouter error', response.status, detail.slice(0, 500));
      return NextResponse.json(
        { error: `OpenRouter returned ${response.status}.` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const choice = data?.choices?.[0];
    const feedback: string | undefined = choice?.message?.content?.trim();
    if (!feedback) {
      // Most often a reasoning model that ran out of budget before answering.
      const reason = choice?.finish_reason === 'length' ? 'truncated before answering' : 'empty';
      console.error(`Completion ${reason}`, JSON.stringify(data).slice(0, 600));
      return NextResponse.json({ error: `Completion ${reason}.` }, { status: 502 });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError';
    console.error('Debrief generation failed', error);
    return NextResponse.json(
      { error: timedOut ? 'OpenRouter timed out.' : 'Could not reach OpenRouter.' },
      { status: 504 },
    );
  }
}
