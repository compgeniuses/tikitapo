import React, { useState } from 'react';
import * as statsService from '../services/statsService';
import type { Stats, GameStats } from '../types';
import type { Theme } from '../themes';
import { GameMode, Difficulty } from '../types';

interface PlayerStatsScreenProps {
  onBack: () => void;
  theme: Theme;
  onResetProgress: () => void;
}

const calculateWinRate = (stats: GameStats) => {
    const totalGames = stats.playerXWins + stats.playerOWins;
    if (totalGames === 0) return '0.0%';
    const rate = (stats.playerXWins / totalGames) * 100;
    return `${rate.toFixed(1)}%`;
};

const StatCard: React.FC<{ title: string; stats: GameStats, theme: Theme, isTwoPlayer?: boolean }> = ({ title, stats, theme, isTwoPlayer = false }) => (
    <div className={`bg-gray-900/50 p-4 rounded-md border ${theme.boardBg === 'bg-gray-800' ? 'border-gray-700' : 'border-transparent'}`}>
        <h3 className={`text-xl font-bold ${theme.accent1} mb-3 text-center`}>{title}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="font-semibold text-gray-300">P1 (X) Wins:</span><span className="text-right font-mono text-white">{stats.playerXWins}</span>
            <span className="font-semibold text-gray-300">{isTwoPlayer ? 'P2 (O) Wins:' : 'CPU/AI (O) Wins:'}</span><span className="text-right font-mono text-white">{stats.playerOWins}</span>
            <span className="font-semibold text-gray-300">Draws:</span><span className="text-right font-mono text-white">{stats.draws}</span>
            <span className="font-semibold text-gray-300">P1 Win Rate:</span><span className="text-right font-mono text-white">{calculateWinRate(stats)}</span>
        </div>
    </div>
);


export const PlayerStatsScreen: React.FC<PlayerStatsScreenProps> = ({ onBack, theme, onResetProgress }) => {
  const [stats, setStats] = useState<Stats>(statsService.getStats());

  const handleResetStats = () => {
    if (window.confirm("Are you sure you want to reset all your stats? This cannot be undone.")) {
        const newStats = statsService.resetStats();
        setStats(newStats);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl border border-cyan-500/20 text-white">
      <h1 className={`text-3xl md:text-4xl font-orbitron font-black text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
        Player Statistics
      </h1>
      
      <div className="space-y-6">
        {/* VS CPU Stats */}
        <div>
            <h2 className="text-2xl font-orbitron font-bold mb-3">vs CPU (Offline)</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <StatCard title="Simple" stats={stats[GameMode.Offline][Difficulty.Simple]} theme={theme} />
                <StatCard title="Hard" stats={stats[GameMode.Offline][Difficulty.Hard]} theme={theme} />
                <StatCard title="Pro" stats={stats[GameMode.Offline][Difficulty.Pro]} theme={theme} />
            </div>
        </div>

        {/* VS AI Stats */}
        <div>
            <h2 className="text-2xl font-orbitron font-bold mb-3">vs AI (Gemini)</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <StatCard title="Simple" stats={stats[GameMode.AI][Difficulty.Simple]} theme={theme} />
                <StatCard title="Hard" stats={stats[GameMode.AI][Difficulty.Hard]} theme={theme} />
                <StatCard title="Pro" stats={stats[GameMode.AI][Difficulty.Pro]} theme={theme} />
            </div>
        </div>

        {/* 2 Player Stats */}
        <div>
             <h2 className="text-2xl font-orbitron font-bold mb-3">2 Player (Hot-seat)</h2>
             <div className="max-w-xs mx-auto">
                <StatCard title="Match Record" stats={stats[GameMode.TwoPlayer]} theme={theme} isTwoPlayer={true} />
             </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={onBack} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-md font-bold transition-transform transform hover:scale-105">
          Back to Menu
        </button>
        <button onClick={onResetProgress} className="px-8 py-3 bg-orange-800 hover:bg-orange-700 rounded-md font-bold transition-transform transform hover:scale-105">
          Reset Progress
        </button>
        <button onClick={handleResetStats} className="px-8 py-3 bg-red-800 hover:bg-red-700 rounded-md font-bold transition-transform transform hover:scale-105">
          Reset Stats
        </button>
      </div>
    </div>
  );
};