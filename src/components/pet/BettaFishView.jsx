import React, { useState, useEffect, useRef } from 'react';
import './BettaFishView.css';
import { sfxClick, sfxWater, sfxFeed, sfxReward } from '../../utils/audio.js';
import { calculateLevelFromExp, getExpProgress, getTotalExpForLevel } from '../../config/levelRewards.js';

/**
 * BettaFishSVG renders a Siamese Fighting Fish (Cá Chọi Halfmoon)
 * Model details:
 * - Head is on the LEFT side (x: 50), Tail is on the RIGHT side (x: 155..258).
 * - Naturally faces WEST (Left).
 * - When swimming towards EAST (Right), transform with scaleX(-1) to face direction of movement.
 * - When swimming towards WEST (Left), transform with scaleX(1).
 */
export const BettaFishSVG = ({
  color = 'blue',
  isFlaring = false,
  isEating = false,
  isSpinning = false,
  isResting = false,
  isDead = false
}) => {
  const isBlue = color === 'blue';

  if (isDead) {
    return (
      <div className="betta-dead-wrapper">
        <div className="betta-ghost-icon">👻</div>
        <div className="betta-dead-label">R.I.P</div>
      </div>
    );
  }

  const primaryBody = isBlue ? 'url(#blueBodyGrad)' : 'url(#redBodyGrad)';
  const finMembrane = isBlue ? 'url(#blueFinMembrane)' : 'url(#redFinMembrane)';
  const finRayColor = isBlue ? '#00e5ff' : '#ffea00';
  const finGlowColor = isBlue ? 'rgba(0, 229, 255, 0.45)' : 'rgba(255, 61, 0, 0.45)';

  return (
    <svg
      className={`betta-svg ${isFlaring ? 'flaring' : ''} ${isEating ? 'eating' : ''} ${isSpinning ? 'spinning' : ''} ${isResting ? 'resting' : ''}`}
      viewBox="0 0 260 180"
      width="100%"
      height="100%"
    >
      <defs>
        {/* Blue fish gradients */}
        <radialGradient id="blueBodyGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#80d8ff" />
          <stop offset="25%" stopColor="#00b0ff" />
          <stop offset="55%" stopColor="#0091ea" />
          <stop offset="85%" stopColor="#0d47a1" />
          <stop offset="100%" stopColor="#001970" />
        </radialGradient>

        <linearGradient id="blueFinMembrane" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="20%" stopColor="#0288d1" />
          <stop offset="45%" stopColor="#1a237e" />
          <stop offset="65%" stopColor="#b71c1c" />
          <stop offset="85%" stopColor="#d32f2f" />
          <stop offset="100%" stopColor="#ff5252" />
        </linearGradient>

        {/* Red fish gradients */}
        <radialGradient id="redBodyGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ff8a80" />
          <stop offset="25%" stopColor="#ff1744" />
          <stop offset="55%" stopColor="#d50000" />
          <stop offset="85%" stopColor="#880e4f" />
          <stop offset="100%" stopColor="#311b92" />
        </radialGradient>

        <linearGradient id="redFinMembrane" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd600" />
          <stop offset="25%" stopColor="#ff6d00" />
          <stop offset="50%" stopColor="#d50000" />
          <stop offset="75%" stopColor="#c2185b" />
          <stop offset="100%" stopColor="#4a148c" />
        </linearGradient>

        {/* Scale texture filter */}
        <pattern id="fishScales" width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M 0 3.5 Q 3.5 0 7 3.5 Q 3.5 7 0 3.5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" />
        </pattern>

        <filter id="bettaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" floodColor={finGlowColor} />
        </filter>
      </defs>

      {/* ===== 1. CAUDAL FIN (HALFMOON FAN TAIL - 180 DEGREE DISPLAY) ===== */}
      <g className="betta-tail-group" filter="url(#bettaGlow)">
        <path
          className="betta-tail-membrane"
          d={
            isFlaring
              ? "M 155,90 Q 180,25 235,10 Q 262,45 264,90 Q 262,135 235,170 Q 180,155 155,90 Z"
              : "M 155,90 Q 180,45 224,30 Q 252,55 248,90 Q 252,125 224,150 Q 180,135 155,90 Z"
          }
          fill={finMembrane}
          opacity="0.95"
        />

        {/* Radiant fin rays spreading like a fan */}
        <g className="betta-tail-rays" stroke={finRayColor} strokeWidth="1.3" opacity="0.9" strokeLinecap="round">
          <line x1="155" y1="90" x2="232" y2="18" />
          <line x1="155" y1="90" x2="242" y2="32" />
          <line x1="155" y1="90" x2="250" y2="50" />
          <line x1="155" y1="90" x2="256" y2="70" />
          <line x1="155" y1="90" x2="258" y2="90" />
          <line x1="155" y1="90" x2="256" y2="110" />
          <line x1="155" y1="90" x2="250" y2="130" />
          <line x1="155" y1="90" x2="242" y2="148" />
          <line x1="155" y1="90" x2="232" y2="162" />
          {/* Secondary branching rays */}
          <line x1="195" y1="56" x2="238" y2="40" strokeWidth="0.8" opacity="0.7" />
          <line x1="195" y1="72" x2="250" y2="58" strokeWidth="0.8" opacity="0.7" />
          <line x1="200" y1="90" x2="256" y2="80" strokeWidth="0.8" opacity="0.7" />
          <line x1="200" y1="90" x2="256" y2="100" strokeWidth="0.8" opacity="0.7" />
          <line x1="195" y1="108" x2="250" y2="122" strokeWidth="0.8" opacity="0.7" />
          <line x1="195" y1="124" x2="238" y2="140" strokeWidth="0.8" opacity="0.7" />
        </g>
      </g>

      {/* ===== 2. DORSAL FIN (CREST FIN) ===== */}
      <g className="betta-dorsal-group">
        <path
          className="betta-dorsal-membrane"
          d={
            isFlaring
              ? "M 105,72 C 115,30 152,15 195,22 C 188,55 172,78 152,84 Z"
              : "M 110,75 C 120,45 148,32 178,40 C 172,62 160,78 150,84 Z"
          }
          fill={finMembrane}
          opacity="0.92"
        />
        <g stroke={finRayColor} strokeWidth="1" opacity="0.8">
          <line x1="115" y1="72" x2="130" y2="32" />
          <line x1="128" y1="74" x2="150" y2="25" />
          <line x1="140" y1="78" x2="168" y2="24" />
          <line x1="150" y1="82" x2="185" y2="28" />
        </g>
      </g>

      {/* ===== 3. ANAL FIN (BOTTOM EXTENDED FIN) ===== */}
      <g className="betta-anal-group">
        <path
          className="betta-anal-membrane"
          d={
            isFlaring
              ? "M 95,108 C 110,138 142,168 180,164 C 172,130 162,105 152,94 Z"
              : "M 100,105 C 115,128 138,150 168,146 C 162,122 158,102 150,94 Z"
          }
          fill={finMembrane}
          opacity="0.92"
        />
        <g stroke={finRayColor} strokeWidth="1" opacity="0.8">
          <line x1="105" y1="108" x2="120" y2="148" />
          <line x1="118" y1="106" x2="140" y2="158" />
          <line x1="132" y1="102" x2="158" y2="160" />
          <line x1="145" y1="98" x2="172" y2="154" />
        </g>
      </g>

      {/* ===== 4. FISH BODY & METALLIC SCALES ===== */}
      <path
        className="betta-body"
        d="M 50,90 C 50,66 85,60 125,72 C 150,78 165,85 165,90 C 165,95 150,102 125,108 C 85,120 50,114 50,90 Z"
        fill={primaryBody}
        stroke={isBlue ? '#0d47a1' : '#b71c1c'}
        strokeWidth="1.2"
      />

      <path
        d="M 68,90 C 68,72 95,66 125,74 C 145,80 155,87 155,90 C 155,93 145,100 125,106 C 95,114 68,108 68,90 Z"
        fill="url(#fishScales)"
        opacity="0.85"
      />

      {/* Shimmer spine highlight */}
      <path
        d="M 65,84 Q 105,74 145,82"
        fill="none"
        stroke={isBlue ? '#b3e5fc' : '#ffcdd2'}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Opercular gill plate (Nắp mang) — flares out when isFlaring */}
      <path
        className={`betta-gill ${isFlaring ? 'gill-flare' : ''}`}
        d={
          isFlaring
            ? "M 75,74 Q 90,90 75,106 Q 86,90 75,74 Z"
            : "M 74,77 Q 80,90 74,103"
        }
        fill={isFlaring ? (isBlue ? '#d50000' : '#00e5ff') : 'none'}
        stroke={isBlue ? '#00e5ff' : '#ff1744'}
        strokeWidth={isFlaring ? "2.5" : "2"}
        strokeLinecap="round"
      />

      {/* Eye */}
      <circle cx="62" cy="85" r="5.5" fill="#111" />
      <circle cx="62" cy="85" r="4.5" fill="#212121" />
      <circle cx="61" cy="84" r="2" fill="#fff" />
      <circle cx="64" cy="86" r="0.9" fill="#fff" opacity="0.9" />
      <circle cx="62" cy="85" r="5.5" fill="none" stroke={isBlue ? '#00e5ff' : '#ffd600'} strokeWidth="1" />

      {/* Mouth */}
      <path
        className="betta-mouth"
        d={isEating ? "M 46,94 Q 42,90 46,86" : "M 49,91 Q 46,90 51,89"}
        stroke={isBlue ? '#002171' : '#880e4f'}
        strokeWidth={isEating ? "2.5" : "1.8"}
        strokeLinecap="round"
        fill="none"
      />

      {/* ===== 5. VENTRAL FINS (RIBBON FINS) ===== */}
      <g className="betta-ventral-group">
        <path
          className="betta-ventral-fin v1"
          d="M 82,106 Q 88,138 95,168 Q 86,142 80,106 Z"
          fill={isBlue ? '#00e5ff' : '#ff5252'}
          opacity="0.9"
        />
        <path
          className="betta-ventral-fin v2"
          d="M 85,107 Q 93,142 100,172 Q 90,145 83,107 Z"
          fill={isBlue ? '#ffffff' : '#ffd600'}
          opacity="0.95"
        />
      </g>

      {/* ===== 6. PECTORAL FIN (FLUTTERING BREAST FIN) ===== */}
      <g className="betta-pectoral-group">
        <path
          className="betta-pectoral-fin"
          d="M 76,92 Q 90,96 88,105 Q 78,103 76,92 Z"
          fill={isBlue ? 'rgba(64, 196, 255, 0.75)' : 'rgba(255, 138, 128, 0.75)'}
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
};

