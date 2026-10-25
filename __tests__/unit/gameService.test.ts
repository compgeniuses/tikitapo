import { describe, it, expect, beforeEach } from 'vitest';
import * as gameService from '../../services/gameService';
import { CellState, Player, Difficulty } from '../../types';

describe('gameService', () => {
  describe('createBoard', () => {
    it('should create a board with correct dimensions', () => {
      const board = gameService.createBoard(3, 0);
      expect(board).toHaveLength(3);
      expect(board[0]).toHaveLength(3);
    });

    it('should create an empty board', () => {
      const board = gameService.createBoard(3, 0);
      board.forEach(row => {
        row.forEach(cell => {
          expect(cell).toBe(CellState.Empty);
        });
      });
    });

    it('should add obstacles when specified', () => {
      const board = gameService.createBoard(3, 2);
      const obstacleCount = board.flat().filter(c => c === CellState.Obstacle).length;
      expect(obstacleCount).toBe(2);
    });
  });

  describe('checkWin', () => {
    it('should detect a horizontal win', () => {
      const board = [
        [CellState.X, CellState.X, CellState.X],
        [CellState.Empty, CellState.Empty, CellState.Empty],
        [CellState.Empty, CellState.Empty, CellState.Empty],
      ];
      const result = gameService.checkWin(board, 3);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe(Player.X);
    });

    it('should detect a vertical win', () => {
      const board = [
        [CellState.X, CellState.Empty, CellState.Empty],
        [CellState.X, CellState.Empty, CellState.Empty],
        [CellState.X, CellState.Empty, CellState.Empty],
      ];
      const result = gameService.checkWin(board, 3);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe(Player.X);
    });

    it('should return null when no winner', () => {
      const board = [
        [CellState.X, CellState.O, CellState.Empty],
        [CellState.Empty, CellState.X, CellState.Empty],
        [CellState.Empty, CellState.Empty, CellState.O],
      ];
      const result = gameService.checkWin(board, 3);
      expect(result).toBeNull();
    });
  });

  describe('checkDraw', () => {
    it('should detect a draw', () => {
      const board = [
        [CellState.X, CellState.O, CellState.X],
        [CellState.X, CellState.O, CellState.O],
        [CellState.O, CellState.X, CellState.X],
      ];
      expect(gameService.checkDraw(board)).toBe(true);
    });

    it('should not detect draw when board is not full', () => {
      const board = [
        [CellState.X, CellState.Empty, CellState.Empty],
        [CellState.Empty, CellState.Empty, CellState.Empty],
        [CellState.Empty, CellState.Empty, CellState.Empty],
      ];
      expect(gameService.checkDraw(board)).toBe(false);
    });
  });

  describe('getComputerMove', () => {
    it('should return a valid move', () => {
      const board = gameService.createBoard(3, 0);
      const move = gameService.getComputerMove(board, Player.O, Player.X, 
        { level: 1, boardSize: 3, winCondition: 3, obstacles: 0, difficulty: Difficulty.Simple },
        { [Player.X]: 0, [Player.O]: 0 }
      );
      
      expect(move).toBeDefined();
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(3);
      expect(move.col).toBeGreaterThanOrEqual(0);
      expect(move.col).toBeLessThan(3);
    });

    it('should not return a move on a filled board', () => {
      const board = [
        [CellState.X, CellState.O, CellState.X],
        [CellState.X, CellState.O, CellState.O],
        [CellState.O, CellState.X, CellState.X],
      ];
      
      const move = gameService.getComputerMove(board, Player.O, Player.X,
        { level: 1, boardSize: 3, winCondition: 3, obstacles: 0, difficulty: Difficulty.Simple },
        { [Player.X]: 0, [Player.O]: 0 }
      );
      
      expect(move).toBeNull();
    });
  });
});
