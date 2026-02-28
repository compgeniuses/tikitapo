import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import {
  Settings,
  Stats,
  Player,
  GameMode,
  Difficulty,
  Level,
  Board,
  Move,
  PlayerNames,
  PlayerAvatars,
  MatchScore,
  Progress,
  Achievement,
  Profile,
  Lobby,
  CellState,
} from '../types';
import { LEVELS_BY_DIFFICULTY, WINS_PER_LEVEL_MATCH, ALL_ACHIEVEMENTS } from '../constants';
import * as settingsService from '../services/settingsService';
import * as statsService from '../services/statsService';
import * as progressService from '../services/progressService';
import * as achievementsService from '../services/achievementsService';
import * as gameService from '../services/gameService';
import * as audioService from '../services/audioService';
import * as aiProviderService from '../services/aiProviderService';
import * as onlineService from '../services/onlineService';
import * as geminiService from '../services/geminiService';
import * as unifiedAIService from '../services/unifiedAIService';
import { THEMES } from '../themes';
import type { Theme } from '../themes';

interface GameStateContextType {
  // Settings
  settings: Settings;
  updateSettings: (settings: Settings) => void;

  // Stats
  stats: Stats;

  // Game State
  gameState: string;
  setGameState: (state: string) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  level: Level;
  setLevel: (level: Level) => void;
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player;
  setCurrentPlayer: (player: Player) => void;
  winner: Player | 'draw' | null;
  setWinner: (winner: Player | 'draw' | null) => void;
  winningLine: Move[];
  setWinningLine: (line: Move[]) => void;
  isComputerTurn: boolean;
  setIsComputerTurn: (turn: boolean) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentBackground: string;

  // Players
  playerNamesForGame: PlayerNames;
  setPlayerNamesForGame: (names: PlayerNames) => void;
  playerAvatars: PlayerAvatars;
  setPlayerAvatars: (avatars: PlayerAvatars) => void;

  // Match
  matchScore: MatchScore;
  setMatchScore: (score: MatchScore) => void;
  matchWinner: Player | null;
  setMatchWinner: (winner: Player | null) => void;
  roundNumber: number;
  setRoundNumber: (num: number) => void;
  roundStarter: Player;
  setRoundStarter: (player: Player) => void;
  isDifficultyTransition: boolean;
  setIsDifficultyTransition: (transition: boolean) => void;

  // AI
  aiMessage: string | null;
  setAiMessage: (msg: string | null) => void;
  isAiThinkingComment: boolean;
  setIsAiThinkingComment: (thinking: boolean) => void;
  isAiThinkingMove: boolean;
  setIsAiThinkingMove: (thinking: boolean) => void;

  // Images
  generatedImage: string | null;
  setGeneratedImage: (img: string | null) => void;
  imageLoading: boolean;
  setImageLoading: (loading: boolean) => void;
  imageError: string | null;
  setImageError: (err: string | null) => void;

  // Progress
  progress: Progress;
  nextLevel: Level | null;
  setNextLevel: (level: Level | null) => void;

  // Achievements
  newlyUnlockedAchievement: Achievement | null;
  setNewlyUnlockedAchievement: (achievement: Achievement | null) => void;

  // Online
  isConnected: boolean;
  lobbies: Lobby[];
  myPlayerPiece: Player | null;

  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Actions
  startNewGame: (levelOverride?: Level, resetScore?: boolean) => void;
  handleCellClick: (row: number, col: number) => void;
  handleGameOver: (
    gameWinner: Player | 'draw',
    line?: Move[],
    isOnlineGame?: boolean
  ) => Promise<void>;
  computerMove: () => Promise<void>;
  unlockAchievement: (id: string) => void;
  handleSettingsChange: (newSettings: Settings) => void;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

interface GameStateProviderProps {
  children: ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
  // Initialize settings and stats
  const [settings, setSettings] = useState<Settings>(settingsService.getSettings());
  const [stats, setStats] = useState<Stats>(statsService.getStats());

