import React, { useEffect, useState, useCallback } from 'react';
import { THEMES } from '../themes';
import type { Theme } from '../themes';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  themeName: string;
  minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onLoadingComplete, 
  themeName,
  minDuration = 3000 
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  
  const theme = THEMES.find(t => t.name === themeName) || THEMES[0];

  const completeLoading = useCallback(() => {
    setIsComplete(true);
    setTimeout(() => {
      onLoadingComplete();
    }, 300);
  }, [onLoadingComplete]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = minDuration;
    
    // Allow skipping after 1 second
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 1000);
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        completeLoading();
      }
    };
    
    requestAnimationFrame(updateProgress);
    
    return () => {
      clearTimeout(skipTimer);
    };
  }, [minDuration, completeLoading]);

  // Handle skip on click or key press
  useEffect(() => {
    const handleSkip = () => {
      if (canSkip && !isComplete) {
        completeLoading();
      }
    };

    window.addEventListener('click', handleSkip);
    window.addEventListener('keydown', handleSkip);
    
    return () => {
      window.removeEventListener('click', handleSkip);
      window.removeEventListener('keydown', handleSkip);
    };
  }, [canSkip, isComplete, completeLoading]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className={`absolute inset-0 ${theme.backgrounds[0]} transition-opacity duration-1000`} />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${theme.accent1.includes('cyan') ? '#06b6d4' : theme.accent1.includes('yellow') ? '#fbbf24' : '#2dd4bf'}, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8">
          {/* Glow Effect */}
          <div className={`absolute inset-0 blur-3xl opacity-50 bg-gradient-to-r ${theme.titleGradient} rounded-full scale-150 animate-pulse`} />
          
          {/* Logo */}
          <div className="relative">
            {/* Game Piece Visual */}
            <div className="flex items-center justify-center mb-4">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl animate-bounce`}
                style={{
                  background: `linear-gradient(135deg, ${theme.playerXColor.includes('cyan') ? '#06b6d4' : theme.playerXColor.includes('lime') ? '#84cc16' : '#ffffff'}, ${theme.playerOColor.includes('yellow') ? '#fbbf24' : theme.playerOColor.includes('red') ? '#ef4444' : '#fb923c'})`,
                  boxShadow: `0 0 40px ${theme.accent1.includes('cyan') ? 'rgba(6,182,212,0.5)' : theme.accent1.includes('yellow') ? 'rgba(251,191,36,0.5)' : 'rgba(45,212,191,0.5)'}`,
                }}
              >
                <span className="text-white drop-shadow-lg">T</span>
              </div>
            </div>
            
            {/* Brand Name */}
            <h1 
              className={`text-6xl md:text-8xl font-black text-center bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent tracking-tighter animate-pulse`}
              style={{
                textShadow: `0 0 60px ${theme.accent1.includes('cyan') ? 'rgba(6,182,212,0.3)' : theme.accent1.includes('yellow') ? 'rgba(251,191,36,0.3)' : 'rgba(45,212,191,0.3)'}`,
              }}
            >
              tikitapo
            </h1>
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-12 text-center">
          <p className={`text-xl md:text-2xl font-light ${theme.accent1} opacity-90 tracking-widest uppercase`}>
            Connect. Compete. Conquer.
          </p>
        </div>

        {/* Progress Container */}
        <div className="w-80 md:w-96 space-y-4">
          {/* Progress Bar Background */}
          <div className="relative h-2 bg-gray-800/80 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Animated Progress Fill */}
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ease-out bg-gradient-to-r ${theme.titleGradient}`}
              style={{ 
                width: `${progress}%`,
                boxShadow: `0 0 20px ${theme.accent1.includes('cyan') ? 'rgba(6,182,212,0.8)' : theme.accent1.includes('yellow') ? 'rgba(251,191,36,0.8)' : 'rgba(45,212,191,0.8)'}`,
              }}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          {/* Progress Info */}
          <div className="flex justify-between items-center text-sm">
            <span className={`${theme.accent2} font-mono`}>Loading...</span>
            <span className={`${theme.accent1} font-bold font-mono`}>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Developer Credit */}
        <div className={`mt-16 text-center transition-opacity duration-500 ${isComplete ? 'opacity-0' : 'opacity-60'}`}>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-gray-400 text-sm">Developed by</span>
            <span 
              className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              style={{
                textShadow: '0 0 20px rgba(168,85,247,0.5)',
              }}
            >
              Genius.africa
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-1">Innovation • Technology • Excellence</p>
        </div>

        {/* Click to continue hint */}
        <div 
          className={`absolute bottom-8 text-center transition-all duration-500 ${canSkip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p className={`${theme.accent1} text-sm animate-pulse`}>
            {isComplete ? 'Press any key or click to continue' : 'Click or press any key to skip'}
          </p>
        </div>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-white/10 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-white/10 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-white/10 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-white/10 rounded-br-3xl" />
    </div>
  );
};
