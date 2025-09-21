import React from 'react';
import { Board, CellState } from '../types';
import type { Move } from '../types';
import { IconX, IconO, IconObstacle } from './icons/PieceIcons';
import type { Theme } from '../themes';

interface GameBoardProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  winningLine: Move[];
  disabled: boolean;
  theme: Theme;
}

const MemoizedIconX = React.memo(IconX);
const MemoizedIconO = React.memo(IconO);
const MemoizedIconObstacle = React.memo(IconObstacle);

const Cell: React.FC<{
  cell: CellState;
  isWinner: boolean;
  disabled: boolean;
  onClick: () => void;
  theme: Theme;
}> = ({ cell, isWinner, disabled, onClick, theme }) => {
    const [isRendered, setIsRendered] = React.useState(false);

    React.useEffect(() => {
        if(cell !== CellState.Empty) {
            setIsRendered(true);
        } else {
            setIsRendered(false);
        }
    }, [cell]);

    const cellContent = (() => {
        switch (cell) {
            case CellState.X: return <MemoizedIconX className={theme.playerXColor} />;
            case CellState.O: return <MemoizedIconO className={theme.playerOColor} />;
            case CellState.Obstacle: return <MemoizedIconObstacle className={theme.obstacleColor} />;
            default: return null;
        }
    })();
    
    return (
        <div
            onClick={onClick}
            className={`flex items-center justify-center rounded-md aspect-square transition-all duration-300
                ${cell === CellState.Empty && !disabled ? `${theme.cellBg} ${theme.cellHoverEffect} cursor-pointer` : `${theme.cellBg}/50`}
                ${disabled && cell === CellState.Empty ? 'cursor-not-allowed' : ''}
                ${isWinner ? `${theme.winningCellBg} ${theme.winningCellBoxShadow}` : ''}
            `}
        >
            <div className={`transition-transform duration-300 ease-out ${isRendered ? 'scale-100' : 'scale-0'}`}>
                {cellContent}
            </div>
        </div>
    );
};

export const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, winningLine, disabled, theme }) => {
  const boardSize = board.length;

  const isWinningCell = (row: number, col: number) => {
    return winningLine.some(move => move.row === row && move.col === col);
  };

  return (
    <div 
        className={`${theme.boardBg} p-2 sm:p-4 rounded-lg transition-shadow duration-500 ${theme.boardBoxShadow}`}
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
            gap: '0.5rem',
            aspectRatio: '1 / 1',
            width: 'clamp(300px, 90vw, 600px)',
        }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
            <Cell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                isWinner={isWinningCell(rowIndex, colIndex)}
                disabled={disabled}
                onClick={() => onCellClick(rowIndex, colIndex)}
                theme={theme}
            />
        ))
      )}
    </div>
  );
};