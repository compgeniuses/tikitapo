import { useState, useCallback, useRef, useMemo } from 'react';
import {
  GameState,
  GameMode,
  Difficulty,
  Player,
  Board,
  CellState,
  PlayerNames,
  Progress,
  Settings,
  MatchScore,
  Level,
  Move,
  PlayerAvatars,
} from '../types';
import { LEVELS_BY_DIFFICULTY, WINS_PER_LEVEL_MATCH, ALL_ACHIEVEMENTS } from '../constants';
import * as gameService from '../services/gameService';
import * as audioService from '../services/audioService';
import * as geminiService from '../services/geminiService';
import * as unifiedAIService from '../services/unifiedAIService';
import * as statsService from '../services/statsService';
import * as progressService from '../services/progressService';
import * as achievementsService from '../services/achievementsService';
import { THEMES } from '../themes';
import type { Theme } from '../themes';

interface UseGameLogicProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export const useGameLogic = ({ settings, onSettingsChange }: UseGameLogicProps) => {
  // Game state
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [gameMode, setGameMode] = useState<GameMode>(settings.lastPlayedMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.lastPlayedDifficulty);
  const [level, setLevel] = useState<Level>(LEVELS_BY_DIFFICULTY[settings.lastPlayedDifficulty][0]);
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.X);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<Move[]>([]);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [theme, setTheme] = useState<Theme>(
    THEMES.find((t) => t.name === settings.themeName) || THEMES[0]
  );

  // Match state
  const [playerNamesForGame, setPlayerNamesForGame] = useState<PlayerNames>(settings.playerNames);
  const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars>({});
  const [matchScore, setMatchScore] = useState<MatchScore>({ [Player.X]: 0, [Player.O]: 0 });
  const [matchWinner, setMatchWinner] = useState<Player | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundStarter, setRoundStarter] = useState<Player>(Player.X);
  const [isDifficultyTransition, setIsDifficultyTransition] = useState(false);

  // AI state
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiThinkingComment, setIsAiThinkingComment] = useState(false);
  const [isAiThinkingMove, setIsAiThinkingMove] = useState(false);

  // Victory image state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [nextLevel, setNextLevel] = useState<Level | null>(null);

  // Progress
  const [progress, setProgress] = useState<Progress>(progressService.getProgress());

  // Achievements
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);

  const moveInProgressRef = useRef(false);

  // Theme background
  const currentBackground = useMemo(() => {
    if (!theme.backgrounds || theme.backgrounds.length === 0) {
      return '';
    }
    const index = (level.level - 1) % theme.backgrounds.length;
    return theme.backgrounds[index];
  }, [theme, level]);

  // Achievement unlocker
  const unlockAchievement = useCallback((id: string) => {
    if (achievementsService.unlockAchievement(id)) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        setNewlyUnlockedAchievement(achievement);
        audioService.playAchievementSound();
      }
    }
  }, []);

  // Handle game over
  const handleGameOver = useCallback(
    async (
      gameWinner: Player | 'draw',
      line: Move[] = [],
      profile?: string,
      currentMatchScore?: MatchScore
    ) => {
      setWinner(gameWinner);
      setWinningLine(line);
      setGameState(GameState.GameOver);

      setIsAiThinkingMove(false);
      setAiMessage(null);

      if (gameWinner === 'draw') {
        setRoundStarter((prev) => (prev === Player.X ? Player.O : Player.X));
        audioService.playDrawSound();
      } else {
        setRoundStarter(gameWinner === Player.X ? Player.O : Player.X);
        audioService.playWinSound();
      }

      const isTieBreaker =
        currentMatchScore &&
        currentMatchScore[Player.X] === WINS_PER_LEVEL_MATCH - 1 &&
        currentMatchScore[Player.O] === WINS_PER_LEVEL_MATCH - 1;

      const newScore = { ...(currentMatchScore || matchScore) };
      if (gameWinner !== 'draw') {
        newScore[gameWinner]++;
      }
      setMatchScore(newScore);

      const p1Score = newScore[Player.X];
      const p2Score = newScore[Player.O];
      let currentMatchWinner: Player | null = null;

      if (p1Score >= WINS_PER_LEVEL_MATCH) currentMatchWinner = Player.X;
      else if (p2Score >= WINS_PER_LEVEL_MATCH) currentMatchWinner = Player.O;

      setMatchWinner(currentMatchWinner);

      if (gameWinner === Player.X) {
        unlockAchievement('first_win');
        if (level.winCondition >= 6) unlockAchievement('connect_6');
        if (level.obstacles >= 5) unlockAchievement('obstacle_course');
      }

      if (currentMatchWinner) {
        if (gameMode === GameMode.TwoPlayer) unlockAchievement('socialite');
        if (currentMatchWinner === Player.X) {
          if (gameMode === GameMode.AI) unlockAchievement('ai_slayer');
          if (newScore[Player.O] === 0) unlockAchievement('flawless_victory');
          if (isTieBreaker) unlockAchievement('clutch_performer');
        }
      }

      if (currentMatchWinner && gameMode !== GameMode.TwoPlayer) {
        const newStats = statsService.updateStats(gameMode, difficulty, currentMatchWinner);
        // Return stats for parent to handle
      }

      if (currentMatchWinner === Player.X && gameMode !== GameMode.TwoPlayer) {
        const newProgress = progressService.completeLevel(difficulty, level.level);
        setProgress(newProgress);

        const nextLevelData = progressService.getNextLevel(difficulty, level.level);
        if (nextLevelData) {
          setNextLevel(nextLevelData);
          if (nextLevelData.difficulty !== level.difficulty) {
            setIsDifficultyTransition(true);
            if (difficulty === Difficulty.Simple) unlockAchievement('simple_complete');
            if (difficulty === Difficulty.Hard) unlockAchievement('hard_complete');
          }
        } else {
          if (difficulty === Difficulty.Pro) {
            unlockAchievement('pro_complete');
          }
        }
      }

      return { newScore, currentMatchWinner };
    },
    [matchScore, level, gameMode, difficulty, unlockAchievement]
  );

  const startNewGame = useCallback(
    (levelOverride?: Level, resetScore: boolean = false) => {
      const gameLevel = levelOverride || level;
      setLevel(gameLevel);

      if (resetScore) {
        setMatchScore({ [Player.X]: 0, [Player.O]: 0 });
        setRoundNumber(1);
      } else {
        setRoundNumber((prev) => prev + 1);
      }

      onSettingsChange({
        ...settings,
        lastPlayedMode: gameMode,
        lastPlayedDifficulty: gameLevel.difficulty,
      });

      const newBoard = gameService.createBoard(gameLevel.boardSize, gameLevel.obstacles);
      const newStarter = resetScore ? Player.X : roundStarter;

      setBoard(newBoard);
      setCurrentPlayer(newStarter);
      setWinner(null);
      setWinningLine([]);
      setGameState(GameState.LevelStart);
      setGeneratedImage(null);
      setImageError(null);
      setImageLoading(false);
      setNextLevel(null);
      setMatchWinner(null);
      setAiMessage(null);
      setIsAiThinkingComment(false);
      setIsAiThinkingMove(false);
      setIsDifficultyTransition(false);
      setPlayerAvatars({});

      const computerStarts =
        newStarter === Player.O && gameMode !== GameMode.TwoPlayer && gameMode !== GameMode.Online;
      setIsComputerTurn(computerStarts);

      if (resetScore) {
        setRoundStarter(Player.X);
      }
    },
    [level, settings, gameMode, onSettingsChange, roundStarter]
  );

  return {
    gameState,
    setGameState,
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    level,
    setLevel,
    board,
    setBoard,
    currentPlayer,
    setCurrentPlayer,
    winner,
    setWinner,
    winningLine,
    setWinningLine,
    isComputerTurn,
    setIsComputerTurn,
    theme,
    setTheme,
    playerNamesForGame,
    setPlayerNamesForGame,
    playerAvatars,
    setPlayerAvatars,
    matchScore,
    setMatchScore,
    matchWinner,
    setMatchWinner,
    roundNumber,
    setRoundNumber,
    roundStarter,
    setRoundStarter,
    isDifficultyTransition,
    setIsDifficultyTransition,
    aiMessage,
    setAiMessage,
    isAiThinkingComment,
    setIsAiThinkingComment,
    isAiThinkingMove,
    setIsAiThinkingMove,
    generatedImage,
    setGeneratedImage,
    imageLoading,
    setImageLoading,
    imageError,
    setImageError,
    nextLevel,
    setNextLevel,
    progress,
    setProgress,
    newlyUnlockedAchievement,
    setNewlyUnlockedAchievement,
    currentBackground,
    moveInProgressRef,
    unlockAchievement,
    handleGameOver,
    startNewGame,
  };
};
