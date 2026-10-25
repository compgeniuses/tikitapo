import { Board, CellState, Difficulty, Move } from '../types';
import * as aiProviderService from './aiProviderService';
import { AIProviderType } from '../types';

// Jev (TypeSafe AI) is a "System One" decision model: it does not generate text, it answers typed
// questions (choice / score / yes-no) with calibrated probabilities. That makes it a natural fit for
// picking game moves. Docs: https://docs.typesafe.ai  (POST /v1/systemone, Bearer auth)

const DEFAULT_BASE_URL = 'https://api.typesafe.ai/v1';
export const JEV_MODEL = 'jev-latest';

interface ChoiceQuestion {
  type: 'choice';
  instructions: string;
  criteria: Record<string, string>;
}

interface ChoiceAnswer {
  type: 'choice';
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const getJevConfig = (): { apiKey: string; baseUrl: string; model: string } | null => {
  const provider = aiProviderService.getProviders().find(p => p.type === AIProviderType.Jev && p.apiKey);
  const apiKey = provider?.apiKey || env.VITE_JEV_API_KEY || '';
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (provider?.baseUrl || env.VITE_JEV_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    model: provider?.models?.[0] || JEV_MODEL,
  };
};

export const isJevConfigured = (): boolean => getJevConfig() !== null;

const askChoices = async (
  state: string,
  questions: Record<string, ChoiceQuestion>,
  timeoutMs = 8000
): Promise<Record<string, ChoiceAnswer> | null> => {
  const config = getJevConfig();
  if (!config) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${config.baseUrl}/systemone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, state, questions }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Jev API error ${response.status}: ${await response.text()}`);
    const data = await response.json();
    return data.answers ?? null;
  } catch (error) {
    console.error('Jev request failed:', error);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const formatBoard = (board: Board): string =>
  board
    .map(row => row.map(c => (c === CellState.X ? 'X' : c === CellState.O ? 'O' : c === CellState.Obstacle ? '#' : '.')).join(' '))
    .join('\n');

// Ask Jev to pick the best move among candidates. Returns null if Jev is unavailable or unsure,
// in which case the caller should use its local engine's choice.
export const chooseMove = async (
  board: Board,
  candidates: Move[],
  winCondition: number,
  minConfidence = 0.4
): Promise<Move | null> => {
  if (candidates.length === 0) return null;
  const criteria: Record<string, string> = {};
  candidates.forEach((m, i) => {
    criteria[`m${i}`] = `Play O at row ${m.row}, column ${m.col} (0-indexed from the top-left)`;
  });

  const state =
    `Connect-${winCondition} game. Rows are listed top to bottom. X = human, O = you, # = obstacle, . = empty.\n` +
    `Goal: get ${winCondition} in a row (horizontal, vertical or diagonal).\n\n${formatBoard(board)}`;

  const answers = await askChoices(state, {
    move: {
      type: 'choice',
      instructions:
        'You are playing O. Which move gives O the best chance to win while stopping X from building an unstoppable line? Prefer moves that extend your own lines and break X lines.',
      criteria,
    },
  });
  const answer = answers?.move;
  if (!answer || answer.confidence < minConfidence) return null;
  const index = Number(answer.choice.slice(1));
  return Number.isInteger(index) ? candidates[index] ?? null : null;
};

// Jev cannot write text, so in-character comments are chosen from per-personality phrase banks,
// with Jev reading the board to pick the right tone.
type Tone = 'pressure' | 'confident' | 'respect' | 'playful';

const PHRASES: Record<Difficulty, Record<Tone, string[]>> = {
  [Difficulty.Simple]: {
    pressure: ['Ooh, this is getting spicy!', 'Gotta be careful here!', 'Uh oh, I might be in trouble!'],
    confident: ['Nice and easy, my friend!', 'I like where this is going!', 'Look at me go!'],
    respect: ['Great move, you!', 'Wow, did not see that coming!', 'You are good at this!'],
    playful: ['Your turn, champ!', 'Hehe, try this one!', 'Let us keep it fun!'],
  },
  [Difficulty.Hard]: {
    pressure: ['You are making this interesting.', 'A worthy attempt. Still mine.', 'I will need to adjust.'],
    confident: ['The board is bending my way.', 'Everything is going to plan.', 'Checkmate is coming.'],
    respect: ['Sharp move. I noticed.', 'Not bad. Not enough, but not bad.', 'You play well. For now.'],
    playful: ['Your move, challenger.', 'Let us see what you do next.', 'Try to keep up.'],
  },
  [Difficulty.Pro]: {
    pressure: ['Irrelevant. I have calculated past this.', 'A minor inconvenience.', 'Adequate. Barely.'],
    confident: ['Inevitable.', 'You lost several moves ago.', 'Predictable, as expected.'],
    respect: ['A rare competent move from a novice.', 'Lucky. Do not get used to it.', 'Hm. Noted.'],
    playful: ['Take your time. It will not help.', 'Go on, amuse me.', 'Your move, novice.'],
  },
};

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const getAIPersonalityComment = async (
  board: Board,
  difficulty: Difficulty,
  lastMove: Move
): Promise<string> => {
  const bank = PHRASES[difficulty] ?? PHRASES[Difficulty.Hard];
  let tone: Tone = 'playful';

  const answers = await askChoices(
    `Connect-N game, O (you) just played at row ${lastMove.row}, column ${lastMove.col}.\n\n${formatBoard(board)}`,
    {
      tone: {
        type: 'choice',
        instructions: 'Which attitude should O take toward the human opponent X after this move?',
        criteria: {
          pressure: 'O is under pressure; X has strong threats on the board',
          confident: 'O is clearly ahead and building a winning position',
          respect: 'X just made a strong or clever move',
          playful: 'The position is balanced or early; keep it light',
        },
      },
    },
    4000
  );
  const chosen = answers?.tone?.choice as Tone | undefined;
  if (chosen && chosen in bank) tone = chosen;
  return pick(bank[tone]);
};
