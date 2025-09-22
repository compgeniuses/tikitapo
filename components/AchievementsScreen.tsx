import React, { useState } from 'react';
import { ALL_ACHIEVEMENTS } from '../constants';
import * as achievementsService from '../services/achievementsService';
import type { Theme } from '../themes';

interface AchievementsScreenProps {
  onBack: () => void;
  theme: Theme;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onBack, theme }) => {
  const [unlockedIds, setUnlockedIds] = useState(new Set(achievementsService.getUnlockedAchievements()));

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all your achievements? This cannot be undone.")) {
      achievementsService.resetAchievements();
      setUnlockedIds(new Set());
    }
  };

  const unlockedCount = unlockedIds.size;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl border border-cyan-500/20 text-white">
      <h1 className={`text-3xl md:text-4xl font-orbitron font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
        Achievements
      </h1>
      <div className="text-center mb-6">
        <p className="font-bold">{unlockedCount} / {totalCount} Unlocked</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
          <div className={`${theme.accent1Bg} h-2.5 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
        {ALL_ACHIEVEMENTS.map(ach => {
          const isUnlocked = unlockedIds.has(ach.id);
          return (
            <div key={ach.id} className={`p-4 rounded-lg flex items-center gap-4 transition-all duration-300 ${isUnlocked ? 'bg-gray-700/80 border-l-4 border-yellow-400' : 'bg-gray-900/50'}`}>
              <div className={`text-4xl transition-transform ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                🏆
              </div>
              <div>
                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-yellow-300' : 'text-gray-400'}`}>{ach.title}</h3>
                <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>{ach.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={onBack} className="px-8 py-3 bg-gray-600 hover:bg-gray-500 rounded-md font-bold transition-transform transform hover:scale-105">
          Back to Menu
        </button>
        <button onClick={handleReset} className="px-8 py-3 bg-red-800 hover:bg-red-700 rounded-md font-bold transition-transform transform hover:scale-105">
          Reset Achievements
        </button>
      </div>
    </div>
  );
};