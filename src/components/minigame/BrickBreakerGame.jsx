import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sfxClick, sfxMerge, sfxReward, sfxSell } from '../../utils/audio.js';
import './BrickBreakerGame.css';

const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 480;
const BRICK_ROWS = 6;
const BRICK_COLS = 6;
const BRICK_GAP = 6;
const BRICK_HEIGHT = 18;
const BRICK_TOP_OFFSET = 50;
const BRICK_WIDTH = Math.floor((CANVAS_WIDTH - 20 - (BRICK_COLS - 1) * BRICK_GAP) / BRICK_COLS);

export default function BrickBreakerGame({ onReward }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [stage, setStage] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState([]);

  // Internal mutable engine state
  const stateRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - 40, width: 80, height: 12, speed: 7 },
    balls: [{ x: CANVAS_WIDTH / 2, y: 400, vx: 2.8, vy: -3.8, radius: 7, isFireball: false }],
    bricks: [],
    powerUps: [], // falling items
    lasers: [],   // shooting beams
    particles: [],
    stage: 1,
    score: 0,
    lives: 3,
    directCoins: 0,
    isFireball: false,
    fireballTimer: 0,
    isWidePaddle: false,
    widePaddleTimer: 0,
    hasShield: false,
    isLaserPaddle: false,
    laserTimer: 0,
    gameOver: false,
    keys: { left: false, right: false }
  });

  // Generate brick layout based on stage
  const generateBricks = (currentStage) => {
    const bricks = [];
    const colors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const x = 10 + c * (BRICK_WIDTH + BRICK_GAP);
        const y = BRICK_TOP_OFFSET + r * (BRICK_HEIGHT + BRICK_GAP);

        let type = 'normal';
        let hp = 1;
        let color = colors[r % colors.length];

        const rand = Math.random();
        if (currentStage >= 2 && rand < 0.12) {
          type = 'bomb';
          color = '#ef4444';
          hp = 1;
        } else if (rand < 0.22) {
          type = 'coin';
          color = '#fbbf24';
          hp = 1;
        } else if (currentStage >= 2 && r <= 1) {
          type = 'sturdy';
          color = '#64748b';
          hp = 2;
        }

        bricks.push({
          id: `${r}-${c}`,
          r, c, x, y, width: BRICK_WIDTH, height: BRICK_HEIGHT,
          type, hp, maxHp: hp, color, isAlive: true
        });
      }
    }
    return bricks;
  };

  const initGame = useCallback(() => {
    const initialBricks = generateBricks(1);
    stateRef.current = {
      paddle: { x: CANVAS_WIDTH / 2 - 40, width: 80, height: 12, speed: 7 },
      balls: [{ x: CANVAS_WIDTH / 2, y: 400, vx: 2.8, vy: -3.8, radius: 7, isFireball: false }],
      bricks: initialBricks,
      powerUps: [],
      lasers: [],
      particles: [],
      stage: 1,
      score: 0,
      lives: 3,
      directCoins: 0,
      isFireball: false,
      fireballTimer: 0,
      isWidePaddle: false,
      widePaddleTimer: 0,
      hasShield: false,
      isLaserPaddle: false,
      laserTimer: 0,
      gameOver: false,
      keys: { left: false, right: false }
    };
    setScore(0);
    setLives(3);
    setStage(1);
    setIsGameOver(false);
    setRewardCoins(0);
    setActivePowerUps([]);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Keybindings for paddle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = true;
      } else if (e.key === ' ' || e.key === 'Enter') {
        fireLasers();
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer movement
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_WIDTH / rect.width;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = (clientX - rect.left) * scale;
    const paddle = stateRef.current.paddle;
    paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, x - paddle.width / 2));
  };

  // Fire lasers when power-up is active
  const fireLasers = () => {
    const state = stateRef.current;
    if (!state.isLaserPaddle || state.gameOver) return;
    const paddle = state.paddle;
    state.lasers.push({ x: paddle.x + 8, y: 440, vy: -7 });
    state.lasers.push({ x: paddle.x + paddle.width - 8, y: 440, vy: -7 });
    sfxClick();
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const loop = () => {
      const state = stateRef.current;
      if (state.gameOver) {
        animId = requestAnimationFrame(loop);
        return;
      }

      // 1. Move paddle via arrow keys
      if (state.keys.left) {
        state.paddle.x = Math.max(0, state.paddle.x - state.paddle.speed);
      }
      if (state.keys.right) {
        state.paddle.x = Math.min(CANVAS_WIDTH - state.paddle.width, state.paddle.x + state.paddle.speed);
      }

      // Handle power-up timers
      const activePills = [];
      if (state.isFireball) {
        state.fireballTimer--;
        activePills.push('🔥 Hỏa cầu');
        if (state.fireballTimer <= 0) state.isFireball = false;
      }
      if (state.isWidePaddle) {
        state.widePaddleTimer--;
        activePills.push('↔️ Mở rộng');
        if (state.widePaddleTimer <= 0) {
          state.isWidePaddle = false;
          state.paddle.width = 80;
        }
      }
      if (state.hasShield) {
        activePills.push('🛡️ Khiên đáy');
      }
      if (state.isLaserPaddle) {
        state.laserTimer--;
        activePills.push('⚡ Laser');
        if (state.laserTimer <= 0) state.isLaserPaddle = false;
      }
      setActivePowerUps(activePills);

      // 2. Move lasers
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const l = state.lasers[i];
        l.y += l.vy;
        if (l.y < 0) {
          state.lasers.splice(i, 1);
          continue;
        }
        // Laser hits brick
        for (const b of state.bricks) {
          if (b.isAlive && l.x >= b.x && l.x <= b.x + b.width && l.y >= b.y && l.y <= b.y + b.height) {
            b.hp -= 1;
            state.lasers.splice(i, 1);
            if (b.hp <= 0) destroyBrick(b, state);
            break;
          }
        }
      }

      // 3. Move Power-Ups
      for (let i = state.powerUps.length - 1; i >= 0; i--) {
        const p = state.powerUps[i];
        p.y += 2.2;

        // Catch by paddle
        if (
          p.y + 12 >= 445 &&
          p.y <= 457 &&
          p.x + 12 >= state.paddle.x &&
          p.x - 12 <= state.paddle.x + state.paddle.width
        ) {
          // Apply power-up
          applyPowerUp(p.type, state);
          state.powerUps.splice(i, 1);
          sfxMerge();
          continue;
        }

        if (p.y > CANVAS_HEIGHT) {
          state.powerUps.splice(i, 1);
        }
      }

      // 4. Move Balls
      for (let i = state.balls.length - 1; i >= 0; i--) {
        const ball = state.balls[i];
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Bounce off left/right walls
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = Math.abs(ball.vx);
        } else if (ball.x + ball.radius > CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - ball.radius;
          ball.vx = -Math.abs(ball.vx);
        }

        // Bounce off ceiling
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = Math.abs(ball.vy);
        }

        // Bounce off paddle
        const paddle = state.paddle;
        if (
          ball.y + ball.radius >= 445 &&
          ball.y - ball.radius <= 445 + paddle.height &&
          ball.x >= paddle.x - ball.radius &&
          ball.x <= paddle.x + paddle.width + ball.radius &&
          ball.vy > 0
        ) {
          // Calculate hit offset (-1 left edge, 0 center, +1 right edge)
          const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
          const maxAngle = (62 * Math.PI) / 180;
          const bounceAngle = hitOffset * maxAngle;
          const currentSpeed = Math.hypot(ball.vx, ball.vy);
          const speed = Math.min(6.5, Math.max(4.2, currentSpeed * 1.01));

          ball.vx = speed * Math.sin(bounceAngle);
          ball.vy = -speed * Math.cos(bounceAngle);
          ball.y = 445 - ball.radius;
          sfxClick();
        }

        // Floor bounce with shield or lose ball
        if (ball.y + ball.radius > CANVAS_HEIGHT) {
          if (state.hasShield) {
            // Shield bounces ball back once!
            ball.y = CANVAS_HEIGHT - ball.radius;
            ball.vy = -Math.abs(ball.vy);
            state.hasShield = false;
            sfxReward();
          } else {
            // Ball lost
            state.balls.splice(i, 1);
            continue;
          }
        }

        // Brick collision
        for (const b of state.bricks) {
          if (!b.isAlive) continue;

          // Check AABB collision with circle
          const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.width));
          const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.height));
          const distX = ball.x - closestX;
          const distY = ball.y - closestY;
          const distSq = distX * distX + distY * distY;

          if (distSq <= ball.radius * ball.radius) {
            // Brick hit!
            if (!state.isFireball) {
              // Standard bounce reflection
              if (Math.abs(distX) > Math.abs(distY)) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }
            }

            b.hp -= 1;
            if (b.hp <= 0) {
              destroyBrick(b, state);
            } else {
              sfxClick();
            }
            break;
          }
        }
      }

      // Check if all balls lost
      if (state.balls.length === 0) {
        state.lives -= 1;
        setLives(state.lives);

        if (state.lives <= 0) {
          // Game Over!
          state.gameOver = true;
          setIsGameOver(true);
          // Scaled coin reward: 250 points = 1 coin, max 18 coins total
          const totalEarnedCoins = Math.min(18, Math.max(1, Math.floor(state.score / 250)) + state.directCoins);
          setRewardCoins(totalEarnedCoins);
          sfxReward();
          if (onReward) onReward(totalEarnedCoins);
        } else {
          // Respawn 1 ball
          state.balls.push({
            x: state.paddle.x + state.paddle.width / 2,
            y: 400,
            vx: 2.8,
            vy: -3.8,
            radius: 7,
            isFireball: false
          });
          sfxClick();
        }
      }

      // Check Stage Clear (all breakable bricks destroyed)
      const remainingBricks = state.bricks.filter(b => b.isAlive);
      if (remainingBricks.length === 0) {
        state.stage += 1;
        setStage(state.stage);
        state.directCoins += 3; // +3 clear stage bonus (scaled down from 10)
        state.score += 1000;
        setScore(state.score);
        state.bricks = generateBricks(state.stage);
        // Reset ball to paddle
        state.balls = [{
          x: state.paddle.x + state.paddle.width / 2,
          y: 400,
          vx: 3.2,
          vy: -4.2,
          radius: 7,
          isFireball: false
        }];
        sfxReward();
      }

      // --- RENDERING CANVAS ---
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background starry night
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Render Bricks
      for (const b of state.bricks) {
        if (!b.isAlive) continue;

        ctx.save();
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 5);
        ctx.fill();

        // Shading / border
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Icon for special brick types
        if (b.type === 'bomb') {
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', b.x + b.width / 2, b.y + b.height / 2);
        } else if (b.type === 'coin') {
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💰', b.x + b.width / 2, b.y + b.height / 2);
        } else if (b.type === 'sturdy' && b.hp === 2) {
          ctx.font = '10px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', b.x + b.width / 2, b.y + b.height / 2);
        }
        ctx.restore();
      }

      // Render Paddle
      const p = state.paddle;
      ctx.save();
      const paddleGrad = ctx.createLinearGradient(p.x, 445, p.x, 445 + p.height);
      paddleGrad.addColorStop(0, state.isFireball ? '#f97316' : '#60a5fa');
      paddleGrad.addColorStop(1, state.isFireball ? '#dc2626' : '#2563eb');

      ctx.fillStyle = paddleGrad;
      ctx.shadowColor = state.isFireball ? 'rgba(239, 68, 68, 0.5)' : 'rgba(37, 99, 235, 0.4)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(p.x, 445, p.width, p.height, 6);
      ctx.fill();
      ctx.restore();

      // Render Lasers
      for (const l of state.lasers) {
        ctx.save();
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.fillRect(l.x - 2, l.y, 4, 12);
        ctx.restore();
      }

      // Render Power-Ups
      for (const pu of state.powerUps) {
        ctx.save();
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const emojiMap = {
          multiball: '🎾',
          fireball: '🔥',
          wide: '↔️',
          shield: '🛡️',
          laser: '⚡'
        };
        ctx.fillText(emojiMap[pu.type] || '⭐', pu.x, pu.y);
        ctx.restore();
      }

      // Render Floor Shield Barrier
      if (state.hasShield) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - 2);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render Balls
      for (const ball of state.balls) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

        if (state.isFireball) {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 14;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(255,255,255,0.7)';
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.restore();
      }

      // Render Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.04;
        if (pt.alpha <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onReward]);

  // Helper: Destroy a brick and drop power-ups / trigger bombs
  const destroyBrick = (brick, state) => {
    brick.isAlive = false;
    state.score += 20;
    setScore(state.score);

    // Particle burst
    for (let i = 0; i < 8; i++) {
      state.particles.push({
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: brick.color,
        alpha: 1
      });
    }

    // Bomb brick explosion
    if (brick.type === 'bomb') {
      sfxReward();
      // Explode adjacent bricks
      for (const nb of state.bricks) {
        if (nb.isAlive && Math.abs(nb.r - brick.r) <= 1 && Math.abs(nb.c - brick.c) <= 1) {
          nb.isAlive = false;
          state.score += 25;
        }
      }
    } else if (brick.type === 'coin') {
      state.directCoins += 1; // Scaled down to 1 direct coin
      sfxSell();
    } else {
      sfxClick();
    }

    // 22% Chance to drop power-up
    if (Math.random() < 0.22) {
      const types = ['multiball', 'fireball', 'wide', 'shield', 'laser'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      state.powerUps.push({
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
        type: chosen
      });
    }
  };

  // Helper: Apply power-up to state
  const applyPowerUp = (type, state) => {
    if (type === 'multiball') {
      const refBall = state.balls[0] || { x: state.paddle.x + 40, y: 400, vx: 2, vy: -3, radius: 7 };
      state.balls.push(
        { x: refBall.x, y: refBall.y, vx: -2.5, vy: -3.5, radius: 7 },
        { x: refBall.x, y: refBall.y, vx: 3.5, vy: -2.5, radius: 7 }
      );
    } else if (type === 'fireball') {
      state.isFireball = true;
      state.fireballTimer = 480; // ~8 seconds
    } else if (type === 'wide') {
      state.isWidePaddle = true;
      state.widePaddleTimer = 600; // ~10 seconds
      state.paddle.width = 120;
    } else if (type === 'shield') {
      state.hasShield = true;
    } else if (type === 'laser') {
      state.isLaserPaddle = true;
      state.laserTimer = 450; // ~7.5 seconds
    }
  };

  return (
    <div className="brick-container">
      {/* Top Header info */}
      <div className="brick-header">
        <div className="brick-score-badge">
          <div className="brick-score-label">ĐIỂM SỐ 🧱</div>
          <div className="brick-score-val">{score}</div>
        </div>

        <div className="brick-lives-panel">
          <span className="brick-stage-badge">Màn {stage}</span>
          <span className="brick-hearts">
            {'❤️'.repeat(Math.max(0, lives))}
          </span>
        </div>
      </div>

      {/* Canvas Wrap */}
      <div
        className="brick-canvas-wrap"
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onClick={fireLasers}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, display: 'block' }}
        />

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="brick-modal-overlay">
            <div className="brick-modal-card">
              <div style={{ fontSize: '50px', marginBottom: '8px' }}>💥🧱</div>
              <h3 className="brick-modal-title">KẾT THÚC LƯỢT CHƠI</h3>
              <div className="brick-modal-score">{score} điểm</div>
              <div className="brick-modal-reward">
                <span>Thưởng phá gạch:</span>
                <b>+{rewardCoins} Xu 💰</b>
              </div>
              <button className="brick-modal-btn" onClick={initGame}>
                Chơi Lại Ngay 🚀
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Power-Ups Banner */}
      {activePowerUps.length > 0 && (
        <div className="brick-powerup-bar">
          <span>Kích hoạt:</span>
          {activePowerUps.map((p, idx) => (
            <span key={idx} className="brick-powerup-pill">{p}</span>
          ))}
        </div>
      )}

      <div className="brick-footer">
        💡 <b>Cách chơi:</b> Di chuyển chuột hoặc chạm vuốt để đỡ bóng nảy phá các khối gạch. Đạt 250 điểm = 1 xu (tối đa 18 xu/ván). Nhặt các vật phẩm rơi để nhận Hỏa cầu 🔥, Đa bóng 🎾, Khiên chắn 🛡️ và Bắn Laser ⚡!
      </div>
    </div>
  );
}
