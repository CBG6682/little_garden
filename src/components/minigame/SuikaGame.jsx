import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sfxMerge, sfxReward, sfxClick } from '../../utils/audio.js';
import './SuikaGame.css';

const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 480;
const WALL_THICKNESS = 10;
const DEADLINE_Y = 72;

export const FRUIT_TIERS = [
  { tier: 0, name: 'Cherry', emoji: '🍒', radius: 14, color: '#f43f5e', score: 2 },
  { tier: 1, name: 'Dâu Tây', emoji: '🍓', radius: 20, color: '#fb7185', score: 4 },
  { tier: 2, name: 'Nho Tím', emoji: '🍇', radius: 27, color: '#a855f7', score: 8 },
  { tier: 3, name: 'Quýt Vàng', emoji: '🍊', radius: 34, color: '#f97316', score: 16 },
  { tier: 4, name: 'Hồng Đỏ', emoji: '🍎', radius: 42, color: '#ef4444', score: 32 },
  { tier: 5, name: 'Táo Xanh', emoji: '🍏', radius: 50, color: '#22c55e', score: 64 },
  { tier: 6, name: 'Lê Ngọt', emoji: '🍐', radius: 59, color: '#84cc16', score: 128 },
  { tier: 7, name: 'Đào Tiên', emoji: '🍑', radius: 69, color: '#f472b6', score: 256 },
  { tier: 8, name: 'Dứa Gai', emoji: '🍍', radius: 80, color: '#eab308', score: 512 },
  { tier: 9, name: 'Dưa Lưới', emoji: '🍈', radius: 93, color: '#4ade80', score: 1024 },
  { tier: 10, name: 'Dưa Hấu', emoji: '🍉', radius: 108, color: '#16a34a', score: 2048 }
];

