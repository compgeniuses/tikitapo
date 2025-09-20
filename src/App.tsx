
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameMode, Difficulty, Player, Profile, Board, CellState } from './types';
import type { Level, Move } from './types';
import { LEVELS } from './constants';
import { GameBoard } from './components/GameBoard';
import { InfoPanel } from './components/InfoPanel';
import { MenuScreen } from './components/MenuScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { AgeCheckScreen } from './components/AgeCheckScreen';
import { ProfileSelectScreen } from './components/ProfileSelectScreen';
import * as gameService from './services/gameService';
import * as audioService from './services/audioService';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Menu);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.Offline);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Hard);
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.X);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<Move[]>([]);
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  
  const [ageCheckAnswer, setAgeCheckAnswer] = useState({ a: 0, b: 0 });
  const [profile, setProfile] = useState<Profile | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const startNewGame = useCallback(() => {
    const newBoard = gameService.createBoard(level.boardSize, level.obstacles);
    setBoard(newBoard);
    setCurrentPlayer(Player.X);
    setWinner(null);
    setWinningLine([]);
    setGameState(GameState.Playing);
    setIsComputerTurn(false);
    setGeneratedImage(null);
    setImageError(null);
    setImageLoading(false);
  }, [level]);

  const handleGameSetup = (mode: GameMode, diff: Difficulty, lvl: Level) => {
    setGameMode(mode);
    setDifficulty(diff);
    setLevel(lvl);
    if (mode === GameMode.AI) {
      const { a, b } = gameService.generateAgeCheckQuestion();
      setAgeCheckAnswer({ a, b });
      setGameState(GameState.AgeCheck);
    } else {
      startNewGame();
    }
  };

  const handleAgeCheckSuccess = () => {
    setGameState(GameState.ProfileSelect);
  };

  const handleProfileSelect = (selectedProfile: Profile) => {
    setProfile(selectedProfile);
    startNewGame();
  };
  
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== GameState.Playing || board[row][col] !== CellState.Empty || isComputerTurn || winner) return;

    audioService.playMoveSound();
    const newBoard = board.map(r => [...r]);
    // FIX: Cast Player to CellState, as the board requires CellState type.
    newBoard[row][col] = currentPlayer as CellState;
    setBoard(newBoard);
    
    const winResult = gameService.checkWin(newBoard, level.winCondition);
    if (winResult) {
      handleGameOver(winResult.winner, winResult.line);
    } else if (gameService.checkDraw(newBoard)) {
      handleGameOver('draw');
    } else {
      setCurrentPlayer(Player.O);
      setIsComputerTurn(true);
    }
  };

  const computerMove = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // AI thinking delay
    
    const move = gameService.getComputerMove(board, Player.O, Player.X, difficulty, level.winCondition);
    
    if (move) {
      audioService.playMoveSound();
      const newBoard = board.map(r => [...r]);
      // FIX: Cast Player to CellState, as the board requires CellState type.
      newBoard[move.row][move.col] = Player.O as CellState;
      setBoard(newBoard);

      const winResult = gameService.checkWin(newBoard, level.winCondition);
      if (winResult) {
        handleGameOver(winResult.winner, winResult.line);
      } else if (gameService.checkDraw(newBoard)) {
        handleGameOver('draw');
      } else {
        setCurrentPlayer(Player.X);
        setIsComputerTurn(false);
      }
    } else {
       // This case should ideally not happen if there are valid moves
       setIsComputerTurn(false);
       setCurrentPlayer(Player.X);
    }
  }, [board, difficulty, level.winCondition]);

  useEffect(() => {
    if (isComputerTurn && gameState === GameState.Playing) {
      computerMove();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComputerTurn, gameState]);


  const handleGameOver = async (gameWinner: Player | 'draw', line: Move[] = []) => {
      setWinner(gameWinner);
      setWinningLine(line);
      setGameState(GameState.GameOver);
      if (gameWinner === 'draw') {
        audioService.playDrawSound();
      } else {
        audioService.playWinSound();
      }

      if (gameMode === GameMode.AI && gameWinner === Player.X && profile) {
        setImageLoading(true);
        try {
          const imageUrl = await geminiService.generateVictoryImage(profile);
          setGeneratedImage(imageUrl);
          setImageError(null);
        } catch (error) {
          console.error("Gemini API error:", error);
          setImageError("Failed to generate victory image. Please try again later.");
        } finally {
          setImageLoading(false);
        }
      }
  };

  const handlePause = () => {
    if(gameState === GameState.Playing) {
        setGameState(GameState.Paused);
        audioService.playUISound();
    }
  };
  const handleResume = () => {
    if(gameState === GameState.Paused) {
        setGameState(GameState.Playing);
        audioService.playUISound();
    }
  };
  const handleStop = () => setGameState(GameState.Menu);
  
  const handleSuggestMove = () => {
    if (gameState !== GameState.Playing || isComputerTurn) return;
    const move = gameService.getSuggestedMove(board, Player.X, Player.O, level.winCondition);
    if(move) {
      // Highlight suggested move - for simplicity, we just click it
      handleCellClick(move.row, move.col);
    }
  };

  const renderContent = () => {
    switch(gameState) {
      case GameState.Menu:
        return <MenuScreen onStartGame={handleGameSetup} />;
      case GameState.AgeCheck:
        return <AgeCheckScreen question={ageCheckAnswer} onSuccess={handleAgeCheckSuccess} onBack={() => setGameState(GameState.Menu)} />;
      case GameState.ProfileSelect:
        return <ProfileSelectScreen onSelect={handleProfileSelect} onBack={() => setGameState(GameState.Menu)} />;
      case GameState.Playing:
      case GameState.Paused:
      case GameState.GameOver:
        return (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full h-full p-4">
            <InfoPanel 
              level={level}
              currentPlayer={currentPlayer}
              onPause={handlePause}
              onStop={handleStop}
              onSuggestMove={handleSuggestMove}
              isPaused={gameState === GameState.Paused}
              isGameOver={gameState === GameState.GameOver}
            />
            <div className="relative">
              <GameBoard 
                board={board} 
                onCellClick={handleCellClick} 
                winningLine={winningLine} 
                disabled={isComputerTurn || gameState !== GameState.Playing}
              />
              {gameState === GameState.Paused && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg z-20">
                    <h2 className="text-4xl font-orbitron font-bold text-cyan-400 mb-6">PAUSED</h2>
                    <button onClick={handleResume} className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-md text-xl font-bold transition-transform transform hover:scale-105">
                        RESUME
                    </button>
                </div>
              )}
               {gameState === GameState.GameOver && (
                <GameOverScreen 
                  winner={winner} 
                  onRestart={startNewGame} 
                  onMenu={handleStop} 
                  generatedImage={generatedImage}
                  imageLoading={imageLoading}
                  imageError={imageError}
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
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
      {renderContent()}
    </main>
  );
};

export default App;
