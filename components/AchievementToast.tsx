import React, { useEffect } from 'react';
import type { Achievement } from '../types';
import type { Theme } from '../themes';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  theme: Theme;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss, theme }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      key={achievement.id} // Re-trigger animation on new achievement
      className="fixed bottom-5 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-lg shadow-2xl z-50 flex items-center gap-4 bg-gray-800 border-2 border-yellow-400 animate-slide-in-up"
    >
      <style>{`
        @keyframes slide-in-up {
          0% { transform: translate(-50%, 100px); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) forwards;
        }
      `}</style>
      <div className="text-4xl">🏆</div>
      <div>
        <p className="text-xs text-yellow-300 font-bold">ACHIEVEMENT UNLOCKED</p>
        <h3 className="font-bold text-lg text-white">{achievement.title}</h3>
        <p className="text-sm text-gray-300">{achievement.description}</p>
      </div>
      <button onClick={onDismiss} className="absolute top-2 right-2 text-gray-500 hover:text-white">
        &times;
      </button>
    </div>
  );
};