
import React from 'react';
import type { Theme } from '../themes';

interface AIPersonalityProps {
  message: string | null;
  isLoading: boolean;
  theme: Theme;
}

export const AIPersonality: React.FC<AIPersonalityProps> = ({ message, isLoading, theme }) => {
  // Don't render anything if there's nothing to show, preventing an empty box from appearing
  if (!isLoading && !message) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg shadow-lg border border-cyan-500/20 min-h-[5rem] flex items-center justify-center transition-opacity duration-500">
      {isLoading && (
        <div className="flex flex-col items-center justify-center text-center">
            <div className="flex space-x-1">
              <span className={`w-2 h-2 ${theme.accent1Bg} rounded-full animate-bounce [animation-delay:-0.3s]`}></span>
              <span className={`w-2 h-2 ${theme.accent1Bg} rounded-full animate-bounce [animation-delay:-0.15s]`}></span>
              <span className={`w-2 h-2 ${theme.accent1Bg} rounded-full animate-bounce`}></span>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">AI is crafting a response...</p>
        </div>
      )}
      {message && !isLoading && (
        <p className="text-center italic text-gray-300">"{message}"</p>
      )}
    </div>
  );
};
