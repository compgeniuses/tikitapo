import React, { useState, useEffect } from 'react';
import { Settings, Player, PlayerNames } from '../types';
import type { Theme } from '../themes';
import { THEMES } from '../themes';

interface SettingsScreenProps {
  onBack: () => void;
  currentSettings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, currentSettings, onSettingsChange }) => {
  const [theme, setTheme] = useState<Theme>(THEMES.find(t => t.name === currentSettings.themeName) || THEMES[0]);
  const [playerNames, setPlayerNames] = useState<PlayerNames>(currentSettings.playerNames);

  // Update parent and save settings whenever local state changes
  useEffect(() => {
    onSettingsChange({
      ...currentSettings,
      themeName: theme.name,
      playerNames,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, playerNames]);

  return (
    <div className="w-full max-w-lg bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20">
      <h1 className={`text-4xl font-orbitron font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
        Settings
      </h1>
      <div className="space-y-6">
        {/* Theme Selector */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t => (
              <button key={t.name} onClick={() => setTheme(t)} className={`p-3 rounded-lg font-semibold transition ${theme.name === t.name ? `${t.accent1Bg} ring-2 ring-white/50` : 'bg-gray-700 hover:bg-gray-600'}`}>{t.name}</button>
            ))}
          </div>
        </div>

        {/* Player Names */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Player Names</label>
          <div className="space-y-3">
            <div>
              <label htmlFor="playerX" className={`block text-sm font-bold ${theme.playerXColor} mb-1`}>
                Player 1 (X)
              </label>
              <input
                id="playerX"
                type="text"
                value={playerNames[Player.X]}
                onChange={(e) => setPlayerNames(prev => ({ ...prev, [Player.X]: e.target.value }))}
                placeholder="Player 1"
                maxLength={20}
                className="w-full p-3 text-lg bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label htmlFor="playerO" className={`block text-sm font-bold ${theme.playerOColor} mb-1`}>
                Player 2 (O) / Default
              </label>
              <input
                id="playerO"
                type="text"
                value={playerNames[Player.O]}
                onChange={(e) => setPlayerNames(prev => ({ ...prev, [Player.O]: e.target.value }))}
                placeholder="Player 2"
                maxLength={20}
                className="w-full p-3 text-lg bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
              />
            </div>
          </div>
        </div>
      </div>
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
