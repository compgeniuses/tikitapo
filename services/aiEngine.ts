import { Board, Difficulty, Level, MatchScore, Move, Player } from '../types';
import * as gameService from './gameService';
import * as jevService from './jevService';

// Gameplay AI: Jev (decision model) picks among strong candidate moves; the local engine is the
// fallback and the source of the candidate list, so the game never stalls if Jev is unreachable.

export const pickMove = async (
  board: Board,
  level: Level,
  matchScore: MatchScore,
  useJev: boolean
): Promise<Move | null> => {
  const ai = Player.O;
  const human = Player.X;
  const local = gameService.getComputerMove(board, ai, human, level, matchScore);
  if (!local || !useJev || !jevService.isJevConfigured()) return local;
  // Wins and blocks are forced; the Simple level stays intentionally weak.
  if (level.difficulty === Difficulty.Simple || gameService.getForcedMove(board, ai, human, level.winCondition)) {
    return local;
  }

  const heuristic = gameService.getCandidateMoves(board, ai, human, level.winCondition, 5);
  const candidates = [local, ...heuristic.filter(m => m.row !== local.row || m.col !== local.col)].slice(0, 5);
  const minConfidence = level.difficulty === Difficulty.Pro ? 0.6 : 0.4;
  return (await jevService.chooseMove(board, candidates, level.winCondition, minConfidence)) ?? local;
};

export const getComment = jevService.getAIPersonalityComment;
