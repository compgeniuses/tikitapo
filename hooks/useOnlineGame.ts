import { useState, useEffect, useCallback } from 'react';
import {
  Player,
  Lobby,
  OnlineGameData,
  Board,
  CellState,
  PlayerNames,
  PlayerAvatars,
  Move,
  Level,
} from '../types';
import * as onlineService from '../services/onlineService';

interface UseOnlineGameProps {
  gameState: string;
  myName: string;
  myAvatarUrl: string;
  onGameStart: (data: {
    board: Board;
    level: Level;
    playerNames: PlayerNames;
    playerAvatars: PlayerAvatars;
    currentPlayer: Player;
  }) => void;
  onOpponentMove: (move: Move) => void;
  onGameOver: (winner: Player | 'draw', line: Move[]) => void;
}

export const useOnlineGame = ({
  gameState,
  myName,
  myAvatarUrl,
  onGameStart,
  onOpponentMove,
  onGameOver,
}: UseOnlineGameProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [myPlayerPiece, setMyPlayerPiece] = useState<Player | null>(null);

  useEffect(() => {
    if (gameState === 'onlineLobby') {
      onlineService.connect({
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onLobbyUpdate: setLobbies,
        onGameStart: (data: OnlineGameData) => {
          const myId = onlineService.getMySocketId();
          const opponentId = Object.keys(data.players).find((id) => id !== myId);
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

          const startingPlayerId = Object.keys(data.players).find(
            (id) => data.players[id].piece === Player.X
          );
          const currentPlayer = startingPlayerId === myId ? Player.X : Player.O;

          onGameStart({
            board: data.board,
            level: data.level,
            playerNames: names,
            playerAvatars: avatars,
            currentPlayer,
          });
        },
        onOpponentMove: (move: Move) => {
          onOpponentMove(move);
        },
        onGameOver: (winner: Player | 'draw', line: Move[]) => {
          onGameOver(winner, line);
        },
      });
    }

    return () => {
      if (gameState !== 'onlineLobby') {
        onlineService.disconnect();
      }
    };
  }, [gameState, onGameStart, onOpponentMove, onGameOver]);

  const createLobby = useCallback(
    (level: Level) => {
      onlineService.createLobby(myName, myAvatarUrl, level);
    },
    [myName, myAvatarUrl]
  );

  const joinLobby = useCallback(
    (lobbyId: string) => {
      onlineService.joinLobby(lobbyId, myName, myAvatarUrl);
    },
    [myName, myAvatarUrl]
  );

  const leaveLobby = useCallback(() => {
    onlineService.cancelLobby();
  }, []);

  const leaveGame = useCallback(() => {
    onlineService.leaveGame();
  }, []);

  const makeMove = useCallback((move: Move) => {
    onlineService.makeMove(move);
  }, []);

  return {
    isConnected,
    lobbies,
    myPlayerPiece,
    createLobby,
    joinLobby,
    leaveLobby,
    leaveGame,
    makeMove,
  };
};
