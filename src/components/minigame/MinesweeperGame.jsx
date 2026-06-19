import React, { useState, useEffect, useRef } from 'react';
import { sfxMerge, sfxReward } from '../../utils/audio.js';

const ROWS = 9;
const COLS = 9;
const MINES = 10;

const MinesweeperGame = ({ onReward }) => {
  const [board, setBoard] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [mode, setMode] = useState('DIG'); // 'DIG' or 'FLAG'
  const [safeCellsRevealed, setSafeCellsRevealed] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  
  const revealedRef = useRef(0);
  const isFirstClickRef = useRef(true);

  const initBoard = () => {
    let b = [];
    for (let r = 0; r < ROWS; r++) {
      let row = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r, c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
      b.push(row);
    }
    return b;
  };

  const placeMines = (boardToPlace, firstR, firstC) => {
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      // Don't place on first click or already a mine
      if (!boardToPlace[r][c].isMine && !(r === firstR && c === firstC)) {
        boardToPlace[r][c].isMine = true;
        placed++;
      }
    }
    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!boardToPlace[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < ROWS && c + j >= 0 && c + j < COLS) {
                if (boardToPlace[r + i][c + j].isMine) count++;
              }
            }
          }
          boardToPlace[r][c].neighborMines = count;
        }
      }
    }
  };

  const resetGame = () => {
    setBoard(initBoard());
    setIsPlaying(true);
    setGameOver(false);
    setGameWon(false);
    setSafeCellsRevealed(0);
    setCoinsEarned(0);
    revealedRef.current = 0;
    isFirstClickRef.current = true;
  };

  const revealCell = (r, c, currentBoard) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || currentBoard[r][c].isRevealed || currentBoard[r][c].isFlagged) {
      return 0;
    }

    currentBoard[r][c].isRevealed = true;
    let newlyRevealed = 1;

    if (currentBoard[r][c].neighborMines === 0 && !currentBoard[r][c].isMine) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          newlyRevealed += revealCell(r + i, c + j, currentBoard);
        }
      }
    }
    return newlyRevealed;
  };

  const handleCellClick = (r, c) => {
    if (!isPlaying || gameOver || board[r][c].isRevealed) return;

    let newBoard = board.map(row => row.map(cell => ({ ...cell })));

    if (mode === 'FLAG') {
      newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
      setBoard(newBoard);
      sfxMerge();
      return;
    }

    if (newBoard[r][c].isFlagged) return; // Cannot dig a flagged cell

    if (isFirstClickRef.current) {
      placeMines(newBoard, r, c);
      isFirstClickRef.current = false;
    }

    if (newBoard[r][c].isMine) {
      // Game Over (Loss)
      newBoard.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setBoard(newBoard);
      handleGameEnd(false);
      return;
    }

    const revealedCount = revealCell(r, c, newBoard);
    revealedRef.current += revealedCount;
    setSafeCellsRevealed(revealedRef.current);
    setBoard(newBoard);
    sfxMerge();

    if (revealedRef.current === ROWS * COLS - MINES) {
      // Game Over (Win)
      handleGameEnd(true);
    }
  };

  const handleGameEnd = (won) => {
    setIsPlaying(false);
    setGameOver(true);
    setGameWon(won);
    
    // Reward logic: cells / 5 coins. +20 bonus if won.
    let baseReward = Math.floor(revealedRef.current / 5);
    let totalReward = baseReward + (won ? 20 : 0);
    
    setCoinsEarned(totalReward);
    if (totalReward > 0) {
      onReward(totalReward);
      sfxReward();
    }
  };

  useEffect(() => {
    setBoard(initBoard());
  }, []);

  const getNumberColor = (num) => {
    const colors = ['#000', '#1976D2', '#388E3C', '#D32F2F', '#7B1FA2', '#FF8F00', '#0097A7', '#424242', '#757575'];
    return colors[num] || '#000';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      
      {!isPlaying && !gameOver ? (
        <div style={{ width: '300px', padding: '20px', backgroundColor: 'white', borderRadius: '15px', border: '3px solid var(--pink-light)', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--pink-dark)' }}>Dò Mìn 💣</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#555' }}>
            Tìm tất cả ô an toàn. Tránh {MINES} quả mìn!<br/>
            Dùng nút chuyển đổi Cắm cờ/Mở ô.
          </p>
          <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Bắt đầu</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', fontWeight: 'bold' }}>
            <div>Đã mở: {safeCellsRevealed}</div>
            <div>Mìn: {MINES}</div>
          </div>

          <div style={{ display: 'flex', gap: '10px', background: '#e0e0e0', padding: '5px', borderRadius: '10px' }}>
            <button 
              onClick={() => setMode('DIG')}
              style={{ padding: '8px 16px', background: mode === 'DIG' ? '#fff' : 'transparent', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: mode === 'DIG' ? 'var(--pink-dark)' : '#555', cursor: 'pointer', boxShadow: mode === 'DIG' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}
            >
              ⛏️ Mở ô
            </button>
            <button 
              onClick={() => setMode('FLAG')}
              style={{ padding: '8px 16px', background: mode === 'FLAG' ? '#fff' : 'transparent', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: mode === 'FLAG' ? 'red' : '#555', cursor: 'pointer', boxShadow: mode === 'FLAG' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}
            >
              🚩 Cắm cờ
            </button>
          </div>

          <div style={{ position: 'relative', width: '300px', height: '300px', border: '3px solid #ccc', borderRadius: '10px', backgroundColor: '#bdbdbd', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)`, width: '100%', height: '100%' }}>
              {board.map((row, r) => row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    width: '100%', height: '100%',
                    boxSizing: 'border-box',
                    border: cell.isRevealed ? '1px solid #9e9e9e' : '2px outset #eee',
                    backgroundColor: cell.isRevealed ? '#e0e0e0' : '#bdbdbd',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 'bold',
                    color: getNumberColor(cell.neighborMines),
                    cursor: (!cell.isRevealed && isPlaying) ? 'pointer' : 'default'
                  }}
                >
                  {cell.isRevealed 
                    ? (cell.isMine ? '💣' : (cell.neighborMines > 0 ? cell.neighborMines : '')) 
                    : (cell.isFlagged ? '🚩' : '')}
                </div>
              )))}
            </div>

            {gameOver && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box', zIndex: 10 }}>
                <h3 style={{ margin: '0 0 10px 0', color: gameWon ? 'var(--pink-primary)' : 'red' }}>
                  {gameWon ? 'Chiến Thắng! 🎉' : 'Bùm! Đạp Trúng Mìn! 💥'}
                </h3>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Ô an toàn đã mở: {safeCellsRevealed}</p>
                <p style={{ margin: '0 0 20px 0', color: '#4CAF50', fontWeight: 'bold' }}>Nhận: +{coinsEarned} Xu 💰</p>
                <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MinesweeperGame;
