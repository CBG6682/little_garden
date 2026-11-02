import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import { db } from './config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { offlineReconcile } from './utils/offlineReconcile.js';
import BoUAvatar from './components/pet/BoUAvatar.jsx';
import PlantAvatar from './components/plant/PlantAvatar.jsx';
import BettaFishView from './components/pet/BettaFishView.jsx';
import Game2048 from './components/minigame/Game2048.jsx';
import MemoryGame from './components/minigame/MemoryGame.jsx';
import SnakeGame from './components/minigame/SnakeGame.jsx';
import PongGame from './components/minigame/PongGame.jsx';
import FlappyGame from './components/minigame/FlappyGame.jsx';
import TetrisGame from './components/minigame/TetrisGame.jsx';
import MinesweeperGame from './components/minigame/MinesweeperGame.jsx';
import BlockBlastGame from './components/minigame/BlockBlastGame.jsx';
import SuikaGame from './components/minigame/SuikaGame.jsx';
import TripleTownGame from './components/minigame/TripleTownGame.jsx';
import BrickBreakerGame from './components/minigame/BrickBreakerGame.jsx';
import PlantTab from './components/PlantTab.jsx';
import ShopModal from './components/shop/ShopModal.jsx';
import RenameModal from './components/common/RenameModal.jsx';
import LevelRewardsModal from './components/common/LevelRewardsModal.jsx';
import Toast from './components/common/Toast.jsx';
import { BOU_LEVEL_REWARDS, FISH_LEVEL_REWARDS, calculateLevelFromExp, getExpProgress, getTotalExpForLevel } from './config/levelRewards.js';
import { PLANT_PROFILES, getSeedPrice, getPlantSellPrice } from './config/plantProfiles.js';
import { sfxClick, sfxWater, sfxFeed, sfxReward, sfxEquip, sfxSell, startBGM, setMuted, getMuted } from './utils/audio.js';
import './App.css';

const defaultGameState = {
  profile: { lastSaveTimestamp: Date.now() },
  currency: { coins: 100 },
  pet: null,
  fishTank: null,
  plants: [],
  weather: { current: "sunny" },
  inventory: { seeds: {}, medicine: 0, fertilizer: 0, cosmetics: [], tools: { growLight: 0, smart_hygrometer: 0, mozart_speaker: 0 } },
  activeCosmetics: { petHat: null, plantPots: {} },
  levelRewards: {
    bou: { highestLevel: 0, claimed: [] },
    fish: { highestLevel: 0, claimed: [] }
  }
};

