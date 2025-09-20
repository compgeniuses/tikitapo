import { Level, Difficulty, Achievement } from './types';

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
        { level: 2, boardSize: 8, winCondition: 5, obstacles: 4, difficulty: Difficulty.Hard },
        { level: 3, boardSize: 9, winCondition: 5, obstacles: 4, difficulty: Difficulty.Hard },
        { level: 4, boardSize: 9, winCondition: 5, obstacles: 5, difficulty: Difficulty.Hard },
        { level: 5, boardSize: 10, winCondition: 5, obstacles: 5, difficulty: Difficulty.Hard },
        { level: 6, boardSize: 10, winCondition: 5, obstacles: 6, difficulty: Difficulty.Hard },
    ],
    [Difficulty.Pro]: [
        { level: 1, boardSize: 10, winCondition: 6, obstacles: 5, difficulty: Difficulty.Pro },
        { level: 2, boardSize: 10, winCondition: 6, obstacles: 6, difficulty: Difficulty.Pro },
        { level: 3, boardSize: 11, winCondition: 6, obstacles: 6, difficulty: Difficulty.Pro },
        { level: 4, boardSize: 11, winCondition: 6, obstacles: 7, difficulty: Difficulty.Pro },
        { level: 5, boardSize: 12, winCondition: 6, obstacles: 7, difficulty: Difficulty.Pro },
        { level: 6, boardSize: 12, winCondition: 6, obstacles: 8, difficulty: Difficulty.Pro },
    ],
};

// For 2-player mode, we can offer a simple selection of board sizes.
export const TWO_PLAYER_LEVELS: Level[] = [
  { level: 1, boardSize: 6, winCondition: 3, obstacles: 0, difficulty: Difficulty.Simple },
  { level: 2, boardSize: 8, winCondition: 4, obstacles: 2, difficulty: Difficulty.Hard },
  { level: 3, boardSize: 10, winCondition: 5, obstacles: 4, difficulty: Difficulty.Pro },
  { level: 4, boardSize: 12, winCondition: 6, obstacles: 6, difficulty: Difficulty.Pro },
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'First Victory', description: 'Win your first round against any opponent.' },
  { id: 'simple_complete', title: 'Apprentice', description: 'Complete all levels in Simple difficulty.' },
  { id: 'hard_complete', title: 'Adept', description: 'Complete all levels in Hard difficulty.' },
  { id: 'pro_complete', title: 'Grandmaster', description: 'Complete all levels in Pro difficulty.' },
  { id: 'connect_6', title: 'Long Shot', description: 'Win a round by connecting 6 pieces.' },
  { id: 'flawless_victory', title: 'Flawless Victory', description: 'Win a level match with a score of 2-0.' },
  { id: 'ai_slayer', title: 'AI Slayer', description: 'Win a match in "vs AI" mode.' },
  { id: 'clutch_performer', title: 'Clutch Performer', description: 'Win a match in a Final Round tie-breaker.' },
  { id: 'obstacle_course', title: 'Obstacle Course', description: 'Win a round on a board with 5 or more obstacles.' },
  { id: 'socialite', title: 'Socialite', description: 'Complete a match in 2 Player mode.' }
];