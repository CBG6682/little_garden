import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import { db } from './config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { offlineReconcile } from './utils/offlineReconcile.js';
import BoUAvatar from './components/pet/BoUAvatar.jsx';
import PlantAvatar from './components/plant/PlantAvatar.jsx';
import Game2048 from './components/minigame/Game2048.jsx';
import MemoryGame from './components/minigame/MemoryGame.jsx';
import SnakeGame from './components/minigame/SnakeGame.jsx';
import PongGame from './components/minigame/PongGame.jsx';
import FlappyGame from './components/minigame/FlappyGame.jsx';
import TetrisGame from './components/minigame/TetrisGame.jsx';
import MinesweeperGame from './components/minigame/MinesweeperGame.jsx';
import PlantTab from './components/PlantTab.jsx';
import ShopModal from './components/shop/ShopModal.jsx';
import { PLANT_PROFILES, getSeedPrice, getPlantSellPrice } from './config/plantProfiles.js';
import { sfxClick, sfxWater, sfxFeed, sfxReward, sfxEquip, sfxSell, startBGM, setMuted, getMuted } from './utils/audio.js';
import './App.css';

const defaultGameState = {
  profile: { lastSaveTimestamp: Date.now() },
  currency: { coins: 100 },
  pet: null,
  plants: [],
  weather: { current: "sunny" },
  inventory: { seeds: {}, medicine: 0, fertilizer: 0, cosmetics: [], tools: { growLight: 0 } },
  activeCosmetics: { petHat: null, plantPots: {} }
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
  const [wateringStates, setWateringStates] = useState({});
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [selectedPlantIdx, setSelectedPlantIdx] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

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
      alert("Bạn cần thêm tiền!");
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
    buyItem(10, state => state.pet.essential.hunger = Math.min(100, state.pet.essential.hunger + 30));
    setIsEating(true);
    sfxFeed();
    setTimeout(() => setIsEating(false), 2000);
  };

  const handlePlayLaser = () => {
    if (gameState.pet.state.isSleeping) return;
    setGameState(prev => {
      const state = {...prev};
      state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 20);
      state.pet.mental.boredom = Math.max(0, state.pet.mental.boredom - 30);
      state.pet.essential.energy = Math.max(0, state.pet.essential.energy - 10);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleAddBedding = () => {
    buyItem(15, state => state.pet.essential.hygiene = Math.min(100, state.pet.essential.hygiene + 40));
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
    alert('Đã bắt sâu thành công!');
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
      newState.pet = {
        essential: { hunger: 100, thirst: 100, energy: 100, hygiene: 100, bladder: 100 },
        mental: { happiness: 100, affection: 50, stress: 0, boredom: 0 },
        health: { overall: 100 },
        physical: { fitness: 50 },
        state: { isSleeping: false, sleepStartTimestamp: null, lastPetTimestamp: null }
      };
      setDoc(doc(db, 'users', user.uid), newState);
      return newState;
    });
  };

  // --- NEW PET ACTIONS ---
  const handlePetBoU = () => {
    if (gameState.pet.state.isSleeping) return;
    const now = Date.now();
    const last = gameState.pet.state.lastPetTimestamp || 0;
    if (now - last < 10000) { alert('Bọ Ú cần nghỉ ngơi chút! (10s)'); return; }
    setIsPetting(true);
    setTimeout(() => setIsPetting(false), 1500);
    setGameState(prev => {
      const state = { ...prev };
      state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 15);
      state.pet.mental.affection = Math.min(100, state.pet.mental.affection + 10);
      state.pet.mental.stress = Math.max(0, state.pet.mental.stress - 5);
      state.pet.state.lastPetTimestamp = now;
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleExercise = () => {
    if (gameState.pet.state.isSleeping) return;
    if (gameState.pet.essential.energy < 20) { alert('Bọ Ú quá mệt để tập!'); return; }
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 5000);
    setGameState(prev => {
      const state = { ...prev };
      state.pet.mental.boredom = Math.max(0, state.pet.mental.boredom - 30);
      state.pet.essential.energy = Math.max(0, state.pet.essential.energy - 20);
      if (!state.pet.physical) state.pet.physical = { fitness: 50 };
      state.pet.physical.fitness = Math.min(100, state.pet.physical.fitness + 15);
      setDoc(doc(db, 'users', user.uid), state);
      return state;
    });
  };

  const handleVetCheck = () => {
    buyItem(50, state => {
      state.pet.health.overall = 100;
      state.pet.mental.stress = 0;
      alert('Bác sĩ đã khám xong! Sức khỏe phục hồi hoàn toàn.');
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
      if (tools.growLight <= 0) { alert('Bạn chưa có đèn LED! Hãy mua ở cửa hàng.'); return; }
      setGameState(prev => { const s = {...prev}; s.plants[idx].hasGrowLight = true; s.inventory.tools.growLight -= 1; setDoc(doc(db,'users',user.uid),s); return s; });
    }
  };

  const buySeed = (id) => {
    if (gameState.plants.length >= 6) {
      alert("Ban công đã đầy! Tối đa 6 chậu cây.");
      return;
    }
    const profile = PLANT_PROFILES[id];
    if (!profile) return;
    const cost = profile.purchasePrice;
    if (gameState.currency.coins < cost) { alert("Bạn cần thêm tiền!"); return; }
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
      alert("Đã mua thành công!");
      return newState;
    });
  };

  const buySupply = (itemId, cost, category) => {
    buyItem(cost, state => {
      if (itemId === 'medicine' && state.pet) {
        state.pet.health.overall = 100;
        state.pet.mental.stress = 0;
        alert("Đã chữa khỏi bệnh cho thú cưng!");
      } else if (itemId === 'fertilizer') {
        state.plants.forEach(p => p.core.nutrients = 100);
        alert("Tất cả cây đã được bón phân!");
      } else if (itemId === 'premium_seed' && state.pet) {
        state.pet.essential.hunger = Math.min(100, state.pet.essential.hunger + 50);
        state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 10);
        alert("Thú cưng đã ăn ngon!");
      } else if (itemId === 'cheese_snack' && state.pet) {
        state.pet.essential.hunger = 100;
        state.pet.mental.happiness = Math.min(100, state.pet.mental.happiness + 50);
        alert("Bọ Ú thích bánh phô mai! 🧀");
      }
    });
  };

  const buyTool = (toolId, cost) => {
    const owned = (gameState.inventory.tools?.[toolId] || 0) > 0 || gameState.plants?.some(p => p.hasGrowLight);
    if (owned) {
      alert("Bạn đã sở hữu công cụ này!");
      return;
    }
    buyItem(cost, state => {
      if (!state.inventory.tools) state.inventory.tools = { growLight: 0 };
      if (toolId === 'growLight') {
        const stateOwned = state.inventory.tools.growLight > 0 || state.plants.some(p => p.hasGrowLight);
        if (!stateOwned) {
          state.inventory.tools = { ...state.inventory.tools, growLight: state.inventory.tools.growLight + 1 };
          alert('Đã mua Đèn LED quang hợp! Đặt lên cây trong menu chăm sóc.');
        }
      }
    });
  };

  const buyCosmetic = (id, cost, slot) => {
    if (gameState.inventory.cosmetics.includes(id)) {
      alert("Bạn đã sở hữu món đồ này!");
      return;
    }
    buyItem(cost, state => {
      if (!state.inventory.cosmetics.includes(id)) {
        state.inventory.cosmetics = [...state.inventory.cosmetics, id];
        if (slot === 'petHat') state.activeCosmetics = { ...state.activeCosmetics, petHat: id };
        if (slot === 'plantPots') state.activeCosmetics = { ...state.activeCosmetics, plantPots: id };
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
      : `Bạn có chắc chắn muốn bán "${plant.nameVi}" với giá ${price} xu không?`;
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
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: 'var(--pink-primary)', color: 'white', borderBottomRadius: '20px', boxShadow: 'var(--shadow)', zIndex: 100 }}>
        <div style={{ fontWeight: 'bold' }}>{user.displayName}</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => { const m = !isMuted; setIsMuted(m); setMuted(m); }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '10px', padding: '2px 8px', cursor: 'pointer', fontSize: '16px' }}>{isMuted ? '🔇' : '🔊'}</button>
          <button onClick={() => { sfxClick(); setIsShopOpen(true); }} style={{ background: 'var(--yellow)', border: 'none', borderRadius: '15px', padding: '2px 10px', cursor: 'pointer', fontWeight: 'bold' }}>🛒 Cửa hàng</button>
          <div style={{ fontWeight: 'bold', fontSize: '18px', background: 'white', color: 'var(--pink-dark)', padding: '2px 10px', borderRadius: '15px' }}>💰 {Math.floor(gameState.currency.coins)}</div>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '10px', padding: '0 10px', cursor: 'pointer' }}>Thoát</button>
      </header>

      <main style={{ flex: 1, padding: '20px', overflowY: 'auto', overflowX: 'hidden' }}>
        {activeTab === 'pet' && (
          <div style={{ textAlign: 'center' }}>
            {gameState.pet === null ? (
              <div style={{ padding: '40px 20px' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--pink-dark)' }}>Chào mừng tới Khu Vườn Nhỏ!</h2>
                <p style={{ color: 'var(--text)', marginBottom: '30px' }}>Bạn chưa có thú cưng nào.</p>
                <button onClick={adoptPet} style={{ padding: '15px 30px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '25px', fontSize: '18px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>Nhận Nuôi Bọ Ú (Miễn phí)</button>
              </div>
            ) : gameState.pet.isDead ? (
              <div style={{ padding: '20px' }}>
                <h2>Bọ Ú</h2>
                <div style={{ margin: '30px 0' }}>
                  <BoUAvatar isDead={true} />
                </div>
                <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '15px', border: '2px solid #ccc', maxWidth: '350px', margin: '0 auto 20px', boxShadow: 'var(--shadow)' }}>
                  <h3 style={{ color: '#5D4037', marginBottom: '10px' }}>R.I.P Bọ Ú 😢</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: 0 }}>Thú cưng của bạn đã qua đời do không được chăm sóc kịp thời.</p>
                </div>
                <button onClick={adoptPet} style={{ padding: '15px 30px', backgroundColor: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '25px', fontSize: '18px', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>Nhận Nuôi Bọ Ú Mới (Miễn phí)</button>
              </div>
            ) : (
              <>
                <h2>Bọ Ú</h2>
                <div style={{ margin: '30px 0' }}>
                  <BoUAvatar 
                    mood={gameState.pet.health.overall < 50 ? 'sad' : gameState.pet.state.isSleeping ? 'sleepy' : 'happy'} 
                    isEating={isEating}
                    isRunning={isRunning}
                    isPetting={isPetting}
                    equippedHat={gameState.activeCosmetics.petHat}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '350px', margin: '0 auto 20px' }}>
                  <StatBar label="Độ đói" value={gameState.pet.essential.hunger} />
                  <StatBar label="Năng lượng" value={gameState.pet.essential.energy} />
                  <StatBar label="Sự vui vẻ" value={gameState.pet.mental.happiness} />
                  <StatBar label="Buồn chán" value={gameState.pet.mental.boredom} reverseColor={true} />
                  <StatBar label="Sức khỏe" value={gameState.pet.physical?.fitness || 50} />
                  <StatBar label="Thể trạng" value={gameState.pet.health.overall} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '350px', margin: '0 auto' }}>
                  <ActionButton label="Cho ăn (10💰)" onClick={handleFeed} />
                  <ActionButton label="Cho uống nước (5💰)" onClick={() => buyItem(5, state => state.pet.essential.thirst = Math.min(100, state.pet.essential.thirst + 35))} />
                  <ActionButton label="Chơi Laser (Miễn phí)" onClick={handlePlayLaser} />
                  <ActionButton label="Thêm đệm lót (15💰)" onClick={handleAddBedding} />
                  <ActionButton label="💕 Vuốt ve" onClick={handlePetBoU} />
                  <ActionButton label="🏃 Tập thể dục" onClick={handleExercise} />
                  <ActionButton label="🏥 Khám bệnh (50💰)" onClick={handleVetCheck} />
                  <ActionButton label={gameState.pet.state.isSleeping ? "Dậy" : "Ngủ"} onClick={() => setGameState(prev => {
                      const state = {...prev};
                      state.pet.state.isSleeping = !state.pet.state.isSleeping;
                      if (state.pet.state.isSleeping) state.pet.state.sleepStartTimestamp = Date.now();
                      setDoc(doc(db, 'users', user.uid), state);
                      return state;
                  })} />
                </div>
              </>
            )}
          </div>
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
          <div style={{ textAlign: 'center', padding: '10px 20px' }}>
            {selectedGame === null ? (
              <div>
                <h2 style={{ color: 'var(--pink-dark)', marginBottom: '5px' }}>Khu Vui Chơi Giải Trí 🎮</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '14px', marginBottom: '25px' }}>Chơi mini-game để kiếm thêm xu chăm sóc khu vườn</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
                  {/* Card for 2048 */}
                  <div style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: 'var(--shadow)', border: '2px solid var(--pink-light)', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                    <div style={{ fontSize: '40px' }}>🧩</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--pink-dark)' }}>Trò Chơi 2048</h3>
                      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--text)' }}>Hợp nhất các ô số giống nhau để đạt điểm tối đa.</p>
                      <span style={{ fontSize: '11px', color: 'var(--pink-primary)', fontWeight: 'bold' }}>Phần thưởng: Điểm ÷ 100 = Xu 💰</span>
                    </div>
                    <button onClick={() => { sfxClick(); setSelectedGame('2048'); }} style={{ padding: '8px 16px', background: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Chơi</button>
                  </div>
                  {/* Card for Memory Match */}
                  <div style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: 'var(--shadow)', border: '2px solid var(--pink-light)', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                    <div style={{ fontSize: '40px' }}>🧠</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--pink-dark)' }}>Trận Chiến Trí Nhớ</h3>
                      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--text)' }}>Tìm tất cả cặp hình giống nhau trước khi hết thời gian.</p>
                      <span style={{ fontSize: '11px', color: 'var(--pink-primary)', fontWeight: 'bold' }}>Tỷ lệ: 2 xu/cặp + 10 xu thưởng 💰</span>
                    </div>
                    <button onClick={() => { sfxClick(); setSelectedGame('memory'); }} style={{ padding: '8px 16px', background: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Chơi</button>
                  </div>
                  {/* Card for Snake */}
                  <div style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: 'var(--shadow)', border: '2px solid var(--pink-light)', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                    <div style={{ fontSize: '40px' }}>🐍</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--pink-dark)' }}>Rắn Săn Mồi</h3>
                      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--text)' }}>Điều khiển rắn ăn quả táo đỏ mà không đâm vào tường hoặc đuôi.</p>
                      <span style={{ fontSize: '11px', color: 'var(--pink-primary)', fontWeight: 'bold' }}>Tỷ lệ: Điểm ÷ 100 = Xu 💰</span>
                    </div>
                    <button onClick={() => { sfxClick(); setSelectedGame('snake'); }} style={{ padding: '8px 16px', background: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Chơi</button>
                  </div>
                  {/* Card for Pong */}
                  <div style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: 'var(--shadow)', border: '2px solid var(--pink-light)', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                    <div style={{ fontSize: '40px' }}>🏓</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--pink-dark)' }}>Bóng Bàn Pong</h3>
                      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--text)' }}>Đỡ quả bóng nảy qua lại để ghi điểm trước máy.</p>
                      <span style={{ fontSize: '11px', color: 'var(--pink-primary)', fontWeight: 'bold' }}>Tỷ lệ: Điểm ÷ 100 = Xu 💰</span>
                    </div>
                    <button onClick={() => { sfxClick(); setSelectedGame('pong'); }} style={{ padding: '8px 16px', background: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Chơi</button>
                  </div>
                  {/* Card for Flappy */}
                  <div style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: 'var(--shadow)', border: '2px solid var(--pink-light)', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                    <div style={{ fontSize: '40px' }}>🐦</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--pink-dark)' }}>Flappy Bọ Ú</h3>
                      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--text)' }}>Bay qua các ống nước và không chạm đất.</p>
                      <span style={{ fontSize: '11px', color: 'var(--pink-primary)', fontWeight: 'bold' }}>Tỷ lệ: Cột x 2 = Xu 💰</span>
                    </div>
                    <button onClick={() => { sfxClick(); setSelectedGame('flappy'); }} style={{ padding: '8px 16px', background: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Chơi</button>
                  </div>
                  {/* Card for Tetris */}
                  <div style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: 'var(--shadow)', border: '2px solid var(--pink-light)', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                    <div style={{ fontSize: '40px' }}>🧱</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--pink-dark)' }}>Xếp Hình Tetris</h3>
                      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--text)' }}>Xóa hàng ngang để ghi điểm.</p>
                      <span style={{ fontSize: '11px', color: 'var(--pink-primary)', fontWeight: 'bold' }}>Tỷ lệ: Hàng x 10 = Xu 💰</span>
                    </div>
                    <button onClick={() => { sfxClick(); setSelectedGame('tetris'); }} style={{ padding: '8px 16px', background: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Chơi</button>
                  </div>
                  {/* Card for Minesweeper */}
                  <div style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: 'var(--shadow)', border: '2px solid var(--pink-light)', display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' }}>
                    <div style={{ fontSize: '40px' }}>💣</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--pink-dark)' }}>Dò Mìn (Minesweeper)</h3>
                      <p style={{ margin: '4px 0 10px', fontSize: '12px', color: 'var(--text)' }}>Tìm tất cả ô an toàn trên lưới 9x9 chứa 10 quả mìn.</p>
                      <span style={{ fontSize: '11px', color: 'var(--pink-primary)', fontWeight: 'bold' }}>Tỷ lệ: Mở ô = Xu + Thưởng 💰</span>
                    </div>
                    <button onClick={() => { sfxClick(); setSelectedGame('minesweeper'); }} style={{ padding: '8px 16px', background: 'var(--pink-primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Chơi</button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                  <button onClick={() => { sfxClick(); setSelectedGame(null); }} style={{ background: 'var(--pink-light)', border: 'none', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', color: 'var(--pink-dark)', fontWeight: 'bold' }}>⬅ Quay lại</button>
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
                ) : (
                  <PongGame onReward={onMinigameReward} />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ textAlign:'center', marginBottom:'5px', color:'var(--pink-dark)' }}>🎒 Kho Đồ</h2>
            <p style={{ textAlign:'center', color:'var(--text-light)', fontSize:'13px', marginBottom:'15px' }}>Trang bị phụ kiện cho thú cưng và cây trồng</p>

            {gameState.inventory.cosmetics.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{ fontSize:'60px', marginBottom:'15px' }}>🎀</div>
                <p style={{ color:'var(--text-light)' }}>Chưa có phụ kiện nào. Ghé Cửa Hàng để mua!</p>
                <button onClick={() => setIsShopOpen(true)} style={{ marginTop:'15px', padding:'12px 25px', background:'var(--pink-primary)', color:'white', border:'none', borderRadius:'20px', cursor:'pointer', fontWeight:'bold' }}>Mở Cửa Hàng</button>
              </div>
            ) : (
              <div className="inventory-grid">
                {Array.from(new Set(gameState.inventory.cosmetics)).map(id => {
                  const meta = {
                    top_hat:       { icon:'🎩', name:'Mũ Top Hat',       slot:'petHat',    desc:'Cho thú cưng' },
                    pink_bow:      { icon:'🎀', name:'Nơ Hồng',          slot:'petHat',    desc:'Cho thú cưng' },
                    gold_pot:      { icon:'🏺', name:'Chậu Vàng',        slot:'plantPots', desc:'Cho tất cả cây' },
                    summer_hat:    { icon:'👒', name:'Mũ rơm mùa hè',    slot:'petHat',    desc:'Cho thú cưng' },
                    pink_bowtie:   { icon:'🎀', name:'Nơ hồng cổ',       slot:'petHat',    desc:'Đeo cổ thú cưng' },
                    bat_trang_pot: { icon:'🏺', name:'Chậu Gốm Bát Tràng', slot:'plantPots', desc:'Cho tất cả cây' },
                    marble_pot:    { icon:'💎', name:'Chậu Đá Cẩm Thạch', slot:'plantPots', desc:'Cho tất cả cây' },
                  }[id] || { icon:'❓', name:id, slot:'petHat', desc:'' };
                  const isEquipped = gameState.activeCosmetics[meta.slot] === id;
                  return (
                    <div key={id} className={`inventory-item ${isEquipped ? 'equipped' : ''}`}>
                      <div className="item-icon-big">{meta.icon}</div>
                      <h4>{meta.name}</h4>
                      <p>{meta.desc}</p>
                      {isEquipped ? (
                        <button className="equip-btn unequip" onClick={() => unequipCosmetic(meta.slot)}>✕ Tháo ra</button>
                      ) : (
                        <button className="equip-btn equip" onClick={() => equipCosmetic(id, meta.slot)}>✓ Trang bị</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <nav style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 5px', backgroundColor: 'var(--white)', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', zIndex: 100 }}>
        <NavButton active={activeTab === 'pet'}       onClick={() => setActiveTab('pet')}>🐹 Bọ Ú</NavButton>
        <NavButton active={activeTab === 'plants'}    onClick={() => setActiveTab('plants')}>🌿 Cây trồng</NavButton>
        <NavButton active={activeTab === 'game'}      onClick={() => setActiveTab('game')}>🎮 Trò chơi</NavButton>
        <NavButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>🎒 Kho đồ</NavButton>
      </nav>

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
    </div>
  );
}

// Helper UI Components
function StatBar({ label, value, reverseColor = false }) {
  let color = value > 60 ? 'var(--green)' : value > 30 ? 'var(--yellow)' : 'var(--red)';
  if (reverseColor) {
    color = value > 70 ? 'var(--red)' : value > 30 ? 'var(--yellow)' : 'var(--green)';
  }
  return (
    <div style={{ textAlign: 'left', marginBottom: '8px' }}>
      <div style={{ fontSize: '12px', marginBottom: '2px', color: 'var(--text)', fontWeight: 'bold' }}>{label}: {Math.floor(value)}%</div>
      <div style={{ height: '10px', width: '100%', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, backgroundColor: color, transition: 'width 0.3s' }}></div>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '8px', backgroundColor: 'var(--pink-light)', color: 'var(--pink-dark)', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', flex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: '12px' }}>
      {label}
    </button>
  );
}

function NavButton({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', fontSize: '16px', color: active ? 'var(--pink-primary)' : 'var(--text-light)', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {children}
      {active && <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--pink-primary)', borderRadius: '50%', marginTop: '4px' }}></div>}
    </button>
  );
}