export default function BettaFishView({
  gameState,
  setGameState,
  user,
  db,
  setDoc,
  doc,
  buyItem,
  setIsShopOpen,
  onOpenRename,
  onOpenRewards,
  showToast
}) {
  const fishTank = gameState.fishTank;

  // Local interaction & animation states
  const [isFlaring, setIsFlaring] = useState(false);
  const [hasMirror, setHasMirror] = useState(false);
  const [fallingFood, setFallingFood] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [selectedFishTab, setSelectedFishTab] = useState('both'); // 'both', 'blue', 'red'
  const [specialAction, setSpecialAction] = useState({ type: null, target: null, timestamp: 0 });
  const [bubbleNestCount, setBubbleNestCount] = useState(6);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, active: false });
  const [isGlowMode, setIsGlowMode] = useState(false);
  const [hasMossBall, setHasMossBall] = useState(false);
  const [bubbleRings, setBubbleRings] = useState([]);
  const [fallingWorms, setFallingWorms] = useState([]);
  const tankRef = useRef(null);

  // Continuous smooth swim positions & physics (No teleporting!)
  const [bluePos, setBluePos] = useState({ top: 65, left: 60, facing: 'right', angle: 3, speed: 4.2 });
  const [redPos, setRedPos] = useState({ top: 135, left: 245, facing: 'left', angle: -3, speed: 4.5 });
  const isActionActiveRef = useRef(false);

  // Smooth wander loop: picks organic waypoints when not doing special actions
  useEffect(() => {
    if (specialAction.type || isFlaring || isCleaning) {
      isActionActiveRef.current = true;
      return;
    }
    isActionActiveRef.current = false;

    const swimWander = () => {
      if (isActionActiveRef.current) return;

      setBluePos(prev => {
        const nextLeft = 30 + Math.random() * 210;
        const nextTop = 40 + Math.random() * 115;
        const deltaX = nextLeft - prev.left;
        const deltaY = nextTop - prev.top;
        const facing = deltaX >= 0 ? 'right' : 'left';
        const angle = Math.max(-12, Math.min(12, deltaY * 0.12));
        const speed = 3.6 + Math.random() * 1.6;
        return { top: nextTop, left: nextLeft, facing, angle, speed };
      });

      setRedPos(prev => {
        const nextLeft = 110 + Math.random() * 200;
        const nextTop = 60 + Math.random() * 115;
        const deltaX = nextLeft - prev.left;
        const deltaY = nextTop - prev.top;
        const facing = deltaX >= 0 ? 'right' : 'left';
        const angle = Math.max(-12, Math.min(12, deltaY * 0.12));
        const speed = 3.8 + Math.random() * 1.6;
        return { top: nextTop, left: nextLeft, facing, angle, speed };
      });
    };

    const timer = setInterval(swimWander, 4200);
    return () => clearInterval(timer);
  }, [specialAction.type, isFlaring, isCleaning]);

  // Helper to add EXP to fish with progressive scaling curve and update permanent highest level
  const addFishExp = (target, expAmount) => {
    setGameState(prev => {
      const state = { ...prev };
      if (!state.fishTank) return state;
      const tank = state.fishTank;

      const giveExp = (fish) => {
        if (!fish || fish.isDead) return;
        const currentLvl = fish.level || 0;
        const baseExp = getTotalExpForLevel(currentLvl);
        if (fish.exp === undefined || fish.exp < baseExp) {
          fish.exp = baseExp;
        }
        fish.exp += expAmount;
        const newLevel = calculateLevelFromExp(fish.exp, currentLvl);
        if (newLevel > currentLvl) {
          fish.level = newLevel;
          sfxReward();
        }
      };

      if (target === 'blue' || target === 'both') giveExp(tank.blueFish);
      if (target === 'red' || target === 'both') giveExp(tank.redFish);

      if (!state.levelRewards) state.levelRewards = { bou: { highestLevel: 0, claimed: [] }, fish: { highestLevel: 0, claimed: [] } };
      if (!state.levelRewards.fish) state.levelRewards.fish = { highestLevel: 0, claimed: [] };
      const maxLvl = Math.max(tank.blueFish?.level || 0, tank.redFish?.level || 0);
      state.levelRewards.fish.highestLevel = Math.max(state.levelRewards.fish.highestLevel || 0, maxLvl);

      if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      return state;
    });
  };

  // Adoption function
  const adoptFishTank = () => {
    sfxReward();
    setGameState(prev => {
      const state = { ...prev };
      const existingHighest = state.levelRewards?.fish?.highestLevel || 0;
      state.fishTank = {
        blueFish: {
          name: 'Cá Chọi Xanh (Thanh Long)',
          color: 'blue',
          hunger: 100,
          energy: 100,
          happiness: 100,
          health: 100,
          stress: 0,
          level: existingHighest,
          exp: getTotalExpForLevel(existingHighest),
          adoptedAt: Date.now(),
          isDead: false
        },
        redFish: {
          name: 'Cá Chọi Đỏ (Hồng Long)',
          color: 'red',
          hunger: 100,
          energy: 100,
          happiness: 100,
          health: 100,
          stress: 0,
          level: existingHighest,
          exp: getTotalExpForLevel(existingHighest),
          adoptedAt: Date.now(),
          isDead: false
        },
        tank: {
          cleanliness: 100,
          oxygen: 100,
          temperature: 26,
          filterRunning: true
        },
        state: {
          lastCleanTimestamp: Date.now(),
          lastFeedTimestamp: Date.now()
        }
      };
      if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      return state;
    });
  };

  // Re-adopt new fish if dead (300 coins) - Never resets highestLevel or claimed rewards!
  const buyNewFishTank = () => {
    buyItem(300, state => {
      const existingHighest = state.levelRewards?.fish?.highestLevel || 0;
      state.fishTank = {
        blueFish: {
          name: state.fishTank?.blueFish?.name || 'Cá Chọi Xanh (Thanh Long)',
          color: 'blue',
          hunger: 100,
          energy: 100,
          happiness: 100,
          health: 100,
          stress: 0,
          level: existingHighest,
          exp: getTotalExpForLevel(existingHighest),
          adoptedAt: Date.now(),
          isDead: false
        },
        redFish: {
          name: state.fishTank?.redFish?.name || 'Cá Chọi Đỏ (Hồng Long)',
          color: 'red',
          hunger: 100,
          energy: 100,
          happiness: 100,
          health: 100,
          stress: 0,
          level: existingHighest,
          exp: getTotalExpForLevel(existingHighest),
          adoptedAt: Date.now(),
          isDead: false
        },
        tank: {
          cleanliness: 100,
          oxygen: 100,
          temperature: 26,
          filterRunning: true
        },
        state: {
          lastCleanTimestamp: Date.now(),
          lastFeedTimestamp: Date.now()
        }
      };
    });
  };

  // Feed action with fast strike bite animation
  const handleFeed = (target = 'both') => {
    buyItem(10, state => {
      const tank = state.fishTank;
      if (!tank) return;

      if (target === 'blue' || target === 'both') {
        if (tank.blueFish && !tank.blueFish.isDead) {
          tank.blueFish.hunger = Math.min(100, tank.blueFish.hunger + 35);
          tank.blueFish.happiness = Math.min(100, tank.blueFish.happiness + 15);
        }
      }
      if (target === 'red' || target === 'both') {
        if (tank.redFish && !tank.redFish.isDead) {
          tank.redFish.hunger = Math.min(100, tank.redFish.hunger + 35);
          tank.redFish.happiness = Math.min(100, tank.redFish.happiness + 15);
        }
      }

      tank.tank.cleanliness = Math.max(0, tank.tank.cleanliness - 3);
      tank.state.lastFeedTimestamp = Date.now();
    });

    sfxFeed();
    addFishExp(target, 15);
    // Smooth surge forward towards food
    if (target === 'blue' || target === 'both') {
      setBluePos(prev => ({
        top: Math.max(35, prev.top - 15),
        left: Math.min(270, Math.max(30, prev.left + (prev.facing === 'right' ? 22 : -22))),
        facing: prev.facing,
        angle: -10,
        speed: 1.4
      }));
    }
    if (target === 'red' || target === 'both') {
      setRedPos(prev => ({
        top: Math.max(35, prev.top - 15),
        left: Math.max(80, Math.min(320, prev.left + (prev.facing === 'right' ? 22 : -22))),
        facing: prev.facing,
        angle: -10,
        speed: 1.4
      }));
    }
    // Spawn falling food pellets
    const newPellets = [
      { id: Date.now() + 1, left: 32 + Math.random() * 35 },
      { id: Date.now() + 2, left: 22 + Math.random() * 55 },
      { id: Date.now() + 3, left: 45 + Math.random() * 25 }
    ];
    setFallingFood(prev => [...prev, ...newPellets]);

    // Activate strike animation
    setSpecialAction({ type: 'strike', target, timestamp: Date.now() });

    setTimeout(() => {
      setFallingFood(prev => prev.filter(p => !newPellets.some(np => np.id === p.id)));
      setSpecialAction(prev => (prev.type === 'strike' ? { type: null, target: null, timestamp: 0 } : prev));
    }, 2800);
  };

  // Mirror display / Flaring action
  const handleMirrorFlare = () => {
    if (isFlaring || hasMirror) return;
    sfxClick();
    addFishExp('both', 20);
    setHasMirror(true);
    setIsFlaring(true);
    // Smooth glide towards center mirror facing each other
    setBluePos({ top: 88, left: 75, facing: 'right', angle: 0, speed: 2.0 });
    setRedPos({ top: 92, left: 245, facing: 'left', angle: 0, speed: 2.0 });

    setGameState(prev => {
      const state = { ...prev };
      const tank = state.fishTank;
      if (tank) {
        if (tank.blueFish && !tank.blueFish.isDead) {
          tank.blueFish.happiness = Math.min(100, tank.blueFish.happiness + 20);
          tank.blueFish.energy = Math.max(10, tank.blueFish.energy - 10);
          tank.blueFish.stress = Math.max(0, tank.blueFish.stress - 15);
        }
        if (tank.redFish && !tank.redFish.isDead) {
          tank.redFish.happiness = Math.min(100, tank.redFish.happiness + 20);
          tank.redFish.energy = Math.max(10, tank.redFish.energy - 10);
          tank.redFish.stress = Math.max(0, tank.redFish.stress - 15);
        }
        if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      }
      return state;
    });

    setTimeout(() => {
      setIsFlaring(false);
      setHasMirror(false);
    }, 4500);
  };

  // Special Animation 1: Pirouette Spin (Lộn nhào 360 độ)
  const handleSpinFish = (target = 'both') => {
    if (specialAction.type) return;
    sfxReward();
    addFishExp(target, 20);
    setSpecialAction({ type: 'spin', target, timestamp: Date.now() });

    setGameState(prev => {
      const state = { ...prev };
      const tank = state.fishTank;
      if (tank) {
        if (tank.blueFish && !tank.blueFish.isDead) tank.blueFish.happiness = Math.min(100, tank.blueFish.happiness + 15);
        if (tank.redFish && !tank.redFish.isDead) tank.redFish.happiness = Math.min(100, tank.redFish.happiness + 15);
        if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      }
      return state;
    });

    setTimeout(() => {
      setSpecialAction({ type: null, target: null, timestamp: 0 });
    }, 2500);
  };

  // Special Animation 2: Build Bubble Nest (Nhả bọt làm tổ)
  const handleBubbleNest = () => {
    if (specialAction.type) return;
    sfxWater();
    addFishExp('both', 20);
    setSpecialAction({ type: 'nest', target: 'both', timestamp: Date.now() });
    setBubbleNestCount(prev => Math.min(24, prev + 5));
    // Smoothly swim up to surface nest areas (no jump!)
    setBluePos({ top: 22, left: 65, facing: 'right', angle: -25, speed: 2.2 });
    setRedPos({ top: 22, left: 260, facing: 'left', angle: -25, speed: 2.2 });

    setGameState(prev => {
      const state = { ...prev };
      const tank = state.fishTank;
      if (tank) {
        if (tank.blueFish && !tank.blueFish.isDead) {
          tank.blueFish.happiness = Math.min(100, tank.blueFish.happiness + 25);
          tank.blueFish.stress = Math.max(0, tank.blueFish.stress - 20);
        }
        if (tank.redFish && !tank.redFish.isDead) {
          tank.redFish.happiness = Math.min(100, tank.redFish.happiness + 25);
          tank.redFish.stress = Math.max(0, tank.redFish.stress - 20);
        }
        if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      }
      return state;
    });

    setTimeout(() => {
      setSpecialAction({ type: null, target: null, timestamp: 0 });
    }, 3800);
  };

  // Special Animation 3: Rest on Plant Leaf (Tựa lá nghỉ ngơi)
  const handleRestOnLeaf = () => {
    if (specialAction.type) return;
    sfxWater();
    addFishExp('both', 15);
    setSpecialAction({ type: 'rest', target: 'both', timestamp: Date.now() });
    // Smoothly glide to leaf resting spots (no jump!)
    setBluePos({ top: 92, left: 70, facing: 'right', angle: 4, speed: 2.4 });
    setRedPos({ top: 155, left: 240, facing: 'left', angle: -4, speed: 2.4 });

    setGameState(prev => {
      const state = { ...prev };
      const tank = state.fishTank;
      if (tank) {
        if (tank.blueFish && !tank.blueFish.isDead) {
          tank.blueFish.energy = Math.min(100, tank.blueFish.energy + 25);
          tank.blueFish.stress = Math.max(0, tank.blueFish.stress - 15);
        }
        if (tank.redFish && !tank.redFish.isDead) {
          tank.redFish.energy = Math.min(100, tank.redFish.energy + 25);
          tank.redFish.stress = Math.max(0, tank.redFish.stress - 15);
        }
        if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      }
      return state;
    });

    setTimeout(() => {
      setSpecialAction({ type: null, target: null, timestamp: 0 });
    }, 4000);
  };

  // Special Interaction 4: Marimo Moss Ball (Thả bóng rêu Marimo)
  const handleRollMossBall = () => {
    if (hasMossBall) return;
    sfxReward();
    addFishExp('both', 20);
    setHasMossBall(true);
    setGameState(prev => {
      const state = { ...prev };
      const tank = state.fishTank;
      if (tank) {
        if (tank.blueFish && !tank.blueFish.isDead) tank.blueFish.happiness = Math.min(100, tank.blueFish.happiness + 20);
        if (tank.redFish && !tank.redFish.isDead) tank.redFish.happiness = Math.min(100, tank.redFish.happiness + 20);
        tank.tank.cleanliness = Math.min(100, tank.tank.cleanliness + 10);
        if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      }
      return state;
    });
    setTimeout(() => setHasMossBall(false), 8000);
  };

  // Special Interaction 5: Torus Bubble Rings (Vũ điệu vòng bọt khí)
  const handleBubbleRing = () => {
    sfxWater();
    addFishExp('both', 20);
    const newRing = { id: Date.now(), left: 20 + Math.random() * 50 };
    setBubbleRings(prev => [...prev, newRing]);
    setGameState(prev => {
      const state = { ...prev };
      const tank = state.fishTank;
      if (tank) {
        if (tank.blueFish && !tank.blueFish.isDead) tank.blueFish.happiness = Math.min(100, tank.blueFish.happiness + 15);
        if (tank.redFish && !tank.redFish.isDead) tank.redFish.happiness = Math.min(100, tank.redFish.happiness + 15);
        tank.tank.oxygen = Math.min(100, tank.tank.oxygen + 15);
        if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      }
      return state;
    });
    setTimeout(() => {
      setBubbleRings(prev => prev.filter(r => r.id !== newRing.id));
    }, 3000);
  };

  // Special Interaction 6: Live Bloodworm Treat (Thưởng trùn huyết tươi)
  const handleBloodwormTreat = () => {
    buyItem(15, state => {
      const tank = state.fishTank;
      if (!tank) return;
      if (tank.blueFish && !tank.blueFish.isDead) {
        tank.blueFish.hunger = Math.min(100, tank.blueFish.hunger + 40);
        tank.blueFish.happiness = Math.min(100, tank.blueFish.happiness + 30);
        tank.blueFish.energy = Math.min(100, tank.blueFish.energy + 15);
      }
      if (tank.redFish && !tank.redFish.isDead) {
        tank.redFish.hunger = Math.min(100, tank.redFish.hunger + 40);
        tank.redFish.happiness = Math.min(100, tank.redFish.happiness + 30);
        tank.redFish.energy = Math.min(100, tank.redFish.energy + 15);
      }
    });
    sfxFeed();
    addFishExp('both', 25);
    const newWorms = [
      { id: Date.now() + 1, left: 25 + Math.random() * 20 },
      { id: Date.now() + 2, left: 55 + Math.random() * 25 }
    ];
    setFallingWorms(prev => [...prev, ...newWorms]);
    setSpecialAction({ type: 'strike', target: 'both', timestamp: Date.now() });
    setTimeout(() => {
      setFallingWorms(prev => prev.filter(w => !newWorms.some(nw => nw.id === w.id)));
      setSpecialAction(prev => (prev.type === 'strike' ? { type: null, target: null, timestamp: 0 } : prev));
    }, 3000);
  };

  // Special Interaction 7: Toggle Glow Fluorescent Light (Đèn dạ quang huỳnh quang)
  const handleToggleGlowMode = () => {
    sfxClick();
    setIsGlowMode(prev => !prev);
  };

  // Tap on tank glass (causes ripple & curiosity)
  const handleTankClick = (e) => {
    if (!tankRef.current) return;
    const rect = tankRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sfxClick();
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    // Gently glide closest fish towards tap ripple (smooth physics)
    if (!specialAction.type && !isFlaring && !isCleaning) {
      if (x < 180) {
        setBluePos(prev => {
          const deltaX = (x - 60) - prev.left;
          const deltaY = (y - 40) - prev.top;
          return {
            top: Math.max(30, Math.min(180, y - 40)),
            left: Math.max(20, Math.min(270, x - 60)),
            facing: deltaX >= 0 ? 'right' : 'left',
            angle: Math.max(-15, Math.min(15, deltaY * 0.12)),
            speed: 2.0
          };
        });
      } else {
        setRedPos(prev => {
          const deltaX = (x - 60) - prev.left;
          const deltaY = (y - 40) - prev.top;
          return {
            top: Math.max(30, Math.min(180, y - 40)),
            left: Math.max(80, Math.min(320, x - 60)),
            facing: deltaX >= 0 ? 'right' : 'left',
            angle: Math.max(-15, Math.min(15, deltaY * 0.12)),
            speed: 2.0
          };
        });
      }
    }
  };

  // Finger/Cursor following
  const handleTankMouseMove = (e) => {
    if (!tankRef.current) return;
    const rect = tankRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y, active: true });
  };

  const handleTankMouseLeave = () => {
    setCursorPos(prev => ({ ...prev, active: false }));
  };

  // Change Water / Clean Tank (15 coins)
  const handleCleanTank = () => {
    buyItem(15, state => {
      if (state.fishTank) {
        state.fishTank.tank.cleanliness = 100;
        state.fishTank.tank.oxygen = 100;
        if (state.fishTank.blueFish) state.fishTank.blueFish.happiness = Math.min(100, state.fishTank.blueFish.happiness + 15);
        if (state.fishTank.redFish) state.fishTank.redFish.happiness = Math.min(100, state.fishTank.redFish.happiness + 15);
      }
    });
    sfxWater();
    addFishExp('both', 25);
    setIsCleaning(true);
    setTimeout(() => setIsCleaning(false), 2000);
  };

  // Toggle Bubbler / Filter — Deep immutable update + sound
  const handleToggleFilter = (e) => {
    if (e) e.stopPropagation();
    sfxClick();
    setGameState(prev => {
      if (!prev?.fishTank) return prev;
      const current = prev.fishTank.tank?.filterRunning !== false;
      const nextRunning = !current;
      const newState = {
        ...prev,
        fishTank: {
          ...prev.fishTank,
          tank: {
            ...(prev.fishTank.tank || {}),
            filterRunning: nextRunning,
            oxygen: nextRunning ? Math.min(100, (prev.fishTank.tank?.oxygen || 50) + 10) : prev.fishTank.tank?.oxygen
          }
        }
      };
      if (user?.uid && db) setDoc(doc(db, 'users', user.uid), newState).catch(console.error);
      return newState;
    });
  };

  // Fish vet & mineral salt (40 coins)
  const handleFishVet = () => {
    buyItem(40, state => {
      if (state.fishTank) {
        if (state.fishTank.blueFish) {
          state.fishTank.blueFish.health = 100;
          state.fishTank.blueFish.stress = 0;
        }
        if (state.fishTank.redFish) {
          state.fishTank.redFish.health = 100;
          state.fishTank.redFish.stress = 0;
        }
        if (showToast) {
          showToast('Đã dưỡng muối khoáng & hồi phục 100% sức khỏe cả 2 chú cá chọi! 💊', 'success');
        }
      }
    });
    sfxReward();
    addFishExp('both', 25);
  };

  // If no fish tank adopted yet
  if (!fishTank) {
    return (
      <div className="betta-welcome-card">
        <div className="betta-welcome-icon">🐠</div>
        <h2 style={{ color: 'var(--pink-dark)', marginBottom: '10px' }}>Thủy Cung Cá Chọi Song Long 🌊</h2>
        <p style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
          Chào mừng bạn đến với bể cá thủy sinh! Bạn có thể nuôi dưỡng <strong>cặp Cá Chọi Halfmoon (Xanh & Đỏ)</strong> với vây đuôi bán nguyệt xòe 180 độ tuyệt đẹp.
          Cả 2 chú cá có chỉ số sinh tồn riêng biệt và tương tác sinh động với nhau!
        </p>
        <button className="adopt-fish-btn" onClick={adoptFishTank}>
          Nhận Nuôi Cặp Cá Chọi (Miễn phí) ✨
        </button>
      </div>
    );
  }

  const { blueFish, redFish, tank } = fishTank;
  const isFilterOn = tank?.filterRunning !== false;
  const bothDead = blueFish?.isDead && redFish?.isDead;

  return (
    <div className="betta-container">
      {/* Title Header with Levels */}
      <div className="betta-header">
        <h2 className="aquarium-title">
          <span>🌊 Bể Cá Chọi Thủy Sinh 🐠</span>
        </h2>
        <div className="fish-level-tags">
          {blueFish && (
            <span className={`fish-tag blue-tag ${blueFish.isDead ? 'dead-tag' : ''}`}>
              🔵 {blueFish.name || 'Cá Xanh'}: {blueFish.isDead ? 'Đã mất 😢' : `LV ${blueFish.level || 0}`}
              {!blueFish.isDead && onOpenRename && (
                <button
                  className="rename-mini-btn"
                  onClick={() => onOpenRename('blueFish', blueFish.name || 'Cá Chọi Xanh (Thanh Long)')}
                  title="Đổi tên Cá Xanh"
                >
                  ✏️
                </button>
              )}
            </span>
          )}
          {redFish && (
            <span className={`fish-tag red-tag ${redFish.isDead ? 'dead-tag' : ''}`}>
              🔴 {redFish.name || 'Cá Đỏ'}: {redFish.isDead ? 'Đã mất 😢' : `LV ${redFish.level || 0}`}
              {!redFish.isDead && onOpenRename && (
                <button
                  className="rename-mini-btn"
                  onClick={() => onOpenRename('redFish', redFish.name || 'Cá Chọi Đỏ (Hồng Long)')}
                  title="Đổi tên Cá Đỏ"
                >
                  ✏️
                </button>
              )}
            </span>
          )}
          {onOpenRewards && (
            <button
              className="rewards-nav-btn"
              onClick={onOpenRewards}
              title="Xem hành trình cấp độ 500 & nhận thưởng mốc"
            >
              🏆 Thưởng Cấp
            </button>
          )}
        </div>

        {/* Fish EXP Progress Track */}
        <div className="fish-exp-row">
          {blueFish && !blueFish.isDead && (() => {
            const bp = getExpProgress(blueFish.exp, blueFish.level || 0);
            return (
              <div className="fish-exp-track" title={`Cá Xanh: ${bp.currentLevelExp}/${bp.expNeeded} EXP`}>
                <div className="fish-exp-info">
                  <span>🔵 {blueFish.name || 'Cá Xanh'}</span>
                  <strong>{bp.currentLevelExp}/{bp.expNeeded} EXP ({bp.percent}%)</strong>
                </div>
                <div className="fish-exp-bar">
                  <div className="fish-exp-fill blue-fill" style={{ width: `${bp.percent}%` }}></div>
                </div>
              </div>
            );
          })()}
          {redFish && !redFish.isDead && (() => {
            const rp = getExpProgress(redFish.exp, redFish.level || 0);
            return (
              <div className="fish-exp-track" title={`Cá Đỏ: ${rp.currentLevelExp}/${rp.expNeeded} EXP`}>
                <div className="fish-exp-info">
                  <span>🔴 {redFish.name || 'Cá Đỏ'}</span>
                  <strong>{rp.currentLevelExp}/{rp.expNeeded} EXP ({rp.percent}%)</strong>
                </div>
                <div className="fish-exp-bar">
                  <div className="fish-exp-fill red-fill" style={{ width: `${rp.percent}%` }}></div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* AQUARIUM GLASS TANK VIEW */}
      <div
        className={`aquarium-tank ${isCleaning ? 'cleaning-active' : ''} ${isGlowMode ? 'glow-mode' : ''}`}
        ref={tankRef}
        onClick={handleTankClick}
        onMouseMove={handleTankMouseMove}
        onMouseLeave={handleTankMouseLeave}
        title="Nhấn vào bể để gõ kính, hoặc rê chuột để cá bơi theo ngón tay!"
      >
        {/* Glow mode fluorescent overlay */}
        {isGlowMode && <div className="glow-mode-overlay"></div>}

        {/* Water Surface Light Caustics & Sunbeams */}
        <div className="tank-water-surface"></div>
        <div className="tank-caustics"></div>
        <div className="tank-godrays">
          <div className="ray r1"></div>
          <div className="ray r2"></div>
          <div className="ray r3"></div>
        </div>

        {/* Floating Water Lettuce (Bèo Nhật trên mặt nước) */}
        <div className="floating-lettuce fl1">
          <div className="lettuce-pad"></div>
          <div className="water-roots"></div>
        </div>
        <div className="floating-lettuce fl2">
          <div className="lettuce-pad"></div>
          <div className="water-roots"></div>
        </div>
        <div className="floating-lettuce fl3">
          <div className="lettuce-pad"></div>
          <div className="water-roots"></div>
        </div>

        {/* Rolling Marimo Moss Ball */}
        {hasMossBall && (
          <div className="moss-ball-roll" title="Bóng rêu Marimo đang lăn tròn">
            <div className="marimo-core"></div>
            <div className="marimo-texture"></div>
          </div>
        )}

        {/* Rising Torus Bubble Rings */}
        {bubbleRings.map(br => (
          <div key={br.id} className="bubble-ring-anim" style={{ left: `${br.left}%` }}></div>
        ))}

        {/* Falling Live Bloodworms */}
        {fallingWorms.map(worm => (
          <div key={worm.id} className="falling-worm" style={{ left: `${worm.left}%` }}>
            🪱
          </div>
        ))}

        {/* Bubble Nest (Tổ bọt cá chọi) */}
        {bubbleNestCount > 0 && (
          <div className="bubble-nest-cluster" title="Tổ bọt của cá chọi">
            {Array.from({ length: bubbleNestCount }).map((_, i) => (
              <div key={i} className={`nest-bubble nb${(i % 5) + 1}`}></div>
            ))}
            <span className="nest-label">Tổ bọt 🫧</span>
          </div>
        )}

        {/* Air Stone & Rising Bubble Column */}
        <div
          className={`air-stone-device ${isFilterOn ? 'active' : 'inactive'}`}
          onClick={handleToggleFilter}
          title={isFilterOn ? "Đá bọt đang sủi oxy (Nhấn để tắt)" : "Đá bọt tắt (Nhấn để bật)"}
        >
          <div className="air-tube"></div>
          <div className="air-stone-block">
            <div className={`stone-led ${isFilterOn ? 'led-on' : 'led-off'}`}></div>
          </div>
        </div>

        {isFilterOn && (
          <div className="bubbler-column">
            <div className="bubble b1"></div>
            <div className="bubble b2"></div>
            <div className="bubble b3"></div>
            <div className="bubble b4"></div>
            <div className="bubble b5"></div>
            <div className="bubble b6"></div>
            <div className="bubble b7"></div>
            <div className="bubble b8"></div>
          </div>
        )}

        {/* Falling Food Pellets */}
        {fallingFood.map(food => (
          <div
            key={food.id}
            className="falling-pellet"
            style={{ left: `${food.left}%` }}
          >
            <div className="pellet-dot"></div>
            <div className="pellet-bubble"></div>
          </div>
        ))}

        {/* Tap Ripple Effects */}
        {ripples.map(r => (
          <div
            key={r.id}
            className="water-ripple"
            style={{ left: r.x, top: r.y }}
          ></div>
        ))}

        {/* Center Mirror for Flaring Interaction */}
        {hasMirror && (
          <div className="aquarium-mirror">
            <div className="mirror-frame">
              <div className="mirror-glass">
                <span className="mirror-reflection">🪞</span>
              </div>
            </div>
            <div className="mirror-stand"></div>
          </div>
        )}

        {/* FISH 1: BLUE BETTA (Cá Chọi Xanh) */}
        <div
          className="fish-swimmer blue-fish-swim"
          style={{
            top: `${bluePos.top}px`,
            left: `${bluePos.left}px`,
            '--fish-speed': `${bluePos.speed}s`
          }}
          onClick={(e) => { e.stopPropagation(); handleSpinFish('blue'); }}
          title="Nhấn vào Cá Xanh để lộn nhào 360°!"
        >
          <div
            className={`fish-scaler ${
              specialAction.type === 'spin' && (specialAction.target === 'blue' || specialAction.target === 'both') ? 'spin-active' : ''
            } ${
              specialAction.type === 'nest' && (specialAction.target === 'blue' || specialAction.target === 'both') ? 'nest-active' : ''
            } ${
              specialAction.type === 'rest' && (specialAction.target === 'blue' || specialAction.target === 'both') ? 'rest-active' : ''
            } ${
              specialAction.type === 'strike' && (specialAction.target === 'blue' || specialAction.target === 'both') ? 'strike-active' : ''
            }`}
            style={{
              '--scaler-base': `scaleX(${bluePos.facing === 'right' ? -1 : 1}) rotate(${bluePos.angle}deg)`,
              transform: `scaleX(${bluePos.facing === 'right' ? -1 : 1}) rotate(${bluePos.angle}deg)`
            }}
          >
            <BettaFishSVG
              color="blue"
              isFlaring={isFlaring}
              isEating={fallingFood.length > 0}
              isSpinning={specialAction.type === 'spin' && (specialAction.target === 'blue' || specialAction.target === 'both')}
              isResting={specialAction.type === 'rest' && (specialAction.target === 'blue' || specialAction.target === 'both')}
              isDead={blueFish?.isDead}
            />
          </div>
          <div className="fish-nametag blue-nametag">
            {blueFish?.name || 'Thanh Long'}
          </div>
          {specialAction.type === 'spin' && (specialAction.target === 'blue' || specialAction.target === 'both') && <div className="special-sparkle">✨⭐✨</div>}
          {specialAction.type === 'nest' && (specialAction.target === 'blue' || specialAction.target === 'both') && <div className="special-sparkle">🫧🫧</div>}
          {specialAction.type === 'rest' && (specialAction.target === 'blue' || specialAction.target === 'both') && <div className="special-sparkle">🍃💤</div>}
        </div>

        {/* FISH 2: RED BETTA (Cá Chọi Đỏ) */}
        <div
          className="fish-swimmer red-fish-swim"
          style={{
            top: `${redPos.top}px`,
            left: `${redPos.left}px`,
            '--fish-speed': `${redPos.speed}s`
          }}
          onClick={(e) => { e.stopPropagation(); handleSpinFish('red'); }}
          title="Nhấn vào Cá Đỏ để lộn nhào 360°!"
        >
          <div
            className={`fish-scaler ${
              specialAction.type === 'spin' && (specialAction.target === 'red' || specialAction.target === 'both') ? 'spin-active' : ''
            } ${
              specialAction.type === 'nest' && (specialAction.target === 'red' || specialAction.target === 'both') ? 'nest-active' : ''
            } ${
              specialAction.type === 'rest' && (specialAction.target === 'red' || specialAction.target === 'both') ? 'rest-active' : ''
            } ${
              specialAction.type === 'strike' && (specialAction.target === 'red' || specialAction.target === 'both') ? 'strike-active' : ''
            }`}
            style={{
              '--scaler-base': `scaleX(${redPos.facing === 'right' ? -1 : 1}) rotate(${redPos.angle}deg)`,
              transform: `scaleX(${redPos.facing === 'right' ? -1 : 1}) rotate(${redPos.angle}deg)`
            }}
          >
            <BettaFishSVG
              color="red"
              isFlaring={isFlaring}
              isEating={fallingFood.length > 0}
              isSpinning={specialAction.type === 'spin' && (specialAction.target === 'red' || specialAction.target === 'both')}
              isResting={specialAction.type === 'rest' && (specialAction.target === 'red' || specialAction.target === 'both')}
              isDead={redFish?.isDead}
            />
          </div>
          <div className="fish-nametag red-nametag">
            {redFish?.name || 'Hồng Long'}
          </div>
          {specialAction.type === 'spin' && (specialAction.target === 'red' || specialAction.target === 'both') && <div className="special-sparkle">✨⭐✨</div>}
          {specialAction.type === 'nest' && (specialAction.target === 'red' || specialAction.target === 'both') && <div className="special-sparkle">🫧🫧</div>}
          {specialAction.type === 'rest' && (specialAction.target === 'red' || specialAction.target === 'both') && <div className="special-sparkle">🍃💤</div>}
        </div>

        {/* Siphon tube during cleaning */}
        {isCleaning && <div className="siphon-tube">🧹 Đang thay nước trong vắt... ✨</div>}

        {/* RICH AQUARIUM DECORATIONS */}
        <div className="aquarium-decor">
          {/* Sunken Ancient Castle in Background */}
          <div className="sunken-castle" title="Lâu đài cổ chìm dưới đáy biển">
            <div className="castle-spire c-left"></div>
            <div className="castle-spire c-main">
              <div className="castle-window"></div>
            </div>
            <div className="castle-spire c-right"></div>
            <div className="castle-arch"></div>
          </div>

          {/* Natural Aquatic Driftwood */}
          <div className="aquarium-driftwood">
            <div className="driftwood-trunk"></div>
            <div className="driftwood-branch db1">
              <div className="moss-tuft mt1"></div>
            </div>
            <div className="driftwood-branch db2">
              <div className="moss-tuft mt2"></div>
            </div>
          </div>

          {/* Broad-leaf Anubias Plant (Resting spot) */}
          <div className="anubias-leaf-bed" title="Tán lá Anubias cho cá nằm nghỉ">
            <div className="anubias-leaf al1"></div>
            <div className="anubias-leaf al2"></div>
          </div>

          {/* Multi-layered Seaweed & Hornwort */}
          <div className="seaweed s1"></div>
          <div className="seaweed s2"></div>
          <div className="seaweed s3"></div>
          <div className="seaweed s4"></div>

          {/* Colorful Corals & Swaying Anemone */}
          <div className="coral-cluster">
            <div className="coral-branch cb1"></div>
            <div className="coral-branch cb2"></div>
            <div className="coral-branch cb3"></div>
          </div>
          <div className="sea-anemone">
            <div className="tentacle t1"></div>
            <div className="tentacle t2"></div>
            <div className="tentacle t3"></div>
          </div>

          {/* Red Apple Snail & Cherry Shrimp */}
          <div className="apple-snail" title="Ốc táo đỏ dọn rêu">
            <div className="snail-shell"></div>
            <div className="snail-body"></div>
          </div>
          <div className="cherry-shrimp" title="Tép cảnh Cherry">
            <div className="shrimp-body"></div>
            <div className="shrimp-antennae"></div>
          </div>

          {/* River Pebbles & Quartz Sand */}
          <div className="river-pebbles">
            <div className="pebble pb1"></div>
            <div className="pebble pb2"></div>
            <div className="pebble pb3"></div>
            <div className="pebble pb4"></div>
          </div>
          <div className="aquarium-rock"></div>
          <div className="aquarium-gravel"></div>
        </div>
      </div>

      <div className="tap-hint">
        💡 <strong>Tương tác:</strong> Chạm bể tạo gợn sóng | Rê chuột để cá bơi theo | Nhấn vào cá để lộn nhào 360° | Nhấn máy sủi đá bọt để bật/tắt
      </div>

      {/* If both fish died from prolonged 3-day neglect */}
      {bothDead ? (
        <div className="betta-dead-box">
          <h3>Cả hai chú cá đã qua đời do lâu ngày không được chăm sóc (3 ngày).</h3>
          <p>Hãy nuôi dưỡng cặp cá chọi mới và chú ý thay nước & cho ăn định kỳ nhé!</p>
          <button className="adopt-fish-btn" onClick={buyNewFishTank}>
            Nuôi Cặp Cá Chọi Mới (300💰)
          </button>
        </div>
      ) : (
        <>
          {/* STATS SECTION WITH SWITCHER */}
          <div className="stats-box-wrapper">
            <div className="stats-tabs">
              <button
                className={`stat-tab-btn ${selectedFishTab === 'both' ? 'active' : ''}`}
                onClick={() => setSelectedFishTab('both')}
              >
                📊 Xem Cả 2 Cá
              </button>
              <button
                className={`stat-tab-btn blue-btn ${selectedFishTab === 'blue' ? 'active' : ''}`}
                onClick={() => setSelectedFishTab('blue')}
              >
                🔵 Cá Xanh
              </button>
              <button
                className={`stat-tab-btn red-btn ${selectedFishTab === 'red' ? 'active' : ''}`}
                onClick={() => setSelectedFishTab('red')}
              >
                🔴 Cá Đỏ
              </button>
            </div>

            {/* TANK ENVIRONMENT STATS */}
            <div className="tank-env-strip">
              <div className="env-metric">
                <span className="env-label">💧 Nước bể:</span>
                <span className="env-value">{Math.floor(tank?.cleanliness || 0)}%</span>
              </div>
              <div className="env-metric">
                <span className="env-label">🫧 Oxy hòa tan:</span>
                <span className="env-value">{Math.floor(tank?.oxygen || 0)}%</span>
              </div>
              <div className="env-metric">
                <span className="env-label">🌡️ Nhiệt độ:</span>
                <span className="env-value">{tank?.temperature || 26}°C</span>
              </div>
              <div className="env-metric">
                <span className="env-label">⚡ Máy sủi:</span>
                <span className={`env-value ${isFilterOn ? 'status-on' : 'status-off'}`}>
                  {isFilterOn ? '🟢 BẬT' : '🔴 TẮT'}
                </span>
              </div>
            </div>

            {/* FISH STAT BARS */}
            <div className="fish-stats-grid">
              {(selectedFishTab === 'both' || selectedFishTab === 'blue') && blueFish && (
                <div className="single-fish-card blue-card">
                  <div className="fish-card-header">
                    <h4>
                      🔵 {blueFish.name || 'Cá Chọi Xanh (Thanh Long)'}
                      {!blueFish.isDead && onOpenRename && (
                        <button
                          className="rename-mini-btn"
                          onClick={() => onOpenRename('blueFish', blueFish.name || 'Cá Chọi Xanh (Thanh Long)')}
                          title="Đổi tên"
                        >
                          ✏️
                        </button>
                      )}
                    </h4>
                    <span>LV {blueFish.level || 0}</span>
                  </div>
                  {blueFish.isDead ? (
                    <div className="fish-dead-text">Đã qua đời 😢</div>
                  ) : (
                    <>
                      <BettaStatBar label="Độ đói" value={blueFish.hunger} />
                      <BettaStatBar label="Năng lượng" value={blueFish.energy} />
                      <BettaStatBar label="Vui vẻ" value={blueFish.happiness} />
                      <BettaStatBar label="Sức khỏe" value={blueFish.health} />
                      <BettaStatBar label="Căng thẳng" value={blueFish.stress || 0} reverseColor={true} />
                    </>
                  )}
                </div>
              )}

              {(selectedFishTab === 'both' || selectedFishTab === 'red') && redFish && (
                <div className="single-fish-card red-card">
                  <div className="fish-card-header">
                    <h4>
                      🔴 {redFish.name || 'Cá Chọi Đỏ (Hồng Long)'}
                      {!redFish.isDead && onOpenRename && (
                        <button
                          className="rename-mini-btn"
                          onClick={() => onOpenRename('redFish', redFish.name || 'Cá Chọi Đỏ (Hồng Long)')}
                          title="Đổi tên"
                        >
                          ✏️
                        </button>
                      )}
                    </h4>
                    <span>LV {redFish.level || 0}</span>
                  </div>
                  {redFish.isDead ? (
                    <div className="fish-dead-text">Đã qua đời 😢</div>
                  ) : (
                    <>
                      <BettaStatBar label="Độ đói" value={redFish.hunger} />
                      <BettaStatBar label="Năng lượng" value={redFish.energy} />
                      <BettaStatBar label="Vui vẻ" value={redFish.happiness} />
                      <BettaStatBar label="Sức khỏe" value={redFish.health} />
                      <BettaStatBar label="Căng thẳng" value={redFish.stress || 0} reverseColor={true} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* INTERACTION ACTION BUTTONS */}
          <div className="betta-actions-grid">
            <button className="betta-action-btn feed-btn" onClick={() => handleFeed('both')}>
              <span className="btn-icon">🍙</span>
              <span>Rải mồi cả bể (10💰)</span>
            </button>

            <button className="betta-action-btn flare-btn" onClick={handleMirrorFlare} disabled={isFlaring}>
              <span className="btn-icon">🪞</span>
              <span>{isFlaring ? 'Đang vè mang...' : 'Gương chọi (Khoe vây)'}</span>
            </button>

            <button className="betta-action-btn spin-btn" onClick={() => handleSpinFish('both')}>
              <span className="btn-icon">🌀</span>
              <span>Lộn nhào 360° (+Vui vẻ)</span>
            </button>

            <button className="betta-action-btn nest-btn" onClick={handleBubbleNest}>
              <span className="btn-icon">🫧</span>
              <span>Nhả tổ bọt (-Stress)</span>
            </button>

            <button className="betta-action-btn rest-btn" onClick={handleRestOnLeaf}>
              <span className="btn-icon">🍃</span>
              <span>Tựa lá nghỉ (+Thể lực)</span>
            </button>

            <button className="betta-action-btn clean-btn" onClick={handleCleanTank}>
              <span className="btn-icon">🧹</span>
              <span>Thay nước bể (15💰)</span>
            </button>

            <button className="betta-action-btn moss-btn" onClick={handleRollMossBall} disabled={hasMossBall}>
              <span className="btn-icon">🟢</span>
              <span>{hasMossBall ? 'Rêu đang lăn...' : 'Bóng rêu Marimo'}</span>
            </button>

            <button className="betta-action-btn glow-btn" onClick={handleToggleGlowMode}>
              <span className="btn-icon">🏮</span>
              <span>{isGlowMode ? 'Tắt dạ quang' : 'Đèn dạ quang'}</span>
            </button>

            <button className="betta-action-btn ring-btn" onClick={handleBubbleRing}>
              <span className="btn-icon">💫</span>
              <span>Vòng bọt khí (+Oxy)</span>
            </button>

            <button className="betta-action-btn worm-btn" onClick={handleBloodwormTreat}>
              <span className="btn-icon">🪱</span>
              <span>Trùn huyết tươi (15💰)</span>
            </button>

            <button className="betta-action-btn oxy-btn" onClick={handleToggleFilter}>
              <span className="btn-icon">🫧</span>
              <span>{isFilterOn ? 'Tắt sủi oxy' : 'Bật sủi oxy'}</span>
            </button>

            <button className="betta-action-btn vet-btn" onClick={handleFishVet}>
              <span className="btn-icon">🏥</span>
              <span>Dưỡng cá & Muối (40💰)</span>
            </button>

            <button className="betta-action-btn shop-btn" onClick={() => setIsShopOpen(true)}>
              <span className="btn-icon">🛒</span>
              <span>Cửa hàng thủy sinh</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BettaStatBar({ label, value, reverseColor = false }) {
  const safeVal = Math.max(0, Math.min(100, Math.floor(value || 0)));
  let color = safeVal > 60 ? 'var(--green)' : safeVal > 30 ? 'var(--yellow)' : 'var(--red)';
  if (reverseColor) {
    color = safeVal > 70 ? 'var(--red)' : safeVal > 30 ? 'var(--yellow)' : 'var(--green)';
  }
  return (
    <div className="betta-stat-row">
      <div className="betta-stat-label">
        <span>{label}</span>
        <strong>{safeVal}%</strong>
      </div>
      <div className="betta-stat-track">
        <div
          className="betta-stat-fill"
          style={{ width: `${safeVal}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}