export default function App() {
  const { user, login, logout, loading: authLoading } = useContext(AuthContext);
  const [gameState, setGameState] = useState(null);
  const [activeTab, setActiveTab] = useState('pet'); // 'pet', 'plants', 'game', 'inventory'
  const [selectedGame, setSelectedGame] = useState(null); // null = hub, '2048', 'memory'
  const [loading, setLoading] = useState(true);

  // Animation States
  const [isEating, setIsEating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [isGrooming, setIsGrooming] = useState(false);
  const [isPlayingBall, setIsPlayingBall] = useState(false);
  const [isLullaby, setIsLullaby] = useState(false);
  const [isTrick, setIsTrick] = useState(false);
  const [snapFlash, setSnapFlash] = useState(false);
  const [polaroidPhoto, setPolaroidPhoto] = useState(null);
  const [wateringStates, setWateringStates] = useState({});
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [selectedPlantIdx, setSelectedPlantIdx] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [inventoryCategory, setInventoryCategory] = useState('all'); // 'all', 'hat', 'pot', 'special'

  // Toast Notification System
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info', icon = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };
  const handleDismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Renaming & Level 500 Rewards States
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState({ type: 'bou', currentName: '' });
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);

  // Helper to open Rename Modal
  const handleOpenRename = (targetType, currentName) => {
    setRenameTarget({ type: targetType, currentName: currentName || '' });
    setIsRenameOpen(true);
  };

  // Helper to save new name into gameState
  const handleSavePetName = (newName, targetType) => {
    setGameState(prev => {
      const state = { ...prev };
      if (targetType === 'bou') {
        if (state.pet) state.pet.name = newName;
      } else if (targetType === 'blueFish') {
        if (state.fishTank?.blueFish) state.fishTank.blueFish.name = newName;
      } else if (targetType === 'redFish') {
        if (state.fishTank?.redFish) state.fishTank.redFish.name = newName;
      }
      if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      return state;
    });
  };

  // Helper to add EXP to Pet (Bọ Ú) with progressive curve and update permanent Level 500 roadmap
  const addPetExp = (amount) => {
    setGameState(prev => {
      const state = { ...prev };
      if (!state.pet || state.pet.isDead) return state;
      const currentLvl = state.pet.level || 0;
      const baseExp = getTotalExpForLevel(currentLvl);
      if (state.pet.exp === undefined || state.pet.exp < baseExp) {
        state.pet.exp = baseExp;
      }
      state.pet.exp += amount;
      const newLevel = calculateLevelFromExp(state.pet.exp, currentLvl);
      if (newLevel > currentLvl) {
        state.pet.level = newLevel;
        sfxReward();
        showToast(`🎉 Bọ Ú đã lên Cấp ${newLevel}! Nhận thưởng mốc trong mục Cúp!`, 'success');
      }
      if (!state.levelRewards) state.levelRewards = { bou: { highestLevel: 0, claimed: [] }, fish: { highestLevel: 0, claimed: [] } };
      if (!state.levelRewards.bou) state.levelRewards.bou = { highestLevel: 0, claimed: [] };
      state.levelRewards.bou.highestLevel = Math.max(state.levelRewards.bou.highestLevel || 0, state.pet.level);

      if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      return state;
    });
  };

  // Helper to claim milestone rewards
  const handleClaimReward = (track, milestoneLevel) => {
    setGameState(prev => {
      const state = { ...prev };
      if (!state.levelRewards) state.levelRewards = { bou: { highestLevel: 0, claimed: [] }, fish: { highestLevel: 0, claimed: [] } };
      if (!state.levelRewards[track]) state.levelRewards[track] = { highestLevel: 0, claimed: [] };
      if (state.levelRewards[track].claimed.includes(milestoneLevel)) return state;

      const rewardList = track === 'bou' ? BOU_LEVEL_REWARDS : FISH_LEVEL_REWARDS;
      const milestone = rewardList.find(m => m.level === milestoneLevel);
      if (!milestone) return state;

      if (milestone.coins) {
        state.currency.coins += milestone.coins;
      }
      if (milestone.cosmeticId) {
        if (!state.inventory) state.inventory = { seeds: {}, medicine: 0, fertilizer: 0, cosmetics: [], tools: { growLight: 0 } };
        if (!state.inventory.cosmetics) state.inventory.cosmetics = [];
        if (!state.inventory.cosmetics.includes(milestone.cosmeticId)) {
          state.inventory.cosmetics = [...state.inventory.cosmetics, milestone.cosmeticId];
        }
      }
      state.levelRewards[track].claimed = [...state.levelRewards[track].claimed, milestoneLevel];
      if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      return state;
    });
  };

  // Helper to claim ALL ready rewards in a track
  const handleClaimAllRewards = (track) => {
    setGameState(prev => {
      const state = { ...prev };
      if (!state.levelRewards) state.levelRewards = { bou: { highestLevel: 0, claimed: [] }, fish: { highestLevel: 0, claimed: [] } };
      if (!state.levelRewards[track]) state.levelRewards[track] = { highestLevel: 0, claimed: [] };

      const currentLvl = track === 'bou'
        ? Math.max(state.pet?.level || 0, state.levelRewards.bou.highestLevel || 0)
        : Math.max(state.fishTank?.blueFish?.level || 0, state.fishTank?.redFish?.level || 0, state.levelRewards.fish.highestLevel || 0);

      const rewardList = track === 'bou' ? BOU_LEVEL_REWARDS : FISH_LEVEL_REWARDS;
      const ready = rewardList.filter(m => currentLvl >= m.level && !state.levelRewards[track].claimed.includes(m.level));
      if (ready.length === 0) return state;

      let totalCoins = 0;
      const newCosmetics = [];

      ready.forEach(m => {
        if (m.coins) totalCoins += m.coins;
        if (m.cosmeticId && !state.inventory?.cosmetics?.includes(m.cosmeticId)) {
          newCosmetics.push(m.cosmeticId);
        }
        state.levelRewards[track].claimed.push(m.level);
      });

      state.currency.coins += totalCoins;
      if (newCosmetics.length > 0) {
        if (!state.inventory) state.inventory = { seeds: {}, medicine: 0, fertilizer: 0, cosmetics: [], tools: { growLight: 0 } };
        if (!state.inventory.cosmetics) state.inventory.cosmetics = [];
        state.inventory.cosmetics = [...state.inventory.cosmetics, ...newCosmetics];
      }

      if (user && db) setDoc(doc(db, 'users', user.uid), state).catch(console.error);
      return state;
    });
  };

  // Start BGM on first user interaction
  useEffect(() => {
    const initBGM = () => { startBGM(); document.removeEventListener('click', initBGM); };
    document.addEventListener('click', initBGM);
    return () => document.removeEventListener('click', initBGM);
  }, []);

  // No longer using click-outside deselect for the permanent Care Station

  // Timezone logic
  const getIsDaytime = () => {
    const date = new Date();
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const vnTime = new Date(utc + (3600000 * 7));
    const hours = vnTime.getHours();
    return hours >= 6 && hours < 18;
  };
  const [isDay, setIsDay] = useState(getIsDaytime());

  useEffect(() => {
    const timer = setInterval(() => setIsDay(getIsDaytime()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      setGameState(null);
      setLoading(false);
      return;
    }

    const initGame = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        let data;
        if (docSnap.exists()) {
          data = offlineReconcile(docSnap.data(), Date.now());
          if (!data.inventory) data.inventory = { seeds: {}, medicine: 0, fertilizer: 0, cosmetics: [], tools: { growLight: 0 } };
          if (!data.inventory.tools) data.inventory.tools = { growLight: 0 };
          if (!data.activeCosmetics) data.activeCosmetics = { petHat: null, plantPots: {} };
          if (data.pet && data.pet.mental.boredom === undefined) data.pet.mental.boredom = 0;
          if (data.pet && !data.pet.physical) data.pet.physical = { fitness: 50 };
          if (data.fishTank === undefined) data.fishTank = null;
        } else {
          data = { ...defaultGameState, profile: { lastSaveTimestamp: Date.now() } };
          await setDoc(docRef, data);
        }

        setGameState(data);
      } catch (err) {
        console.error("Failed to load game data:", err);
      }
      setLoading(false);
    };

    initGame();
  }, [user]);

  useEffect(() => {
    if (!user || !gameState) return;

    const interval = setInterval(() => {
      setGameState(prevState => {
        const newState = offlineReconcile(prevState, Date.now());
        setDoc(doc(db, 'users', user.uid), newState).catch(console.error);
        return newState;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [user, gameState]);

  useEffect(() => {
    if (!gameState || !gameState.pet || gameState.pet.state.isSleeping) return;
    const runTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsRunning(true);
        setTimeout(() => setIsRunning(false), 5000);
      }
    }, 15000);
    return () => clearInterval(runTimer);
  }, [gameState?.pet?.state?.isSleeping]);

  if (authLoading || loading) return (
    <div style={{textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '24px', color: 'var(--pink-dark)'}}>
      🌸 Đang chuẩn bị khu vườn...
    </div>
  );

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--pink-dark)', fontSize: '36px', marginBottom: '10px' }}>Khu Vườn Nhỏ 🌸</h1>
        <p style={{ color: 'var(--text)', marginBottom: '30px' }}>Chăm sóc thú cưng & cây trồng của bạn</p>
        <button onClick={login} style={{ padding: '12px 24px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '25px', fontSize: '18px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>Đăng nhập với Google</button>
      </div>
    );
  }

  if (!gameState) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Lỗi tải dữ liệu. Vui lòng làm mới trang.</div>;
  }

  const buyItem = (cost, callback) => {
    if (gameState.currency.coins < cost) {
      showToast("Bạn cần thêm tiền! 💰", "warning");
      return;
    }
    setGameState(prev => {
      const newState = { ...prev, currency: { ...prev.currency, coins: prev.currency.coins - cost } };
      callback(newState);
      setDoc(doc(db, 'users', user.uid), newState);
      return newState;
    });
  };

  const handleFeed = () => {
    buyItem(10, state => state.pet.essential.hunger = Math.min(100, state.pet.essential.hunger + 40));
    setIsEating(true);
    sfxFeed();
    addPetExp(15);
    setTimeout(() => setIsEating(false), 2000);
  };

  const handlePlayLaser = () => {
    if (gameState.pet.state.isSleeping) return;
    addPetExp(20);
    setGameState(prev => {
      const state = {...prev};
      state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 25);
      state.pet.mental.boredom = Math.max(0, state.pet.mental.boredom - 35);
      state.pet.essential.energy = Math.max(0, state.pet.essential.energy - 4);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleAddBedding = () => {
    buyItem(15, state => state.pet.essential.hygiene = Math.min(100, state.pet.essential.hygiene + 50));
    addPetExp(15);
  };

  const handleWaterPlant = (idx) => {
    buyItem(5, state => state.plants[idx].core.soilMoisture = Math.min(100, state.plants[idx].core.soilMoisture + 35));
    sfxWater();
    setWateringStates(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setWateringStates(prev => ({ ...prev, [idx]: false }));
    }, 2000);
  };

  const handleFertilizePlant = (idx) => {
    buyItem(25, state => state.plants[idx].core.nutrients = Math.min(100, state.plants[idx].core.nutrients + 40));
  };

  const handlePestControl = (idx) => {
    buyItem(10, state => {
      state.plants[idx].status.pestRisk = Math.max(0, state.plants[idx].status.pestRisk - 50);
      state.plants[idx].status.cleanliness = Math.min(100, (state.plants[idx].status.cleanliness || 0) + 25);
    });
    showToast('Đã bắt sạch sâu bọ trên cây! 🐛', 'success');
  };

  const handlePrune = (idx) => {
    setGameState(prev => {
      const state = { ...prev };
      state.plants[idx].status.vitality = Math.min(100, state.plants[idx].status.vitality + 15);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const equipCosmetic = (id, slot) => {
    setGameState(prev => {
      const state = { ...prev };
      state.activeCosmetics[slot] = id;
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
    sfxEquip();
  };

  const unequipCosmetic = (slot) => {
    setGameState(prev => {
      const state = { ...prev };
      state.activeCosmetics[slot] = null;
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
    sfxClick();
  };

  const adoptPet = () => {
    setGameState(prev => {
      const newState = { ...prev };
      const existingHighest = newState.levelRewards?.bou?.highestLevel || 0;
      newState.pet = {
        name: 'Bọ Ú',
        essential: { hunger: 100, thirst: 100, energy: 100, hygiene: 100, bladder: 100 },
        mental: { happiness: 100, affection: 50, stress: 0, boredom: 0 },
        health: { overall: 100 },
        physical: { fitness: 50 },
        state: { isSleeping: false, sleepStartTimestamp: null, lastPetTimestamp: null },
        isDead: false,
        adoptedAt: Date.now(),
        level: existingHighest,
        exp: getTotalExpForLevel(existingHighest)
      };
      setDoc(doc(db, 'users', user.uid), newState);
      return newState;
    });
  };

  const buyNewPet = () => {
    buyItem(500, state => {
      const existingHighest = state.levelRewards?.bou?.highestLevel || 0;
      state.pet = {
        name: state.pet?.name || 'Bọ Ú',
        essential: { hunger: 100, thirst: 100, energy: 100, hygiene: 100, bladder: 100 },
        mental: { happiness: 100, affection: 50, stress: 0, boredom: 0 },
        health: { overall: 100 },
        physical: { fitness: 50 },
        state: { isSleeping: false, sleepStartTimestamp: null, lastPetTimestamp: null },
        isDead: false,
        adoptedAt: Date.now(),
        level: existingHighest,
        exp: getTotalExpForLevel(existingHighest)
      };
    });
  };

  // --- NEW PET ACTIONS ---
  const handlePetBoU = () => {
    if (gameState.pet.state.isSleeping) return;
    const now = Date.now();
    const last = gameState.pet.state.lastPetTimestamp || 0;
    if (now - last < 5000) { showToast('Bọ Ú cần nghỉ ngơi chút! (5s) ⏳', 'info'); return; }
    setIsPetting(true);
    setTimeout(() => setIsPetting(false), 1500);
    addPetExp(10);
    setGameState(prev => {
      const state = { ...prev };
      state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 18);
      state.pet.mental.affection = Math.min(100, state.pet.mental.affection + 15);
      state.pet.mental.stress = Math.max(0, state.pet.mental.stress - 10);
      state.pet.state.lastPetTimestamp = now;
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleExercise = () => {
    if (gameState.pet.state.isSleeping) return;
    if (gameState.pet.essential.energy < 8) { showToast('Bọ Ú quá mệt để tập! 😴', 'warning'); return; }
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 5000);
    addPetExp(20);
    setGameState(prev => {
      const state = { ...prev };
      state.pet.mental.boredom = Math.max(0, state.pet.mental.boredom - 35);
      state.pet.essential.energy = Math.max(0, state.pet.essential.energy - 8);
      if (!state.pet.physical) state.pet.physical = { fitness: 50 };
      state.pet.physical.fitness = Math.min(100, state.pet.physical.fitness + 20);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleGroomPet = () => {
    if (gameState.pet.state.isSleeping) return;
    setIsGrooming(true);
    sfxReward();
    addPetExp(15);
    setTimeout(() => setIsGrooming(false), 2000);
    setGameState(prev => {
      const state = { ...prev };
      state.pet.essential.hygiene = Math.min(100, state.pet.essential.hygiene + 25);
      state.pet.mental.affection = Math.min(100, state.pet.mental.affection + 15);
      state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 10);
      state.pet.mental.stress = Math.max(0, state.pet.mental.stress - 10);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handlePlayBall = () => {
    if (gameState.pet.state.isSleeping) return;
    if (gameState.pet.essential.energy < 4) { showToast('Bọ Ú cần nghỉ ngơi một chút! ⏳', 'info'); return; }
    setIsPlayingBall(true);
    sfxClick();
    addPetExp(15);
    setTimeout(() => setIsPlayingBall(false), 2500);
    setGameState(prev => {
      const state = { ...prev };
      state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 25);
      state.pet.mental.boredom = Math.max(0, state.pet.mental.boredom - 35);
      state.pet.essential.energy = Math.max(0, state.pet.essential.energy - 4);
      if (!state.pet.physical) state.pet.physical = { fitness: 50 };
      state.pet.physical.fitness = Math.min(100, state.pet.physical.fitness + 10);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleLullaby = () => {
    setIsLullaby(true);
    sfxWater();
    addPetExp(15);
    setTimeout(() => setIsLullaby(false), 3000);
    setGameState(prev => {
      const state = { ...prev };
      state.pet.essential.energy = Math.min(100, state.pet.essential.energy + 25);
      state.pet.mental.stress = 0;
      state.pet.mental.boredom = Math.max(0, state.pet.mental.boredom - 15);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleNailCare = () => {
    buyItem(5, state => {
      state.pet.health.overall = Math.min(100, state.pet.health.overall + 15);
      state.pet.essential.hygiene = Math.min(100, state.pet.essential.hygiene + 30);
      showToast('Đã vệ sinh móng và tai cho Bọ Ú sạch sẽ, gọn gàng! ✂️', 'success');
    });
    addPetExp(15);
  };

  const handleTrickTraining = () => {
    if (gameState.pet.state.isSleeping) return;
    if (gameState.pet.essential.energy < 6) { showToast('Bọ Ú cần nạp thêm năng lượng để tập xiếc! 🎪', 'warning'); return; }
    setIsTrick(true);
    sfxReward();
    addPetExp(25);
    setTimeout(() => setIsTrick(false), 2500);
    setGameState(prev => {
      const state = { ...prev };
      if (!state.pet.physical) state.pet.physical = { fitness: 50 };
      state.pet.physical.fitness = Math.min(100, state.pet.physical.fitness + 20);
      state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 20);
      state.pet.essential.energy = Math.max(0, state.pet.essential.energy - 6);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleSnapPhoto = () => {
    setSnapFlash(true);
    sfxReward();
    addPetExp(25);
    setTimeout(() => setSnapFlash(false), 500);
    setPolaroidPhoto({
      id: Date.now(),
      date: new Date().toLocaleTimeString('vi-VN'),
      title: 'Bọ Ú Đáng Yêu 💕'
    });
    setGameState(prev => {
      const state = { ...prev };
      state.currency.coins += 5; // Reward +5 coins
      state.pet.mental.affection = Math.min(100, state.pet.mental.affection + 20);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleVetCheck = () => {
    buyItem(50, state => {
      state.pet.health.overall = 100;
      state.pet.mental.stress = 0;
      showToast('Bác sĩ đã khám xong! Sức khỏe phục hồi 100%. 🏥', 'success');
    });
  };

  // --- NEW PLANT ACTIONS ---
  const handleTillSoil = (idx) => {
    setGameState(prev => {
      const state = { ...prev };
      state.plants[idx].advanced.aeration = 100;
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleSunbathe = (idx) => {
    setGameState(prev => {
      const state = { ...prev };
      state.plants[idx].core.sunlight = 100;
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleSingToPlant = (idx) => {
    setGameState(prev => {
      const state = { ...prev };
      state.plants[idx].status.vitality = Math.min(100, state.plants[idx].status.vitality + 20);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleToggleGrowLight = (idx) => {
    const tools = gameState.inventory.tools || { growLight: 0 };
    const plant = gameState.plants[idx];
    if (plant.hasGrowLight) {
      setGameState(prev => { const s = {...prev}; s.plants[idx].hasGrowLight = false; s.inventory.tools.growLight += 1; setDoc(doc(db,'users',user.uid),s); return s; });
    } else {
      if (tools.growLight <= 0) { showToast('Bạn chưa có đèn LED! Hãy mua ở cửa hàng. 💡', 'warning'); return; }
      setGameState(prev => { const s = {...prev}; s.plants[idx].hasGrowLight = true; s.inventory.tools.growLight -= 1; setDoc(doc(db,'users',user.uid),s); return s; });
    }
  };

  const buySeed = (id) => {
    if (gameState.plants.length >= 6) {
      showToast("Ban công đã đầy! Tối đa 6 chậu cây. 🪴", "warning");
      return;
    }
    const profile = PLANT_PROFILES[id];
    if (!profile) return;
    const cost = profile.purchasePrice;
    if (gameState.currency.coins < cost) { showToast("Bạn cần thêm tiền! 💰", "warning"); return; }
    setGameState(prev => {
      const newState = { ...prev };
      newState.currency.coins -= cost;
      newState.plants.push({
        id, nameVi: profile.nameVi, core: { ...profile.core },
        advanced: { hydration: 50, soilPH: 6.5, aeration: 70 },
        status: { growthStage: "seed", growthProgress: 0, vitality: 100, cleanliness: 100, pestRisk: 0 },
        plantedAt: Date.now(), hasGrowLight: false, isBlooming: false
      });
      setDoc(doc(db, 'users', user.uid), newState);
      showToast(`Đã trồng hạt giống ${profile.nameVi}! 🌱`, "success");
      return newState;
    });
  };

  const buySupply = (itemId, cost, category) => {
    buyItem(cost, state => {
      if (itemId === 'medicine' && state.pet) {
        state.pet.health.overall = 100;
        state.pet.mental.stress = 0;
        showToast("Đã chữa khỏi bệnh cho thú cưng! 💊", "success");
      } else if (itemId === 'fertilizer') {
        state.plants.forEach(p => p.core.nutrients = 100);
        showToast("Tất cả cây đã được bón phân tươi tốt! 🧪", "success");
      } else if (itemId === 'premium_seed' && state.pet) {
        state.pet.essential.hunger = Math.min(100, state.pet.essential.hunger + 50);
        state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 10);
        showToast("Thú cưng đã ăn ngon miệng! 🌻", "success");
      } else if (itemId === 'cheese_snack' && state.pet) {
        state.pet.essential.hunger = 100;
        state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 50);
        showToast("Bọ Ú rất thích bánh phô mai! 🧀", "success");
      } else if (itemId === 'carrot_snack' && state.pet) {
        state.pet.essential.hunger = Math.min(100, state.pet.essential.hunger + 35);
        if (!state.pet.physical) state.pet.physical = { fitness: 50 };
        state.pet.physical.fitness = Math.min(100, state.pet.physical.fitness + 15);
        state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 10);
        showToast("Bọ Ú gặm cà rốt giòn rụm! 🥕", "success");
      } else if (itemId === 'dried_apple' && state.pet) {
        state.pet.essential.hunger = Math.min(100, state.pet.essential.hunger + 30);
        state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 30);
        state.pet.mental.stress = 0;
        showToast("Bọ Ú thưởng thức táo đỏ sấy dẻo ngọt ngào! 🍎", "success");
      } else if (itemId === 'alfalfa_hay' && state.pet) {
        state.pet.essential.hunger = Math.min(100, state.pet.essential.hunger + 40);
        state.pet.essential.hygiene = Math.min(100, state.pet.essential.hygiene + 30);
        if (!state.pet.physical) state.pet.physical = { fitness: 50 };
        state.pet.physical.fitness = Math.min(100, state.pet.physical.fitness + 15);
        showToast("Bọ Ú nhai cỏ Alfalfa thơm phức mượt lông! 🌾", "success");
      } else if (itemId === 'chew_stick' && state.pet) {
        if (!state.pet.physical) state.pet.physical = { fitness: 50 };
        state.pet.physical.fitness = Math.min(100, state.pet.physical.fitness + 25);
        state.pet.mental.affection = Math.min(100, (state.pet.mental.affection || 0) + 20);
        state.pet.mental.boredom = Math.max(0, (state.pet.mental.boredom || 0) - 20);
        showToast("Bọ Ú mài răng với khúc gỗ thơm tho! 🪵", "success");
      } else if (itemId === 'fish_food' && state.fishTank) {
        if (state.fishTank.blueFish && !state.fishTank.blueFish.isDead) {
          state.fishTank.blueFish.hunger = Math.min(100, state.fishTank.blueFish.hunger + 40);
          state.fishTank.blueFish.happiness = Math.min(100, state.fishTank.blueFish.happiness + 25);
        }
        if (state.fishTank.redFish && !state.fishTank.redFish.isDead) {
          state.fishTank.redFish.hunger = Math.min(100, state.fishTank.redFish.hunger + 40);
          state.fishTank.redFish.happiness = Math.min(100, state.fishTank.redFish.happiness + 25);
        }
        showToast("Đã rải mồi trùn chỉ và lăng quăng tươi cho cá! 🦟", "success");
      } else if (itemId === 'fish_medicine' && state.fishTank) {
        if (state.fishTank.blueFish) {
          state.fishTank.blueFish.health = 100;
          state.fishTank.blueFish.stress = 0;
        }
        if (state.fishTank.redFish) {
          state.fishTank.redFish.health = 100;
          state.fishTank.redFish.stress = 0;
        }
        showToast("Đã dưỡng muối khoáng & hồi phục 100% sức khỏe cá! 💊", "success");
      } else if (itemId === 'water_plant' && state.fishTank) {
        state.fishTank.tank.oxygen = Math.min(100, state.fishTank.tank.oxygen + 35);
        state.fishTank.tank.cleanliness = Math.min(100, state.fishTank.tank.cleanliness + 20);
        showToast("Đã thả thêm Rong La Hán thủy sinh vào bể! 🌿", "success");
      } else if (itemId === 'almond_leaf' && state.fishTank) {
        if (state.fishTank.blueFish && !state.fishTank.blueFish.isDead) {
          state.fishTank.blueFish.happiness = 100;
          state.fishTank.blueFish.health = Math.min(100, state.fishTank.blueFish.health + 30);
        }
        if (state.fishTank.redFish && !state.fishTank.redFish.isDead) {
          state.fishTank.redFish.happiness = 100;
          state.fishTank.redFish.health = Math.min(100, state.fishTank.redFish.health + 30);
        }
        showToast("Đã thả lá bàng khô lên màu! Vây cá rực rỡ! 🍃", "success");
      } else if (itemId === 'artemia_shrimp' && state.fishTank) {
        if (state.fishTank.blueFish && !state.fishTank.blueFish.isDead) {
          state.fishTank.blueFish.hunger = Math.min(100, state.fishTank.blueFish.hunger + 45);
          state.fishTank.blueFish.happiness = Math.min(100, state.fishTank.blueFish.happiness + 30);
        }
        if (state.fishTank.redFish && !state.fishTank.redFish.isDead) {
          state.fishTank.redFish.hunger = Math.min(100, state.fishTank.redFish.hunger + 45);
          state.fishTank.redFish.happiness = Math.min(100, state.fishTank.redFish.happiness + 30);
        }
        showToast("Đã cho đàn cá ăn tép tươi Artemia giàu dinh dưỡng! 🦐", "success");
      } else if (itemId === 'volcanic_rock' && state.fishTank) {
        state.fishTank.tank.cleanliness = Math.min(100, state.fishTank.tank.cleanliness + 30);
        state.fishTank.tank.oxygen = Math.min(100, state.fishTank.tank.oxygen + 25);
        showToast("Đã rải đá nham thạch vi sinh lọc nước tự nhiên! 🪨", "success");
      } else if (itemId === 'apple_snail' && state.fishTank) {
        state.fishTank.tank.cleanliness = 100;
        if (state.fishTank.blueFish) state.fishTank.blueFish.stress = 0;
        if (state.fishTank.redFish) state.fishTank.redFish.stress = 0;
        showToast("Ốc táo vàng chăm chỉ dọn sạch bể cá! 🐌", "success");
      } else if (itemId === 'nano_led' && state.fishTank) {
        if (state.fishTank.blueFish && !state.fishTank.blueFish.isDead) {
          state.fishTank.blueFish.happiness = 100;
        }
        if (state.fishTank.redFish && !state.fishTank.redFish.isDead) {
          state.fishTank.redFish.happiness = 100;
        }
        state.fishTank.tank.oxygen = Math.min(100, state.fishTank.tank.oxygen + 20);
        showToast("Đã bật Đèn Nano LED! Vảy cá phát quang rực rỡ! 🏮", "success");
      } else if (itemId === 'worm_castings') {
        state.plants.forEach(p => {
          if (!p.core) p.core = {};
          p.core.nutrients = 100;
          if (!p.advanced) p.advanced = {};
          p.advanced.aeration = 100;
        });
        showToast("Tất cả cây đã được bón phân trùn quế tơi xốp! 🪱", "success");
      } else if (itemId === 'pest_spray') {
        state.plants.forEach(p => {
          if (!p.status) p.status = {};
          p.status.pestRisk = 0;
          p.status.cleanliness = 100;
        });
        showToast("Đã xịt thảo mộc bảo vệ mọi cây sạch rệp sâu! 🧴", "success");
      } else if (itemId === 'nano_mister') {
        state.plants.forEach(p => {
          if (!p.core) p.core = {};
          p.core.soilMoisture = 100;
          if (!p.status) p.status = {};
          p.status.vitality = Math.min(100, (p.status.vitality || 70) + 25);
        });
        showToast("Đã phun sương Nano mát lành cho toàn bộ chậu cây! 💧", "success");
      }
    });
  };

  const buyTool = (toolId, cost) => {
    const owned = (gameState.inventory.tools?.[toolId] || 0) > 0 || (toolId === 'growLight' && gameState.plants?.some(p => p.hasGrowLight));
    if (owned) {
      showToast("Bạn đã sở hữu công cụ này rồi!", "info");
      return;
    }
    buyItem(cost, state => {
      if (!state.inventory) state.inventory = { seeds: {}, medicine: 0, fertilizer: 0, cosmetics: [], tools: {} };
      if (!state.inventory.tools) state.inventory.tools = { growLight: 0 };
      if (toolId === 'growLight') {
        const stateOwned = state.inventory.tools.growLight > 0 || state.plants.some(p => p.hasGrowLight);
        if (!stateOwned) {
          state.inventory.tools = { ...state.inventory.tools, growLight: (state.inventory.tools.growLight || 0) + 1 };
          showToast('Đã mua Đèn LED quang hợp! Đặt lên cây trong menu chăm sóc. 💡', 'success');
        }
      } else if (toolId === 'smart_hygrometer') {
        state.inventory.tools = { ...state.inventory.tools, smart_hygrometer: 1 };
        state.plants?.forEach(p => {
          if (!p.status) p.status = {};
          p.status.vitality = 100;
        });
        showToast('Đã mua Nhiệt ẩm kế thông minh! Tối ưu sức sống toàn bộ cây cảnh. 🌡️', 'success');
      } else if (toolId === 'mozart_speaker') {
        state.inventory.tools = { ...state.inventory.tools, mozart_speaker: 1 };
        if (state.pet) {
          if (!state.pet.mental) state.pet.mental = {};
          state.pet.mental.happiness = 100;
          state.pet.mental.stress = 0;
        }
        showToast('Đã mua Loa Bluetooth Mozart! Giai điệu thư giãn giảm sạch stress cho Bọ Ú. 🎵', 'success');
      }
    });
  };

  const buyCosmetic = (id, cost, slot) => {
    if (gameState.inventory.cosmetics.includes(id)) {
      showToast("Bạn đã sở hữu món đồ này rồi! 🎀", "info");
      return;
    }
    buyItem(cost, state => {
      if (!state.inventory.cosmetics.includes(id)) {
        state.inventory.cosmetics = [...state.inventory.cosmetics, id];
        if (slot === 'petHat') state.activeCosmetics = { ...state.activeCosmetics, petHat: id };
        if (slot === 'plantPots') state.activeCosmetics = { ...state.activeCosmetics, plantPots: id };
        showToast("Đã mua và trang bị thành công! ✨", "success");
      }
    });
  };

  const onMinigameReward = (coins) => {
    setGameState(prev => {
      const newState = { ...prev, currency: { ...prev.currency, coins: prev.currency.coins + coins } };
      setDoc(doc(db, 'users', user.uid), newState);
      return newState;
    });
  };

  const handleSellPlant = (idx) => {
    const plant = gameState.plants[idx];
    if (!plant) return;
    const isDead = plant.status.growthStage === 'dead';
    const price = isDead ? 0 : getPlantSellPrice(plant);
    const confirmMsg = isDead 
      ? `Bạn có chắc chắn muốn dọn dẹp chậu cây "${plant.nameVi}" đã chết không?`
      : `Bạn có chắc chắn muốn bán "${plant.nameVi}" với giá ${price} xu${(plant.level || 0) > 0 ? ` (đã cộng +${plant.level * 2} xu từ LV ${plant.level})` : ''} không?`;
    if (!window.confirm(confirmMsg)) return;
    setGameState(prev => {
      const state = { ...prev, currency: { ...prev.currency, coins: prev.currency.coins + price }, plants: [...prev.plants] };
      state.plants.splice(idx, 1);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
    setSelectedPlantIdx(null);
    if (isDead) {
      sfxClick();
    } else {
      sfxSell();
    }
  };

  return (
    <div className={`app-container ${isShopOpen ? 'shop-open' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      <header className="main-app-header">
        <div className="header-user-badge">
          <span className="header-user-avatar">👤</span>
          <span>{user.displayName || 'Bạn nhỏ'}</span>
        </div>
        <div className="header-right-actions">
          <button 
            className="header-audio-btn" 
            onClick={() => { const m = !isMuted; setIsMuted(m); setMuted(m); }} 
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button className="header-shop-btn" onClick={() => { sfxClick(); setIsShopOpen(true); }}>
            🛒 Cửa hàng
          </button>
          <div className="header-wallet-pill">
            💰 {Math.floor(gameState.currency.coins)}
          </div>
          <button className="header-logout-btn" onClick={logout} title="Đăng xuất">
            Thoát
          </button>
        </div>
      </header>

      <main className="main-content-view">
        {activeTab === 'pet' && (
          <div className="pet-tab-card">
            {gameState.pet === null ? (
              <div style={{ padding: '40px 20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', marginTop: '20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🐹✨</div>
                <h2 style={{ marginBottom: '10px', color: '#831843', fontWeight: 800 }}>Chào mừng tới Khu Vườn Nhỏ!</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>Bạn chưa có thú cưng nào để bầu bạn.</p>
                <button onClick={adoptPet} className="arcade-play-btn" style={{ fontSize: '15px', padding: '12px 28px' }}>Nhận Nuôi Bọ Ú (Miễn phí)</button>
              </div>
            ) : gameState.pet.isDead ? (
              <div style={{ padding: '20px' }}>
                <h2>{gameState.pet.name || 'Bọ Ú'}</h2>
                <div style={{ margin: '30px 0' }}>
                  <BoUAvatar isDead={true} />
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '20px', border: '2px solid #fed7aa', maxWidth: '350px', margin: '0 auto 20px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ color: '#5D4037', marginBottom: '10px' }}>R.I.P {gameState.pet.name || 'Bọ Ú'} 😢</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Thú cưng đã qua đời sau 3 ngày không được chăm sóc. Các vật phẩm và mốc cấp độ vẫn được bảo lưu nguyên vẹn.</p>
                </div>
                <button onClick={buyNewPet} className="arcade-play-btn" style={{ fontSize: '15px', padding: '12px 28px' }}>Nhận Nuôi Bọ Ú Mới (500💰)</button>
              </div>
            ) : (
              <>
                <div className="pet-title-header">
                  <span className="pet-display-name">{gameState.pet.name || 'Bọ Ú'}</span>
                  <button
                    className="rename-mini-btn"
                    onClick={() => handleOpenRename('bou', gameState.pet.name || 'Bọ Ú')}
                    title="Đổi tên Bọ Ú"
                  >
                    ✏️
                  </button>
                  <span className="pet-level-badge">
                    ⭐ LV {gameState.pet.level || 0}
                  </span>
                  <button
                    className="rewards-nav-btn"
                    onClick={() => setIsRewardsOpen(true)}
                    title="Xem hành trình cấp độ 500 & nhận thưởng mốc"
                  >
                    🏆 Thưởng Cấp
                  </button>
                </div>

                {/* Level EXP Progress Bar */}
                {(() => {
                  const progress = getExpProgress(gameState.pet.exp, gameState.pet.level || 0);
                  return (
                    <div className="pet-exp-progress-wrap" title={`Kinh nghiệm lên cấp: ${progress.currentLevelExp}/${progress.expNeeded} EXP`}>
                      <div className="pet-exp-labels">
                        <span>Kinh nghiệm lên Cấp {progress.currentLevel + 1}</span>
                        <strong>{progress.currentLevelExp} / {progress.expNeeded} EXP ({progress.percent}%)</strong>
                      </div>
                      <div className="pet-exp-bar-track">
                        <div className="pet-exp-bar-fill" style={{ width: `${progress.percent}%` }}></div>
                      </div>
                    </div>
                  );
                })()}

                <div className="pet-habitat-box">
                  <BoUAvatar 
                    mood={gameState.pet.health.overall < 50 ? 'sad' : gameState.pet.state.isSleeping ? 'sleepy' : 'happy'} 
                    isEating={isEating}
                    isRunning={isRunning}
                    isPetting={isPetting}
                    isGrooming={isGrooming}
                    isPlayingBall={isPlayingBall}
                    isLullaby={isLullaby}
                    isTrick={isTrick}
                    snapFlash={snapFlash}
                    equippedHat={gameState.activeCosmetics.petHat}
                  />
                </div>
                
                {/* Modern Stat Meters */}
                <div className="pet-stats-modern-grid">
                  <ModernPetStat icon="🍙" label="Độ đói" value={gameState.pet.essential.hunger} />
                  <ModernPetStat icon="⚡" label="Năng lượng" value={gameState.pet.essential.energy} />
                  <ModernPetStat icon="💖" label="Vui vẻ" value={gameState.pet.mental.happiness} />
                  <ModernPetStat icon="🥱" label="Buồn chán" value={gameState.pet.mental.boredom} reverseColor={true} />
                  <ModernPetStat icon="💪" label="Sức khỏe" value={gameState.pet.physical?.fitness || 50} />
                  <ModernPetStat icon="🩺" label="Thể trạng" value={gameState.pet.health.overall} />
                </div>

                {/* Modern Action Buttons Grid */}
                <div className="pet-actions-modern-grid">
                  <button className="pet-act-btn act-feed" onClick={handleFeed}>
                    <span className="act-icon">🍙</span>
                    <span className="act-label">Cho ăn</span>
                    <span className="act-sub">10💰</span>
                  </button>
                  <button className="pet-act-btn act-ball" onClick={() => buyItem(5, state => state.pet.essential.thirst = Math.min(100, state.pet.essential.thirst + 45))}>
                    <span className="act-icon">💧</span>
                    <span className="act-label">Uống nước</span>
                    <span className="act-sub">5💰</span>
                  </button>
                  <button className="pet-act-btn act-groom" onClick={handleGroomPet}>
                    <span className="act-icon">🪮</span>
                    <span className="act-label">Chải Spa</span>
                    <span className="act-sub">Free</span>
                  </button>
                  <button className="pet-act-btn act-ball" onClick={handlePlayBall}>
                    <span className="act-icon">⚽</span>
                    <span className="act-label">Bóng lăn</span>
                    <span className="act-sub">Free</span>
                  </button>
                  <button className="pet-act-btn act-laser" onClick={handlePlayLaser}>
                    <span className="act-icon">🔦</span>
                    <span className="act-label">Tia Laser</span>
                    <span className="act-sub">Free</span>
                  </button>
                  <button className="pet-act-btn act-lullaby" onClick={handleLullaby}>
                    <span className="act-icon">🎵</span>
                    <span className="act-label">Hộp nhạc</span>
                    <span className="act-sub">Free</span>
                  </button>
                  <button className="pet-act-btn act-trick" onClick={handleTrickTraining}>
                    <span className="act-icon">🎪</span>
                    <span className="act-label">Tập xiếc</span>
                    <span className="act-sub">+EXP</span>
                  </button>
                  <button className="pet-act-btn act-photo" onClick={handleSnapPhoto}>
                    <span className="act-icon">📸</span>
                    <span className="act-label">Chụp ảnh</span>
                    <span className="act-sub">+5💰</span>
                  </button>
                  <button className="pet-act-btn act-nail" onClick={handleNailCare}>
                    <span className="act-icon">✂️</span>
                    <span className="act-label">Cắt móng</span>
                    <span className="act-sub">5💰</span>
                  </button>
                  <button className="pet-act-btn act-bed" onClick={handleAddBedding}>
                    <span className="act-icon">🛏️</span>
                    <span className="act-label">Thêm đệm</span>
                    <span className="act-sub">15💰</span>
                  </button>
                  <button className="pet-act-btn act-groom" onClick={handlePetBoU}>
                    <span className="act-icon">💕</span>
                    <span className="act-label">Vuốt ve</span>
                    <span className="act-sub">Free</span>
                  </button>
                  <button className="pet-act-btn act-wheel" onClick={handleExercise}>
                    <span className="act-icon">🏃</span>
                    <span className="act-label">Chạy bộ</span>
                    <span className="act-sub">Free</span>
                  </button>
                  <button className="pet-act-btn act-vet" onClick={handleVetCheck}>
                    <span className="act-icon">🏥</span>
                    <span className="act-label">Bác sĩ</span>
                    <span className="act-sub">50💰</span>
                  </button>
                  <button className="pet-act-btn act-feed" onClick={() => setGameState(prev => {
                      const state = {...prev};
                      state.pet.state.isSleeping = !state.pet.state.isSleeping;
                      if (state.pet.state.isSleeping) state.pet.state.sleepStartTimestamp = Date.now();
                      setDoc(doc(db, 'users', user.uid), state);
                      return state;
                  })}>
                    <span className="act-icon">{gameState.pet.state.isSleeping ? '☀️' : '🌙'}</span>
                    <span className="act-label">{gameState.pet.state.isSleeping ? 'Đánh thức' : 'Đi ngủ'}</span>
                    <span className="act-sub">Nghỉ ngơi</span>
                  </button>
                </div>

                {polaroidPhoto && (
                  <div className="polaroid-popup" onClick={() => setPolaroidPhoto(null)}>
                    <div className="polaroid-frame" onClick={e => e.stopPropagation()}>
                      <div className="polaroid-photo-inner">
                        <div style={{ fontSize: '64px' }}>🐹✨</div>
                      </div>
                      <h4 className="polaroid-caption">{polaroidPhoto.title}</h4>
                      <p className="polaroid-date">Đã chụp lúc {polaroidPhoto.date}</p>
                      <div className="polaroid-reward-tag">Thưởng +5 xu 💰</div>
                      <button className="polaroid-close-btn" onClick={() => setPolaroidPhoto(null)}>Cất vào album kỷ niệm</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'fish' && (
          <BettaFishView
            gameState={gameState}
            setGameState={setGameState}
            user={user}
            db={db}
            setDoc={setDoc}
            doc={doc}
            buyItem={buyItem}
            setIsShopOpen={setIsShopOpen}
            onOpenRename={handleOpenRename}
            onOpenRewards={() => setIsRewardsOpen(true)}
            showToast={showToast}
          />
        )}

        {activeTab === 'plants' && (
          <PlantTab
            gameState={gameState}
            selectedPlantIdx={selectedPlantIdx}
            setSelectedPlantIdx={setSelectedPlantIdx}
            wateringStates={wateringStates}
            isDay={isDay}
            setIsShopOpen={setIsShopOpen}
            handleWaterPlant={handleWaterPlant}
            handleFertilizePlant={handleFertilizePlant}
            handlePestControl={handlePestControl}
            handlePrune={handlePrune}
            handleTillSoil={handleTillSoil}
            handleSunbathe={handleSunbathe}
            handleSingToPlant={handleSingToPlant}
            handleToggleGrowLight={handleToggleGrowLight}
            handleSellPlant={handleSellPlant}
          />
        )}

        {activeTab === 'game' && (
          <div className="arcade-hub-modern">
            {selectedGame === null ? (
              <div>
                <div className="arcade-hub-header">
                  <h2>Khu Vui Chơi Giải Trí 🎮</h2>
                  <p>Chơi mini-game vừa giải trí vừa kiếm xu nuôi thú và trồng cây!</p>
                </div>
                <div className="arcade-games-column">
                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">🧩</div>
                    <div className="arcade-card-info">
                      <h3>Trò Chơi 2048</h3>
                      <p>Hợp nhất các ô số giống nhau để đạt điểm tối đa.</p>
                      <span className="arcade-rate-tag">Thưởng: Điểm ÷ 100 = Xu 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('2048'); }}>Chơi</button>
                  </div>

                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">🧠</div>
                    <div className="arcade-card-info">
                      <h3>Trận Chiến Trí Nhớ</h3>
                      <p>Tìm tất cả cặp hình giống nhau trước khi hết thời gian.</p>
                      <span className="arcade-rate-tag">Thưởng: 2 xu/cặp + 10 xu thưởng 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('memory'); }}>Chơi</button>
                  </div>

                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">🐍</div>
                    <div className="arcade-card-info">
                      <h3>Rắn Săn Mồi</h3>
                      <p>Điều khiển rắn ăn táo đỏ mà không đâm vào tường hoặc đuôi.</p>
                      <span className="arcade-rate-tag">Thưởng: Điểm ÷ 100 = Xu 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('snake'); }}>Chơi</button>
                  </div>

                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">🏓</div>
                    <div className="arcade-card-info">
                      <h3>Bóng Bàn Pong</h3>
                      <p>Đỡ quả bóng nảy qua lại để ghi điểm trước đối thủ máy.</p>
                      <span className="arcade-rate-tag">Thưởng: Điểm ÷ 100 = Xu 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('pong'); }}>Chơi</button>
                  </div>

                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">🐦</div>
                    <div className="arcade-card-info">
                      <h3>Flappy Bọ Ú</h3>
                      <p>Bay qua các khe ống nước mà không chạm đất.</p>
                      <span className="arcade-rate-tag">Thưởng: Cột × 2 = Xu 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('flappy'); }}>Chơi</button>
                  </div>

                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">🧱</div>
                    <div className="arcade-card-info">
                      <h3>Xếp Hình Tetris</h3>
                      <p>Xoay và xếp các khối gạch rơi xuống để xóa hàng ngang.</p>
                      <span className="arcade-rate-tag">Thưởng: Hàng × 10 = Xu 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('tetris'); }}>Chơi</button>
                  </div>

                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">💣</div>
                    <div className="arcade-card-info">
                      <h3>Dò Mìn (Minesweeper)</h3>
                      <p>Khám phá toàn bộ 71 ô an toàn trên bãi mìn cổ điển.</p>
                      <span className="arcade-rate-tag">Thưởng: Ô mở = Xu + Thưởng 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('minesweeper'); }}>Chơi</button>
                  </div>

                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon">🧊</div>
                    <div className="arcade-card-info">
                      <h3>Block Blast</h3>
                      <p>Kéo các khối gạch vào bàn 8×8 để tạo combo xóa hàng và cột.</p>
                      <span className="arcade-rate-tag">Thưởng: Điểm ÷ 50 = Xu 💰</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('blockblast'); }}>Chơi</button>
                  </div>

                  {/* Card for Suika Game */}
                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon" style={{ background: '#fff7ed' }}>🍉</div>
                    <div className="arcade-card-info">
                      <h3>Suika Game (Trò Chơi Dưa Hấu)</h3>
                      <p>Thả và hợp nhất 11 cấp trái cây vật lý 2D để tạo Dưa Hấu Khổng Lồ!</p>
                      <span className="arcade-rate-tag">Thưởng: Điểm ÷ 300 = Xu 💰 (Tối đa 15)</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('suika'); }}>Chơi</button>
                  </div>

                  {/* Card for Triple Town */}
                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon" style={{ background: '#ecfdf5' }}>🏡</div>
                    <div className="arcade-card-info">
                      <h3>Triple Town (Thị Trấn Hợp Nhất 3)</h3>
                      <p>Ghép 3 bụi cỏ, cây, nhà để xây dựng thành phố bay kỳ quan!</p>
                      <span className="arcade-rate-tag">Thưởng: Điểm ÷ 1000 = Xu 💰 (Tối đa 20)</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('tripletown'); }}>Chơi</button>
                  </div>

                  {/* Card for Brick Breaker */}
                  <div className="arcade-card-modern">
                    <div className="arcade-card-icon" style={{ background: '#eff6ff' }}>🧱</div>
                    <div className="arcade-card-info">
                      <h3>Brick Breaker (Phá Gạch Cổ Điển)</h3>
                      <p>Đỡ bóng phá khối gạch màu sắc, kích hoạt Hỏa cầu, Đa bóng và Bắn Laser!</p>
                      <span className="arcade-rate-tag">Thưởng: Điểm ÷ 250 = Xu 💰 (Tối đa 18)</span>
                    </div>
                    <button className="arcade-play-btn" onClick={() => { sfxClick(); setSelectedGame('brickbreaker'); }}>Chơi</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                  <button 
                    onClick={() => { sfxClick(); setSelectedGame(null); }} 
                    style={{ background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '6px 14px', cursor: 'pointer', color: '#475569', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                  >
                    ⬅ Quay lại sảnh game
                  </button>
                </div>
                {selectedGame === '2048' ? (
                  <Game2048 onReward={onMinigameReward} />
                ) : selectedGame === 'memory' ? (
                  <MemoryGame onReward={onMinigameReward} />
                ) : selectedGame === 'snake' ? (
                  <SnakeGame onReward={onMinigameReward} />
                ) : selectedGame === 'flappy' ? (
                  <FlappyGame onReward={onMinigameReward} />
                ) : selectedGame === 'tetris' ? (
                  <TetrisGame onReward={onMinigameReward} />
                ) : selectedGame === 'minesweeper' ? (
                  <MinesweeperGame onReward={onMinigameReward} />
                ) : selectedGame === 'blockblast' ? (
                  <BlockBlastGame onReward={onMinigameReward} />
                ) : selectedGame === 'suika' ? (
                  <SuikaGame onReward={onMinigameReward} />
                ) : selectedGame === 'tripletown' ? (
                  <TripleTownGame onReward={onMinigameReward} />
                ) : selectedGame === 'brickbreaker' ? (
                  <BrickBreakerGame onReward={onMinigameReward} />
                ) : (
                  <PongGame onReward={onMinigameReward} />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-tab-modern">
            <div className="inventory-header-modern">
              <h2>🎒 Kho Phụ Kiện & Vật Phẩm</h2>
              <p>Trang bị phụ kiện làm đẹp cho Bọ Ú và các chậu cây của bạn</p>
            </div>

            {/* Category tabs */}
            <div className="inv-category-tabs">
              <button 
                className={`inv-cat-pill ${inventoryCategory === 'all' ? 'active' : ''}`}
                onClick={() => setInventoryCategory('all')}
              >
                Tất cả ({Array.from(new Set(gameState.inventory?.cosmetics || [])).length})
              </button>
              <button 
                className={`inv-cat-pill ${inventoryCategory === 'hat' ? 'active' : ''}`}
                onClick={() => setInventoryCategory('hat')}
              >
                Mũ & Nơ 🎩
              </button>
              <button 
                className={`inv-cat-pill ${inventoryCategory === 'pot' ? 'active' : ''}`}
                onClick={() => setInventoryCategory('pot')}
              >
                Chậu Cây 🏺
              </button>
              <button 
                className={`inv-cat-pill ${inventoryCategory === 'special' ? 'active' : ''}`}
                onClick={() => setInventoryCategory('special')}
              >
                Mốc Cấp 500 🏆
              </button>
            </div>

            {(!gameState.inventory?.cosmetics || gameState.inventory.cosmetics.length === 0) ? (
              <div style={{ textAlign:'center', padding:'40px 20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize:'60px', marginBottom:'15px' }}>🎀</div>
                <p style={{ color:'#64748b' }}>Chưa có phụ kiện nào. Hãy ghé Cửa Hàng hoặc lên cấp để nhận!</p>
                <button onClick={() => setIsShopOpen(true)} className="arcade-play-btn" style={{ marginTop: '12px' }}>Ghé Cửa Hàng</button>
              </div>
            ) : (
              <div className="inventory-modern-grid">
                {Array.from(new Set(gameState.inventory.cosmetics)).filter(id => {
                  const itemSlot = ['gold_pot', 'bat_trang_pot', 'marble_pot', 'men_lam_pot', 'rainbow_pot'].includes(id) ? 'plantPots' : 'petHat';
                  const isMilestone = [
                    'crown_gold', 'angel_halo', 'chef_hat', 'wizard_hat', 'detective_hat',
                    'party_hat', 'sunglasses', 'bunny_ears', 'viking_helmet', 'cat_ears',
                    'beret_hat', 'pirate_hat', 'samurai_helmet', 'flower_crown', 'phoenix_feather',
                    'diamond_crown', 'cosmic_aura'
                  ].includes(id);

                  if (inventoryCategory === 'hat') return itemSlot === 'petHat' && !isMilestone;
                  if (inventoryCategory === 'pot') return itemSlot === 'plantPots';
                  if (inventoryCategory === 'special') return isMilestone;
                  return true;
                }).map(id => {
                  const meta = {
                    top_hat:        { icon:'🎩', name:'Mũ Top Hat',       slot:'petHat',    desc:'Cho Bọ Ú cưng' },
                    pink_bow:       { icon:'🎀', name:'Nơ Hồng',          slot:'petHat',    desc:'Cho Bọ Ú cưng' },
                    gold_pot:       { icon:'🏺', name:'Chậu Vàng Hoàng Gia', slot:'plantPots', desc:'Cho tất cả chậu cây' },
                    summer_hat:     { icon:'👒', name:'Mũ Rơm Mùa Hè',    slot:'petHat',    desc:'Cho Bọ Ú cưng' },
                    pink_bowtie:    { icon:'🎀', name:'Nơ Hồng Quý Phái',  slot:'petHat',    desc:'Đeo cổ Bọ Ú cưng' },
                    bat_trang_pot:  { icon:'🏺', name:'Chậu Gốm Bát Tràng', slot:'plantPots', desc:'Cho tất cả chậu cây' },
                    marble_pot:     { icon:'💎', name:'Chậu Cẩm Thạch',   slot:'plantPots', desc:'Cho tất cả chậu cây' },
                    sakura_flower:  { icon:'🌸', name:'Bông Hoa Sakura',  slot:'petHat',    desc:'Gài đầu Bọ Ú xinh xắn' },
                    prince_crown:     { icon:'👑', name:'Mũ Hoàng Tử Nhí', slot:'petHat',    desc:'Vương miện quý tộc cho Bọ Ú' },
                    cool_sunglasses:  { icon:'🕶️', name:'Kính Mát Sành Điệu', slot:'petHat',    desc:'Kính râm thời thượng ngầu đét' },
                    reindeer_antlers: { icon:'🦌', name:'Bờm Tuần Lộc Noel', slot:'petHat',    desc:'Bờm tuần lộc Giáng sinh đáng yêu' },
                    men_lam_pot:      { icon:'🏺', name:'Chậu Gốm Men Lam', slot:'plantPots', desc:'Họa tiết men lam cổ điển' },
                    rainbow_pot:      { icon:'🌈', name:'Chậu Cầu Vồng Pastel', slot:'plantPots', desc:'Sắc pastel kỳ diệu' },
                    crown_gold:     { icon:'👑', name:'Vương Miện Vàng', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 120' },
                    angel_halo:     { icon:'😇', name:'Vòng Thiên Thần', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 140' },
                    chef_hat:       { icon:'👨‍🍳', name:'Mũ Đầu Bếp Nhí', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 170' },
                    wizard_hat:     { icon:'🧙‍♂️', name:'Mũ Phù Thủy', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 190' },
                    detective_hat:  { icon:'🕵️', name:'Mũ Thám Tử', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 220' },
                    party_hat:      { icon:'🥳', name:'Nón Sinh Nhật', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 240' },
                    sunglasses:     { icon:'🕶️', name:'Kính Râm Ngầu', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 270' },
                    bunny_ears:     { icon:'🐰', name:'Tai Thỏ Dễ Thương', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 290' },
                    viking_helmet:  { icon:'🛡️', name:'Nón Chiến Binh', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 320' },
                    cat_ears:       { icon:'🐱', name:'Bờm Tai Mèo', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 340' },
                    beret_hat:      { icon:'🎨', name:'Mũ Beret Họa Sĩ', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 370' },
                    pirate_hat:     { icon:'🏴‍☠️', name:'Mũ Thuyền Trưởng', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 390' },
                    samurai_helmet: { icon:'⚔️', name:'Giáp Samurai', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 420' },
                    flower_crown:   { icon:'💐', name:'Vòng Hoa Thần Tiên', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 440' },
                    phoenix_feather:{ icon:'🪶', name:'Lông Phượng Hoàng', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 470' },
                    diamond_crown:  { icon:'💎', name:'Vương Miện Kim Cương', slot:'petHat',    desc:'Thưởng Cột Mốc Cấp 490' },
                    cosmic_aura:    { icon:'🌌', name:'Hào Quang Vũ Trụ', slot:'petHat',    desc:'Phần Thưởng Tối Thượng Cấp 500' }
                  }[id] || { icon:'🎀', name:id, slot:'petHat', desc:'Vật phẩm sưu tầm' };
                  const isEquipped = gameState.activeCosmetics && gameState.activeCosmetics[meta.slot] === id;
                  return (
                    <div key={id} className={`inv-item-card-modern ${isEquipped ? 'is-equipped' : ''}`}>
                      {isEquipped && <span className="inv-equipped-tag">Đang dùng</span>}
                      <div className="inv-icon-wrap">{meta.icon}</div>
                      <h4 className="inv-item-name">{meta.name}</h4>
                      <p className="inv-item-desc">{meta.desc}</p>
                      {isEquipped ? (
                        <button className="inv-action-btn btn-unequip" onClick={() => { unequipCosmetic(meta.slot); showToast(`Đã tháo ${meta.name}`); }}>
                          ✕ Tháo ra
                        </button>
                      ) : (
                        <button className="inv-action-btn btn-equip" onClick={() => { equipCosmetic(id, meta.slot); showToast(`Đã trang bị ${meta.name}`, 'success'); }}>
                          ✓ Trang bị
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Bottom Dock */}
      <nav className="modern-bottom-dock">
        <button className={`dock-nav-btn ${activeTab === 'pet' ? 'active' : ''}`} onClick={() => { sfxClick(); setActiveTab('pet'); }}>
          <span className="dock-icon">🐹</span>
          <span className="dock-label">Bọ Ú</span>
          {activeTab === 'pet' && <span className="dock-indicator" />}
        </button>
        <button className={`dock-nav-btn ${activeTab === 'fish' ? 'active' : ''}`} onClick={() => { sfxClick(); setActiveTab('fish'); }}>
          <span className="dock-icon">🐠</span>
          <span className="dock-label">Bể cá</span>
          {activeTab === 'fish' && <span className="dock-indicator" />}
        </button>
        <button className={`dock-nav-btn ${activeTab === 'plants' ? 'active' : ''}`} onClick={() => { sfxClick(); setActiveTab('plants'); }}>
          <span className="dock-icon">🌿</span>
          <span className="dock-label">Cây trồng</span>
          {activeTab === 'plants' && <span className="dock-indicator" />}
        </button>
        <button className={`dock-nav-btn ${activeTab === 'game' ? 'active' : ''}`} onClick={() => { sfxClick(); setActiveTab('game'); }}>
          <span className="dock-icon">🎮</span>
          <span className="dock-label">Trò chơi</span>
          {activeTab === 'game' && <span className="dock-indicator" />}
        </button>
        <button className={`dock-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => { sfxClick(); setActiveTab('inventory'); }}>
          <span className="dock-icon">🎒</span>
          <span className="dock-label">Kho đồ</span>
          {activeTab === 'inventory' && <span className="dock-indicator" />}
        </button>
      </nav>

      {/* Floating Toast Notification Stack */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

      <ShopModal 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
        gameState={gameState} 
        buyItem={buyItem}
        buySeed={buySeed}
        buySupply={buySupply}
        buyCosmetic={buyCosmetic}
        buyTool={buyTool}
      />

      {/* RENAME MODAL */}
      <RenameModal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        targetType={renameTarget.type}
        currentName={renameTarget.currentName}
        onSaveName={handleSavePetName}
      />

      {/* LEVEL REWARDS MODAL (UP TO LEVEL 500) */}
      <LevelRewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        gameState={gameState}
        onClaimReward={handleClaimReward}
        onClaimAll={handleClaimAllRewards}
      />
    </div>
  );
}

// Helper UI Components
function ModernPetStat({ icon, label, value, reverseColor = false }) {
  const clamped = Math.max(0, Math.min(100, Math.floor(value || 0)));
  let color = clamped > 60 ? '#10b981' : clamped > 30 ? '#f59e0b' : '#ef4444';
  if (reverseColor) {
    color = clamped > 70 ? '#ef4444' : clamped > 30 ? '#f59e0b' : '#10b981';
  }
  return (
    <div className="modern-stat-row">
      <div className="modern-stat-meta">
        <span>{icon} {label}</span>
        <span className="modern-stat-val" style={{ color }}>{clamped}%</span>
      </div>
      <div className="modern-stat-track">
        <div className="modern-stat-fill" style={{ width: `${clamped}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
