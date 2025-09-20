import React from 'react';
import type { Level, PlayerNames, MatchScore } from '../types';
import { Player, Difficulty } from '../types';
import { IconX, IconO, IconPause, IconSuggest, IconStop } from './icons/PieceIcons';
import type { Theme } from '../themes';

interface InfoPanelProps {
  level: Level;
  currentPlayer: Player;
  playerNames: PlayerNames;
  matchScore: MatchScore;
  onPause: () => void;
  onStop: () => void;
  onSuggestMove: () => void;
  isPaused: boolean;
  isGameOver: boolean;
  isTieBreaker?: boolean;
  theme: Theme;
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

export const InfoPanel: React.FC<InfoPanelProps> = ({ level, currentPlayer, playerNames, matchScore, onPause, onStop, onSuggestMove, isPaused, isGameOver, isTieBreaker, theme }) => {
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
          LEVEL {level.level}
        </h2>
        <p className="text-sm font-bold text-gray-300">{level.difficulty}</p>
        <p className="text-xs lg:text-base text-gray-400">Connect {level.winCondition}</p>
        {level.difficulty === Difficulty.Simple && (
            <p className="text-xs text-gray-500 lg:text-sm">(Horiz/Vert Only)</p>
        )}
      </div>

      <div className="hidden lg:block h-px bg-cyan-500/20 my-2"></div>
      
      {/* Score Section */}
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

      <div className="hidden lg:block h-px bg-cyan-500/20 my-2"></div>

      {/* Current Turn Section */}
      <div className="bg-gray-900/50 p-2 lg:p-4 rounded-md flex items-center justify-center gap-2 lg:gap-3">
        <div className="w-6 h-6 lg:w-8 lg:h-8">
            {currentPlayer === Player.X ? <IconX className={theme.playerXColor} /> : <IconO className={theme.playerOColor} />}
        </div>
        <div className="text-left">
            <p className="text-xs text-gray-400 leading-tight">TURN</p>
            <span className={`font-bold text-sm lg:text-lg truncate leading-tight ${currentPlayer === Player.X ? theme.playerXColor : theme.playerOColor}`}>
                {playerNames[currentPlayer]}
            </span>
        </div>
      </div>
      
      {/* Controls Section */}
      <div className="flex items-center lg:flex-col gap-2 lg:gap-3 mt-auto lg:mt-4">
         <div className="flex lg:w-full items-center justify-center gap-2 lg:gap-3">
            <ControlButton onClick={onPause} disabled={isPaused || isGameOver} label="Pause Game" theme={theme}>
                <IconPause className="w-5 h-5 lg:w-6 lg:h-6" />
            </ControlButton>
            <ControlButton onClick={onSuggestMove} disabled={isPaused || isGameOver || currentPlayer !== Player.X} label="Suggest Move" theme={theme}>
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