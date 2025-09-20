import { Progress, Difficulty, Level } from '../types';
import { LEVELS_BY_DIFFICULTY, DIFFICULTIES_ORDER } from '../constants';

const PROGRESS_KEY = 'connect-n-progress-v2';

const defaultProgress: Progress = {
    [Difficulty.Simple]: 1,
    [Difficulty.Hard]: 1,
    [Difficulty.Pro]: 1,
};

export const getProgress = (): Progress => {
    const savedProgress = localStorage.getItem(PROGRESS_KEY);
    if (savedProgress) {
        try {
            const parsed = JSON.parse(savedProgress);
            return { ...defaultProgress, ...parsed };
        } catch (e) {
            console.error("Failed to parse progress, returning default.", e);
            return { ...defaultProgress };
        }
    }
    return { ...defaultProgress };
};

const saveProgress = (progress: Progress) => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const completeLevel = (difficulty: Difficulty, completedLevelNumber: number): Progress => {
    const progress = getProgress();
    const levelsInDifficulty = LEVELS_BY_DIFFICULTY[difficulty];
    const isLastLevel = completedLevelNumber === levelsInDifficulty.length;

    if (isLastLevel) {
        // Completed the final level of the difficulty, so try to unlock the next one.
        const currentDifficultyIndex = DIFFICULTIES_ORDER.indexOf(difficulty);
        const isNotFinalDifficulty = currentDifficultyIndex < DIFFICULTIES_ORDER.length - 1;

        if (isNotFinalDifficulty) {
            const nextDifficulty = DIFFICULTIES_ORDER[currentDifficultyIndex + 1];
            // Unlock level 1 of the next difficulty if it's not already unlocked.
            if (progress[nextDifficulty] < 1) {
                progress[nextDifficulty] = 1;
            }
        }
    } else {
        // Not the last level, just unlock the next level in the current difficulty.
        const nextLevelInDifficulty = completedLevelNumber + 1;
        if (nextLevelInDifficulty > progress[difficulty]) {
            progress[difficulty] = nextLevelInDifficulty;
        }
    }

    saveProgress(progress);
    return progress;
};

export const getNextLevel = (difficulty: Difficulty, completedLevelNumber: number): Level | null => {
    const levelsForCurrentDifficulty = LEVELS_BY_DIFFICULTY[difficulty];
    const currentLevelIndex = levelsForCurrentDifficulty.findIndex(l => l.level === completedLevelNumber);

    // Try to find the next level in the current difficulty
    if (currentLevelIndex !== -1 && currentLevelIndex + 1 < levelsForCurrentDifficulty.length) {
        return levelsForCurrentDifficulty[currentLevelIndex + 1];
    }
    
    // If it was the last level, try to find the first level of the next difficulty
    const currentDifficultyIndex = DIFFICULTIES_ORDER.indexOf(difficulty);
    if (currentDifficultyIndex < DIFFICULTIES_ORDER.length - 1) {
        const nextDifficulty = DIFFICULTIES_ORDER[currentDifficultyIndex + 1];
        return LEVELS_BY_DIFFICULTY[nextDifficulty][0];
    }

    return null; // No more levels
}

export const resetProgress = (): Progress => {
    const newProgress = { ...defaultProgress };
    saveProgress(newProgress);
    return newProgress;
};