  // Game state
  const [gameState, setGameState] = useState<string>('menu');
  const [gameMode, setGameMode] = useState<GameMode>(settings.lastPlayedMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.lastPlayedDifficulty);
  const [level, setLevel] = useState<Level>(LEVELS_BY_DIFFICULTY[settings.lastPlayedDifficulty][0]);
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.X);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<Move[]>([]);
  const [isComputerTurn, setIsComputerTurn] = useState(false);

  // Theme
  const [theme, setTheme] = useState<Theme>(
    THEMES.find((t) => t.name === settings.themeName) || THEMES[0]
  );

  // Players
  const [playerNamesForGame, setPlayerNamesForGame] = useState<PlayerNames>(settings.playerNames);
  const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars>({});

  // Match
  const [matchScore, setMatchScore] = useState<MatchScore>({ [Player.X]: 0, [Player.O]: 0 });
  const [matchWinner, setMatchWinner] = useState<Player | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundStarter, setRoundStarter] = useState<Player>(Player.X);
  const [isDifficultyTransition, setIsDifficultyTransition] = useState(false);

  // AI
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiThinkingComment, setIsAiThinkingComment] = useState(false);
  const [isAiThinkingMove, setIsAiThinkingMove] = useState(false);

  // Images
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Progress
  const [progress, setProgress] = useState<Progress>(progressService.getProgress());
  const [nextLevel, setNextLevel] = useState<Level | null>(null);

  // Achievements
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(
    null
  );

  // Online
  const [isConnected, setIsConnected] = useState(false);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [myPlayerPiece, setMyPlayerPiece] = useState<Player | null>(null);

  // Loading
  const [isLoading, setIsLoading] = useState(true);

  // Initialize AI settings
  useEffect(() => {
    aiProviderService.initializeAISettings();
  }, []);

  // Update theme when settings change
  useEffect(() => {
    const newTheme = THEMES.find((t) => t.name === settings.themeName) || THEMES[0];
    setTheme(newTheme);
  }, [settings.themeName]);

  // Current background
  const currentBackground = React.useMemo(() => {
    if (!theme.backgrounds || theme.backgrounds.length === 0) return '';
    const index = (level.level - 1) % theme.backgrounds.length;
    return theme.backgrounds[index];
  }, [theme, level]);

  // Update settings
  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    settingsService.saveSettings(newSettings);
  }, []);

  // Unlock achievement
  const unlockAchievement = useCallback((id: string) => {
    if (achievementsService.unlockAchievement(id)) {
      const achievement = ALL_ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        setNewlyUnlockedAchievement(achievement);
        audioService.playAchievementSound();
      }
    }
  }, []);

  // Start new game
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

      handleSettingsChange({
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
      setGameState('levelStart');
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
        newStarter === Player.O && gameMode !== 'twoPlayer' && gameMode !== 'online';
      setIsComputerTurn(computerStarts);

      if (resetScore) {
        setRoundStarter(Player.X);
      }
    },
    [level, settings, gameMode, roundStarter, handleSettingsChange]
  );

  // Handle game over
  const handleGameOver = useCallback(
    async (gameWinner: Player | 'draw', line: Move[] = [], isOnlineGame = false) => {
      setWinner(gameWinner);
      setWinningLine(line);
      setGameState('gameOver');

      if (isOnlineGame) {
        if (gameWinner === 'draw') audioService.playDrawSound();
        else audioService.playWinSound();
        return;
      }

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
        matchScore[Player.X] === WINS_PER_LEVEL_MATCH - 1 &&
        matchScore[Player.O] === WINS_PER_LEVEL_MATCH - 1;

      const newScore = { ...matchScore };
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

      // Achievements
      if (gameWinner === Player.X) {
        unlockAchievement('first_win');
        if (level.winCondition >= 6) unlockAchievement('connect_6');
        if (level.obstacles >= 5) unlockAchievement('obstacle_course');
      }

      if (currentMatchWinner) {
        if (gameMode === 'twoPlayer') unlockAchievement('socialite');
        if (currentMatchWinner === Player.X) {
          if (gameMode === 'ai') unlockAchievement('ai_slayer');
          if (newScore[Player.O] === 0) unlockAchievement('flawless_victory');
          if (isTieBreaker) unlockAchievement('clutch_performer');
        }
      }

      if (currentMatchWinner && gameMode !== 'twoPlayer') {
        const newStats = statsService.updateStats(gameMode, difficulty, currentMatchWinner);
        setStats(newStats);

        if (currentMatchWinner === Player.X) {
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
      }
    },
    [matchScore, level, gameMode, difficulty, unlockAchievement]
  );

  // Handle cell click
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gameState !== 'playing' || board[row]?.[col] !== CellState.Empty || winner) return;

      audioService.playMoveSound();
      setAiMessage(null);

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = currentPlayer as unknown as CellState;
      setBoard(newBoard);

      const winResult = gameService.checkWin(newBoard, level.winCondition);
      if (winResult) {
        handleGameOver(winResult.winner, winResult.line);
        return;
      }

      if (gameService.checkDraw(newBoard)) {
        handleGameOver('draw');
        return;
      }

      const nextPlayer = currentPlayer === Player.X ? Player.O : Player.X;
      setCurrentPlayer(nextPlayer);

      if (gameMode !== 'twoPlayer' && gameMode !== 'online') {
        setIsComputerTurn(true);
      }
    },
    [board, currentPlayer, gameState, level, winner, gameMode, handleGameOver]
  );

  // Computer move
  const computerMove = useCallback(async () => {
    if (gameMode === 'twoPlayer' || gameMode === 'online') return;

    if (difficulty === Difficulty.Pro) {
      setIsAiThinkingMove(true);
      await new Promise((resolve) => setTimeout(resolve, 50));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const move = gameService.getComputerMove(board, Player.O, Player.X, level, matchScore);
    setIsAiThinkingMove(false);

    if (move) {
      audioService.playMoveSound();
      const newBoard = board.map((r) => [...r]);
      newBoard[move.row][move.col] = Player.O as unknown as CellState;
      setBoard(newBoard);

      const winResult = gameService.checkWin(newBoard, level.winCondition);
      if (winResult) {
        handleGameOver(winResult.winner, winResult.line);
        return;
      }

      if (gameService.checkDraw(newBoard)) {
        handleGameOver('draw');
        return;
      }

      if (gameMode === 'ai') {
        setIsAiThinkingComment(true);
        try {
          const aiService = unifiedAIService.createActiveAIService();
          let comment: string;

          if (aiService.isReady()) {
            comment = await aiService.getAIComment(newBoard, difficulty, move);
          } else {
            comment = await geminiService.getAIPersonalityComment(newBoard, difficulty, move);
          }
          setAiMessage(comment);
        } catch (error) {
          console.error('Failed to get AI comment:', error);
          setAiMessage(null);
        } finally {
          setIsAiThinkingComment(false);
        }
      }

      setCurrentPlayer(Player.X);
      setIsComputerTurn(false);
    } else {
      setIsComputerTurn(false);
      setCurrentPlayer(Player.X);
    }
  }, [board, difficulty, level, gameMode, matchScore, handleGameOver]);

  const value: GameStateContextType = {
    settings,
    updateSettings: handleSettingsChange,
    stats,
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
    currentBackground,
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
    progress,
    nextLevel,
    setNextLevel,
    newlyUnlockedAchievement,
    setNewlyUnlockedAchievement,
    isConnected,
    lobbies,
    myPlayerPiece,
    isLoading,
    setIsLoading,
    startNewGame,
    handleCellClick,
    handleGameOver,
    computerMove,
    unlockAchievement,
    handleSettingsChange,
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};
