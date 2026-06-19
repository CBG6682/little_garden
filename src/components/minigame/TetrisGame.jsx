import React, { useState, useEffect, useRef } from 'react';
import { sfxMerge, sfxReward } from '../../utils/audio.js';

const TetrisGame = ({ onReward }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0); // number of lines
  const scoreRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 20;

  const boardRef = useRef(Array(ROWS).fill().map(() => Array(COLS).fill(0)));
  const currentPieceRef = useRef(null);
  const gameIntervalRef = useRef(null);
  const fastDropRef = useRef(false);

  const COLORS = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // I
    '#0DFF72', // S
    '#F538FF', // Z
    '#FF8E0D', // L
    '#FFE138', // J
    '#3877FF', // O
  ];

  const PIECES = [
    [],
    [[1, 1, 1], [0, 1, 0]], // T
    [[0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0]], // I
    [[0, 3, 3], [3, 3, 0]], // S
    [[4, 4, 0], [0, 4, 4]], // Z
    [[0, 5, 0], [0, 5, 0], [0, 5, 5]], // L
    [[0, 6, 0], [0, 6, 0], [6, 6, 0]], // J
    [[7, 7], [7, 7]], // O
  ];

  const resetGame = () => {
    boardRef.current = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    spawnPiece();
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    setCoinsEarned(0);
  };

  const spawnPiece = () => {
    const typeId = Math.floor(Math.random() * 7) + 1;
    const matrix = PIECES[typeId];
    currentPieceRef.current = {
      matrix,
      pos: { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 }
    };
    if (collide(boardRef.current, currentPieceRef.current)) {
      handleGameOver();
    }
  };

  const collide = (board, player) => {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 &&
           (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  const merge = (board, player) => {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          board[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  };

  const sweep = () => {
    let linesCleared = 0;
    outer: for (let y = boardRef.current.length - 1; y >= 0; --y) {
      for (let x = 0; x < boardRef.current[y].length; ++x) {
        if (boardRef.current[y][x] === 0) {
          continue outer;
        }
      }
      const row = boardRef.current.splice(y, 1)[0].fill(0);
      boardRef.current.unshift(row);
      ++y;
      linesCleared++;
    }
    if (linesCleared > 0) {
      setScore(prev => {
        const newScore = prev + linesCleared;
        scoreRef.current = newScore;
        return newScore;
      });
      sfxMerge();
    }
  };

  const drop = () => {
    currentPieceRef.current.pos.y++;
    if (collide(boardRef.current, currentPieceRef.current)) {
      currentPieceRef.current.pos.y--;
      merge(boardRef.current, currentPieceRef.current);
      sweep();
      if (isPlaying) {
        spawnPiece();
      }
    }
    drawGame();
  };

  const move = (dir) => {
    currentPieceRef.current.pos.x += dir;
    if (collide(boardRef.current, currentPieceRef.current)) {
      currentPieceRef.current.pos.x -= dir;
    }
    drawGame();
  };

  const rotate = () => {
    const m = currentPieceRef.current.matrix;
    // transpose
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
      }
    }
    // reverse rows
    m.forEach(row => row.reverse());
    
    // wall kick check
    const pos = currentPieceRef.current.pos.x;
    let offset = 1;
    while (collide(boardRef.current, currentPieceRef.current)) {
      currentPieceRef.current.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > m[0].length) {
        // failed
        currentPieceRef.current.pos.x = pos; // reset
        // reverse rotation
        m.forEach(row => row.reverse());
        for (let y = 0; y < m.length; ++y) {
          for (let x = 0; x < y; ++x) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
          }
        }
        return;
      }
    }
    drawGame();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || gameOver) return;
      if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
      else if (e.key === 'ArrowDown') {
        drop();
      }
      else if (e.key === 'ArrowUp') {
        rotate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (isPlaying) {
      gameIntervalRef.current = setInterval(() => {
        drop();
      }, 500);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying]);

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    const reward = scoreRef.current * 10; // 10 coins per line
    setCoinsEarned(reward);
    if (reward > 0) {
      onReward(reward);
      sfxReward();
    }
  };

  const drawMatrix = (matrix, offset, ctx) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = '#000';
          ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(boardRef.current, { x: 0, y: 0 }, ctx);
    if (currentPieceRef.current) {
      drawMatrix(currentPieceRef.current.matrix, currentPieceRef.current.pos, ctx);
    }
  };

  useEffect(() => {
    drawGame();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', fontWeight: 'bold' }}>
        <div>Hàng: {score}</div>
        <div>Thưởng: {score * 10} 💰</div>
      </div>

      <div style={{ position: 'relative', width: '200px', height: '400px', border: '3px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={200} height={400} style={{ display: 'block' }} />

        {!isPlaying && !gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--pink-dark)' }}>Xếp Hình 🧱</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', textAlign: 'center', color: '#555' }}>Dùng nút điều khiển hoặc phím mũi tên để di chuyển và xoay khối.</p>
            <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Bắt đầu</button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>Kết Thúc!</h3>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Hàng đã xóa: {score}</p>
            <p style={{ margin: '0 0 20px 0', color: '#4CAF50', fontWeight: 'bold' }}>Nhận: +{coinsEarned} Xu 💰</p>
            <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
          </div>
        )}
      </div>

      {/* D-Pad controls for touch compatibility */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <button onClick={() => isPlaying && rotate()} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>↻</button>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => isPlaying && move(-1)} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>◀</button>
          <button onClick={() => isPlaying && move(1)} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>▶</button>
        </div>
        <button onClick={() => isPlaying && drop()} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>▼</button>
      </div>
    </div>
  );
};

export default TetrisGame;
