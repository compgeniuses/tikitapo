import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState, GameMode, Difficulty, Player, Profile, Board, CellState, PlayerNames, Progress, Settings, MatchScore, Achievement, Stats, Lobby, OnlineGameData, PlayerAvatars } from './types';
import type { Level, Move } from './types';
import { LEVELS_BY_DIFFICULTY, WINS_PER_LEVEL_MATCH, ALL_ACHIEVEMENTS } from './constants';
import { GameBoard } from './components/GameBoard';
import { InfoPanel } from './components/InfoPanel';
import { MenuScreen } from './components/MenuScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { AgeCheckScreen } from './components/AgeCheckScreen';
import { ProfileSelectScreen } from './components/ProfileSelectScreen';
import { PlayerStatsScreen } from './components/PlayerStatsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AIPersonality } from './components/AIPersonality';
import { LevelStartScreen } from './components/LevelStartScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { AchievementToast } from './components/AchievementToast';
import { OnlineLobbyScreen } from './components/OnlineLobbyScreen';
import { AvatarCreationScreen } from './components/AvatarCreationScreen';
import * as gameService from './services/gameService';
import * as audioService from './services/audioService';
import * as geminiService from './services/geminiService';
import * as statsService from './services/statsService';
import * as progressService from './services/progressService';
import * as settingsService from './services/settingsService';
import * as achievementsService from './services/achievementsService';
import * as onlineService from './services/onlineService';
import { THEMES } from './themes';
import type { Theme } from './themes';

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(settingsService.getSettings());
  const [stats, setStats] = useState<Stats>(statsService.getStats());

  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [gameMode, setGameMode] = useState<GameMode>(settings.lastPlayedMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.lastPlayedDifficulty);
  const [level, setLevel] = useState<Level>(LEVELS_BY_DIFFICULTY[settings.lastPlayedDifficulty][0]);
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.X);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<Move[]>([]);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [theme, setTheme] = useState<Theme>(THEMES.find(t => t.name === settings.themeName) || THEMES[0]);
  
  const [ageCheckAnswer, setAgeCheckAnswer] = useState({ a: 0, b: 0 });
  const [profile, setProfile] = useState<Profile | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const [progress, setProgress] = useState<Progress>(progressService.getProgress());
  const [nextLevel, setNextLevel] = useState<Level | null>(null);

  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiThinkingComment, setIsAiThinkingComment] = useState(false);
  const [isAiThinkingMove, setIsAiThinkingMove] = useState(false);
  
  const [playerNamesForGame, setPlayerNamesForGame] = useState<PlayerNames>(settings.playerNames);
  const [playerAvatars, setPlayerAvatars] = useState<PlayerAvatars>({});
  const [matchScore, setMatchScore] = useState<MatchScore>({ [Player.X]: 0, [Player.O]: 0 });
  const [matchWinner, setMatchWinner] = useState<Player | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundStarter, setRoundStarter] = useState<Player>(Player.X);
  const [isDifficultyTransition, setIsDifficultyTransition] = useState(false);
  
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);
  
  // Online state
  const [isConnected, setIsConnected] = useState(false);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [myPlayerPiece, setMyPlayerPiece] = useState<Player | null>(null);

  const moveInProgressRef = useRef(false);

  const currentBackground = useMemo(() => {
    if (!theme.backgrounds || theme.backgrounds.length === 0) {
      return ''; // Fallback
    }
    // Cycle through backgrounds based on level number.
    const index = (level.level - 1) % theme.backgrounds.length;
    return theme.backgrounds[index];
  }, [theme, level]);

  const unlockAchievement = useCallback((id: string) => {
    if (achievementsService.unlockAchievement(id)) {
      const achievement = ALL_ACHIEVEMENTS.find(a => a.id === id);
      if (achievement) {
        setNewlyUnlockedAchievement(achievement);
        audioService.playAchievementSound();
      }
    }
  }, []);

  const handleOnlineGameStart = useCallback((data: OnlineGameData) => {
    setBoard(data.board);
    setLevel(data.level);
    
    const myId = onlineService.getMySocketId();
    const opponentId = Object.keys(data.players).find(id => id !== myId);
    
    const myData = data.players[myId!];
    const opponentData = opponentId ? data.players[opponentId] : null;

    setMyPlayerPiece(myData?.piece || null);

    const names: PlayerNames = { [Player.X]: '', [Player.O]: '' };
    const avatars: PlayerAvatars = { [Player.X]: '', [Player.O]: '' };

    if (myData) {
      names[myData.piece] = myData.name;
      avatars[myData.piece] = myData.avatarUrl;
    }
    if (opponentData) {
      names[opponentData.piece] = opponentData.name;
      avatars[opponentData.piece] = opponentData.avatarUrl;
    }

    setPlayerNamesForGame(names);
    setPlayerAvatars(avatars);
    
    const startingPlayerId = Object.keys(data.players).find(id => data.players[id].piece === Player.X);
    setCurrentPlayer(startingPlayerId === myId ? Player.X : Player.O);
    
    setWinner(null);
    setWinningLine([]);
    setGameState(GameState.Playing);
  }, []);


  useEffect(() => {
    if (gameState === GameState.OnlineLobby) {
      onlineService.connect({
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onLobbyUpdate: setLobbies,
        onGameStart: handleOnlineGameStart,
        onOpponentMove: (move) => {
          setBoard(currentBoard => {
            const newBoard = currentBoard.map(r => [...r]);
            const opponentPiece = myPlayerPiece === Player.X ? Player.O : Player.X;
            newBoard[move.row][move.col] = opponentPiece as unknown as CellState;
            return newBoard;
          });
          setCurrentPlayer(myPlayerPiece!);
          audioService.playMoveSound();
        },
        onGameOver: (gameWinner, line) => handleGameOver(gameWinner, line, true),
      });
    }
    return () => {
      if (gameState !== GameState.OnlineLobby) {
        onlineService.disconnect();
      }
    };
  }, [gameState, handleOnlineGameStart, myPlayerPiece]);
  
  useEffect(() => {
    // Refresh progress from storage when returning to menu
    if (gameState === GameState.Menu) {
      setProgress(progressService.getProgress());
    }
  }, [gameState]);

  useEffect(() => {
    const newTheme = THEMES.find(t => t.name === settings.themeName) || THEMES[0];
    setTheme(newTheme);
  }, [settings.themeName]);

  useEffect(() => {
    if (gameState === GameState.LevelStart) {
      const timer = setTimeout(() => {
        setGameState(GameState.Playing);
      }, 2500); // Wait for the announcement animation to finish
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    settingsService.saveSettings(newSettings);
  }, []);

  const startNewGame = useCallback((levelOverride?: Level, resetScore: boolean = false) => {
    const gameLevel = levelOverride || level;
    setLevel(gameLevel);
    
    if(resetScore) {
      setMatchScore({ [Player.X]: 0, [Player.O]: 0 });
      setRoundNumber(1);
    } else {
      setRoundNumber(prev => prev + 1);
    }

    // Save last played settings
    const latestSettings = {
      ...settings,
      lastPlayedMode: gameMode,
      lastPlayedDifficulty: gameLevel.difficulty,
    };
    handleSettingsChange(latestSettings);

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
    
    // If computer is the new starter, set its turn
    const computerStarts = newStarter === Player.O && gameMode !== GameMode.TwoPlayer && gameMode !== GameMode.Online;
    setIsComputerTurn(computerStarts);
    
    // Reset round starter for a brand new match
    if (resetScore) {
      setRoundStarter(Player.X);
    }
  }, [level, settings, gameMode, handleSettingsChange, roundStarter]);

  const handleGameSetup = (mode: GameMode, selectedLevel: Level) => {
    setGameMode(mode);

    if (mode === GameMode.Online) {
      setGameState(GameState.OnlineLobby);
      return;
    }
    
    setDifficulty(selectedLevel.difficulty);
    setLevel(selectedLevel);

    let p2Name = settings.playerNames[Player.O];
    if (mode === GameMode.AI) p2Name = 'Gemini AI';
    else if (mode === GameMode.Offline) p2Name = 'CPU';
    setPlayerNamesForGame({
      [Player.X]: settings.playerNames[Player.X],
      [Player.O]: p2Name
    });

    if (mode === GameMode.AI) {
      setGameState(GameState.ProfileSelect);
    } else {
      startNewGame(selectedLevel, true);
    }
  };

  const handleAgeCheckSuccess = () => {
    startNewGame(level, true);
  };

  const handleProfileSelect = (selectedProfile: Profile) => {
    setProfile(selectedProfile);
    if (selectedProfile === Profile.Man || selectedProfile === Profile.Woman) {
      const { a, b } = gameService.generateAgeCheckQuestion();
      setAgeCheckAnswer({ a, b });
      setGameState(GameState.AgeCheck);
    } else {
      startNewGame(level, true);
    }
  };
  
  const handleCellClick = (row: number, col: number) => {
    const isMyTurnOnline = gameMode === GameMode.Online && currentPlayer === myPlayerPiece;
    const isMyTurnOffline = gameMode !== GameMode.Online && !isComputerTurn;
    
    if (gameState !== GameState.Playing || board[row][col] !== CellState.Empty || (!isMyTurnOnline && !isMyTurnOffline) || winner) return;

    audioService.playMoveSound();
    setAiMessage(null);
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer as unknown as CellState;
    setBoard(newBoard);
    
    if(gameMode === GameMode.Online){
      onlineService.makeMove({row, col});
      setCurrentPlayer(currentPlayer === Player.X ? Player.O : Player.X);
      return;
    }

    const winResult = gameService.checkWin(newBoard, level.winCondition);
    if (winResult) {
      handleGameOver(winResult.winner, winResult.line);
    } else if (gameService.checkDraw(newBoard)) {
      handleGameOver('draw');
    } else {
      const nextPlayer = currentPlayer === Player.X ? Player.O : Player.X;
      setCurrentPlayer(nextPlayer);
      if (gameMode !== GameMode.TwoPlayer) {
        setIsComputerTurn(true);
      }
    }
  };
  
  const handleGameOver = useCallback(async (gameWinner: Player | 'draw', line: Move[] = [], isOnlineGame = false) => {
      setWinner(gameWinner);
      setWinningLine(line);
      setGameState(GameState.GameOver);
      
      if(isOnlineGame) {
         if (gameWinner === 'draw') audioService.playDrawSound();
         else audioService.playWinSound();
         return;
      }
      
      setIsAiThinkingMove(false);
      setAiMessage(null);

      // Determine starter for the next round
      if (gameWinner === 'draw') {
        setRoundStarter(prev => (prev === Player.X ? Player.O : Player.X));
        audioService.playDrawSound();
      } else {
        setRoundStarter(gameWinner === Player.X ? Player.O : Player.X);
        audioService.playWinSound();
      }

      const isTieBreaker = matchScore[Player.X] === WINS_PER_LEVEL_MATCH - 1 && matchScore[Player.O] === WINS_PER_LEVEL_MATCH - 1;
      
      const newScore = { ...matchScore };
      if (gameWinner !== 'draw') {
        newScore[gameWinner]++;
      }
      setMatchScore(newScore);

      const p1Score = newScore[Player.X];
      const p2Score = newScore[Player.O];
      let currentMatchWinner: Player | 'draw' | null = null;

      if (p1Score >= WINS_PER_LEVEL_MATCH) currentMatchWinner = Player.X;
      else if (p2Score >= WINS_PER_LEVEL_MATCH) currentMatchWinner = Player.O;
      
      setMatchWinner(currentMatchWinner as Player | null);
      
      // --- Achievement Checks ---
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
      // --- End Achievement Checks ---

      if (currentMatchWinner) {
        const diff = gameMode === GameMode.TwoPlayer ? null : difficulty;
        const newStats = statsService.updateStats(gameMode, diff, currentMatchWinner);
        setStats(newStats);
        
        if (currentMatchWinner === Player.X && gameMode !== GameMode.TwoPlayer) {
          const newProgress = progressService.completeLevel(difficulty, level.level);
          setProgress(newProgress);
          
          const nextLevelData = progressService.getNextLevel(difficulty, level.level);
          if (nextLevelData) {
              setNextLevel(nextLevelData);
              if (nextLevelData.difficulty !== level.difficulty) {
                setIsDifficultyTransition(true);
                if(difficulty === Difficulty.Simple) unlockAchievement('simple_complete');
                if(difficulty === Difficulty.Hard) unlockAchievement('hard_complete');
              }
          } else {
             if(difficulty === Difficulty.Pro) {
                unlockAchievement('pro_complete');
             }
          }
        }
      }

      if (gameMode === GameMode.AI && currentMatchWinner === Player.X && profile) {
        setImageLoading(true);
        try {
          const imageUrl = await geminiService.generateVictoryImage(profile, settings.avatarUrl);
          setGeneratedImage(imageUrl);
          setImageError(null);
        } catch (error) {
          console.error("Gemini API error:", error);
          setImageError("Failed to generate victory image. Please try again later.");
        } finally {
          setImageLoading(false);
        }
      }
  }, [gameMode, difficulty, level, profile, matchScore, unlockAchievement, settings.avatarUrl]);

  const computerMove = useCallback(async () => {
    if (gameMode === GameMode.TwoPlayer || gameMode === GameMode.Online) return;

    if (difficulty === Difficulty.Pro) {
        setIsAiThinkingMove(true);
        await new Promise(resolve => setTimeout(resolve, 50)); 
    } else {
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    const move = gameService.getComputerMove(board, Player.O, Player.X, level, matchScore);
    
    setIsAiThinkingMove(false);

    if (move) {
      audioService.playMoveSound();
      const newBoard = board.map(r => [...r]);
      newBoard[move.row][move.col] = Player.O as unknown as CellState;
      setBoard(newBoard);

      const winResult = gameService.checkWin(newBoard, level.winCondition);
      if (winResult) {
        handleGameOver(winResult.winner, winResult.line);
        return;
      } else if (gameService.checkDraw(newBoard)) {
        handleGameOver('draw');
        return;
      } 
      
      if (gameMode === GameMode.AI) {
        setIsAiThinkingComment(true);
        try {
            const comment = await geminiService.getAIPersonalityComment(newBoard, difficulty, move);
            setAiMessage(comment);
        } catch (error) {
            console.error("Failed to get AI comment:", error);
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
  }, [board, difficulty, level, gameMode, handleGameOver, matchScore]);

  useEffect(() => {
    if (isComputerTurn && gameState === GameState.Playing && gameMode !== GameMode.TwoPlayer) {
      if (moveInProgressRef.current) return;
      moveInProgressRef.current = true;
      computerMove().finally(() => {
        moveInProgressRef.current = false;
      });
    }
  }, [isComputerTurn, gameState, computerMove, gameMode]);

  const handlePause = () => (gameState === GameState.Playing) && setGameState(GameState.Paused);
  const handleResume = () => (gameState === GameState.Paused) && setGameState(GameState.Playing);
  const handleStop = () => {
    if(gameMode === GameMode.Online) onlineService.leaveGame();
    setGameState(GameState.Menu)
  };
  
  const handleSuggestMove = () => {
    if (gameState !== GameState.Playing || isComputerTurn || gameMode === GameMode.Online) return;
    const opponent = currentPlayer === Player.X ? Player.O : Player.X;
    const move = gameService.getSuggestedMove(board, currentPlayer, opponent, level.winCondition);
    if(move) handleCellClick(move.row, move.col);
  };
  
  const handleShowStats = () => setGameState(GameState.Stats);
  const handleShowSettings = () => setGameState(GameState.Settings);
  const handleShowAchievements = () => setGameState(GameState.Achievements);
  const handleGoToAvatarCreation = () => setGameState(GameState.AvatarCreation);
  const handleSaveAvatar = (url: string) => {
    handleSettingsChange({ ...settings, avatarUrl: url });
    setGameState(GameState.Settings);
  };
  
  const handleResetProgress = () => {
    if(window.confirm("Are you sure you want to reset your level progress? This will lock all levels except the first one in each difficulty.")) {
      const newProgress = progressService.resetProgress();
      setProgress(newProgress);
      alert("Level progress has been reset.");
    }
  }
  
  const handleResetAchievements = () => {
    if(window.confirm("Are you sure you want to reset all your achievements?")) {
      achievementsService.resetAchievements();
      alert("Achievements have been reset.");
    }
  }

  const handleResetStats = () => {
    if (window.confirm("Are you sure you want to reset all your stats? This cannot be undone.")) {
        const newStats = statsService.resetStats();
        setStats(newStats);
        alert("Player stats have been reset.");
    }
  };

  const renderContent = () => {
    const isTieBreaker = matchScore[Player.X] === WINS_PER_LEVEL_MATCH - 1 &&
                         matchScore[Player.O] === WINS_PER_LEVEL_MATCH - 1 &&
                         !matchWinner;

    switch(gameState) {
      case GameState.Menu:
        return <MenuScreen onStartGame={handleGameSetup} onShowStats={handleShowStats} onShowSettings={handleShowSettings} onShowAchievements={handleShowAchievements} progress={progress} settings={settings} />;
      case GameState.Settings:
        return <SettingsScreen onBack={() => setGameState(GameState.Menu)} currentSettings={settings} onSettingsChange={handleSettingsChange} onGoToAvatarCreation={handleGoToAvatarCreation} />;
      case GameState.AvatarCreation:
        return <AvatarCreationScreen onBack={() => setGameState(GameState.Settings)} theme={theme} onSaveAvatar={handleSaveAvatar} />;
      case GameState.AgeCheck:
        return <AgeCheckScreen question={ageCheckAnswer} onSuccess={handleAgeCheckSuccess} onBack={() => setGameState(GameState.ProfileSelect)} />;
      case GameState.ProfileSelect:
        return <ProfileSelectScreen onSelect={handleProfileSelect} onBack={() => setGameState(GameState.Menu)} />;
      case GameState.Stats:
        return <PlayerStatsScreen onBack={() => setGameState(GameState.Menu)} theme={theme} stats={stats} onResetProgress={handleResetProgress} onResetAchievements={handleResetAchievements} onResetStats={handleResetStats} />;
      case GameState.Achievements:
        return <AchievementsScreen onBack={() => setGameState(GameState.Menu)} theme={theme} />;
      case GameState.OnlineLobby:
        return <OnlineLobbyScreen onBack={() => setGameState(GameState.Menu)} theme={theme} isConnected={isConnected} lobbies={lobbies} myName={settings.playerNames[Player.X]} myAvatarUrl={settings.avatarUrl} />;
      case GameState.LevelStart:
      case GameState.Playing:
      case GameState.Paused:
      case GameState.GameOver:
        return (
          <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-4 lg:gap-12 w-full h-full p-2 sm:p-4">
            <div className="flex flex-col gap-4 w-full lg:w-auto lg:max-w-xs">
              <InfoPanel 
                level={level}
                currentPlayer={currentPlayer}
                playerNames={playerNamesForGame}
                playerAvatars={playerAvatars}
                matchScore={matchScore}
                onPause={handlePause}
                onStop={handleStop}
                onSuggestMove={handleSuggestMove}
                isPaused={gameState === GameState.Paused}
                isGameOver={gameState === GameState.GameOver}
                isTieBreaker={isTieBreaker}
                theme={theme}
                isOnline={gameMode === GameMode.Online}
              />
              {gameMode === GameMode.AI && (gameState === GameState.Playing || gameState === GameState.Paused) && (
                <AIPersonality 
                  message={aiMessage}
                  isLoading={isAiThinkingComment}
                  theme={theme}
                />
              )}
            </div>
            <div className="relative">
              <GameBoard 
                board={board} 
                onCellClick={handleCellClick} 
                winningLine={winningLine} 
                disabled={(gameMode === GameMode.Online ? currentPlayer !== myPlayerPiece : isComputerTurn) || gameState !== GameState.Playing}
                theme={theme}
              />
              {isAiThinkingMove && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg z-20">
                    <div className="w-16 h-16 border-8 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
                    <h2 className="text-2xl font-orbitron font-bold text-purple-300 mt-6">{difficulty.toUpperCase()} AI IS THINKING...</h2>
                </div>
              )}
              {gameState === GameState.Paused && gameMode !== GameMode.Online && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg z-20">
                    <h2 className="text-4xl font-orbitron font-bold text-cyan-400 mb-6">PAUSED</h2>
                    <button onClick={handleResume} className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-md text-xl font-bold transition-transform transform hover:scale-105">
                        RESUME
                    </button>
                </div>
              )}
               {gameState === GameState.LevelStart && gameMode !== GameMode.Online && (
                  <LevelStartScreen
                    levelNumber={level.level}
                    roundNumber={roundNumber}
                    isTieBreaker={isTieBreaker}
                  />
               )}
               {gameState === GameState.GameOver && (
                <GameOverScreen 
                  winner={winner} 
                  playerNames={playerNamesForGame}
                  onRestart={startNewGame} 
                  onMenu={handleStop} 
                  generatedImage={generatedImage}
                  imageLoading={imageLoading}
                  imageError={imageError}
                  nextLevel={nextLevel}
                  matchScore={matchScore}
                  matchWinner={matchWinner}
                  currentLevel={level}
                  roundNumber={roundNumber}
                  isDifficultyTransition={isDifficultyTransition}
                  isOnline={gameMode === GameMode.Online}
                />
               )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className={`min-h-screen text-white flex items-center justify-center p-4 transition-colors duration-500 ${currentBackground}`}>
      {renderContent()}
      {newlyUnlockedAchievement && (
        <AchievementToast 
          achievement={newlyUnlockedAchievement}
          onDismiss={() => setNewlyUnlockedAchievement(null)}
          theme={theme}
        />
      )}
    </main>
  );
};

export default App;