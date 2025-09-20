
import React from 'react';
import { Profile } from '../types';

interface ProfileSelectScreenProps {
  onSelect: (profile: Profile) => void;
  onBack: () => void;
}

export const ProfileSelectScreen: React.FC<ProfileSelectScreenProps> = ({ onSelect, onBack }) => {
  return (
    <div className="w-full max-w-lg bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20 text-center">
      <h2 className="text-3xl font-orbitron font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
        Choose Your Profile
      </h2>
      <p className="text-gray-300 mb-8">This will influence the theme of your AI-generated victory image.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => onSelect(Profile.Man)} 
          className="p-6 bg-gray-700 hover:bg-cyan-800 rounded-lg font-bold transition-all transform hover:scale-105 border-2 border-transparent hover:border-cyan-400"
        >
          <div className="text-4xl mb-2">🧔</div>
          <div className="text-xl">Man</div>
        </button>
        <button 
          onClick={() => onSelect(Profile.Woman)} 
          className="p-6 bg-gray-700 hover:bg-purple-800 rounded-lg font-bold transition-all transform hover:scale-105 border-2 border-transparent hover:border-purple-400"
        >
          <div className="text-4xl mb-2">👩</div>
          <div className="text-xl">Woman</div>
        </button>
        <button 
          onClick={() => onSelect(Profile.Child)} 
          className="p-6 bg-gray-700 hover:bg-yellow-800 rounded-lg font-bold transition-all transform hover:scale-105 border-2 border-transparent hover:border-yellow-400"
        >
          <div className="text-4xl mb-2">🧒</div>
          <div className="text-xl">Child</div>
        </button>
      </div>

      <button onClick={onBack} className="mt-8 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-md font-bold transition-transform transform hover:scale-105">
        Back to Menu
      </button>
    </div>
  );
};
