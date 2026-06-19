import React, { useState, useEffect, useRef } from 'react';
import { sfxMerge, sfxReward } from '../../utils/audio.js';

const FlappyGame = ({ onReward }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const birdRef = useRef({ y: 150, velocity: 0, gravity: 0.5, jump: -7, radius: 10 });
  const pipesRef = useRef([]);
  const frameCountRef = useRef(0);
  const gameIntervalRef = useRef(null);

  const canvasWidth = 300;
  const canvasHeight = 400;

  const resetGame = () => {
    birdRef.current = { y: 150, velocity: 0, gravity: 0.5, jump: -7, radius: 10 };
    pipesRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    setCoinsEarned(0);
  };

  const jump = () => {
    if (!isPlaying) return;
    birdRef.current.velocity = birdRef.current.jump;
    sfxMerge(); // Optional: A light sound for jumping
  };

  const handleKeyDown = (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      gameIntervalRef.current = setInterval(gameStep, 1000 / 60);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying]);

  const gameStep = () => {
    const bird = birdRef.current;
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Floor/Ceiling collision
    if (bird.y + bird.radius >= canvasHeight || bird.y - bird.radius <= 0) {
      handleGameOver();
      return;
    }

    frameCountRef.current += 1;
    // Add pipes
    if (frameCountRef.current % 90 === 0) {
      const gap = 120;
      const minHeight = 50;
      const maxHeight = canvasHeight - gap - minHeight;
      const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
      pipesRef.current.push({ x: canvasWidth, topHeight, gap, passed: false });
    }

    // Move pipes and check collisions
    const pipes = pipesRef.current;
    for (let i = 0; i < pipes.length; i++) {
      const p = pipes[i];
      p.x -= 2.5;

      // Check collision
      const hitPipeX = 50 + bird.radius > p.x && 50 - bird.radius < p.x + 40; // bird is fixed at x=50, pipe width=40
      const hitPipeY = bird.y - bird.radius < p.topHeight || bird.y + bird.radius > p.topHeight + p.gap;
      
      if (hitPipeX && hitPipeY) {
        handleGameOver();
        return;
      }

      if (p.x + 40 < 50 && !p.passed) {
        p.passed = true;
        setScore(prev => {
          const newScore = prev + 1;
          scoreRef.current = newScore;
          return newScore;
        });
      }
    }

    // Remove off-screen pipes
    if (pipes.length > 0 && pipes[0].x + 40 < 0) {
      pipes.shift();
    }

    drawGame();
  };

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    const reward = scoreRef.current * 2; // 2 coins per obstacle
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
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Pipes
    ctx.fillStyle = '#2ECC71'; // Green pipes
    pipesRef.current.forEach(p => {
      // Top pipe
      ctx.fillRect(p.x, 0, 40, p.topHeight);
      // Bottom pipe
      ctx.fillRect(p.x, p.topHeight + p.gap, 40, canvasHeight - p.topHeight - p.gap);
      
      // Pipe borders
      ctx.strokeStyle = '#27AE60';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, 0, 40, p.topHeight);
      ctx.strokeRect(p.x, p.topHeight + p.gap, 40, canvasHeight - p.topHeight - p.gap);
    });

    // Bird (Bọ Ú)
    ctx.fillStyle = '#FF9800'; // Orange bird
    ctx.beginPath();
    ctx.arc(50, birdRef.current.y, birdRef.current.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E65100';
    ctx.stroke();
    
    // Bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(54, birdRef.current.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(55, birdRef.current.y - 3, 1.5, 0, Math.PI * 2);
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
        <div>Thưởng: {score * 2} 💰</div>
      </div>

      <div 
        style={{ position: 'relative', width: '300px', height: '400px', border: '3px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}
        onMouseDown={jump}
        onTouchStart={jump}
      >
        <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} style={{ display: 'block' }} />

        {!isPlaying && !gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#E65100' }}>Flappy Bọ Ú 🐦</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', textAlign: 'center', color: '#555' }}>Nhấn Spacebar hoặc chạm màn hình để bay qua các ống nước.</p>
            <button onClick={(e) => { e.stopPropagation(); resetGame(); }} style={{ padding: '10px 20px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Bắt đầu</button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'red' }}>Trò Chơi Kết Thúc!</h3>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Cột đã qua: {score}</p>
            <p style={{ margin: '0 0 20px 0', color: '#4CAF50', fontWeight: 'bold' }}>Nhận: +{coinsEarned} Xu 💰</p>
            <button onClick={(e) => { e.stopPropagation(); resetGame(); }} style={{ padding: '10px 20px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Chơi lại</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlappyGame;
