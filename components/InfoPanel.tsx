import React from 'react';
import type { Level, PlayerNames, MatchScore, PlayerAvatars } from '../types';
import { Player, Difficulty } from '../types';
import { IconX, IconO, IconPause, IconSuggest, IconStop } from './icons/PieceIcons';
import type { Theme } from '../themes';

interface InfoPanelProps {
  level: Level;
  currentPlayer: Player;
  playerNames: PlayerNames;
  playerAvatars?: PlayerAvatars;
  matchScore: MatchScore;
  onPause: () => void;
  onStop: () => void;
  onSuggestMove: () => void;
  isPaused: boolean;
  isGameOver: boolean;
  isTieBreaker?: boolean;
  theme: Theme;
  isOnline: boolean;
}

const ControlButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
  theme: Theme;
}> = ({ onClick, disabled, label, children, theme }) => (
  <div className="group relative">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-3 rounded-full transition-all duration-200 ease-in-out transform
        ${disabled
          ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
          : `bg-gray-700 hover:bg-gray-600 text-gray-200 hover:scale-110 hover:${theme.accent1}`
        }`}
      aria-label={label}
    >
      {children}
    </button>
    <span
      className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md
                 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    >
      {label}
    </span>
  </div>
);

const Avatar: React.FC<{ src?: string }> = ({ src }) => {
  if (!src) {
    return <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>;
  }
  return <img src={src} alt="Player Avatar" className="w-10 h-10 rounded-full bg-gray-700 object-cover flex-shrink-0" />;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ level, currentPlayer, playerNames, playerAvatars, matchScore, onPause, onStop, onSuggestMove, isPaused, isGameOver, isTieBreaker, theme, isOnline }) => {
  return (
    <div className={`
      bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-cyan-500/20
      p-3 lg:p-4
      flex flex-row lg:flex-col items-center justify-between lg:justify-start lg:items-stretch gap-4
      w-full lg:max-w-xs
    `}>
      {/* Game Info Section */}
      <div className="flex flex-col lg:text-center">
        <h2 className={`text-xl lg:text-3xl font-orbitron font-black bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
          {isOnline ? 'ONLINE MATCH' : `LEVEL ${level.level}`}
        </h2>
        {!isOnline && <p className="text-sm font-bold text-gray-300">{level.difficulty}</p>}
        <p className="text-xs lg:text-base text-gray-400">Connect {level.winCondition}</p>
        {!isOnline && level.difficulty === Difficulty.Simple && (
            <p className="text-xs text-gray-500 lg:text-sm">(Horiz/Vert Only)</p>
        )}
      </div>

      <div className="hidden lg:block h-px bg-cyan-500/20 my-2"></div>
      
      {/* Score Section */}
     {!isOnline && (
        <div className="text-center">
            <p className={`text-xs uppercase font-bold tracking-wider leading-tight transition-colors duration-300 ${isTieBreaker ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}>
                {isTieBreaker ? 'Final Round' : 'Score'}
            </p>
            <div className="font-bold text-sm lg:text-lg truncate leading-tight flex items-center justify-center gap-2">
                <span className={theme.playerXColor}>{playerNames[Player.X]}: {matchScore[Player.X]}</span>
                <span>-</span>
                <span className={theme.playerOColor}>{matchScore[Player.O]}: {playerNames[Player.O]}</span>
            </div>
        </div>
      )}
      {!isOnline && <div className="hidden lg:block h-px bg-cyan-500/20 my-2"></div>}


      {/* Current Turn Section */}
      {isOnline && playerAvatars ? (
        <div className="flex flex-col gap-2">
            <div className={`p-2 rounded-md transition-all duration-300 ${currentPlayer === Player.X ? 'bg-gray-600 ring-2 ring-cyan-400' : 'bg-gray-900/50'}`}>
                <div className="flex items-center gap-3">
                    <Avatar src={playerAvatars[Player.X]} />
                    <div className="overflow-hidden">
                        <p className={`font-bold truncate ${theme.playerXColor}`}>{playerNames[Player.X]}</p>
                        <p className="text-xs text-gray-400">Playing as X</p>
                    </div>
                </div>
            </div>
            <div className={`p-2 rounded-md transition-all duration-300 ${currentPlayer === Player.O ? 'bg-gray-600 ring-2 ring-yellow-400' : 'bg-gray-900/50'}`}>
                <div className="flex items-center gap-3">
                    <Avatar src={playerAvatars[Player.O]} />
                    <div className="overflow-hidden">
                        <p className={`font-bold truncate ${theme.playerOColor}`}>{playerNames[Player.O]}</p>
                        <p className="text-xs text-gray-400">Playing as O</p>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="bg-gray-900/50 p-2 lg:p-4 rounded-md flex items-center justify-center gap-2 lg:gap-3">
            <div className="w-6 h-6 lg:w-8 lg:h-8">
                {currentPlayer === Player.X ? <IconX className={theme.playerXColor} /> : <IconO className={theme.playerOColor} />}
            </div>
            <div className="text-left">
                <p className="text-xs text-gray-400 leading-tight">TURN</p>
                <span className={`font-bold text-sm lg:text-lg truncate leading-tight ${currentPlayer === Player.X ? theme.playerXColor : theme.playerOColor}`}>
                    {playerNames[currentPlayer] || '...'}
                </span>
            </div>
        </div>
      )}
      
      {/* Controls Section */}
      <div className="flex items-center lg:flex-col gap-2 lg:gap-3 mt-auto lg:mt-4">
         <div className="flex lg:w-full items-center justify-center gap-2 lg:gap-3">
            <ControlButton onClick={onPause} disabled={isPaused || isGameOver || isOnline} label={isOnline ? "Pause unavailable online" : "Pause Game"} theme={theme}>
                <IconPause className="w-5 h-5 lg:w-6 lg:h-6" />
            </ControlButton>
            <ControlButton onClick={onSuggestMove} disabled={isPaused || isGameOver || currentPlayer !== Player.X || isOnline} label={isOnline ? "Suggestion unavailable online" : "Suggest Move"} theme={theme}>
                <IconSuggest className="w-5 h-5 lg:w-6 lg:h-6" />
            </ControlButton>
            <ControlButton onClick={onStop} disabled={false} label="Stop Game" theme={theme}>
                <IconStop className="w-5 h-5 lg:w-6 lg:h-6" />
            </ControlButton>
        </div>
      </div>
    </div>
  );
};