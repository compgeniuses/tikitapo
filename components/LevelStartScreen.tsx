import React from 'react';

interface LevelStartScreenProps {
  levelNumber: number;
  roundNumber: number;
  isTieBreaker?: boolean;
}

export const LevelStartScreen: React.FC<LevelStartScreenProps> = ({ levelNumber, roundNumber, isTieBreaker }) => {
  return (
    <div
      key={`${levelNumber}-${roundNumber}`} // Re-trigger animation on change
      className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center rounded-lg z-30 animate-fade-in-out"
    >
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2.5s ease-in-out forwards;
        }

        @keyframes text-zoom {
          0% { transform: scale(3); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-text-zoom {
          animation: text-zoom 0.8s cubic-bezier(0.250, 0.460, 0.450, 0.940) forwards;
        }
      `}</style>
      
      {isTieBreaker ? (
        <h1 className="text-8xl md:text-9xl font-orbitron font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-400 to-red-600 opacity-0 animate-text-zoom [animation-delay:0.5s]">
          FINAL ROUND
        </h1>
      ) : (
        <>
          {roundNumber === 1 && (
            <h2 className="text-5xl font-orbitron font-black text-gray-400 mb-4 opacity-0 animate-text-zoom [animation-delay:0.2s]">
              LEVEL {levelNumber}
            </h2>
          )}
          <h1 className="text-8xl md:text-9xl font-orbitron font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 opacity-0 animate-text-zoom [animation-delay:0.5s]">
            ROUND {roundNumber}
          </h1>
        </>
      )}
    </div>
  );
};