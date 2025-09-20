import { Board, CellState, Player, Difficulty, MatchScore } from '../types';
import type { Move, Level } from '../types';

export const createBoard = (size: number, obstacles: number): Board => {
  const board: Board = Array(size).fill(null).map(() => Array(size).fill(CellState.Empty));
  
  let obstaclesPlaced = 0;
  while (obstaclesPlaced < obstacles) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (board[row][col] === CellState.Empty) {
      board[row][col] = CellState.Obstacle;
      obstaclesPlaced++;
    }
  }
  return board;
};

export const checkWin = (board: Board, winCondition: number): { winner: Player, line: Move[] } | null => {
    const size = board.length;
    const allowDiagonals = winCondition > 4; // Only allow for Hard/Pro (Connect 5+)

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== CellState.Empty && board[r][c] !== CellState.Obstacle) {
                const player = board[r][c] as unknown as Player;
                
                // Horizontal
                if (c + winCondition <= size) {
                    const line = [{ row: r, col: c }];
                    let match = true;
                    for (let i = 1; i < winCondition; i++) {
                        if (board[r][c + i] !== (player as unknown as CellState)) { match = false; break; }
                        line.push({ row: r, col: c + i });
                    }
                    if (match) return { winner: player, line };
                }
                
                // Vertical
                if (r + winCondition <= size) {
                    const line = [{ row: r, col: c }];
                    let match = true;
                    for (let i = 1; i < winCondition; i++) {
                        if (board[r + i][c] !== (player as unknown as CellState)) { match = false; break; }
                        line.push({ row: r + i, col: c });
                    }
                    if (match) return { winner: player, line };
                }

                if (allowDiagonals) {
                    // Diagonal (top-left to bottom-right)
                    if (r + winCondition <= size && c + winCondition <= size) {
                        const line = [{ row: r, col: c }];
                        let match = true;
                        for (let i = 1; i < winCondition; i++) {
                            if (board[r + i][c + i] !== (player as unknown as CellState)) { match = false; break; }
                            line.push({ row: r + i, col: c + i });
                        }
                        if (match) return { winner: player, line };
                    }

                    // Anti-Diagonal (top-right to bottom-left)
                    if (r + winCondition <= size && c - winCondition + 1 >= 0) {
                        const line = [{ row: r, col: c }];
                        let match = true;
                        for (let i = 1; i < winCondition; i++) {
                            if (board[r + i][c - i] !== (player as unknown as CellState)) { match = false; break; }
                            line.push({ row: r + i, col: c - i });
                        }
                        if (match) return { winner: player, line };
                    }
                }
            }
        }
    }
    return null;
};

export const checkDraw = (board: Board): boolean => {
  return board.every(row => row.every(cell => cell !== CellState.Empty));
};

export const getValidMoves = (board: Board): Move[] => {
    const moves: Move[] = [];
    board.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === CellState.Empty) {
                moves.push({ row: r, col: c });
            }
        });
    });
    return moves;
};

const findWinningOrBlockingMove = (board: Board, player: Player, winCondition: number): Move | null => {
  const validMoves = getValidMoves(board);
  for (const move of validMoves) {
      const tempBoard = board.map(row => [...row]);
      tempBoard[move.row][move.col] = player as unknown as CellState;
      if (checkWin(tempBoard, winCondition)?.winner === player) {
          return move;
      }
  }
  return null;
};

const evaluateWindow = (window: CellState[], player: Player, winCondition: number): number => {
    let score = 0;
    const opponent = player === Player.X ? Player.O : Player.X;
    
    const playerCount = window.filter(p => p === (player as unknown as CellState)).length;
    const opponentCount = window.filter(p => p === (opponent as unknown as CellState)).length;
    const emptyCount = window.filter(p => p === CellState.Empty).length;

    if (playerCount === winCondition) {
        score += 100000;
    } else if (playerCount === winCondition - 1 && emptyCount === 1) {
        score += 100;
    } else if (playerCount === winCondition - 2 && emptyCount === 2) {
        score += 10;
    }

    if (opponentCount === winCondition - 1 && emptyCount === 1) {
        score -= 90;
    }

    return score;
}

const evaluateBoard = (board: Board, aiPlayer: Player, humanPlayer: Player, winCondition: number): number => {
    let score = 0;
    const size = board.length;
    const allowDiagonals = winCondition > 4;

    // Center control bonus
    const center = Math.floor(size / 2);
    for (let r = center - 1; r <= center + 1; r++) {
        for (let c = center - 1; c <= center + 1; c++) {
            if (r >= 0 && r < size && c >= 0 && c < size) {
                if (board[r][c] === (aiPlayer as unknown as CellState)) {
                    score += 3;
                }
            }
        }
    }

    // Score rows, columns, and diagonals
    const directions = [[0, 1], [1, 0]];
    if (allowDiagonals) {
        directions.push([1, 1], [1, -1]);
    }
    
    for (const [dr, dc] of directions) {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (r + (winCondition - 1) * dr < size && r + (winCondition - 1) * dr >= 0 && c + (winCondition - 1) * dc < size && c + (winCondition - 1) * dc >= 0) {
                    const window: CellState[] = [];
                    for (let i = 0; i < winCondition; i++) {
                        window.push(board[r + i * dr][c + i * dc]);
                    }
                    score += evaluateWindow(window, aiPlayer, winCondition);
                }
            }
        }
    }

    return score;
}

