import React from 'react';
import PlantAvatar from './plant/PlantAvatar.jsx';
import { getPlantSellPrice } from '../config/plantProfiles.js';

// Helper components
function StatBar({ label, value, reverseColor = false }) {
  let color = value > 60 ? 'var(--green)' : value > 30 ? 'var(--yellow)' : 'var(--red)';
  if (reverseColor) {
    color = value > 70 ? 'var(--red)' : value > 30 ? 'var(--yellow)' : 'var(--green)';
  }
  return (
    <div style={{ textAlign: 'left', marginBottom: '6px' }}>
      <div style={{ fontSize: '11px', marginBottom: '2px', color: 'var(--text)', fontWeight: 'bold' }}>
        {label}: {Math.floor(value)}%
      </div>
      <div style={{ height: '8px', width: '100%', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, backgroundColor: color, transition: 'width 0.3s' }}></div>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick, disabled, style }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{ 
        padding: '8px 4px', 
        backgroundColor: disabled ? '#f1f1f1' : 'var(--pink-light)', 
        color: disabled ? '#9e9e9e' : 'var(--pink-dark)', 
        border: 'none', 
        borderRadius: '10px', 
        fontWeight: 'bold', 
        cursor: disabled ? 'not-allowed' : 'pointer', 
        flex: 1, 
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
        fontSize: '11px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s',
        ...style 
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      {label}
    </button>
  );
}

