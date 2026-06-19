import React, { useState, useEffect, useRef } from 'react';
import { sfxMerge, sfxReward } from '../../utils/audio.js';

const PongGame = ({ onReward }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Position references
  const playerYRef = useRef(110); // Paddle height is 60, canvas height 300, so center it
  const compYRef = useRef(110);
  const ballRef = useRef({ x: 150, y: 150, vx: 3, vy: 1.5 });
  const gameIntervalRef = useRef(null);

  const paddleHeight = 55;
  const paddleWidth = 10;
  const ballRadius = 6;
  const canvasWidth = 300;
  const canvasHeight = 300;

  const resetGame = () => {
    playerYRef.current = 110;
    compYRef.current = 110;
    ballRef.current = { x: 150, y: 150, vx: 3, vy: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2) };
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    setCoinsEarned(0);
  };

  const handleKeyDown = (e) => {
    if (!isPlaying) return;
    if (e.key === 'ArrowUp') {
      playerYRef.current = Math.max(0, playerYRef.current - 15);
    } else if (e.key === 'ArrowDown') {
      playerYRef.current = Math.min(canvasHeight - paddleHeight, playerYRef.current + 15);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      gameIntervalRef.current = setInterval(gameStep, 1000 / 60); // 60 FPS
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying]);

  const gameStep = () => {
    const ball = ballRef.current;
    
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collision (Top and Bottom)
    if (ball.y - ballRadius <= 0) {
      ball.y = ballRadius;
      ball.vy = -ball.vy;
    } else if (ball.y + ballRadius >= canvasHeight) {
      ball.y = canvasHeight - ballRadius;
      ball.vy = -ball.vy;
    }

    // AI paddle logic (Comp)
    const compSpeed = 2.5;
    const compCenter = compYRef.current + paddleHeight / 2;
    if (ball.y < compCenter - 10) {
      compYRef.current = Math.max(0, compYRef.current - compSpeed);
    } else if (ball.y > compCenter + 10) {
      compYRef.current = Math.min(canvasHeight - paddleHeight, compYRef.current + compSpeed);
    }

    // Collision Check: Player Paddle (Left side)
    if (ball.vx < 0 && ball.x - ballRadius <= paddleWidth + 5) {
      // Check y position
      if (ball.y >= playerYRef.current && ball.y <= playerYRef.current + paddleHeight) {
        ball.vx = -ball.vx * 1.05; // Slightly speed up
        ball.vy += (ball.y - (playerYRef.current + paddleHeight / 2)) * 0.1; // Add reflection angle
        ball.x = paddleWidth + 5 + ballRadius;
        setScore(prev => {
          const newScore = prev + 100;
          scoreRef.current = newScore;
          return newScore;
        }); // 100 points per success bounce
        sfxMerge();
      } else if (ball.x <= 0) {
        // Player missed! Game over
        handleGameOver();
        return;
      }
    }

    // Collision Check: Comp Paddle (Right side)
    if (ball.vx > 0 && ball.x + ballRadius >= canvasWidth - paddleWidth - 5) {
      if (ball.y >= compYRef.current && ball.y <= compYRef.current + paddleHeight) {
        ball.vx = -ball.vx;
        ball.x = canvasWidth - paddleWidth - 5 - ballRadius;
      } else if (ball.x >= canvasWidth) {
        // Comp missed! Spawn new ball, reward extra
        setScore(prev => {
          const newScore = prev + 200;
          scoreRef.current = newScore;
          return newScore;
        });
        ball.x = 150;
        ball.y = 150;
        ball.vx = -3;
        ball.vy = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
        sfxMerge();
      }
    }

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
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Background
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Center line
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player paddle (Left) - blue/cyan
    ctx.fillStyle = '#00E5FF';
    ctx.fillRect(5, playerYRef.current, paddleWidth, paddleHeight);

    // Comp paddle (Right) - orange/red
    ctx.fillStyle = '#FF6D00';
    ctx.fillRect(canvasWidth - paddleWidth - 5, compYRef.current, paddleWidth, paddleHeight);

    // Ball - white
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, ballRadius, 0, Math.PI * 2);
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
        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ display: 'block' }} />

        {!isPlaying && !gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box', color: 'white' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#00E5FF' }}>Bóng Bàn Pong 🏓</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', textAlign: 'center', color: '#ccc' }}>Nhấn nút di chuyển trên màn hình hoặc phím mũi tên Lên/Xuống để điều khiển vợt màu xanh đỡ bóng.</p>
            <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: '#00E5FF', color: 'black', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Bắt đầu</button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box', color: 'white' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>Trò Chơi Kết Thúc!</h3>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Điểm đạt được: {score}</p>
            <p style={{ margin: '0 0 20px 0', color: '#4CAF50', fontWeight: 'bold' }}>Nhận: +{coinsEarned} Xu 💰</p>
            <button onClick={resetGame} style={{ padding: '10px 20px', backgroundColor: '#00E5FF', color: 'black', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
          </div>
        )}
      </div>

      {/* Button controls for touch screens */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <button 
          onMouseDown={() => isPlaying && (playerYRef.current = Math.max(0, playerYRef.current - 20))}
          onTouchStart={() => isPlaying && (playerYRef.current = Math.max(0, playerYRef.current - 20))}
          style={{ width: '70px', height: '50px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ▲
        </button>
        <button 
          onMouseDown={() => isPlaying && (playerYRef.current = Math.min(canvasHeight - paddleHeight, playerYRef.current + 20))}
          onTouchStart={() => isPlaying && (playerYRef.current = Math.min(canvasHeight - paddleHeight, playerYRef.current + 20))}
          style={{ width: '70px', height: '50px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default PongGame;
