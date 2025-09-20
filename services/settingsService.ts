import { Settings, Player, GameMode, Difficulty, PlayerNames } from '../types';
import { THEMES } from '../themes';

const SETTINGS_KEY = 'connect-n-settings-v1';

const defaultSettings: Settings = {
  themeName: THEMES[0].name,
  playerNames: {
    [Player.X]: 'Player 1',
    [Player.O]: 'Player 2',
  },
  lastPlayedMode: GameMode.Offline,
  lastPlayedDifficulty: Difficulty.Simple,
};

export const getSettings = (): Settings => {
  try {
    const settingsJson = localStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      const savedSettings = JSON.parse(settingsJson);
      // Merge with defaults to ensure all properties exist if the structure changes
      return { ...defaultSettings, ...savedSettings };
    }
  } catch (error) {
    console.error("Failed to parse settings from localStorage:", error);
  }
  return JSON.parse(JSON.stringify(defaultSettings));
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
};
