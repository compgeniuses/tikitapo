import React, { useState, useMemo } from 'react';
import { Difficulty, GameMode } from '../types';
import * as leaderboardService from '../services/leaderboardService';
import type { Theme } from '../themes';

interface LeaderboardScreenProps {
  onBack: () => void;
  theme: Theme;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, theme }) => {
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [gameModeFilter, setGameModeFilter] = useState<GameMode | 'all'>('all');

  const leaderboard = useMemo(() => {
    const difficulty = difficultyFilter === 'all' ? undefined : difficultyFilter;
    const gameMode = gameModeFilter === 'all' ? undefined : gameModeFilter;
    return leaderboardService.getFilteredLeaderboard(difficulty, gameMode);
  }, [difficultyFilter, gameModeFilter]);

  const stats = useMemo(() => {
    const allEntries = leaderboardService.getLeaderboard();
    const totalWins = allEntries.reduce((sum, e) => sum + e.wins, 0);
    const totalLosses = allEntries.reduce((sum, e) => sum + e.losses, 0);
    const totalDraws = allEntries.reduce((sum, e) => sum + e.draws, 0);
    const totalGames = totalWins + totalLosses + totalDraws;

    return {
      totalGames,
      totalWins,
      totalLosses,
      totalDraws,
      winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20">
      <h1
        className={`text-4xl font-orbitron font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}
      >
        Leaderboard
      </h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-900/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
          <div className="text-xs text-gray-400">Games</div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-400">{stats.totalWins}</div>
          <div className="text-xs text-gray-400">Wins</div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-400">{stats.totalLosses}</div>
          <div className="text-xs text-gray-400">Losses</div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.totalDraws}</div>
          <div className="text-xs text-gray-400">Draws</div>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.winRate}%</div>
          <div className="text-xs text-gray-400">Win Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className={`block text-sm font-bold ${theme.accent1} mb-2`}>Difficulty</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
            className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">All Difficulties</option>
            {Object.values(Difficulty).map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`block text-sm font-bold ${theme.accent1} mb-2`}>Game Mode</label>
          <select
            value={gameModeFilter}
            onChange={(e) => setGameModeFilter(e.target.value as GameMode | 'all')}
            className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">All Modes</option>
            <option value={GameMode.AI}>vs AI</option>
            <option value={GameMode.TwoPlayer}>2 Player</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className={`border-b-2 ${theme.accent1.replace('text-', 'border-')}`}>
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">Player</th>
              <th className="py-3 px-4 text-center">Wins</th>
              <th className="py-3 px-4 text-center">Losses</th>
              <th className="py-3 px-4 text-center">Draws</th>
              <th className="py-3 px-4 text-center">Win %</th>
              <th className="py-3 px-4 text-center">Difficulty</th>
              <th className="py-3 px-4 text-right">Last Played</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No games recorded yet. Play some games to see your stats!
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, index) => {
                const total = entry.wins + entry.losses + entry.draws;
                const winRate = total > 0 ? Math.round((entry.wins / total) * 100) : 0;

                return (
                  <tr
                    key={entry.id}
                    className={`border-b border-gray-700 hover:bg-gray-700/50 ${index < 3 ? 'bg-yellow-500/10' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                              ? 'text-gray-300'
                              : index === 2
                                ? 'text-orange-400'
                                : 'text-gray-400'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {entry.avatarUrl && (
                          <img
                            src={entry.avatarUrl}
                            alt={entry.playerName}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-medium">{entry.playerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-green-400">{entry.wins}</td>
                    <td className="py-3 px-4 text-center text-red-400">{entry.losses}</td>
                    <td className="py-3 px-4 text-center text-yellow-400">{entry.draws}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded ${
                          winRate >= 70
                            ? 'bg-green-500/20 text-green-400'
                            : winRate >= 50
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {winRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          entry.difficulty === Difficulty.Simple
                            ? 'bg-green-500/20 text-green-400'
                            : entry.difficulty === Difficulty.Hard
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {entry.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 text-sm">
                      {formatDate(entry.date)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-lg font-orbitron font-bold transition-transform transform hover:scale-105"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
