import { Difficulty, GameMode, Player } from '../types';

const LEADERBOARD_KEY = 'tikitapo_leaderboard';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  wins: number;
  losses: number;
  draws: number;
  difficulty: Difficulty;
  gameMode: GameMode;
  date: string;
  avatarUrl?: string;
}

export interface LeaderboardStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winRate: number;
  bestStreak: number;
  currentStreak: number;
}

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all leaderboard entries
export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save leaderboard
const saveLeaderboard = (entries: LeaderboardEntry[]): void => {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
};

// Add a game result to leaderboard
export const addGameResult = (
  playerName: string,
  result: 'win' | 'loss' | 'draw',
  difficulty: Difficulty,
  gameMode: GameMode,
  avatarUrl?: string
): LeaderboardEntry => {
  const entries = getLeaderboard();

  // Find existing entry for this player + difficulty + mode
  const existingIndex = entries.findIndex(
    (e) => e.playerName === playerName && e.difficulty === difficulty && e.gameMode === gameMode
  );

  const newEntry: LeaderboardEntry = {
    id: generateId(),
    playerName,
    wins: result === 'win' ? 1 : 0,
    losses: result === 'loss' ? 1 : 0,
    draws: result === 'draw' ? 1 : 0,
    difficulty,
    gameMode,
    date: new Date().toISOString(),
    avatarUrl,
  };

  if (existingIndex >= 0) {
    // Update existing entry
    entries[existingIndex].wins += newEntry.wins;
    entries[existingIndex].losses += newEntry.losses;
    entries[existingIndex].draws += newEntry.draws;
    entries[existingIndex].date = newEntry.date;
  } else {
    // Add new entry
    entries.push(newEntry);
  }

  saveLeaderboard(entries);
  return newEntry;
};

// Get leaderboard for specific difficulty and mode
export const getFilteredLeaderboard = (
  difficulty?: Difficulty,
  gameMode?: GameMode
): LeaderboardEntry[] => {
  const entries = getLeaderboard();

  return entries
    .filter((e) => {
      if (difficulty && e.difficulty !== difficulty) return false;
      if (gameMode && e.gameMode !== gameMode) return false;
      return true;
    })
    .sort((a, b) => b.wins - a.wins); // Sort by wins descending
};

// Get player's stats
export const getPlayerStats = (playerName: string): LeaderboardStats | null => {
  const entries = getLeaderboard().filter((e) => e.playerName === playerName);

  if (entries.length === 0) return null;

  const totalWins = entries.reduce((sum, e) => sum + e.wins, 0);
  const totalLosses = entries.reduce((sum, e) => sum + e.losses, 0);
  const totalDraws = entries.reduce((sum, e) => sum + e.draws, 0);
  const totalGames = totalWins + totalLosses + totalDraws;

  return {
    totalGames,
    totalWins,
    totalLosses,
    totalDraws,
    winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
    bestStreak: 0, // Could implement streak tracking
    currentStreak: 0,
  };
};

// Get top players
export const getTopPlayers = (limit: number = 10): LeaderboardEntry[] => {
  return getLeaderboard()
    .sort((a, b) => b.wins - a.wins)
    .slice(0, limit);
};

// Clear leaderboard
export const clearLeaderboard = (): void => {
  localStorage.removeItem(LEADERBOARD_KEY);
};

// Remove specific entry
export const removeEntry = (id: string): boolean => {
  const entries = getLeaderboard();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length === entries.length) return false;

  saveLeaderboard(filtered);
  return true;
};