const minimax = (board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean, aiPlayer: Player, humanPlayer: Player, winCondition: number): number => {
    const winResult = checkWin(board, winCondition);
    if (winResult) {
        if (winResult.winner === aiPlayer) return 1000000 - (5 - depth); // Win faster is better
        if (winResult.winner === humanPlayer) return -1000000 + (5 - depth); // Lose slower is better
    }
    if (checkDraw(board) || depth === 0) {
        return evaluateBoard(board, aiPlayer, humanPlayer, winCondition);
    }

    const validMoves = getValidMoves(board);
    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of validMoves) {
            const newBoard = board.map(r => [...r]);
            newBoard[move.row][move.col] = aiPlayer as unknown as CellState;
            const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, humanPlayer, winCondition);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else { // Minimizing
        let minEval = Infinity;
        for (const move of validMoves) {
            const newBoard = board.map(r => [...r]);
            newBoard[move.row][move.col] = humanPlayer as unknown as CellState;
            const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, humanPlayer, winCondition);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

const findBestMoveMinimax = (board: Board, aiPlayer: Player, humanPlayer: Player, level: Level, matchScore: MatchScore): Move | null => {
    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) return null;
    
    let bestMove: Move = validMoves[0];
    let bestValue = -Infinity;
    
    // Determine search depth based on difficulty and level
    let depth = 1;
    if (level.difficulty === Difficulty.Hard) { // This is now only a fallback for Pro
        depth = 2 + Math.floor(level.level / 2); // Depth 2-3
    } else if (level.difficulty === Difficulty.Pro) {
        depth = 3 + level.level; // Depth 4-6
    }
    
    // Adaptive AI: If AI is losing the match, increase search depth to play harder.
    if (matchScore[aiPlayer] < matchScore[humanPlayer]) {
        depth += 1;
    }

    // Cap depth for larger boards to prevent performance issues
    if (level.boardSize > 10) depth = Math.max(1, depth - 2);
    else if (level.boardSize > 8) depth = Math.max(1, depth - 1);


    for (const move of validMoves) {
        const newBoard = board.map(r => [...r]);
        newBoard[move.row][move.col] = aiPlayer as unknown as CellState;
        const moveValue = minimax(newBoard, depth, -Infinity, Infinity, false, aiPlayer, humanPlayer, level.winCondition);
        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
        }
    }
    return bestMove;
}

export const getComputerMove = (board: Board, aiPlayer: Player, humanPlayer: Player, level: Level, matchScore: MatchScore): Move | null => {
    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) return null;

    // 1. Check for an immediate winning move for the AI.
    const winningMove = findWinningOrBlockingMove(board, aiPlayer, level.winCondition);
    if (winningMove) return winningMove;

    // 2. Check for an immediate move to block the human player.
    const blockingMove = findWinningOrBlockingMove(board, humanPlayer, level.winCondition);
    if (blockingMove) return blockingMove;
    
    // 3. Use appropriate logic for difficulty
    if (level.difficulty === Difficulty.Simple) {
        // Simple AI plays randomly after checking for wins/blocks.
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    
    if (level.difficulty === Difficulty.Hard) {
        // Hard AI uses a 1-ply heuristic search to find the best immediate move.
        return findBestMoveByHeuristic(board, aiPlayer, humanPlayer, level.winCondition) || validMoves[0];
    }
    
    // Pro uses the deep-searching Minimax algorithm.
    return findBestMoveMinimax(board, aiPlayer, humanPlayer, level, matchScore) || validMoves[0];
};

// Simplified heuristic for basic evaluation (used by Hard AI)
const findBestMoveByHeuristic = (board: Board, aiPlayer: Player, humanPlayer: Player, winCondition: number): Move | null => {
    const validMoves = getValidMoves(board);
    let bestMove: Move | null = null;
    let maxScore = -Infinity;

    for (const move of validMoves) {
        const tempBoard = board.map(r => [...r]);
        tempBoard[move.row][move.col] = aiPlayer as unknown as CellState;
        const score = evaluateBoard(tempBoard, aiPlayer, humanPlayer, winCondition);
        if (score > maxScore) {
            maxScore = score;
            bestMove = move;
        }
    }
    return bestMove;
};


export const getSuggestedMove = (board: Board, humanPlayer: Player, aiPlayer: Player, winCondition: number): Move | null => {
    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) return null;

    // 1. Prioritize winning move
    const winningMove = findWinningOrBlockingMove(board, humanPlayer, winCondition);
    if (winningMove) return winningMove;
    
    // 2. Prioritize blocking move
    const blockingMove = findWinningOrBlockingMove(board, aiPlayer, winCondition);
    if (blockingMove) return blockingMove;

    // 3. Random move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
};

export const generateAgeCheckQuestion = (): { a: number, b: number } => {
    const a = Math.floor(Math.random() * 9) + 2; // 2-10
    const b = Math.floor(Math.random() * 9) + 2; // 2-10
    return { a, b };
};