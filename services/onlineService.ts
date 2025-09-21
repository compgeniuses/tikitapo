import { io, Socket } from 'socket.io-client';
import type { Lobby, OnlineGameData, Level, Move, Player } from '../types';

// In a real application, this URL would come from an environment variable
const SERVER_URL = 'https://tikitap0-server.glitch.me/'; 

// FIX: Correctly type the socket with the event interfaces. This tells TypeScript
// about the custom events the app uses, fixing the errors on the `socket.on()` calls.
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

interface ServerToClientEvents {
  lobbyUpdate: (lobbies: Lobby[]) => void;
  gameStart: (gameData: OnlineGameData) => void;
  opponentMove: (move: Move) => void;
  gameOver: (winner: Player | 'draw', line: Move[]) => void;
  opponentDisconnect: () => void;
  connect: () => void;
  disconnect: () => void;
}

interface ClientToServerEvents {
  createLobby: (hostName: string, hostAvatarUrl: string, level: Level) => void;
  joinLobby: (lobbyId: string, playerName: string, playerAvatarUrl: string) => void;
  cancelLobby: () => void;
  makeMove: (move: Move) => void;
  leaveGame: () => void;
}

interface ConnectionCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onLobbyUpdate: (lobbies: Lobby[]) => void;
  onGameStart: (gameData: OnlineGameData) => void;
  onOpponentMove: (move: Move) => void;
  onGameOver: (winner: Player | 'draw', line: Move[]) => void;
}

export const connect = (callbacks: ConnectionCallbacks) => {
  if (socket) return;
  
  socket = io(SERVER_URL, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', callbacks.onConnect);
  socket.on('disconnect', callbacks.onDisconnect);
  socket.on('lobbyUpdate', callbacks.onLobbyUpdate);
  socket.on('gameStart', callbacks.onGameStart);
  socket.on('opponentMove', callbacks.onOpponentMove);
  socket.on('gameOver', callbacks.onGameOver);
  socket.on('opponentDisconnect', () => {
    alert("Your opponent has disconnected. You win!");
    // The server will also send a gameOver event, but this is a more immediate notification
  });
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getMySocketId = (): string | undefined => {
  return socket?.id;
}

export const createLobby = (hostName: string, hostAvatarUrl: string, level: Level) => {
  socket?.emit('createLobby', hostName, hostAvatarUrl, level);
};

export const joinLobby = (lobbyId: string, playerName: string, playerAvatarUrl: string) => {
  socket?.emit('joinLobby', lobbyId, playerName, playerAvatarUrl);
};

export const cancelLobby = () => {
    socket?.emit('cancelLobby');
};

export const makeMove = (move: Move) => {
  socket?.emit('makeMove', move);
};

export const leaveGame = () => {
  socket?.emit('leaveGame');
};