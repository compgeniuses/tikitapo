import { GameMode, Difficulty, Player, Stats, GameStats } from '../types';

const STATS_STORAGE_KEY = 'connect-n-stats';

const defaultGameStats: GameStats = {
  playerXWins: 0,
  playerOWins: 0,
  draws: 0,
};

const defaultStats: Stats = {
  [GameMode.Offline]: {
    [Difficulty.Simple]: { ...defaultGameStats },
    [Difficulty.Hard]: { ...defaultGameStats },
    [Difficulty.Pro]: { ...defaultGameStats },
  },
  [GameMode.AI]: {
    [Difficulty.Simple]: { ...defaultGameStats },
    [Difficulty.Hard]: { ...defaultGameStats },
    [Difficulty.Pro]: { ...defaultGameStats },
  },
  [GameMode.TwoPlayer]: { ...defaultGameStats },
};

export const getStats = (): Stats => {
  try {
    const statsJson = localStorage.getItem(STATS_STORAGE_KEY);
    if (statsJson) {
      const savedStats = JSON.parse(statsJson);
      // Deep merge to ensure new properties from defaultStats are included
      return {
        ...defaultStats,
        ...savedStats,
        [GameMode.Offline]: {
          ...defaultStats.offline,
          ...(savedStats.offline || {}),
        },
        [GameMode.AI]: {
          ...defaultStats.ai,
          ...(savedStats.ai || {}),
        },
        [GameMode.TwoPlayer]: {
          ...defaultStats.twoPlayer,
          ...(savedStats.twoPlayer || {}),
        }
      };
    }
  } catch (error) {
    console.error("Failed to parse stats from localStorage:", error);
  }
  return JSON.parse(JSON.stringify(defaultStats));
};

export const saveStats = (stats: Stats): void => {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save stats to localStorage:", error);
  }
};

export const updateStats = (
  gameMode: GameMode,
  difficulty: Difficulty | null,
  winner: Player | 'draw'
): void => {
  const stats = getStats();
  
  let gameStats: GameStats | null = null;
  
  if (gameMode === GameMode.TwoPlayer) {
    gameStats = stats.twoPlayer;
  } else if (difficulty && (gameMode === GameMode.Offline || gameMode === GameMode.AI)) {
    gameStats = stats[gameMode][difficulty];
  }

  if (gameStats) {
      if (winner === 'draw') {
        gameStats.draws++;
      } else if (winner === Player.X) {
        gameStats.playerXWins++;
      } else if (winner === Player.O) {
        gameStats.playerOWins++;
      }
  }

  saveStats(stats);
};

export const resetStats = (): Stats => {
   const newStats = JSON.parse(JSON.stringify(defaultStats));
   saveStats(newStats);
   return newStats;
};
