const ACHIEVEMENTS_KEY = 'connect-n-achievements-v1';

export const getUnlockedAchievements = (): string[] => {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get achievements:", error);
    return [];
  }
};

const saveUnlockedAchievements = (unlockedIds: string[]) => {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedIds));
  } catch (error) {
    console.error("Failed to save achievements:", error);
  }
};

export const unlockAchievement = (id: string): boolean => {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    saveUnlockedAchievements(unlocked);
    return true; // It's a new unlock
  }
  return false; // Already unlocked
};

export const resetAchievements = (): void => {
  saveUnlockedAchievements([]);
};