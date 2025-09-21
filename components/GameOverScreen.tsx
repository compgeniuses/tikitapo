import React from 'react';
import { Player } from '../types';
import type { Level, PlayerNames, MatchScore } from '../types';
import { Fireworks } from './Fireworks';
import { WINS_PER_LEVEL_MATCH } from '../constants';

interface GameOverScreenProps {
  winner: Player | 'draw' | null;
  playerNames: PlayerNames;
  onRestart: (level: Level, resetScore: boolean) => void;
  onMenu: () => void;
  generatedImage: string | null;
  imageLoading: boolean;
  imageError: string | null;
  nextLevel: Level | null;
  matchScore: MatchScore;
  matchWinner: Player | null;
  currentLevel: Level;
  roundNumber: number;
  isDifficultyTransition: boolean;
  isOnline?: boolean;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  winner, playerNames, onRestart, onMenu, generatedImage, imageLoading, imageError, nextLevel, matchScore, matchWinner, currentLevel, roundNumber, isDifficultyTransition, isOnline = false
}) => {
  const isHumanWinner = winner === Player.X;

  const getOnlineHeading = () => {
    if (winner === 'draw') return 'DRAW!';
    return `${playerNames[winner as Player].toUpperCase()} WINS!`;
  }

  const heading = isOnline 
    ? getOnlineHeading()
    : matchWinner 
      ? (isDifficultyTransition ? `${currentLevel.difficulty.toUpperCase()} COMPLETE!` : 'MATCH OVER')
      : `ROUND ${roundNumber} OVER`;
  
  const roundMessage = winner === 'draw' 
    ? `ROUND ${roundNumber} DRAW!` 
    : `${playerNames[winner as Player].toUpperCase()} WINS ROUND ${roundNumber}!`;
  
  const finalMessage = matchWinner 
    ? (isDifficultyTransition 
        ? `You've unlocked ${nextLevel?.difficulty.toUpperCase()} difficulty!`
        : `${playerNames[matchWinner].toUpperCase()} WINS THE MATCH!`)
    : '';

  const renderActionButton = () => {
    if (isOnline) return null; // Server will handle next steps
    
    if (matchWinner) {
      if (matchWinner === Player.X && nextLevel) {
        if (isDifficultyTransition) {
          return (
            <button onClick={() => onRestart(nextLevel, true)} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-md text-xl font-bold transition-transform transform hover:scale-105 animate-pulse">
              PROCEED TO {nextLevel.difficulty.toUpperCase()}
            </button>
          )
        }
        return (
          <button onClick={() => onRestart(nextLevel, true)} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md text-xl font-bold transition-transform transform hover:scale-105 animate-pulse">
            NEXT LEVEL
          </button>
        );
      }
      const buttonText = matchWinner === Player.O ? 'TRY AGAIN' : 'PLAY AGAIN';
      return (
        <button onClick={() => onRestart(currentLevel, true)} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md text-xl font-bold transition-transform transform hover:scale-105">
          {buttonText}
        </button>
      );
    } else {
      return (
        <button onClick={() => onRestart(currentLevel, false)} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-xl font-bold transition-transform transform hover:scale-105">
          NEXT ROUND
        </button>
      );
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-20 p-4 text-center">
      {isHumanWinner && !matchWinner && <Fireworks />}
      {matchWinner === Player.X && <Fireworks />}
      
      <h2 className={`text-5xl font-orbitron font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r ${isDifficultyTransition ? 'from-purple-400 to-pink-500' : 'from-yellow-400 to-orange-500'}`}>
        {heading}
      </h2>

      {!isOnline && <p className="text-2xl font-bold mb-2">{matchWinner ? finalMessage : roundMessage}</p>}

      {!isOnline && (
        <div className="bg-gray-900/50 p-2 rounded-md mb-4">
            <p className="text-sm text-gray-400">SCORE (First to {WINS_PER_LEVEL_MATCH})</p>
            <p className="text-xl font-bold font-mono">
                <span className="text-cyan-400">{playerNames[Player.X]}: {matchScore[Player.X]}</span>
                <span className="mx-2">-</span>
                <span className="text-yellow-400">{matchScore[Player.O]}: {playerNames[Player.O]}</span>
            </p>
        </div>
      )}
      
      {generatedImage && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-cyan-300 mb-2">Your Victory Reward!</h3>
          <img src={generatedImage} alt="AI Generated Victory" className="rounded-lg shadow-lg w-48 h-48 sm:w-64 sm:h-64 object-cover border-2 border-yellow-400" />
        </div>
      )}

      {imageLoading && (
        <div className="flex flex-col items-center justify-center mb-4">
           <div className="w-12 h-12 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
           <p className="mt-2 text-cyan-300">Generating your reward...</p>
        </div>
      )}

      {imageError && (
         <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md">
            <p className="text-red-300">{imageError}</p>
         </div>
      )}

      <div className="flex gap-4">
        {renderActionButton()}
        <button onClick={onMenu} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-md text-xl font-bold transition-transform transform hover:scale-105">
          {isOnline ? 'BACK TO LOBBY' : 'MENU'}
        </button>
      </div>
    </div>
  );
};