export interface Theme {
  name: string;
  background: string;
  boardBg: string;
  cellBg: string;
  cellHoverBg: string;
  titleGradient: string;
  accent1: string; // text color
  accent1Bg: string; // bg color
  accent2: string;
  accent2Bg: string;
  playerXColor: string;
  playerOColor: string;
  obstacleColor: string;
  winningCellBg: string;
}

export const THEMES: Theme[] = [
  {
    name: 'Sci-Fi',
    background: 'bg-gray-900 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]',
    boardBg: 'bg-gray-800',
    cellBg: 'bg-gray-700',
    cellHoverBg: 'hover:bg-cyan-900',
    titleGradient: 'from-cyan-400 to-purple-500',
    accent1: 'text-cyan-300',
    accent1Bg: 'bg-cyan-500',
    accent2: 'text-purple-300',
    accent2Bg: 'bg-purple-600',
    playerXColor: 'text-cyan-400',
    playerOColor: 'text-yellow-400',
    obstacleColor: 'text-gray-500',
    winningCellBg: 'animate-pulse bg-yellow-500',
  },
  {
    name: 'Jungle',
    background: 'bg-green-900 bg-[url("data:image/svg+xml,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20width=\'28\'%20height=\'49\'%20viewBox=\'0%200%2028%2049\'%3E%3Cg%20fill-rule=\'evenodd\'%3E%3Cg%20id=\'hexagons\'%20fill=\'%231e3b20\'%20fill-opacity=\'0.2\'%20fill-rule=\'nonzero\'%3E%3Cpath%20d=\'M13.99%209.25l13.99%208.077v16.154L13.99%2041.556%200%2033.48V17.327L13.99%209.25zM-13.99%201.173l13.99%208.076v16.154L-13.99%2033.48V17.327L-27.98%209.25l13.99-8.077zM27.98%201.173l13.99%208.076v16.154L27.98%2033.48V17.327L13.99%209.25l13.99-8.077zM13.99%2025.404l13.99%208.077v16.154L13.99%2057.712%200%2049.635V33.48l13.99-8.076zM-13.99%2017.327l13.99%208.077v16.154L-13.99%2049.635V33.48L-27.98%2025.404l13.99-8.077zM27.98%2017.327l13.99%208.077v16.154L27.98%2049.635V33.48L13.99%2025.404l13.99-8.077z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]',
    boardBg: 'bg-yellow-900/50 backdrop-blur-sm border-2 border-yellow-700',
    cellBg: 'bg-green-800',
    cellHoverBg: 'hover:bg-green-700',
    titleGradient: 'from-yellow-400 to-orange-500',
    accent1: 'text-yellow-300',
    accent1Bg: 'bg-yellow-600',
    accent2: 'text-orange-300',
    accent2Bg: 'bg-orange-600',
    playerXColor: 'text-lime-400',
    playerOColor: 'text-red-500',
    obstacleColor: 'text-yellow-900',
    winningCellBg: 'animate-pulse bg-lime-500',
  },
    {
    name: 'Ocean',
    background: 'bg-blue-900 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0px,_rgba(255,255,255,0.05)_1px,_transparent_1px),radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0px,_rgba(255,255,255,0.05)_1px,_transparent_1px)] [background-size:20px_20px]',
    boardBg: 'bg-cyan-900/60 backdrop-blur-sm border-2 border-cyan-700',
    cellBg: 'bg-blue-800',
    cellHoverBg: 'hover:bg-blue-700',
    titleGradient: 'from-teal-300 to-sky-400',
    accent1: 'text-teal-200',
    accent1Bg: 'bg-teal-500',
    accent2: 'text-sky-300',
    accent2Bg: 'bg-sky-600',
    playerXColor: 'text-white',
    playerOColor: 'text-orange-400',
    obstacleColor: 'text-gray-400',
    winningCellBg: 'animate-pulse bg-teal-400',
  }
];