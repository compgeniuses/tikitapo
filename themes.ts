export interface Theme {
  name: string;
  background: string;
  boardBg: string;
  boardBoxShadow: string;
  cellBg: string;
  cellHoverEffect: string;
  titleGradient: string;
  accent1: string; // text color
  accent1Bg: string; // bg color
  accent2: string;
  accent2Bg: string;
  playerXColor: string;
  playerOColor: string;
  obstacleColor: string;
  winningCellBg: string;
  winningCellBoxShadow: string;
}

export const THEMES: Theme[] = [
  {
    name: 'Sci-Fi',
    background: "bg-gray-900 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[move-stars_200s_linear_infinite]",
    boardBg: 'bg-gray-800/50 backdrop-blur-sm border-2 border-cyan-500/30',
    boardBoxShadow: 'shadow-[0_0_25px_3px_rgba(0,255,255,0.2)]',
    cellBg: 'bg-cyan-900/20',
    cellHoverEffect: 'hover:bg-cyan-700/50 hover:shadow-[inset_0_0_10px_rgba(100,255,255,0.5)]',
    titleGradient: 'from-cyan-400 to-purple-500',
    accent1: 'text-cyan-300',
    accent1Bg: 'bg-cyan-500',
    accent2: 'text-purple-300',
    accent2Bg: 'bg-purple-600',
    playerXColor: 'text-cyan-400',
    playerOColor: 'text-yellow-400',
    obstacleColor: 'text-gray-500',
    winningCellBg: 'bg-yellow-500/80 animate-pulse',
    winningCellBoxShadow: 'shadow-[0_0_15px_3px_rgba(251,191,36,0.7)]',
  },
  {
    name: 'Jungle',
    background: 'bg-[#14281D] bg-[url("data:image/svg+xml,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20width=\'100\'%20height=\'100\'%20viewBox=\'0%200%20100%20100\'%3E%3Cg%20fill=\'%231a382a\'%20fill-opacity=\'0.4\'%3E%3Cpath%20d=\'M0%2050A50%2050%200%200%201%2050%200h50v50a50%2050%200%200%201-50%2050H0V50zm100%200V0h-50a50%2050%200%200%201%2050%2050zM0%200h50v50A50%2050%200%200%201%200%200z\'/%3E%3C/g%3E%3C/svg%3E")] bg-[size:100px_100px] animate-[pan-jungle_120s_linear_infinite]',
    boardBg: 'bg-yellow-900/50 backdrop-blur-sm border-4 border-yellow-800/80',
    boardBoxShadow: 'shadow-[0_0_25px_5px_rgba(110,60,30,0.5)]',
    cellBg: 'bg-green-900/50',
    cellHoverEffect: 'hover:bg-green-800/70 hover:shadow-[inset_0_0_10px_rgba(134,239,172,0.4)]',
    titleGradient: 'from-yellow-400 to-orange-500',
    accent1: 'text-yellow-300',
    accent1Bg: 'bg-yellow-600',
    accent2: 'text-orange-300',
    accent2Bg: 'bg-orange-600',
    playerXColor: 'text-lime-400',
    playerOColor: 'text-red-500',
    obstacleColor: 'text-yellow-900/80',
    winningCellBg: 'bg-lime-500/80 animate-pulse',
    winningCellBoxShadow: 'shadow-[0_0_15px_3px_rgba(190,242,100,0.7)]',
  },
  {
    name: 'Ocean',
    background: 'bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 bg-[size:400%_400%] animate-[ocean-gradient_15s_ease_infinite]',
    boardBg: 'bg-cyan-900/50 backdrop-blur-sm border-2 border-cyan-700/50',
    boardBoxShadow: 'shadow-[0_0_25px_4px_rgba(34,211,238,0.25)]',
    cellBg: 'bg-blue-800/30',
    cellHoverEffect: 'hover:bg-blue-700/50 hover:shadow-[inset_0_0_10px_rgba(125,211,252,0.5)]',
    titleGradient: 'from-teal-300 to-sky-400',
    accent1: 'text-teal-200',
    accent1Bg: 'bg-teal-500',
    accent2: 'text-sky-300',
    accent2Bg: 'bg-sky-600',
    playerXColor: 'text-white',
    playerOColor: 'text-orange-400',
    obstacleColor: 'text-gray-400/80',
    winningCellBg: 'bg-teal-400/80 animate-pulse',
    winningCellBoxShadow: 'shadow-[0_0_15px_3px_rgba(45,212,191,0.7)]',
  }
];