import { Level, Difficulty } from './types';

export const WINS_PER_LEVEL_MATCH = 2; // First to 2 wins (best of 3)

export const DIFFICULTIES_ORDER = [Difficulty.Simple, Difficulty.Hard, Difficulty.Pro];

export const LEVELS_BY_DIFFICULTY: { [key in Difficulty]: Level[] } = {
    [Difficulty.Simple]: [
        { level: 1, boardSize: 5, winCondition: 3, obstacles: 0, difficulty: Difficulty.Simple },
        { level: 2, boardSize: 6, winCondition: 3, obstacles: 1, difficulty: Difficulty.Simple },
        { level: 3, boardSize: 7, winCondition: 4, obstacles: 1, difficulty: Difficulty.Simple },
        { level: 4, boardSize: 8, winCondition: 4, obstacles: 2, difficulty: Difficulty.Simple },
    ],
    [Difficulty.Hard]: [
        { level: 1, boardSize: 8, winCondition: 5, obstacles: 3, difficulty: Difficulty.Hard },
        { level: 2, boardSize: 9, winCondition: 5, obstacles: 4, difficulty: Difficulty.Hard },
        { level: 3, boardSize: 10, winCondition: 5, obstacles: 4, difficulty: Difficulty.Hard },
    ],
    [Difficulty.Pro]: [
        { level: 1, boardSize: 10, winCondition: 6, obstacles: 5, difficulty: Difficulty.Pro },
        { level: 2, boardSize: 11, winCondition: 6, obstacles: 6, difficulty: Difficulty.Pro },
        { level: 3, boardSize: 12, winCondition: 6, obstacles: 6, difficulty: Difficulty.Pro },
    ],
};

// For 2-player mode, we can offer a simple selection of board sizes.
export const TWO_PLAYER_LEVELS: Level[] = [
  { level: 1, boardSize: 6, winCondition: 3, obstacles: 0, difficulty: Difficulty.Simple },
  { level: 2, boardSize: 8, winCondition: 4, obstacles: 2, difficulty: Difficulty.Hard },
  { level: 3, boardSize: 10, winCondition: 5, obstacles: 4, difficulty: Difficulty.Pro },
  { level: 4, boardSize: 12, winCondition: 6, obstacles: 6, difficulty: Difficulty.Pro },
];