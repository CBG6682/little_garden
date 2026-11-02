import React from 'react';
import './PlantTab.css';
import PlantAvatar from './plant/PlantAvatar.jsx';
import { getPlantSellPrice } from '../config/plantProfiles.js';

// Modern Stat Bar component
function ModernStatBar({ icon, label, value, reverseColor = false }) {
  const safeVal = Math.max(0, Math.min(100, Math.floor(value || 0)));
  let color = safeVal > 60 ? '#10b981' : safeVal > 30 ? '#f59e0b' : '#ef4444';
  if (reverseColor) {
    color = safeVal > 70 ? '#ef4444' : safeVal > 30 ? '#f59e0b' : '#10b981';
  }

  return (
    <div className="plant-stat-row">
      <div className="plant-stat-meta">
        <span>{icon} {label}</span>
        <strong className="plant-stat-val">{safeVal}%</strong>
      </div>
      <div className="plant-stat-track">
        <div
          className="plant-stat-fill"
          style={{ width: `${safeVal}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
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
    <div className="plant-tab-container">
      {/* BALCONY HEADER */}
      <div className="balcony-header">
        <h2>
          <span>🌿 Vườn Ban Công Tươi Mát 🌸</span>
        </h2>
        <p>Chăm sóc các chậu cây, kích hoa và thu hoạch kiếm xu</p>
        {(Boolean(gameState.inventory?.tools?.smart_hygrometer) || Boolean(gameState.inventory?.tools?.mozart_speaker)) && (
          <div className="balcony-tools-active-bar">
            {Boolean(gameState.inventory?.tools?.smart_hygrometer) && (
              <span className="balcony-tool-badge">🌡️ Ẩm kế tự động: Ổn định</span>
            )}
            {Boolean(gameState.inventory?.tools?.mozart_speaker) && (
              <span className="balcony-tool-badge">🎵 Loa Mozart: Đang phát</span>
            )}
          </div>
        )}
      </div>

      {/* BALCONY SCENE */}
      <div className="balcony-wrapper">
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
                        title="Trồng cây mới"
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
      </div>

      {/* MODERN CARE STATION */}
      {selectedPlant ? (
        <div className="modern-care-station">
          <div className="care-header-modern">
            <div className="care-title-wrap">
              <h3 className="care-plant-name">🌿 {selectedPlant.nameVi}</h3>
              {(selectedPlant.level || 0) > 0 && (
                <span className="plant-level-badge">⭐ LV {selectedPlant.level}</span>
              )}
            </div>
            <span className={`plant-stage-badge ${selectedPlant.status.growthStage}`}>
              {getStageLabel(selectedPlant.status.growthStage)}
            </span>
          </div>

          {selectedPlant.status.growthStage === 'dead' && (
            <div className="care-station-dead-banner">
              💀 Cây đã héo úa hoàn toàn do lâu ngày thiếu chăm sóc. Hãy dọn dẹp để trồng hạt giống mới nhé!
            </div>
          )}

          {/* Detailed stats grid */}
          <div className="plant-stats-grid">
            <ModernStatBar icon="💧" label="Độ ẩm đất" value={selectedPlant.core.soilMoisture} />
            <ModernStatBar icon="🧫" label="Dinh dưỡng" value={selectedPlant.core.nutrients} />
            <ModernStatBar icon="❤️" label="Sức sống" value={selectedPlant.status.vitality} />
            <ModernStatBar icon="⛏️" label="Tơi xốp đất" value={selectedPlant.advanced?.aeration || 70} />
            <ModernStatBar icon="☀️" label="Ánh sáng" value={selectedPlant.core?.sunlight || 60} />
            <ModernStatBar icon="✨" label="Vệ sinh chậu" value={selectedPlant.status?.cleanliness || 100} />
          </div>

          {/* Row 1 Action Buttons */}
          <div className="plant-actions-grid">
            <button
              className="plant-action-btn btn-water"
              onClick={() => handleWaterPlant(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">💧</span>
              <span className="btn-text">Tưới nước<br/>(5💰)</span>
            </button>

            <button
              className="plant-action-btn btn-fert"
              onClick={() => handleFertilizePlant(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">🧫</span>
              <span className="btn-text">Bón phân<br/>(25💰)</span>
            </button>

            <button
              className="plant-action-btn btn-pest"
              onClick={() => handlePestControl(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">🐛</span>
              <span className="btn-text">Diệt sâu<br/>(10💰)</span>
            </button>

            <button
              className="plant-action-btn btn-prune"
              onClick={() => handlePrune(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">✂️</span>
              <span className="btn-text">Cắt tỉa<br/>lá úa</span>
            </button>
          </div>

          {/* Row 2 Action Buttons */}
          <div className="plant-actions-grid">
            <button
              className="plant-action-btn btn-till"
              onClick={() => handleTillSoil(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">⛏️</span>
              <span className="btn-text">Xới đất<br/>tơi xốp</span>
            </button>

            <button
              className="plant-action-btn btn-sun"
              onClick={() => handleSunbathe(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">☀️</span>
              <span className="btn-text">Tắm nắng<br/>quang hợp</span>
            </button>

            <button
              className="plant-action-btn btn-sing"
              onClick={() => handleSingToPlant(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">🎵</span>
              <span className="btn-text">Hát ru<br/>cho cây</span>
            </button>

            <button
              className={`plant-action-btn btn-light ${selectedPlant.hasGrowLight ? 'light-on' : ''}`}
              onClick={() => handleToggleGrowLight(selectedPlantIdx)}
              disabled={selectedPlant.status.growthStage === 'dead'}
            >
              <span className="btn-icon">💡</span>
              <span className="btn-text">{selectedPlant.hasGrowLight ? 'Tắt đèn' : 'Bật đèn'}</span>
            </button>
          </div>

          {/* Sell / Harvest Footer */}
          <div className="care-station-footer-modern">
            <div className="plant-value-tag">
              {selectedPlant.status.growthStage === 'dead' ? (
                <span style={{ color: '#ef4444' }}>Giá trị: 0 xu 💰</span>
              ) : (
                <>
                  <span>Giá bán:</span>
                  <span className="val-coins">{getPlantSellPrice(selectedPlant)} 💰</span>
                  {(selectedPlant.level || 0) > 0 && (
                    <span className="val-bonus">
                      +{(selectedPlant.level || 0) * 2} xu (LV {selectedPlant.level})
                    </span>
                  )}
                </>
              )}
            </div>

            <button
              className={`modern-sell-btn ${selectedPlant.status.growthStage === 'dead' ? 'clean-dead' : 'sell-active'}`}
              onClick={() => handleSellPlant(selectedPlantIdx)}
            >
              {selectedPlant.status.growthStage === 'dead' ? '🗑️ Dọn dẹp chậu' : '💸 Bán thu hoạch'}
            </button>
          </div>
        </div>
      ) : (
        <div className="modern-care-station empty">
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🪴</div>
          <h3 style={{ margin: '0 0 6px', color: '#16a34a', fontSize: '16px' }}>Trạm Chăm Sóc Cây Cảnh</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Nhấn vào một chậu cây trên ban công để kiểm tra độ ẩm, bón phân và chăm sóc!
          </p>
        </div>
      )}

      {/* Button to open Shop to buy seeds */}
      <div className="buy-more-banner">
        <button className="buy-more-btn" onClick={() => setIsShopOpen(true)}>
          🛒 Mua Thêm Hạt Giống & Cây Cảnh
        </button>
      </div>
    </div>
  );
};

export default PlantTab;