const PlantTab = ({
  gameState,
  selectedPlantIdx,
  setSelectedPlantIdx,
  wateringStates,
  isDay,
  setIsShopOpen,
  handleWaterPlant,
  handleFertilizePlant,
  handlePestControl,
  handlePrune,
  handleTillSoil,
  handleSunbathe,
  handleSingToPlant,
  handleToggleGrowLight,
  handleSellPlant
}) => {
  const plants = gameState.plants || [];
  const selectedPlant = selectedPlantIdx !== null ? plants[selectedPlantIdx] : null;

  // Determine stage display name in Vietnamese
  const getStageLabel = (stage) => {
    switch (stage) {
      case 'seed': return 'Hạt giống 🌱';
      case 'sprout': return 'Cây mầm 🌿';
      case 'plant': return 'Cây non 🪴';
      case 'mature': return 'Trưởng thành 🌸';
      case 'dead': return 'Cây đã chết 💀';
      default: return stage;
    }
  };

  return (
    <div style={{ padding: 0 }}>
      {/* BALCONY SCENE */}
      <div className="balcony-scene">
        <div className={`city-background ${isDay ? 'day' : 'night'}`}>
          {/* Sky elements clipped inside */}
          <div className="sky-clip">
            <div className="sun-moon"></div>
            <div className="clouds">
              <div className="cloud c1"></div>
              <div className="cloud c2"></div>
            </div>
            <div className="stars">
              <div className="star s1"></div>
              <div className="star s2"></div>
              <div className="star s3"></div>
            </div>
            <div className="buildings">
              <div className="building" style={{ height: '70px' }}><div className="window w1"></div><div className="window w2"></div></div>
              <div className="building" style={{ height: '100px' }}><div className="window w3"></div><div className="window w4"></div></div>
              <div className="building" style={{ height: '55px' }}><div className="window w1"></div></div>
              <div className="building" style={{ height: '80px' }}><div className="window w2"></div><div className="window w3"></div></div>
              <div className="building" style={{ height: '45px' }}></div>
              <div className="building" style={{ height: '90px' }}><div className="window w4"></div></div>
            </div>
          </div>

          {/* PLANTS sitting on top of the rail */}
          <div className="balcony-plants-row">
            {Array.from({ length: 6 }).map((_, idx) => {
              const plant = plants[idx];
              const isSelected = selectedPlantIdx === idx;
              return (
                <div
                  key={idx}
                  className={`balcony-plant-slot ${isSelected ? 'selected' : ''}`}
                  onClick={() => plant && setSelectedPlantIdx(isSelected ? null : idx)}
                  style={{ position: 'relative' }}
                >
                  {plant ? (
                    <PlantAvatar
                      species={plant.id}
                      stage={plant.status.growthStage}
                      isWatering={wateringStates[idx]}
                      potSkin={gameState.activeCosmetics.plantPots}
                      isBlooming={plant.isBlooming || false}
                      hasGrowLight={plant.hasGrowLight || false}
                    />
                  ) : (
                    <div 
                      className="empty-plant-slot" 
                      onClick={(e) => { e.stopPropagation(); setIsShopOpen(true); }}
                    >
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WOODEN BALCONY SHELF */}
          <div className="balcony-shelf">
            <div className="balcony-top-rail"></div>
            <div className="balcony-posts-row">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="balcony-post"></div>)}
            </div>
            <div className="balcony-floor"></div>
          </div>
        </div>
      </div>

      {/* PERMANENT CARE STATION */}
      {selectedPlant ? (
        <div className="care-station">
          <div className="care-station-header">
            <h3 className="care-station-title">🌿 Trạm Chăm Sóc: {selectedPlant.nameVi}</h3>
            <span className={`care-station-badge ${selectedPlant.status.growthStage}`}>
              {getStageLabel(selectedPlant.status.growthStage)}
            </span>
          </div>

          {selectedPlant.status.growthStage === 'dead' && (
            <div className="care-station-dead-banner">
              💀 Cây đã héo úa hoàn toàn do thiếu sự chăm sóc. Bạn không thể thực hiện các hành động chăm sóc nữa.
            </div>
          )}

          {/* Detailed stats grids */}
          <div className="care-station-grid">
            <StatBar label="Độ ẩm đất" value={selectedPlant.core.soilMoisture} />
            <StatBar label="Chất dinh dưỡng" value={selectedPlant.core.nutrients} />
            <StatBar label="Sức sống (Máu)" value={selectedPlant.status.vitality} />
            <StatBar label="Độ tơi xốp đất" value={selectedPlant.advanced.aeration || 70} />
            <StatBar label="Ánh sáng hấp thụ" value={selectedPlant.core.sunlight || 60} />
            <StatBar label="Vệ sinh chậu" value={selectedPlant.status.cleanliness || 100} />
          </div>

          {/* Row 1 Action Buttons */}
          <div className="care-station-actions">
            <ActionButton 
              label="Tưới Nước" 
              icon="💧" 
              onClick={() => handleWaterPlant(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'} 
            />
            <ActionButton 
              label="Bón Phân" 
              icon="🧫" 
              onClick={() => handleFertilizePlant(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'} 
            />
            <ActionButton 
              label="Diệt Sâu" 
              icon="🐛" 
              onClick={() => handlePestControl(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'} 
            />
            <ActionButton 
              label="Cắt Tỉa" 
              icon="✂️" 
              onClick={() => handlePrune(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'} 
            />
          </div>

          {/* Row 2 Action Buttons */}
          <div className="care-station-actions-row2">
            <ActionButton 
              label="Xới Đất" 
              icon="⛏️" 
              onClick={() => handleTillSoil(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'} 
            />
            <ActionButton 
              label="Tắm Nắng" 
              icon="☀️" 
              onClick={() => handleSunbathe(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'} 
            />
            <ActionButton 
              label="Hát Cho Cây" 
              icon="🎵" 
              onClick={() => handleSingToPlant(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'} 
            />
            <ActionButton 
              label={selectedPlant.hasGrowLight ? 'Tắt Đèn' : 'Bật Đèn'} 
              icon="💡" 
              onClick={() => handleToggleGrowLight(selectedPlantIdx)} 
              disabled={selectedPlant.status.growthStage === 'dead'}
              style={selectedPlant.hasGrowLight ? { background: '#7C4DFF', color: 'white' } : {}}
            />
          </div>

          {/* Sell Row */}
          <div className="care-station-footer">
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--text)' }}>
              {selectedPlant.status.growthStage === 'dead' ? (
                <span style={{ color: 'var(--red)' }}>Giá trị: 0 xu 💰</span>
              ) : (
                <span style={{ color: 'var(--green)' }}>Giá trị: {getPlantSellPrice(selectedPlant)} xu 💰</span>
              )}
            </div>
            <button 
              className="sell-btn" 
              style={{ width: 'auto', padding: '6px 20px' }}
              onClick={() => handleSellPlant(selectedPlantIdx)}
            >
              {selectedPlant.status.growthStage === 'dead' ? '🗑️ Dọn dẹp chậu' : '💸 Bán cây'}
            </button>
          </div>
        </div>
      ) : (
        <div className="care-station empty">
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌿</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Trạm Chăm Sóc Cây Trồng</div>
          <p style={{ margin: '4px 0 0', fontSize: '11px', textAlign: 'center' }}>
            Chọn một chậu cây trên ban công ở trên để bắt đầu chăm sóc chi tiết.
          </p>
        </div>
      )}

      {/* Button to open Shop to buy more plants */}
      <div style={{ textAlign: 'center', padding: '15px 20px' }}>
        <button 
          onClick={() => setIsShopOpen(true)} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'var(--green)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '15px', 
            cursor: 'pointer', 
            fontWeight: 'bold' 
          }}
        >
          🛒 Mua Thêm Cây
        </button>
      </div>
    </div>
  );
};

export default PlantTab;
