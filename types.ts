export enum Player {
  X = 'X',
  O = 'O',
  None = '',
}

export enum CellState {
  Empty = '',
  X = 'X',
  O = 'O',
  Obstacle = 'Obstacle',
}

export type Board = CellState[][];

export enum GameState {
  Menu = 'menu',
  Settings = 'settings',
  AgeCheck = 'ageCheck',
  ProfileSelect = 'profileSelect',
  LevelStart = 'levelStart',
  Playing = 'playing',
  Paused = 'paused',
  GameOver = 'gameOver',
  Stats = 'stats',
}

export enum GameMode {
  Offline = 'offline',
  AI = 'ai',
  TwoPlayer = 'twoPlayer',
}

export enum Difficulty {
  Simple = 'Simple',
  Hard = 'Hard',
  Pro = 'Pro',
}

export enum Profile {
  Man = 'man',
  Woman = 'woman',
  Child = 'child',
}

export interface Level {
  level: number;
  boardSize: number;
  winCondition: number;
  obstacles: number;
  difficulty: Difficulty;
}

export interface Move {
  row: number;
  col: number;
}

export interface PlayerNames {
  [Player.X]: string;
  [Player.O]: string;
}

export interface MatchScore {
  [Player.X]: number;
  [Player.O]: number;
}

export interface GameStats {
  playerXWins: number;
  playerOWins: number;
  draws: number;
}

export interface Progress {
  [Difficulty.Simple]: number;
  [Difficulty.Hard]: number;
  [Difficulty.Pro]: number;
}

export interface Stats {
  [GameMode.Offline]: {
    [key in Difficulty]: GameStats;
  };
  [GameMode.AI]: {
    [key in Difficulty]: GameStats;
  };
  [GameMode.TwoPlayer]: GameStats;
}

export interface Settings {
  themeName: string;
  playerNames: PlayerNames;
  lastPlayedMode: GameMode;
  lastPlayedDifficulty: Difficulty;
}