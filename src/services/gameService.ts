
import { Board, CellState, Player, Difficulty } from '../types';
import type { Move } from '../types';

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

    const checkLine = (r: number, c: number, dr: number, dc: number): Move[] | null => {
        // FIX: Cast CellState to Player. The surrounding logic ensures this is a player piece. Cast via unknown for safety.
        const player = board[r][c] as unknown as Player;
        if (player === Player.None) return null;

        const line: Move[] = [{ row: r, col: c }];
        for (let i = 1; i < winCondition; i++) {
            const newRow = r + i * dr;
            const newCol = c + i * dc;
            // FIX: Cast Player to CellState for comparison, as board cells are of type CellState.
            if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size || board[newRow][newCol] !== (player as CellState)) {
                return null;
            }
            line.push({ row: newRow, col: newCol });
        }
        return line;
    };

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== CellState.Empty && board[r][c] !== CellState.Obstacle) {
                // Horizontal
                let line = checkLine(r, c, 0, 1);
                // FIX: Cast CellState to Player.
                if (line) return { winner: board[r][c] as unknown as Player, line };
                // Vertical
                line = checkLine(r, c, 1, 0);
                // FIX: Cast CellState to Player.
                if (line) return { winner: board[r][c] as unknown as Player, line };
                // Diagonal (top-left to bottom-right)
                line = checkLine(r, c, 1, 1);
                // FIX: Cast CellState to Player.
                if (line) return { winner: board[r][c] as unknown as Player, line };
                // Anti-Diagonal (top-right to bottom-left)
                line = checkLine(r, c, 1, -1);
                // FIX: Cast CellState to Player.
                if (line) return { winner: board[r][c] as unknown as Player, line };
            }
        }
    }

    return null;
};

export const checkDraw = (board: Board): boolean => {
  return board.every(row => row.every(cell => cell !== CellState.Empty));
};

const getValidMoves = (board: Board): Move[] => {
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
      // FIX: Cast Player to CellState for assignment to the board.
      tempBoard[move.row][move.col] = player as CellState;
      if (checkWin(tempBoard, winCondition)) {
          return move;
      }
  }
  return null;
};

const findBestMoveByHeuristic = (board: Board, aiPlayer: Player, humanPlayer: Player, winCondition: number): Move | null => {
    const validMoves = getValidMoves(board);
    let bestMove: Move | null = null;
    let maxScore = -Infinity;

    for (const move of validMoves) {
        const tempBoard = board.map(r => [...r]);
        // FIX: Cast Player to CellState for assignment to the board.
        tempBoard[move.row][move.col] = aiPlayer as CellState;
        const score = evaluateBoard(tempBoard, aiPlayer, humanPlayer, winCondition);
        if (score > maxScore) {
            maxScore = score;
            bestMove = move;
        }
    }
    return bestMove;
};

const evaluateBoard = (board: Board, aiPlayer: Player, humanPlayer: Player, winCondition: number): number => {
    let score = 0;
    // Prioritize winning move
    if (checkWin(board, winCondition)?.winner === aiPlayer) return 10000;
    
    // Evaluate based on potential lines
    score += countPotentialLines(board, aiPlayer, winCondition) * 10;
    score -= countPotentialLines(board, humanPlayer, winCondition) * 9; // Slightly less weight to blocking

    return score;
};

const countPotentialLines = (board: Board, player: Player, winCondition: number): number => {
    let count = 0;
    const size = board.length;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            for (const [dr, dc] of directions) {
                for(let len = 2; len < winCondition; len++){
                     if (canPlaceLine(board, r, c, dr, dc, player, len)) {
                        count += len * len; // Weight longer potential lines more
                    }
                }
            }
        }
    }
    return count;
};

const canPlaceLine = (board: Board, r: number, c: number, dr: number, dc: number, player: Player, length: number): boolean => {
    let playerCount = 0;
    let emptyCount = 0;

    for (let i = 0; i < length; i++) {
        const newR = r + i * dr;
        const newC = c + i * dc;

        if (newR < 0 || newR >= board.length || newC < 0 || newC >= board.length) return false;
        
        const cell = board[newR][newC];
        // FIX: Cast Player to CellState for comparison, as a board cell is of type CellState.
        if (cell === (player as CellState)) playerCount++;
        else if (cell === CellState.Empty) emptyCount++;
        else return false; // Blocked by opponent or obstacle
    }

    // A potential line has only the player's pieces and empty spots
    return playerCount > 0 && (playerCount + emptyCount === length);
};


export const getComputerMove = (board: Board, aiPlayer: Player, humanPlayer: Player, difficulty: Difficulty, winCondition: number): Move | null => {
    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) return null;

    if (difficulty === Difficulty.Simple) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Hard & Pro: Check for immediate win
    const winningMove = findWinningOrBlockingMove(board, aiPlayer, winCondition);
    if (winningMove) return winningMove;

    // Hard & Pro: Check for immediate block
    const blockingMove = findWinningOrBlockingMove(board, humanPlayer, winCondition);
    if (blockingMove) return blockingMove;

    if (difficulty === Difficulty.Hard) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Pro: Use heuristic
    if (difficulty === Difficulty.Pro) {
      return findBestMoveByHeuristic(board, aiPlayer, humanPlayer, winCondition) || validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)];
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
