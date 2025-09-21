import React, { useState } from 'react';
import type { Theme } from '../themes';
import type { Lobby, Level } from '../types';
import * as onlineService from '../services/onlineService';
import { TWO_PLAYER_LEVELS } from '../constants';

interface OnlineLobbyScreenProps {
  onBack: () => void;
  theme: Theme;
  isConnected: boolean;
  lobbies: Lobby[];
  myName: string;
  myAvatarUrl: string;
}

const Avatar: React.FC<{ src?: string }> = ({ src }) => {
  if (!src) {
    return <div className="w-12 h-12 rounded-full bg-gray-600 flex-shrink-0"></div>;
  }
  return <img src={src} alt="Host Avatar" className="w-12 h-12 rounded-full bg-gray-600 object-cover flex-shrink-0" />;
}

const WaitingForOpponent: React.FC<{
    myLobby: Lobby;
    theme: Theme;
}> = ({ myLobby, theme }) => {
    return (
        <div className="bg-gray-900/50 p-6 rounded-lg text-center animate-pulse">
            <h2 className={`text-2xl font-bold ${theme.accent1} mb-4`}>Waiting for an opponent...</h2>
            <p className="text-gray-300">Your game is live!</p>
            <p className="text-sm text-gray-400">({myLobby.level.boardSize}x{myLobby.level.boardSize}, Connect {myLobby.level.winCondition})</p>
            <button
                onClick={() => onlineService.cancelLobby()}
                className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 rounded-md font-bold"
            >
                Cancel Game
            </button>
        </div>
    );
};


export const OnlineLobbyScreen: React.FC<OnlineLobbyScreenProps> = ({ onBack, theme, isConnected, lobbies, myName, myAvatarUrl }) => {
  const [selectedLevel, setSelectedLevel] = useState<Level>(TWO_PLAYER_LEVELS[0]);

  const handleCreateLobby = () => {
    onlineService.createLobby(myName, myAvatarUrl, selectedLevel);
  };

  const handleJoinLobby = (lobbyId: string) => {
    onlineService.joinLobby(lobbyId, myName, myAvatarUrl);
  };
  
  const myLobby = lobbies.find(lobby => lobby.hostId === onlineService.getMySocketId());

  return (
    <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl border border-cyan-500/20">
      <h1 className={`text-3xl md:text-4xl font-orbitron font-black text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r ${theme.titleGradient}`}>
        Online Lobby
      </h1>
      <div className="text-center mb-6">
        <p className={`font-bold text-sm ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
          Status: {isConnected ? 'Connected' : 'Connecting...'}
        </p>
      </div>

      {myLobby ? (
          <WaitingForOpponent myLobby={myLobby} theme={theme} />
      ) : (
        <>
        {/* Available Games Section */}
          <div>
            <h2 className="text-xl font-bold mb-4">Available Games</h2>
            <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 bg-gray-900/50 p-3 rounded-lg">
              {lobbies.length > 0 ? (
                lobbies.map(lobby => (
                  <div key={lobby.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar src={lobby.hostAvatarUrl} />
                      <div>
                        <p className="font-bold text-lg">{lobby.hostName}'s Game</p>
                        <p className="text-xs text-gray-400">{lobby.level.boardSize}x{lobby.level.boardSize}, Connect {lobby.level.winCondition}</p>
                      </div>
                    </div>
                    <button onClick={() => handleJoinLobby(lobby.id)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md font-bold">
                      Join
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No available games. Why not create one?
                </div>
              )}
            </div>
          </div>
          
          <div className="h-px bg-cyan-500/20 my-6"></div>

          {/* Create Game Section */}
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-center mb-4">Create Your Game</h2>
            <div>
              <label className={`block text-lg font-bold ${theme.accent1} mb-2`}>Board Setup</label>
              <select
                value={selectedLevel.level}
                onChange={(e) => setSelectedLevel(TWO_PLAYER_LEVELS.find(l => l.level === parseInt(e.target.value))!)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none mb-4"
              >
                {TWO_PLAYER_LEVELS.map(l => (
                  <option key={l.level} value={l.level}>
                    {l.boardSize}x{l.boardSize}, Connect {l.winCondition}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={handleCreateLobby} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-md font-bold">Create & Wait for Opponent</button>
          </div>
        </>
      )}

      <div className="mt-8">
        <button onClick={onBack} className="w-full py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold transition-transform transform hover:scale-105">
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};