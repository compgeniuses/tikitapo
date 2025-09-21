import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import type { Theme } from '../themes';

interface AvatarCreationScreenProps {
  onBack: () => void;
  onSaveAvatar: (url: string) => void;
  theme: Theme;
}

export const AvatarCreationScreen: React.FC<AvatarCreationScreenProps> = ({ onBack, onSaveAvatar, theme }) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your avatar.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setImageUrl(null);

    try {
      const url = await geminiService.generateAvatar(prompt);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (imageUrl) {
      onSaveAvatar(imageUrl);
    }
  };

  return (
    <div className="w-full max-w-lg bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/20">
      <h1 className={`text-4xl font-orbitron font-black text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
        Create Your Avatar
      </h1>
      <p className="text-center text-gray-300 mb-6">Describe your desired avatar and let AI bring it to life!</p>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., a steampunk cat wearing a monocle"
          className="w-full p-3 text-lg bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none text-white h-24 resize-none"
          disabled={isLoading}
        />

        {error && <p className="text-red-400 text-center">{error}</p>}

        <div className="h-64 w-64 mx-auto bg-gray-900/50 rounded-lg flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
              <p className="mt-2 text-cyan-300">Generating...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Generated Avatar" className="w-full h-full object-cover rounded-lg" />
          ) : (
            <p className="text-gray-500">Your avatar will appear here</p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {imageUrl && !isLoading && (
             <>
                <button onClick={handleGenerate} className={`px-6 py-3 ${theme.accent2Bg} hover:opacity-90 rounded-md font-bold transition-transform transform hover:scale-105`}>
                    Regenerate
                </button>
                <button onClick={handleAccept} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md font-bold transition-transform transform hover:scale-105">
                    Accept & Save
                </button>
             </>
          )}
          {!imageUrl && (
             <button onClick={handleGenerate} disabled={isLoading} className={`w-full py-3 ${theme.accent1Bg} hover:opacity-90 rounded-lg text-lg font-orbitron font-bold transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}>
                {isLoading ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <button onClick={onBack} className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold transition-transform transform hover:scale-105">
          Back to Settings
        </button>
      </div>
    </div>
  );
};