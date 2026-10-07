import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as jevService from '../../services/jevService';
import * as aiEngine from '../../services/aiEngine';
import * as gameService from '../../services/gameService';
import { Difficulty, Level, Player } from '../../types';

const store: Record<string, string> = {};
const level: Level = { level: 1, boardSize: 5, winCondition: 4, obstacles: 0, difficulty: Difficulty.Hard };
const score = { [Player.X]: 0, [Player.O]: 0 };

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation((k: string) => store[k] ?? null);
  (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation((k: string, v: string) => {
    store[k] = v;
  });
});
afterEach(() => vi.restoreAllMocks());

const withJevKey = () => {
  store['tikitapo_ai_providers'] = JSON.stringify([
    { id: 'j', name: 'Jev', type: 'jev', apiKey: 'test-key-1234567', baseUrl: 'https://jev.test/v1', models: ['jev-latest'] },
  ]);
};

describe('jevService', () => {
  it('is not configured without a key', () => {
    expect(jevService.isJevConfigured()).toBe(false);
  });

  it('chooseMove sends a choice question and maps the answer to a candidate', async () => {
    withJevKey();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answers: { move: { type: 'choice', choice: 'm1', confidence: 0.9, probabilities: {} } } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const board = gameService.createBoard(5, 0);
    const move = await jevService.chooseMove(board, [{ row: 0, col: 0 }, { row: 2, col: 2 }], 4);
    expect(move).toEqual({ row: 2, col: 2 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://jev.test/v1/systemone');
    expect(init.headers.Authorization).toBe('Bearer test-key-1234567');
    expect(JSON.parse(init.body).questions.move.type).toBe('choice');
  });

  it('returns null on low confidence or request failure', async () => {
    withJevKey();
    const board = gameService.createBoard(5, 0);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answers: { move: { type: 'choice', choice: 'm0', confidence: 0.1, probabilities: {} } } }),
    }));
    expect(await jevService.chooseMove(board, [{ row: 0, col: 0 }], 4)).toBeNull();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(await jevService.chooseMove(board, [{ row: 0, col: 0 }], 4)).toBeNull();
  });

  it('comment falls back to a phrase without a key', async () => {
    const text = await jevService.getAIPersonalityComment(gameService.createBoard(5, 0), Difficulty.Hard, { row: 0, col: 0 });
    expect(text.length).toBeGreaterThan(0);
  });
});

describe('aiEngine.pickMove', () => {
  it('returns a valid local move when Jev is unavailable', async () => {
    const board = gameService.createBoard(5, 0);
    const move = await aiEngine.pickMove(board, level, score, true);
    expect(move).not.toBeNull();
    expect(board[move!.row][move!.col]).toBe('');
  });
});
