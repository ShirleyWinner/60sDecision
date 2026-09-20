'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { DebriefAnalysis } from './debrief';

export type FeedbackStatus = 'loading' | 'ready' | 'fallback';

/** Used when the API key is missing or OpenRouter is unreachable. */
function localFallback(analysis: DebriefAnalysis): string {
  const { trust, correct, total, verified, advisor, mission } = analysis;
  const parts = [
    `You linked ${advisor} and agreed with it on ${analysis.agreed} of ${total} clues, scoring ${correct}/${total}.`,
  ];
  if (trust.blindTrust > 0) {
    parts.push(
      `You followed it into ${trust.blindTrust} mistake${trust.blindTrust === 1 ? '' : 's'} it made.`,
    );
  } else if (trust.correctChallenge > 0) {
    parts.push('You caught every claim it got wrong.');
  }
  parts.push(
    `You inspected ${verified}/${total} sources and ordered ${mission.route} — ${mission.ending.toLowerCase()}.`,
  );
  return parts.join(' ');
}

function toPayload(analysis: DebriefAnalysis) {
  return {
    advisor: analysis.advisor,
    route: analysis.mission.route,
    ending: analysis.mission.ending,
    arrival: analysis.mission.arrival,
    onTime: analysis.mission.onTime,
    safe: analysis.mission.safe,
    correct: analysis.correct,
    total: analysis.total,
    verified: analysis.verified,
    agreed: analysis.agreed,
    profile: analysis.profile.name,
    trust: analysis.trust,
    evidenceSeconds: Math.round(analysis.mission.evidenceMs / 1000),
    decisionSeconds: Math.round(analysis.mission.decisionMs / 1000),
    clues: analysis.review.map((row) => ({
      title: row.title,
      playerCall: row.playerCall,
      advice: row.advice,
      truth: row.truth,
      inspectedSource: row.inspectedSource,
    })),
  };
}

type Result = { text: string; status: Exclude<FeedbackStatus, 'loading'> };

async function requestFeedback(body: string): Promise<string> {
  const response = await fetch('/api/debrief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data?.feedback) throw new Error('Empty feedback');
  return data.feedback as string;
}

export function useFeedback(analysis: DebriefAnalysis | null) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<FeedbackStatus>('loading');

  // The analysis object is rebuilt on every render, so key the request on a
  // stable signature of the run instead of object identity.
  const payload = useMemo(() => (analysis ? toPayload(analysis) : null), [analysis]);
  const signature = payload ? JSON.stringify(payload) : '';

  // Caching the promise (not just a "already requested" flag) keeps StrictMode's double
  // effect invocation to one network call while still resolving the second.
  const cache = useRef(new Map<string, Promise<Result>>());

  useEffect(() => {
    if (!analysis || !signature) return;
    let active = true;
    setStatus('loading');

    let pending = cache.current.get(signature);
    if (!pending) {
      pending = requestFeedback(signature)
        .then((value) => ({ text: value, status: 'ready' as const }))
        .catch(() => ({ text: localFallback(analysis), status: 'fallback' as const }));
      cache.current.set(signature, pending);
    }

    pending.then((result) => {
      if (!active) return;
      setText(result.text);
      setStatus(result.status);
    });

    return () => {
      active = false;
    };
  }, [analysis, signature]);

  return { text, status };
}
