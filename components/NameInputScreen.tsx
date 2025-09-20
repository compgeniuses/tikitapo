import React, { useState } from 'react';
import { GameMode, Player } from '../types';
import type { PlayerNames } from '../types';
import type { Theme } from '../themes';

interface NameInputScreenProps {
  gameMode: GameMode;
  onStart: (names: PlayerNames) => void;
  onBack: () => void;
  theme: Theme;
}

export const NameInputScreen: React.FC<NameInputScreenProps> = ({ gameMode, onStart, onBack, theme }) => {
  const [nameX, setNameX] = useState('');
  const [nameO, setNameO] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const playerXName = nameX.trim() || 'Player 1';
    let playerOName: string;

    if (gameMode === GameMode.TwoPlayer) {
      playerOName = nameO.trim() || 'Player 2';
    } else if (gameMode === GameMode.AI) {
      playerOName = 'Gemini AI';
    } else {
      playerOName = 'CPU';
    }
    
    onStart({
      [Player.X]: playerXName,
      [Player.O]: playerOName,
    });
  };

  return (
    <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20 text-center">
      <h2 className={`text-3xl font-orbitron font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
        Enter Player Names
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playerX" className={`block text-lg font-bold ${theme.accent1} mb-2`}>
            Player 1 (X)
          </label>
          <input
            id="playerX"
            type="text"
            value={nameX}
            onChange={(e) => setNameX(e.target.value)}
            placeholder="Player 1"
            maxLength={20}
            className="w-full p-3 text-lg text-center bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white"
          />
        </div>
        
        {gameMode === GameMode.TwoPlayer && (
          <div>
            <label htmlFor="playerO" className={`block text-lg font-bold ${theme.accent2} mb-2`}>
              Player 2 (O)
            </label>
            <input
              id="playerO"
              type="text"
              value={nameO}
              onChange={(e) => setNameO(e.target.value)}
              placeholder="Player 2"
              maxLength={20}
              className="w-full p-3 text-lg text-center bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
            />
          </div>
        )}
        
        <div className="pt-4 flex justify-center gap-4">
          <button type="button" onClick={onBack} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-md font-bold transition-transform transform hover:scale-105">
            Back
          </button>
          <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md font-bold transition-transform transform hover:scale-105">
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};