export default function SuikaGame({ onReward }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);
  const [nextTier, setNextTier] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rewardCoins, setRewardCoins] = useState(0);
  const [watermelonsCreated, setWatermelonsCreated] = useState(0);
  const [nearDeadline, setNearDeadline] = useState(false);

  // Game internal mutable state refs
  const stateRef = useRef({
    fruits: [],
    particles: [],
    pointerX: CANVAS_WIDTH / 2,
    canDrop: true,
    dropCooldown: 0,
    currentTier: 0,
    nextTier: 1,
    score: 0,
    gameOver: false,
    dangerTimer: 0,
    watermelons: 0
  });

  const getRandomDropTier = () => {
    // Only drop smaller tiers (0 to 3)
    const weights = [0.45, 0.3, 0.18, 0.07];
    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (r <= sum) return i;
    }
    return 0;
  };

  const initGame = useCallback(() => {
    const cTier = getRandomDropTier();
    const nTier = getRandomDropTier();
    stateRef.current = {
      fruits: [],
      particles: [],
      pointerX: CANVAS_WIDTH / 2,
      canDrop: true,
      dropCooldown: 0,
      currentTier: cTier,
      nextTier: nTier,
      score: 0,
      gameOver: false,
      overflowTimer: 0,
      watermelons: 0
    };
    setCurrentTier(cTier);
    setNextTier(nTier);
    setScore(0);
    setIsGameOver(false);
    setRewardCoins(0);
    setWatermelonsCreated(0);
    setNearDeadline(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Drop current fruit
  const handleDrop = useCallback(() => {
    const state = stateRef.current;
    if (!state.canDrop || state.gameOver) return;

    const tierInfo = FRUIT_TIERS[state.currentTier];
    const minX = WALL_THICKNESS + tierInfo.radius;
    const maxX = CANVAS_WIDTH - WALL_THICKNESS - tierInfo.radius;
    const dropX = Math.max(minX, Math.min(maxX, state.pointerX));

    const newFruit = {
      id: Date.now() + Math.random(),
      x: dropX,
      y: 45,
      vx: 0,
      vy: 1.5,
      tier: state.currentTier,
      radius: tierInfo.radius,
      color: tierInfo.color,
      age: 0,
      squishX: 1,
      squishY: 1
    };

    state.fruits.push(newFruit);
    sfxClick();

    // Advance tiers
    const nextDrop = state.nextTier;
    const upcomingDrop = getRandomDropTier();
    state.currentTier = nextDrop;
    state.nextTier = upcomingDrop;
    state.canDrop = false;
    state.dropCooldown = 32; // frames (~0.5s)
    setCurrentTier(nextDrop);
    setNextTier(upcomingDrop);
  }, []);

  // Pointer interactions
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_WIDTH / rect.width;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = (clientX - rect.left) * scale;
    stateRef.current.pointerX = x;
  };

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const loop = () => {
      const state = stateRef.current;

      // Drop cooldown
      if (!state.canDrop && !state.gameOver) {
        state.dropCooldown--;
        if (state.dropCooldown <= 0) {
          state.canDrop = true;
        }
      }

      // Physics sub-stepping (4 steps per frame for high stability)
      const SUB_STEPS = 4;
      const dt = 1 / SUB_STEPS;
      const gravity = 0.38 * dt;

      for (let step = 0; step < SUB_STEPS; step++) {
        // Integrate position & velocity
        for (let i = 0; i < state.fruits.length; i++) {
          const f = state.fruits[i];
          f.vy += gravity;
          f.x += f.vx * dt;
          f.y += f.vy * dt;

          // Air resistance / friction
          f.vx *= Math.pow(0.992, dt);
          f.vy *= Math.pow(0.996, dt);

          // Floor boundary
          const floorY = CANVAS_HEIGHT - WALL_THICKNESS;
          if (f.y + f.radius > floorY) {
            f.y = floorY - f.radius;
            f.vy = -f.vy * 0.22;
            f.vx *= 0.94;
            if (Math.abs(f.vy) < 0.2) f.vy = 0;
          }

          // Left wall
          const leftX = WALL_THICKNESS + f.radius;
          if (f.x < leftX) {
            f.x = leftX;
            f.vx = -f.vx * 0.3;
          }

          // Right wall
          const rightX = CANVAS_WIDTH - WALL_THICKNESS - f.radius;
          if (f.x > rightX) {
            f.x = rightX;
            f.vx = -f.vx * 0.3;
          }
        }

        // Fruit-to-Fruit Collisions & Merging
        const toRemove = new Set();
        const toAdd = [];

        for (let i = 0; i < state.fruits.length; i++) {
          const a = state.fruits[i];
          if (toRemove.has(a.id)) continue;

          for (let j = i + 1; j < state.fruits.length; j++) {
            const b = state.fruits[j];
            if (toRemove.has(b.id)) continue;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.hypot(dx, dy);
            const minDist = a.radius + b.radius;

            if (dist < minDist && dist > 0.0001) {
              // MERGE CHECK: Same tier and not already max tier
              if (a.tier === b.tier && a.tier < FRUIT_TIERS.length - 1) {
                toRemove.add(a.id);
                toRemove.add(b.id);

                const nextT = a.tier + 1;
                const nextInfo = FRUIT_TIERS[nextT];
                const midX = (a.x + b.x) / 2;
                const midY = (a.y + b.y) / 2;

                toAdd.push({
                  id: Date.now() + Math.random(),
                  x: midX,
                  y: midY,
                  vx: (a.vx + b.vx) * 0.35,
                  vy: Math.min(-1.5, (a.vy + b.vy) * 0.35),
                  tier: nextT,
                  radius: nextInfo.radius,
                  color: nextInfo.color,
                  age: 45,
                  squishX: 1.25,
                  squishY: 0.8
                });

                // Scoring
                state.score += nextInfo.score;
                setScore(state.score);

                // Watermelon celebration
                if (nextT === 10) {
                  state.watermelons++;
                  setWatermelonsCreated(state.watermelons);
                  sfxReward();
                } else {
                  sfxMerge();
                }

                // Burst particles
                for (let p = 0; p < 12; p++) {
                  const angle = Math.random() * Math.PI * 2;
                  const speed = 1.5 + Math.random() * 3.5;
                  state.particles.push({
                    x: midX,
                    y: midY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: nextInfo.color,
                    size: 3 + Math.random() * 4,
                    alpha: 1,
                    life: 25
                  });
                }
                break;
              }

              // Normal Elastic Push Collisions
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              // Mass based on radius
              const massA = a.radius;
              const massB = b.radius;
              const totalMass = massA + massB;
              const ratioA = massB / totalMass;
              const ratioB = massA / totalMass;

              a.x -= nx * overlap * ratioA;
              a.y -= ny * overlap * ratioA;
              b.x += nx * overlap * ratioB;
              b.y += ny * overlap * ratioB;

              // Velocity adjustment along normal
              const rvx = b.vx - a.vx;
              const rvy = b.vy - a.vy;
              const velAlongNormal = rvx * nx + rvy * ny;

              if (velAlongNormal < 0) {
                const restitution = 0.22;
                const impulse = -(1 + restitution) * velAlongNormal / (1 / massA + 1 / massB);
                a.vx -= (impulse / massA) * nx;
                a.vy -= (impulse / massA) * ny;
                b.vx += (impulse / massB) * nx;
                b.vy += (impulse / massB) * ny;

                // Tangent friction (rolling effect)
                const tx = -ny;
                const ty = nx;
                const velAlongTangent = rvx * tx + rvy * ty;
                const frictionImpulse = -velAlongTangent * 0.15;
                a.vx -= (frictionImpulse / massA) * tx;
                a.vy -= (frictionImpulse / massA) * ty;
                b.vx += (frictionImpulse / massB) * tx;
                b.vy += (frictionImpulse / massB) * ty;
              }
            }
          }
        }

        // Apply removals and additions
        if (toRemove.size > 0) {
          state.fruits = state.fruits.filter(f => !toRemove.has(f.id));
        }
        if (toAdd.length > 0) {
          state.fruits.push(...toAdd);
        }
      }

      // Increment age of all fruits
      for (const f of state.fruits) {
        f.age = (f.age || 0) + 1;
      }

      // Check Overflow / Game Over:
      // Any mature fruit (age > 45 ~ 0.75s after drop) whose top edge breaches DEADLINE_Y
      let isOverflowing = false;
      for (const f of state.fruits) {
        if ((f.age || 0) > 45 && f.y - f.radius < DEADLINE_Y) {
          isOverflowing = true;
          break;
        }
      }

      if (isOverflowing && !state.gameOver) {
        state.overflowTimer = (state.overflowTimer || 0) + 1;
        setNearDeadline(true);

        // 90 frames (~1.5s sustained overflow) triggers GAME OVER!
        if (state.overflowTimer >= 90) {
          state.gameOver = true;
          setIsGameOver(true);
          // Scaled coin reward: 300 points = 1 coin, max 15 coins
          const coins = Math.min(15, Math.max(1, Math.floor(state.score / 300)));
          setRewardCoins(coins);
          sfxReward();
          if (onReward) onReward(coins);
        }
      } else {
        state.overflowTimer = Math.max(0, (state.overflowTimer || 0) - 2);
        if (state.overflowTimer === 0) {
          setNearDeadline(false);
        }
      }

      // --- RENDERING CANVAS ---
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background soft grid / texture
      ctx.fillStyle = '#fffdfa';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Boundary box walls
      ctx.fillStyle = '#fde68a';
      // Left wall
      ctx.fillRect(0, 0, WALL_THICKNESS, CANVAS_HEIGHT);
      // Right wall
      ctx.fillRect(CANVAS_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, CANVAS_HEIGHT);
      // Bottom floor
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, CANVAS_HEIGHT - WALL_THICKNESS, CANVAS_WIDTH, WALL_THICKNESS);

      // Deadline dashed line with danger intensity
      ctx.save();
      const isDangerous = state.overflowTimer > 0;
      ctx.strokeStyle = isDangerous ? '#ef4444' : '#cbd5e1';
      ctx.lineWidth = isDangerous ? 3 : 1.5;
      ctx.setLineDash(isDangerous ? [4, 4] : [6, 5]);
      ctx.beginPath();
      ctx.moveTo(WALL_THICKNESS, DEADLINE_Y);
      ctx.lineTo(CANVAS_WIDTH - WALL_THICKNESS, DEADLINE_Y);
      ctx.stroke();

      if (isDangerous) {
        const secondsLeft = Math.max(1, Math.ceil((90 - state.overflowTimer) / 60));
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`⚠️ TRÀN BÌNH: ${secondsLeft}s`, CANVAS_WIDTH - WALL_THICKNESS - 4, DEADLINE_Y - 5);
      }
      ctx.restore();

      // Dropper guide line & fruit preview at top
      if (state.canDrop && !state.gameOver) {
        const curInfo = FRUIT_TIERS[state.currentTier];
        const minX = WALL_THICKNESS + curInfo.radius;
        const maxX = CANVAS_WIDTH - WALL_THICKNESS - curInfo.radius;
        const curX = Math.max(minX, Math.min(maxX, state.pointerX));

        // Dotted drop line
        ctx.save();
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(curX, 45);
        ctx.lineTo(curX, CANVAS_HEIGHT - WALL_THICKNESS);
        ctx.stroke();
        ctx.restore();

        // Dropper fruit preview
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(curX, 40, curInfo.radius, 0, Math.PI * 2);
        ctx.fillStyle = curInfo.color;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Emoji
        ctx.font = `${Math.floor(curInfo.radius * 1.15)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(curInfo.emoji, curX, 40);
        ctx.restore();
      }

      // Render Fallen Fruits
      for (const f of state.fruits) {
        const info = FRUIT_TIERS[f.tier];

        // Smooth squish recovery
        f.squishX += (1 - f.squishX) * 0.1;
        f.squishY += (1 - f.squishY) * 0.1;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.scale(f.squishX, f.squishY);

        // Body gradient
        const grad = ctx.createRadialGradient(-f.radius * 0.3, -f.radius * 0.3, f.radius * 0.1, 0, 0, f.radius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, info.color);
        grad.addColorStop(1, info.color);

        ctx.beginPath();
        ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0,0,0,0.12)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fill();

        // Inner border highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = Math.max(1.5, f.radius * 0.05);
        ctx.stroke();

        // Emoji face/representation
        ctx.font = `${Math.floor(f.radius * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info.emoji, 0, 0);

        ctx.restore();
      }

      // Render Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // particle gravity
        p.alpha -= 1 / p.life;

        if (p.alpha <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onReward]);

  const currentInfo = FRUIT_TIERS[currentTier] || FRUIT_TIERS[0];
  const nextInfo = FRUIT_TIERS[nextTier] || FRUIT_TIERS[1];

  return (
    <div className="suika-container">
      {/* Top Header stats */}
      <div className="suika-header">
        <div className="suika-score-box">
          <div className="suika-score-title">ĐIỂM SỐ 🍉</div>
          <div className="suika-score-val">{score}</div>
        </div>

        <div className="suika-next-box">
          <div className="suika-next-label">Tiếp theo:</div>
          <div className="suika-next-preview" title={`${nextInfo.name} (${nextInfo.emoji})`}>
            {nextInfo.emoji}
          </div>
        </div>
      </div>

      {/* Canvas Wrap */}
      <div
        className="suika-canvas-wrap"
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onClick={handleDrop}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px`, display: 'block' }}
        />

        {nearDeadline && (
          <div className="suika-danger-banner">
            ⚠️ NGUY HIỂM: SẮP TRÀN BÌNH ⚠️
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="suika-modal-overlay">
            <div className="suika-modal-card">
              <div className="suika-modal-icon">
                {watermelonsCreated > 0 ? '🍉🎉' : '💥'}
              </div>
              <h3 className="suika-modal-title">KẾT THÚC LƯỢT CHƠI</h3>
              <div className="suika-modal-score">{score} điểm</div>
              {watermelonsCreated > 0 && (
                <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#16a34a', fontWeight: 'bold' }}>
                  Đã tạo thành công {watermelonsCreated} quả Dưa Hấu Khổng Lồ!
                </p>
              )}
              <div className="suika-modal-reward">
                <span>Thưởng:</span>
                <b>+{rewardCoins} Xu 💰</b>
              </div>
              <button className="suika-modal-btn" onClick={initGame}>
                Chơi Lại Ngay 🍉
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evolution Chart */}
      <div className="suika-evolution-chart" title="Thứ tự tiến hóa trái cây">
        {FRUIT_TIERS.map((tier, idx) => (
          <React.Fragment key={tier.tier}>
            <span style={{ fontSize: '17px' }}>{tier.emoji}</span>
            {idx < FRUIT_TIERS.length - 1 && <span className="suika-chart-arrow">➔</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="suika-footer-tips">
        💡 <b>Cách chơi:</b> Rê chuột / lướt ngón tay chọn vị trí rồi chạm để thả trái cây. Ghép 2 quả giống nhau sẽ hợp nhất thành quả lớn hơn! Đạt 300 điểm = 1 xu (tối đa 15 xu/ván). Trái cây tràn qua vạch đỏ quá 1.5s sẽ kết thúc trò chơi!
      </div>
    </div>
  );
}
