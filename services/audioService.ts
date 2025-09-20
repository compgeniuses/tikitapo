let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

const playSound = (type: 'sine' | 'square' | 'sawtooth' | 'triangle', frequency: number, duration: number, volume: number = 0.3) => {
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
  } catch (error) {
    console.error("Could not play sound:", error);
  }
};

export const playMoveSound = () => {
  playSound('sine', 440, 0.1, 0.2);
  playSound('sine', 880, 0.1, 0.1);
};

export const playWinSound = () => {
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((note, i) => {
        setTimeout(() => playSound('triangle', note, 0.2), i * 100);
    });
};

export const playDrawSound = () => {
    playSound('sawtooth', 220, 0.2);
    setTimeout(() => playSound('sawtooth', 196, 0.2), 200);
};

export const playUISound = () => {
    playSound('square', 800, 0.05, 0.1);
};

export const playAchievementSound = () => {
    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((note, i) => {
        setTimeout(() => playSound('triangle', note, 0.25, 0.4), i * 80);
    });
};