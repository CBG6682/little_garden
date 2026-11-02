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
    return (gameState.inventory?.tools?.[id] || 0) > 0;
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
          <button className={tab === 'fish' ? 'active' : ''} onClick={() => setTab('fish')}>🐠 Bể cá</button>
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
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🥕</div>
                <h4>Cà rốt hữu cơ</h4>
                <p>+35 Độ đói, +15 Thể lực/Mài răng</p>
                <button onClick={() => buySupply('carrot_snack', 15, 'pet')}>Mua (15💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🍎</div>
                <h4>Táo đỏ sấy dẻo</h4>
                <p>+30 Độ đói, +30 Vui vẻ, sạch stress</p>
                <button onClick={() => buySupply('dried_apple', 20, 'pet')}>Mua (20💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🌾</div>
                <h4>Cỏ Alfalfa thơm</h4>
                <p>+40 Độ đói, +30 Vệ sinh/Mượt lông</p>
                <button onClick={() => buySupply('alfalfa_hay', 25, 'pet')}>Mua (25💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🪵</div>
                <h4>Gỗ gặm mài răng</h4>
                <p>+25 Thể lực mài răng, +20 Thân thiết</p>
                <button onClick={() => buySupply('chew_stick', 15, 'pet')}>Mua (15💰)</button>
              </div>
            </div>
          )}

          {tab === 'fish' && (
            <div className="shop-grid">
              <div className="shop-item">
                <div className="item-icon">🦟</div>
                <h4>Lăng quăng & Trùn chỉ</h4>
                <p>+40 Độ đói, +25 Sự vui vẻ cho cả 2 cá</p>
                <button onClick={() => buySupply('fish_food', 15, 'fish')}>Mua (15💰)</button>
              </div>
              <div className="shop-item">
                <div className="item-icon">💊</div>
                <h4>Muối khoáng & Thuốc cá</h4>
                <p>Phục hồi 100% máu, giải stress</p>
                <button onClick={() => buySupply('fish_medicine', 40, 'fish')}>Mua (40💰)</button>
              </div>
              <div className="shop-item">
                <div className="item-icon">🌿</div>
                <h4>Rong La Hán Thủy Sinh</h4>
                <p>+35 Oxy, nước sạch trong lành</p>
                <button onClick={() => buySupply('water_plant', 25, 'fish')}>Mua (25💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🍃</div>
                <h4>Lá Bàng Khô Lên Màu</h4>
                <p>Dưỡng vây bóng khỏe, kích thích xòe đuôi</p>
                <button onClick={() => buySupply('almond_leaf', 30, 'fish')}>Mua (30💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🦐</div>
                <h4>Tép tươi Artemia</h4>
                <p>+45 Độ đói, +30 Vui vẻ cho cả 2 cá</p>
                <button onClick={() => buySupply('artemia_shrimp', 20, 'fish')}>Mua (20💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🪨</div>
                <h4>Đá nham thạch vi sinh</h4>
                <p>+30 Độ sạch nước, +25 Oxy bể</p>
                <button onClick={() => buySupply('volcanic_rock', 35, 'fish')}>Mua (35💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🐌</div>
                <h4>Ốc táo vàng dọn bể</h4>
                <p>100% Sạch nước, giảm stress</p>
                <button onClick={() => buySupply('apple_snail', 30, 'fish')}>Mua (30💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🏮</div>
                <h4>Đèn chiếu Nano LED</h4>
                <p>100% Vui vẻ, kích vảy dạ quang</p>
                <button onClick={() => buySupply('nano_led', 40, 'fish')}>Mua (40💰)</button>
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
                  nhat_mat_huong: '🪴',
                  hoa_sen_mini: '🪷',
                  xuong_rong_tai_tho: '🌵',
                  lan_ho_diep: '🌺',
                  huong_duong_lun: '🌻',
                  sen_da_mong_rong: '🐲',
                  mai_vang_bonsai: '🌼'
                };
                const icon = iconMap[id] || '🌱';
                const isRare = id === 'cay_hoa_quynh' || id === 'mai_vang_bonsai' || id === 'lan_ho_diep';
                const isNew = [
                  'cay_trau_ba', 'cay_thiet_moc_lan', 'tung_bong_lai', 'hanh_phuc_mini',
                  'kim_ngan_luong', 'duoi_cong', 'bang_singapore', 'huong_thao',
                  'day_nhen', 'truc_phat_tai', 'ngu_gia_bi', 'van_loc_new', 'thuong_xuan', 'nhat_mat_huong',
                  'hoa_sen_mini', 'xuong_rong_tai_tho', 'lan_ho_diep', 'huong_duong_lun', 'sen_da_mong_rong', 'mai_vang_bonsai'
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
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🪱</div>
                <h4>Phân trùn quế nguyên chất</h4>
                <p>100% Dinh dưỡng & Tơi xốp đất mọi cây</p>
                <button onClick={() => buySupply('worm_castings', 35, 'plant')}>Mua (35💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🧴</div>
                <h4>Xịt thảo mộc đuổi rệp</h4>
                <p>100% Sạch chậu, 0% Sâu bọ mọi cây</p>
                <button onClick={() => buySupply('pest_spray', 25, 'plant')}>Mua (25💰)</button>
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">💧</div>
                <h4>Bình phun sương Nano</h4>
                <p>100% Độ ẩm đất, +25 Sức sống mọi cây</p>
                <button onClick={() => buySupply('nano_mister', 30, 'plant')}>Mua (30💰)</button>
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
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🌸</div>
                <h4>Bông Hoa Sakura</h4>
                <p>Hoa anh đào gắn đầu thú cưng</p>
                {isCosmeticOwned('sakura_flower') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('sakura_flower', 180, 'petHat')}>Mua (180💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">👑</div>
                <h4>Mũ Hoàng Tử Nhí</h4>
                <p>Vương miện quý tộc cho Bọ Ú</p>
                {isCosmeticOwned('prince_crown') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('prince_crown', 180, 'petHat')}>Mua (180💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🕶️</div>
                <h4>Kính Mát Sành Điệu</h4>
                <p>Kính râm ngầu đét cho Bọ Ú</p>
                {isCosmeticOwned('cool_sunglasses') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('cool_sunglasses', 130, 'petHat')}>Mua (130💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🦌</div>
                <h4>Bờm Tuần Lộc Noel</h4>
                <p>Bờm tuần lộc Giáng sinh đáng yêu</p>
                {isCosmeticOwned('reindeer_antlers') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('reindeer_antlers', 160, 'petHat')}>Mua (160💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🏺</div>
                <h4>Chậu Gốm Men Lam</h4>
                <p>Họa tiết men lam nghệ thuật</p>
                {isCosmeticOwned('men_lam_pot') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('men_lam_pot', 260, 'plantPots')}>Mua (260💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🌈</div>
                <h4>Chậu Cầu Vồng Pastel</h4>
                <p>Sắc màu pastel lung linh rực rỡ</p>
                {isCosmeticOwned('rainbow_pot') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyCosmetic('rainbow_pot', 220, 'plantPots')}>Mua (220💰)</button>
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
              <div className="shop-item shop-item-tool shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🌡️</div>
                <h4>Nhiệt ẩm kế thông minh</h4>
                <p>Theo dõi lý tưởng & tối ưu sức sống toàn bộ cây cảnh.</p>
                {isToolOwned('smart_hygrometer') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyTool && buyTool('smart_hygrometer', 100)}>Mua (100💰)</button>
                )}
              </div>
              <div className="shop-item shop-item-tool shop-item-new">
                <div className="new-badge">MỚI</div>
                <div className="item-icon">🎵</div>
                <h4>Loa Bluetooth Mozart</h4>
                <p>Thư giãn sạch stress cho Bọ Ú và kích thích cây nở hoa.</p>
                {isToolOwned('mozart_speaker') ? (
                  <button disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>Đã sở hữu</button>
                ) : (
                  <button onClick={() => buyTool && buyTool('mozart_speaker', 120)}>Mua (120💰)</button>
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
