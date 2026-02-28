import React, { useState, useEffect } from 'react';
import { Settings, Player, PlayerNames } from '../types';
import type { Theme } from '../themes';
import { THEMES } from '../themes';
import { AISettingsModal } from './AISettingsModal';

interface SettingsScreenProps {
  onBack: () => void;
  currentSettings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
  onGoToAvatarCreation: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  currentSettings,
  onSettingsChange,
  onGoToAvatarCreation,
}) => {
  const [theme, setTheme] = useState<Theme>(
    THEMES.find((t) => t.name === currentSettings.themeName) || THEMES[0]
  );
  const [playerNames, setPlayerNames] = useState<PlayerNames>(currentSettings.playerNames);
  const [showAISettings, setShowAISettings] = useState(false);

  useEffect(() => {
    onSettingsChange({
      ...currentSettings,
      themeName: theme.name,
      playerNames,
    });
  }, [theme, playerNames]);

  return (
    <div className="w-full max-w-lg bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20">
      <h1
        className={`text-4xl font-orbitron font-black text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}
      >
        Settings
      </h1>
      <div className="space-y-6">
        {/* Theme Selector */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t)}
                className={`p-3 rounded-lg font-semibold transition ${theme.name === t.name ? `${t.accent1Bg} ring-2 ring-white/50` : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Section */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Your Avatar</label>
          <div className="flex items-center gap-4 bg-gray-900/50 p-3 rounded-lg">
            {currentSettings.avatarUrl ? (
              <img
                src={currentSettings.avatarUrl}
                alt="Your Avatar"
                className="w-16 h-16 rounded-full bg-gray-700 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-3xl">?</span>
              </div>
            )}
            <button
              onClick={onGoToAvatarCreation}
              className={`px-4 py-2 ${theme.accent2Bg} hover:opacity-90 rounded-md font-bold transition-transform transform hover:scale-105`}
            >
              Create / Change Avatar
            </button>
          </div>
        </div>

        {/* AI Settings */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>
            AI Configuration
          </label>
          <div className="bg-gray-900/50 p-3 rounded-lg">
            <button
              onClick={() => setShowAISettings(true)}
              className={`w-full px-4 py-3 ${theme.accent1Bg} hover:opacity-90 rounded-md font-bold transition-transform transform hover:scale-105 flex items-center justify-center gap-2`}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
              </svg>
              Configure AI Agents & API Keys
            </button>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Add your own API keys (OpenAI, Gemini, Anthropic) and configure AI opponents
            </p>
          </div>
        </div>

        {/* Sound Settings */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Sound</label>
          <div className="space-y-3 bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Sound Effects</span>
              <button
                role="switch"
                aria-checked={currentSettings.soundEnabled !== false}
                onClick={() =>
                  onSettingsChange({
                    ...currentSettings,
                    soundEnabled: !currentSettings.soundEnabled,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${currentSettings.soundEnabled !== false ? 'bg-purple-600' : 'bg-gray-600'}`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full transition-transform ${currentSettings.soundEnabled !== false ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
            {currentSettings.soundEnabled !== false && (
              <div>
                <label htmlFor="volume" className="block text-sm text-gray-400 mb-1">
                  Volume
                </label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  value={currentSettings.soundVolume ?? 80}
                  onChange={(e) =>
                    onSettingsChange({ ...currentSettings, soundVolume: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Animation Settings */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Animations</label>
          <div className="space-y-3 bg-gray-900/50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Enable Animations</span>
              <button
                role="switch"
                aria-checked={currentSettings.animationsEnabled !== false}
                onClick={() =>
                  onSettingsChange({
                    ...currentSettings,
                    animationsEnabled: !currentSettings.animationsEnabled,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${currentSettings.animationsEnabled !== false ? 'bg-purple-600' : 'bg-gray-600'}`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full transition-transform ${currentSettings.animationsEnabled !== false ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Reduced Motion</span>
              <button
                role="switch"
                aria-checked={currentSettings.reducedMotion === true}
                onClick={() =>
                  onSettingsChange({
                    ...currentSettings,
                    reducedMotion: !currentSettings.reducedMotion,
                  })
                }
                className={`w-12 h-6 rounded-full transition-colors ${currentSettings.reducedMotion ? 'bg-purple-600' : 'bg-gray-600'}`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full transition-transform ${currentSettings.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Player Names */}
        <div>
          <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Player Names</label>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="playerX"
                className={`block text-sm font-bold ${theme.playerXColor} mb-1`}
              >
                Player 1 (X)
              </label>
              <input
                id="playerX"
                type="text"
                value={playerNames[Player.X]}
                onChange={(e) =>
                  setPlayerNames((prev) => ({ ...prev, [Player.X]: e.target.value }))
                }
                placeholder="Player 1"
                maxLength={20}
                className="w-full p-3 text-lg bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white"
              />
            </div>
            <div>
              <label
                htmlFor="playerO"
                className={`block text-sm font-bold ${theme.playerOColor} mb-1`}
              >
                Player 2 (O) / Default
              </label>
              <input
                id="playerO"
                type="text"
                value={playerNames[Player.O]}
                onChange={(e) =>
                  setPlayerNames((prev) => ({ ...prev, [Player.O]: e.target.value }))
                }
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

      <AISettingsModal isOpen={showAISettings} onClose={() => setShowAISettings(false)} />
    </div>
  );
};
