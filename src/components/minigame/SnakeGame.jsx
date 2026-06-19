import React, { useState, useEffect, useRef } from 'react';
import { sfxMerge, sfxReward } from '../../utils/audio.js';

const SnakeGame = ({ onReward }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Game state refs to avoid closure stale state in game loop
  const snakeRef = useRef([[10, 10]]);
  const dirRef = useRef([1, 0]); // moving right initially
  const foodRef = useRef([5, 5]);
  const gameIntervalRef = useRef(null);

  const gridCount = 20;
  const cellSize = 15; // 300px / 20

  const resetGame = () => {
    snakeRef.current = [[10, 10]];
    dirRef.current = [1, 0];
    foodRef.current = [Math.floor(Math.random() * gridCount), Math.floor(Math.random() * gridCount)];
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    setCoinsEarned(0);
  };

  const handleKeyDown = (e) => {
    if (!isPlaying) return;
    const currentDir = dirRef.current;
    switch (e.key) {
      case 'ArrowUp':
        if (currentDir[1] !== 1) dirRef.current = [0, -1];
        break;
      case 'ArrowDown':
        if (currentDir[1] !== -1) dirRef.current = [0, 1];
        break;
      case 'ArrowLeft':
        if (currentDir[0] !== 1) dirRef.current = [-1, 0];
        break;
      case 'ArrowRight':
        if (currentDir[0] !== -1) dirRef.current = [1, 0];
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      gameIntervalRef.current = setInterval(gameStep, 130);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying]);

  const gameStep = () => {
    const snake = [...snakeRef.current];
    const dir = dirRef.current;
    const head = snake[0];
    const newHead = [head[0] + dir[0], head[1] + dir[1]];

    // Collision Check: Walls
    if (newHead[0] < 0 || newHead[0] >= gridCount || newHead[1] < 0 || newHead[1] >= gridCount) {
      handleGameOver();
      return;
    }

    // Collision Check: Self
    for (let segment of snake) {
      if (segment[0] === newHead[0] && segment[1] === newHead[1]) {
        handleGameOver();
        return;
      }
    }

    // Move Snake
    snake.unshift(newHead);

    // Food check
    if (newHead[0] === foodRef.current[0] && newHead[1] === foodRef.current[1]) {
      // Eat food
      setScore(prev => {
        const newScore = prev + 100;
        scoreRef.current = newScore;
        return newScore;
      }); // 100 points per food
      sfxMerge();
      // Generate new food location (not on snake body)
      let newFood;
      while (true) {
        newFood = [Math.floor(Math.random() * gridCount), Math.floor(Math.random() * gridCount)];
        const collides = snake.some(seg => seg[0] === newFood[0] && seg[1] === newFood[1]);
        if (!collides) break;
      }
      foodRef.current = newFood;
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    drawGame();
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    const reward = Math.floor(scoreRef.current / 100);
    setCoinsEarned(reward);
    if (reward > 0) {
      onReward(reward);
      sfxReward();
    }
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#f7f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake body
    ctx.fillStyle = '#4CAF50';
    snakeRef.current.forEach((segment, idx) => {
      if (idx === 0) {
        ctx.fillStyle = '#2E7D32'; // Darker green for head
      } else {
        ctx.fillStyle = '#4CAF50';
      }
      ctx.fillRect(segment[0] * cellSize, segment[1] * cellSize, cellSize - 1, cellSize - 1);
    });

    // Draw food
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.arc(
      foodRef.current[0] * cellSize + cellSize / 2,
      foodRef.current[1] * cellSize + cellSize / 2,
      cellSize / 2 - 1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  // Initial draw
  useEffect(() => {
    drawGame();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', fontWeight: 'bold' }}>
        <div>Điểm: {score}</div>
        <div>Thưởng: {Math.floor(score / 100)} 💰</div>
      </div>

      <div style={{ position: 'relative', width: '300px', height: '300px', border: '3px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={300} height={300} style={{ display: 'block' }} />

        {!isPlaying && !gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--pink-dark)' }}>Rắn Săn Mồi 🐍</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', textAlign: 'center', color: '#555' }}>Dùng nút di chuyển trên màn hình hoặc phím mũi tên để điều khiển rắn ăn quả táo đỏ.</p>
            <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Bắt đầu</button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>Trò Chơi Kết Thúc!</h3>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Điểm đạt được: {score}</p>
            <p style={{ margin: '0 0 20px 0', color: '#4CAF50', fontWeight: 'bold' }}>Nhận: +{coinsEarned} Xu 💰</p>
            <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
          </div>
        )}
      </div>

      {/* D-Pad controls for touch compatibility */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <button onClick={() => isPlaying && (dirRef.current[1] !== 1) && (dirRef.current = [0, -1])} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>▲</button>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => isPlaying && (dirRef.current[0] !== 1) && (dirRef.current = [-1, 0])} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>◀</button>
          <button onClick={() => isPlaying && (dirRef.current[0] !== -1) && (dirRef.current = [1, 0])} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>▶</button>
        </div>
        <button onClick={() => isPlaying && (dirRef.current[1] !== -1) && (dirRef.current = [0, 1])} style={{ width: '50px', height: '40px', background: '#e0e0e0', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>▼</button>
      </div>
    </div>
  );
};

export default SnakeGame;
