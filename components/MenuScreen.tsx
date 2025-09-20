import React, { useState } from 'react';
import { GameMode, Difficulty, Progress, Settings } from '../types';
import type { Level } from '../types';
import { LEVELS_BY_DIFFICULTY, TWO_PLAYER_LEVELS } from '../constants';
import { THEMES } from '../themes';
import type { Theme } from '../themes';

interface MenuScreenProps {
  onStartGame: (mode: GameMode, level: Level) => void;
  onShowStats: () => void;
  onShowSettings: () => void;
  onShowAchievements: () => void;
  progress: Progress;
  settings: Settings;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame, onShowStats, onShowSettings, onShowAchievements, progress, settings }) => {
  const [mode, setMode] = useState<GameMode>(settings.lastPlayedMode);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(settings.lastPlayedDifficulty);
  const [twoPlayerLevel, setTwoPlayerLevel] = useState<Level>(TWO_PLAYER_LEVELS[0]);

  const theme = THEMES.find(t => t.name === settings.themeName) || THEMES[0];

  const handleStart = (level: Level) => {
    onStartGame(mode, level);
  }

  const renderCpuLevelSelector = () => {
    const levels = LEVELS_BY_DIFFICULTY[selectedDifficulty];
    const unlockedForDifficulty = progress[selectedDifficulty];

    return (
      <div>
        {/* Difficulty Selector */}
        <div className="mb-4">
            <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
                {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map(key => (
                    <button 
                        key={key} 
                        onClick={() => setSelectedDifficulty(Difficulty[key])}
                        className={`p-3 rounded-lg font-bold transition ${selectedDifficulty === Difficulty[key] ? `${theme.accent1Bg} ring-2 ring-white/50` : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        {Difficulty[key]}
                    </button>
                ))}
            </div>
        </div>

        {/* Level Grid */}
        <div>
            <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Select Level</label>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
            {levels.map(level => {
                const isUnlocked = level.level <= unlockedForDifficulty;
                return (
                <button
                    key={`${level.difficulty}-${level.level}`}
                    onClick={() => handleStart(level)}
                    disabled={!isUnlocked}
                    className={`p-3 rounded-lg font-semibold transition text-center
                    ${isUnlocked 
                        ? `bg-gray-700 hover:bg-gray-600 hover:ring-2 hover:ring-white/50` 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`
                    }
                >
                    <span className="font-bold block text-xl">{level.level}</span>
                    <span className="text-xs">{level.boardSize}x{level.boardSize}</span>
                </button>
                )
            })}
            </div>
        </div>
      </div>
    );
  };
  
  const renderTwoPlayerSelector = () => {
      return (
         <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Board Setup</label>
           <select 
            value={twoPlayerLevel.level} 
            onChange={(e) => setTwoPlayerLevel(TWO_PLAYER_LEVELS.find(l => l.level === parseInt(e.target.value))!)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
           >
            {TWO_PLAYER_LEVELS.map(l => (
                <option key={l.level} value={l.level}>
                    {l.boardSize}x{l.boardSize}, Connect {l.winCondition}
                </option>
            ))}
           </select>
        </div>
      );
  }

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20">
      <h1 className={`text-6xl md:text-7xl font-orbitron font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
        tikiTaP0
      </h1>
      
      <div className="space-y-6">
        {/* Game Mode */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Game Mode</label>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setMode(GameMode.Offline)} className={`p-4 rounded-lg font-bold transition ${mode === GameMode.Offline ? `${theme.accent1Bg} ring-2 ring-white/50` : 'bg-gray-700 hover:bg-gray-600'}`}>vs CPU</button>
            <button onClick={() => setMode(GameMode.AI)} className={`p-4 rounded-lg font-bold transition ${mode === GameMode.AI ? `${theme.accent1Bg} ring-2 ring-white/50` : 'bg-gray-700 hover:bg-gray-600'}`}>vs AI</button>
            <button onClick={() => setMode(GameMode.TwoPlayer)} className={`p-4 rounded-lg font-bold transition ${mode === GameMode.TwoPlayer ? `${theme.accent1Bg} ring-2 ring-white/50` : 'bg-gray-700 hover:bg-gray-600'}`}>2 Player</button>
          </div>
           {mode === GameMode.AI && <p className="text-center text-xs text-gray-400 mt-1">(Win to get a Gemini-generated image!)</p>}
        </div>
        
        { (mode === GameMode.Offline || mode === GameMode.AI) && renderCpuLevelSelector() }
        { mode === GameMode.TwoPlayer && renderTwoPlayerSelector() }
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-2">
        <button
            onClick={onShowStats}
            className="w-full py-3 bg-gray-700 hover:bg-purple-800 rounded-lg text-sm font-orbitron font-bold transition-all transform hover:scale-105"
        >
            STATS
        </button>
        <button
            onClick={onShowAchievements}
            className="w-full py-3 bg-gray-700 hover:bg-yellow-800 rounded-lg text-sm font-orbitron font-bold transition-all transform hover:scale-105"
        >
            AWARDS
        </button>
        <button
            onClick={onShowSettings}
            className="w-full py-3 bg-gray-700 hover:bg-cyan-800 rounded-lg text-sm font-orbitron font-bold transition-all transform hover:scale-105"
        >
            SETTINGS
        </button>
      </div>

      {mode === GameMode.TwoPlayer && (
         <button
          onClick={() => handleStart(twoPlayerLevel)}
          className="w-full mt-4 py-4 bg-green-600 hover:bg-green-500 rounded-lg text-2xl font-orbitron font-bold transition-transform transform hover:scale-105"
        >
          START GAME
        </button>
      )}
    </div>
  );
};