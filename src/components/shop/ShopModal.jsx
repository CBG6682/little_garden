import React, { useState } from 'react';
import './ShopModal.css';
import { PLANT_PROFILES } from '../../config/plantProfiles.js';

const ShopModal = ({ isOpen, onClose, gameState, buyItem, buySeed, buySupply, buyCosmetic, buyTool }) => {
  const [tab, setTab] = useState('pet'); // 'pet', 'plants', 'cosmetics', 'tools'

  if (!isOpen) return null;

  const isCosmeticOwned = (id) => gameState.inventory.cosmetics?.includes(id);

  const isToolOwned = (id) => {
    if (id === 'growLight') {
      return (gameState.inventory.tools?.growLight || 0) > 0 || gameState.plants?.some(p => p.hasGrowLight);
    }
    return false;
  };

  return (
    <div className="shop-overlay">
      <div className="shop-modal">
        <div className="shop-header">
          <h2>Cửa hàng Khu Vườn Nhỏ 🌸</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="shop-tabs">
          <button className={tab === 'pet' ? 'active' : ''} onClick={() => setTab('pet')}>🐹 Bọ Ú</button>
          <button className={tab === 'plants' ? 'active' : ''} onClick={() => setTab('plants')}>🌿 Hạt giống</button>
          <button className={tab === 'cosmetics' ? 'active' : ''} onClick={() => setTab('cosmetics')}>🎀 Trang trí</button>
          <button className={tab === 'tools' ? 'active' : ''} onClick={() => setTab('tools')}>🔧 Công cụ</button>
        </div>

        <div className="shop-content">
          <div className="coins-display">Số dư: <strong>{Math.floor(gameState.currency.coins)} 💰</strong></div>
          
          {tab === 'pet' && (
            <div className="shop-grid">
              <div className="shop-item">
                <div className="item-icon">🌻</div>
                <h4>Hạt giống cao cấp</h4>
                <p>+50 Độ đói, +10 Sự vui vẻ</p>
                <button onClick={() => buySupply('premium_seed', 25, 'pet')}>Mua (25💰)</button>
              </div>
              <div className="shop-item">
                <div className="item-icon">💊</div>
                <h4>Thuốc chữa bệnh</h4>
                <p>Chữa bệnh ngay lập tức</p>
                <button onClick={() => buySupply('medicine', 50, 'pet')}>Mua (50💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🧀</div>
                <h4>Bánh dặm phô mai</h4>
                <p>100% Độ đói + 50% Sự vui vẻ</p>
                <button onClick={() => buySupply('cheese_snack', 40, 'pet')}>Mua (40💰)</button>
              </div>
            </div>
          )}

          {tab === 'plants' && (
            <div className="shop-grid">
              {Object.entries(PLANT_PROFILES).map(([id, profile]) => {
                const iconMap = {
                  sen_da_hong_sao: '🌱',
                  cay_kim_tien: '🌿',
                  cay_luoi_ho: '🪴',
                  cay_phat_tai: '🎋',
                  sen_da_do_la: '🏵️',
                  cay_van_loc: '🌺',
                  cay_trau_ba: '🍀',
                  cay_thiet_moc_lan: '🌴',
                  cay_hoa_quynh: '🌸',
                  tung_bong_lai: '🌲',
                  hanh_phuc_mini: '🌳',
                  kim_ngan_luong: '🍒',
                  duoi_cong: '🪶',
                  bang_singapore: '🍃',
                  huong_thao: '🌾',
                  day_nhen: '🕸️',
                  truc_phat_tai: '🎋',
                  ngu_gia_bi: '☘️',
                  van_loc_new: '🍂',
                  thuong_xuan: '🍀',
                  nhat_mat_huong: '🪴'
                };
                const icon = iconMap[id] || '🌱';
                const isRare = id === 'cay_hoa_quynh';
                const isNew = [
                  'cay_trau_ba', 'cay_thiet_moc_lan', 'tung_bong_lai', 'hanh_phuc_mini',
                  'kim_ngan_luong', 'duoi_cong', 'bang_singapore', 'huong_thao',
                  'day_nhen', 'truc_phat_tai', 'ngu_gia_bi', 'van_loc_new', 'thuong_xuan', 'nhat_mat_huong'
                ].includes(id);

                return (
                  <div key={id} className={`shop-item ${isRare ? 'shop-item-rare' : isNew ? 'shop-item-new' : ''}`}>
                    {isRare && <div className="rare-badge">HIẾM</div>}
                    {isNew && !isRare && <div className="new-badge">MỚI</div>}
                    <div className="item-icon">{icon}</div>
                    <h4>{profile.nameVi}</h4>
                    <p>{profile.daysPerStage} ngày/giai đoạn</p>
                    <button onClick={() => buySeed(id)}>Mua ({profile.purchasePrice}💰)</button>
                  </div>
                );
              })}
              
              {/* Plant Supplies */}
              <div className="shop-item">
                <div className="item-icon">🧪</div>
                <h4>Phân bón hữu cơ</h4>
                <p>Tối đa dinh dưỡng ngay</p>
                <button onClick={() => buySupply('fertilizer', 30, 'plant')}>Mua (30💰)</button>
              </div>
            </div>
          )}

          {tab === 'cosmetics' && (
            <div className="shop-grid">
              <div className="shop-item">
                <div className="item-icon">🎩</div>
                <h4>Mũ Top Hat</h4>
                <p>Dành cho thú cưng</p>
                {isCosmeticOwned('top_hat') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('top_hat', 200, 'petHat')}>Mua (200💰)</button>
                )}
              </div>
              <div className="shop-item">
                <div className="item-icon">🎀</div>
                <h4>Nơ Hồng</h4>
                <p>Dành cho thú cưng</p>
                {isCosmeticOwned('pink_bow') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('pink_bow', 150, 'petHat')}>Mua (150💰)</button>
                )}
              </div>
              <div className="shop-item">
                <div className="item-icon">🏺</div>
                <h4>Chậu Vàng</h4>
                <p>Cho tất cả cây</p>
                {isCosmeticOwned('gold_pot') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('gold_pot', 300, 'plantPots')}>Mua (300💰)</button>
                )}
              </div>

              {/* NEW COSMETICS */}
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">👒</div>
                <h4>Mũ rơm mùa hè</h4>
                <p>Dành cho thú cưng</p>
                {isCosmeticOwned('summer_hat') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('summer_hat', 120, 'petHat')}>Mua (120💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🎀</div>
                <h4>Nơ hồng cổ</h4>
                <p>Nơ đeo cổ cho thú cưng</p>
                {isCosmeticOwned('pink_bowtie') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('pink_bowtie', 100, 'petHat')}>Mua (100💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🏺</div>
                <h4>Chậu Gốm Bát Tràng</h4>
                <p>Gốm truyền thống Việt Nam</p>
                {isCosmeticOwned('bat_trang_pot') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('bat_trang_pot', 250, 'plantPots')}>Mua (250💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">💎</div>
                <h4>Chậu Đá Cẩm Thạch</h4>
                <p>Chậu cao cấp bằng đá marble</p>
                {isCosmeticOwned('marble_pot') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('marble_pot', 350, 'plantPots')}>Mua (350💰)</button>
                )}
              </div>
            </div>
          )}

          {tab === 'tools' && (
            <div className="shop-grid">
              <div className="shop-item shop-item-tool">
                <div className="item-icon">💡</div>
                <h4>Đèn LED quang hợp</h4>
                <p>Cây phát triển tốc độ tối đa cả ban đêm. Đặt trên chậu cây.</p>
                {isToolOwned('growLight') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyTool && buyTool('growLight', 150)}>Mua (150💰)</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopModal;
