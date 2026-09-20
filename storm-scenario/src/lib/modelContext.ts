import { agents } from '@/data/agents';
import type { GameState } from './gameState';

/**
 * Browsers that expose `document.modelContext` let a page publish read-only
 * tools to an assistant. We publish the current simulation phase only.
 */
interface ModelContext {
  registerTool(
    tool: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      annotations?: Record<string, unknown>;
      execute(input: unknown): unknown;
    },
    options?: { signal?: AbortSignal },
  ): unknown;
}

export function registerStatusTool(getState: () => GameState): () => void {
  const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!modelContext?.registerTool) return () => {};

  const lifecycle = new AbortController();

  Promise.resolve(
    modelContext.registerTool(
      {
        name: 'read_operation_status',
        description:
          'Read the current Storm Corridor simulation phase, advisor and completed judgments.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute(input: unknown) {
          if (input && Object.keys(input as object).length) {
            throw new Error('No parameters accepted');
          }
          const state = getState();
          return {
            phase: state.screen,
            timerEnabled: false,
            secondsRemaining: null,
            advisor: state.agent === null ? null : agents[state.agent].name,
            judgments: [...state.answers],
            outcome: state.outcome,
          };
        },
      },
      { signal: lifecycle.signal },
    ),
  ).catch(() => {});

  return () => lifecycle.abort();
}
