/**
 * LEVEL REWARDS ROADMAP CONFIGURATION (UP TO LEVEL 500)
 * 50 Milestones (Every 10 levels from 10 to 500)
 * Separate tracks for:
 * 1. Bọ Ú (Guinea Pig)
 * 2. Cá Chọi (Betta Fish - Blue + Red combined)
 */

// EXP required for each level: Progressive scaling curve
// Early levels (1-5) are friendly, but progression becomes progressively slower and more rewarding at high levels
export const getExpNeededForLevel = (level) => {
  const safeL = Math.max(0, Math.floor(level || 0));
  return 100 + Math.floor(25 * safeL + 1.5 * Math.pow(safeL, 1.6));
};

// Precomputed cumulative total EXP for levels 0 to 550
const CUMULATIVE_EXP = [0];
let _runningExp = 0;
for (let lvl = 0; lvl <= 550; lvl++) {
  _runningExp += getExpNeededForLevel(lvl);
  CUMULATIVE_EXP.push(_runningExp);
}

export const getTotalExpForLevel = (level) => {
  const safeL = Math.max(0, Math.min(500, Math.floor(level || 0)));
  return CUMULATIVE_EXP[safeL] || 0;
};

export const calculateLevelFromExp = (totalExp, currentLevel = 0) => {
  if (!totalExp || totalExp <= 0) return Math.max(0, currentLevel || 0);
  let lvl = 0;
  while (lvl < 500 && totalExp >= CUMULATIVE_EXP[lvl + 1]) {
    lvl++;
  }
  // Guarantee level never decreases below current recorded level
  return Math.max(lvl, currentLevel || 0);
};

export const getExpProgress = (totalExp, currentLevel = null) => {
  const lvl = currentLevel !== null ? Math.max(0, Math.floor(currentLevel)) : calculateLevelFromExp(totalExp);
  const currentLevelBaseExp = getTotalExpForLevel(lvl);
  const nextLevelBaseExp = getTotalExpForLevel(lvl + 1);
  const expNeeded = nextLevelBaseExp - currentLevelBaseExp;
  const currentLevelExp = Math.max(0, (totalExp || currentLevelBaseExp) - currentLevelBaseExp);
  const percent = Math.min(100, Math.max(0, Math.floor((currentLevelExp / expNeeded) * 100)));
  return {
    currentLevel: lvl,
    currentLevelExp: Math.min(expNeeded, currentLevelExp),
    expNeeded,
    percent
  };
};

/**
 * 50 MILESTONES FOR BỌ Ú (GUINEA PIG)
 */
export const BOU_LEVEL_REWARDS = [
  { level: 10, coins: 150, title: 'Bọ Ú Năng Động', icon: '🐾', rewardName: '150 Xu + Hạt Dinh Dưỡng Hoàng Gia', item: { type: 'coins', amount: 150 } },
  { level: 20, coins: 300, cosmeticId: 'summer_hat', icon: '👒', rewardName: '300 Xu + Mũ Rơm Mùa Hè', item: { type: 'cosmetic', id: 'summer_hat', amount: 300 } },
  { level: 30, coins: 500, icon: '🥕', rewardName: '500 Xu + Rổ Cà Rốt Tươi Ngon', item: { type: 'coins', amount: 500 } },
  { level: 40, coins: 700, cosmeticId: 'pink_bow', icon: '🎀', rewardName: '700 Xu + Nơ Hồng Đeo Tai', item: { type: 'cosmetic', id: 'pink_bow', amount: 700 } },
  { level: 50, coins: 1000, title: 'Chiến Thần Đào Bới', icon: '⭐', rewardName: '1,000 Xu + Danh hiệu [Chiến Thần Đào Bới]', item: { type: 'coins', amount: 1000 } },
  { level: 60, coins: 1200, icon: '🧀', rewardName: '1,200 Xu + Bánh Phô Mai Thụy Sĩ Thượng Hạng', item: { type: 'coins', amount: 1200 } },
  { level: 70, coins: 1500, cosmeticId: 'pink_bowtie', icon: '🎗️', rewardName: '1,500 Xu + Nơ Đeo Cổ Hoàng Tử', item: { type: 'cosmetic', id: 'pink_bowtie', amount: 1500 } },
  { level: 80, coins: 1800, icon: '🌻', rewardName: '1,800 Xu + Túi Hạt Hướng Dương Thần Kỳ', item: { type: 'coins', amount: 1800 } },
  { level: 90, coins: 2200, cosmeticId: 'sakura_flower', icon: '🌸', rewardName: '2,200 Xu + Hoa Anh Đào Cài Đầu', item: { type: 'cosmetic', id: 'sakura_flower', amount: 2200 } },
  { level: 100, coins: 3000, cosmeticId: 'top_hat', title: 'Quý Tộc Chuột Lang', icon: '🎩', rewardName: '3,000 Xu + Mũ Top Hat Quý Tộc + Danh hiệu [Quý Tộc Chuột Lang]', item: { type: 'cosmetic', id: 'top_hat', amount: 3000 } },

  { level: 110, coins: 3500, icon: '🍓', rewardName: '3,500 Xu + Giỏ Dâu Tây Ngọt Lịm', item: { type: 'coins', amount: 3500 } },
  { level: 120, coins: 4000, cosmeticId: 'crown_gold', icon: '👑', rewardName: '4,000 Xu + Vương Miện Hoàng Gia Vàng Ròng', item: { type: 'cosmetic', id: 'crown_gold', amount: 4000 } },
  { level: 130, coins: 4500, icon: '🎪', rewardName: '4,500 Xu + Thảm Luyện Xiếc Cao Cấp', item: { type: 'coins', amount: 4500 } },
  { level: 140, coins: 5000, cosmeticId: 'angel_halo', icon: '😇', rewardName: '5,000 Xu + Vòng Thiên Thần Tỏa Sáng', item: { type: 'cosmetic', id: 'angel_halo', amount: 5000 } },
  { level: 150, coins: 6000, title: 'Bậc Thầy Nhào Lộn', icon: '🌟', rewardName: '6,000 Xu + Danh hiệu [Bậc Thầy Nhào Lộn]', item: { type: 'coins', amount: 6000 } },
  { level: 160, coins: 6500, icon: '🫒', rewardName: '6,500 Xu + Ô-liu Tươi Giòn Ngọt', item: { type: 'coins', amount: 6500 } },
  { level: 170, coins: 7000, cosmeticId: 'chef_hat', icon: '👨‍🍳', rewardName: '7,000 Xu + Mũ Đầu Bếp Nhí Siêu Cute', item: { type: 'cosmetic', id: 'chef_hat', amount: 7000 } },
  { level: 180, coins: 7500, icon: '🍉', rewardName: '7,500 Xu + Dưa Hấu Mát Lạnh Khổng Lồ', item: { type: 'coins', amount: 7500 } },
  { level: 190, coins: 8000, cosmeticId: 'wizard_hat', icon: '🧙‍♂️', rewardName: '8,000 Xu + Mũ Phù Thủy Ma Thuật', item: { type: 'cosmetic', id: 'wizard_hat', amount: 8000 } },
  { level: 200, coins: 10000, title: 'Huyền Thoại Bọ Ú', icon: '🏆', rewardName: '10,000 Xu + Danh hiệu [Huyền Thoại Bọ Ú]', item: { type: 'coins', amount: 10000 } },

  { level: 210, coins: 11000, icon: '🍎', rewardName: '11,000 Xu + Táo Đỏ Mật Mẹ Thiên Nhiên', item: { type: 'coins', amount: 11000 } },
  { level: 220, coins: 12000, cosmeticId: 'detective_hat', icon: '🕵️', rewardName: '12,000 Xu + Mũ Thám Tử Sherlock', item: { type: 'cosmetic', id: 'detective_hat', amount: 12000 } },
  { level: 230, coins: 13000, icon: '🍇', rewardName: '13,000 Xu + Chùm Nho Mẫu Đơn Đắt Đỏ', item: { type: 'coins', amount: 13000 } },
  { level: 240, coins: 14000, cosmeticId: 'party_hat', icon: '🥳', rewardName: '14,000 Xu + Nón Sinh Nhật Cầu Vồng', item: { type: 'cosmetic', id: 'party_hat', amount: 14000 } },
  { level: 250, coins: 16000, title: 'Vương Giả Chuột Lang', icon: '🎖️', rewardName: '16,000 Xu + Danh hiệu [Vương Giả Chuột Lang]', item: { type: 'coins', amount: 16000 } },
  { level: 260, coins: 17000, icon: '🥦', rewardName: '17,000 Xu + Bông Cải Xanh Giàu Vitamin', item: { type: 'coins', amount: 17000 } },
  { level: 270, coins: 18000, cosmeticId: 'sunglasses', icon: '🕶️', rewardName: '18,000 Xu + Kính Râm Ngầu Cool Boy', item: { type: 'cosmetic', id: 'sunglasses', amount: 18000 } },
  { level: 280, coins: 19000, icon: '🫐', rewardName: '19,000 Xu + Việt Quất Bắc Cực Ngọt Ngào', item: { type: 'coins', amount: 19000 } },
  { level: 290, coins: 20000, cosmeticId: 'bunny_ears', icon: '🐰', rewardName: '20,000 Xu + Tai Thỏ Dễ Thương', item: { type: 'cosmetic', id: 'bunny_ears', amount: 20000 } },
  { level: 300, coins: 25000, title: 'Bất Tử Lang Vương', icon: '👑', rewardName: '25,000 Xu + Danh hiệu [Bất Tử Lang Vương]', item: { type: 'coins', amount: 25000 } },

  { level: 310, coins: 26000, icon: '🍍', rewardName: '26,000 Xu + Trái Dứa Mật Ngọt', item: { type: 'coins', amount: 26000 } },
  { level: 320, coins: 27000, cosmeticId: 'viking_helmet', icon: '🛡️', rewardName: '27,000 Xu + Nón Chiến Binh Viking', item: { type: 'cosmetic', id: 'viking_helmet', amount: 27000 } },
  { level: 330, coins: 28000, icon: '🥞', rewardName: '28,000 Xu + Bánh Kẹp Bơ Mật Ong Bổ Dưỡng', item: { type: 'coins', amount: 28000 } },
  { level: 340, coins: 29000, cosmeticId: 'cat_ears', icon: '🐱', rewardName: '29,000 Xu + Bờm Tai Mèo Đen Quyến Rũ', item: { type: 'cosmetic', id: 'cat_ears', amount: 29000 } },
  { level: 350, coins: 32000, title: 'Lãnh Chúa Thảo Nguyên', icon: '🪐', rewardName: '32,000 Xu + Danh hiệu [Lãnh Chúa Thảo Nguyên]', item: { type: 'coins', amount: 32000 } },
  { level: 360, coins: 33000, icon: '🥭', rewardName: '33,000 Xu + Xoài Cát Hòa Lộc Chín Vàng', item: { type: 'coins', amount: 33000 } },
  { level: 370, coins: 34000, cosmeticId: 'beret_hat', icon: '🎨', rewardName: '34,000 Xu + Mũ Họa Sĩ Beret Pháp', item: { type: 'cosmetic', id: 'beret_hat', amount: 34000 } },
  { level: 380, coins: 35000, icon: '🌽', rewardName: '35,000 Xu + Bắp Ngô Nếp Dẻo Thơm', item: { type: 'coins', amount: 35000 } },
  { level: 390, coins: 36000, cosmeticId: 'pirate_hat', icon: '🏴‍☠️', rewardName: '36,000 Xu + Mũ Thuyền Trưởng Hải Tặc', item: { type: 'cosmetic', id: 'pirate_hat', amount: 36000 } },
  { level: 400, coins: 40000, title: 'Thần Thú Vũ Trụ', icon: '✨', rewardName: '40,000 Xu + Danh hiệu [Thần Thú Vũ Trụ]', item: { type: 'coins', amount: 40000 } },

  { level: 410, coins: 42000, icon: '💎', rewardName: '42,000 Xu + Đá Pha Lê Giảm Đói Vĩnh Cửu', item: { type: 'coins', amount: 42000 } },
  { level: 420, coins: 44000, cosmeticId: 'samurai_helmet', icon: '⚔️', rewardName: '44,000 Xu + Giáp Samurai Hoàng Gia', item: { type: 'cosmetic', id: 'samurai_helmet', amount: 44000 } },
  { level: 430, coins: 46000, icon: '🥝', rewardName: '46,000 Xu + Kiwi Vàng New Zealand', item: { type: 'coins', amount: 46000 } },
  { level: 440, coins: 48000, cosmeticId: 'flower_crown', icon: '💐', rewardName: '48,000 Xu + Vòng Hoa Thần Tiên Rực Rỡ', item: { type: 'cosmetic', id: 'flower_crown', amount: 48000 } },
  { level: 450, coins: 50000, title: 'Tôn Giả Chuột Lang', icon: '💫', rewardName: '50,000 Xu + Danh hiệu [Tôn Giả Chuột Lang]', item: { type: 'coins', amount: 50000 } },
  { level: 460, coins: 55000, icon: '🥥', rewardName: '55,000 Xu + Nước Dừa Băng Tinh Khiết', item: { type: 'coins', amount: 55000 } },
  { level: 470, coins: 60000, cosmeticId: 'phoenix_feather', icon: '🪶', rewardName: '60,000 Xu + Lông Phượng Hoàng Lửa Cài Đầu', item: { type: 'cosmetic', id: 'phoenix_feather', amount: 60000 } },
  { level: 480, coins: 70000, icon: '🏺', rewardName: '70,000 Xu + Chén Cỏ Thần Bất Tử', item: { type: 'coins', amount: 70000 } },
  { level: 490, coins: 80000, cosmeticId: 'diamond_crown', icon: '💎', rewardName: '80,000 Xu + Vương Miện Kim Cương Tối Thượng', item: { type: 'cosmetic', id: 'diamond_crown', amount: 80000 } },
  { level: 500, coins: 150000, cosmeticId: 'cosmic_aura', title: 'ĐẠI HOÀNG ĐẾ BỌ Ú TỐI CAO', icon: '🌌', rewardName: '150,000 Xu + Hào Quang Vũ Trụ Tối Thượng + Danh hiệu [ĐẠI HOÀNG ĐẾ BỌ Ú TỐI CAO]', item: { type: 'cosmetic', id: 'cosmic_aura', amount: 150000 } }
];

/**
 * 50 MILESTONES FOR BETTA FISH TANK (CÁ XANH + CÁ ĐỎ TÍNH CHUNG)
 */
export const FISH_LEVEL_REWARDS = [
  { level: 10, coins: 150, title: 'Ngư Thủ Sơ Khai', icon: '🐟', rewardName: '150 Xu + Thức Ăn Hạt Chìm Cao Cấp', item: { type: 'coins', amount: 150 } },
  { level: 20, coins: 300, icon: '🌿', rewardName: '300 Xu + Cụm Rong Đuôi Chồn Phát Sáng', item: { type: 'coins', amount: 300 } },
  { level: 30, coins: 500, icon: '🍃', rewardName: '500 Xu + Lá Bàng Rừng Lên Màu Đậm Đà', item: { type: 'coins', amount: 500 } },
  { level: 40, coins: 700, icon: '🪱', rewardName: '700 Xu + Khay Trùn Chỉ Tươi Đậm Đạm', item: { type: 'coins', amount: 700 } },
  { level: 50, coins: 1000, title: 'Chiến Thần Song Long', icon: '⚔️', rewardName: '1,000 Xu + Danh hiệu [Chiến Thần Song Long]', item: { type: 'coins', amount: 1000 } },
  { level: 60, coins: 1200, icon: '🫧', rewardName: '1,200 Xu + Bộ Đá Bọt Oxy Siêu Mịn', item: { type: 'coins', amount: 1200 } },
  { level: 70, coins: 1500, icon: '🪸', rewardName: '1,500 Xu + Nhánh San Hô Đỏ Biển Sâu', item: { type: 'coins', amount: 1500 } },
  { level: 80, coins: 1800, icon: '🟢', rewardName: '1,800 Xu + Quả Cầu Rêu Marimo Khổng Lồ', item: { type: 'coins', amount: 1800 } },
  { level: 90, coins: 2200, icon: '🪞', rewardName: '2,200 Xu + Gương Pha Lê Khoe Vây 360°', item: { type: 'coins', amount: 2200 } },
  { level: 100, coins: 3000, title: 'Bậc Thầy Halfmoon', icon: '🐠', rewardName: '3,000 Xu + Danh hiệu [Bậc Thầy Halfmoon]', item: { type: 'coins', amount: 3000 } },

  { level: 110, coins: 3500, icon: '🌊', rewardName: '3,500 Xu + Nước Thần Tăng Sức Đề Kháng', item: { type: 'coins', amount: 3500 } },
  { level: 120, coins: 4000, icon: '🏰', rewardName: '4,000 Xu + Tòa Lâu Đài Cổ Dưới Đáy Biển', item: { type: 'coins', amount: 4000 } },
  { level: 130, coins: 4500, icon: '🦐', rewardName: '4,500 Xu + Đàn Tép Cherry Dọn Rêu Chăm Chỉ', item: { type: 'coins', amount: 4500 } },
  { level: 140, coins: 5000, icon: '🏮', rewardName: '5,000 Xu + Đèn Actinic UV Chiếu Sáng Neon', item: { type: 'coins', amount: 5000 } },
  { level: 150, coins: 6000, title: 'Chúa Tể Thủy Cung', icon: '🔱', rewardName: '6,000 Xu + Danh hiệu [Chúa Tể Thủy Cung]', item: { type: 'coins', amount: 6000 } },
  { level: 160, coins: 6500, icon: '🪵', rewardName: '6,500 Xu + Gốc Lũa Bonsai Rêu Phượng Hoàng', item: { type: 'coins', amount: 6500 } },
  { level: 170, coins: 7000, icon: '🐚', rewardName: '7,000 Xu + Ốc Táo Hoàng Kim Dọn Đáy', item: { type: 'coins', amount: 7000 } },
  { level: 180, coins: 7500, icon: '🪷', rewardName: '7,500 Xu + Hoa Súng Nước Mini Nở Rộ', item: { type: 'coins', amount: 7500 } },
  { level: 190, coins: 8000, icon: '🧊', rewardName: '8,000 Xu + Tinh Thể Nước Băng Bắc Cực', item: { type: 'coins', amount: 8000 } },
  { level: 200, coins: 10000, title: 'Huyền Thoại Song Ngư', icon: '🏆', rewardName: '10,000 Xu + Danh hiệu [Huyền Thoại Song Ngư]', item: { type: 'coins', amount: 10000 } },

  { level: 210, coins: 11000, icon: '🧂', rewardName: '11,000 Xu + Muối Khoáng Biển Chết Tinh Khiết', item: { type: 'coins', amount: 11000 } },
  { level: 220, coins: 12000, icon: '🪨', rewardName: '12,000 Xu + Đá Nham Thạch Lọc Nước Thần Kì', item: { type: 'coins', amount: 12000 } },
  { level: 230, coins: 13000, icon: '🌺', rewardName: '13,000 Xu + Tiêu Thảo Đỏ Biển Sâu', item: { type: 'coins', amount: 13000 } },
  { level: 240, coins: 14000, icon: '🪶', rewardName: '14,000 Xu + Vây Rồng Ánh Kim Phát Sáng', item: { type: 'coins', amount: 14000 } },
  { level: 250, coins: 16000, title: 'Vua Cá Chọi Rực Rỡ', icon: '👑', rewardName: '16,000 Xu + Danh hiệu [Vua Cá Chọi Rực Rỡ]', item: { type: 'coins', amount: 16000 } },
  { level: 260, coins: 17000, icon: '💫', rewardName: '17,000 Xu + Vòng Bọt Khí Kim Cương Lấp Lánh', item: { type: 'coins', amount: 17000 } },
  { level: 270, coins: 18000, icon: '🌴', rewardName: '18,000 Xu + Dương Xỉ Java Cổ Thụ Thủy Sinh', item: { type: 'coins', amount: 18000 } },
  { level: 280, coins: 19000, icon: '💎', rewardName: '19,000 Xu + Cát Thạch Anh Dạ Quang Lót Đáy', item: { type: 'coins', amount: 19000 } },
  { level: 290, coins: 20000, icon: '🌀', rewardName: '20,000 Xu + Máy Tạo Sóng Êm Dịu Cho Bể', item: { type: 'coins', amount: 20000 } },
  { level: 300, coins: 25000, title: 'Thần Ngư Biển Sâu', icon: '🌌', rewardName: '25,000 Xu + Danh hiệu [Thần Ngư Biển Sâu]', item: { type: 'coins', amount: 25000 } },

  { level: 310, coins: 26000, icon: '🪱', rewardName: '26,000 Xu + Yến Mạch Mồi Tươi Tuyệt Hảo', item: { type: 'coins', amount: 26000 } },
  { level: 320, coins: 27000, icon: '🏺', rewardName: '27,000 Xu + Bình Gốm Cổ Atlantis Dưới Nước', item: { type: 'coins', amount: 27000 } },
  { level: 330, coins: 28000, icon: '✨', rewardName: '28,000 Xu + Tinh Dầu Khoáng Dưỡng Vây Bóng', item: { type: 'coins', amount: 28000 } },
  { level: 340, coins: 29000, icon: '🪸', rewardName: '29,000 Xu + San Hô Trắng Ngũ Sắc', item: { type: 'coins', amount: 29000 } },
  { level: 350, coins: 32000, title: 'Hải Vương Halfmoon', icon: '🔱', rewardName: '32,000 Xu + Danh hiệu [Hải Vương Halfmoon]', item: { type: 'coins', amount: 32000 } },
  { level: 360, coins: 33000, icon: '🌿', rewardName: '33,000 Xu + Cỏ Thìa Thủy Sinh Trải Thảm Xanh', item: { type: 'coins', amount: 33000 } },
  { level: 370, coins: 34000, icon: '🪞', rewardName: '34,000 Xu + Gương Ngọc Bích Tự Động Khoe Vây', item: { type: 'coins', amount: 34000 } },
  { level: 380, coins: 35000, icon: '🫧', rewardName: '35,000 Xu + Suối Nguồn Tinh Khiết Bất Tận', item: { type: 'coins', amount: 35000 } },
  { level: 390, coins: 36000, icon: '🏮', rewardName: '36,000 Xu + Đèn Lồng Đáy Biển Cổ Kính', item: { type: 'coins', amount: 36000 } },
  { level: 400, coins: 40000, title: 'Long Thần Thủy Vực', icon: '🐉', rewardName: '40,000 Xu + Danh hiệu [Long Thần Thủy Vực]', item: { type: 'coins', amount: 40000 } },

  { level: 410, coins: 42000, icon: '💎', rewardName: '42,000 Xu + Ngọc Trai Đen Thái Bình Dương', item: { type: 'coins', amount: 42000 } },
  { level: 420, coins: 44000, icon: '🏰', rewardName: '44,000 Xu + Cung Điện Pha Lê Dưới Nước', item: { type: 'coins', amount: 44000 } },
  { level: 430, coins: 46000, icon: '🪸', rewardName: '46,000 Xu + Rạn San Hô Great Barrier Reef', item: { type: 'coins', amount: 46000 } },
  { level: 440, coins: 48000, icon: '✨', rewardName: '48,000 Xu + Vảy Rồng Đổi Màu Theo Tâm Trạng', item: { type: 'coins', amount: 48000 } },
  { level: 450, coins: 50000, title: 'Bá Chủ Đại Dương', icon: '🌊', rewardName: '50,000 Xu + Danh hiệu [Bá Chủ Đại Dương]', item: { type: 'coins', amount: 50000 } },
  { level: 460, coins: 55000, icon: '🌿', rewardName: '55,000 Xu + Rừng Thủy Sinh Nguyên Sinh Khổng Lồ', item: { type: 'coins', amount: 55000 } },
  { level: 470, coins: 60000, icon: '🐚', rewardName: '60,000 Xu + Vỏ Ốc Hóa Thạch Ngàn Năm', item: { type: 'coins', amount: 60000 } },
  { level: 480, coins: 70000, icon: '🔱', rewardName: '70,000 Xu + Cây Đinh Ba Poseidon Thần Thoại', item: { type: 'coins', amount: 70000 } },
  { level: 490, coins: 80000, icon: '💎', rewardName: '80,000 Xu + Viên Ngọc Rồng Thủy Cung Thượng Cổ', item: { type: 'coins', amount: 80000 } },
  { level: 500, coins: 150000, title: 'VŨ TRỤ LONG VƯƠNG THỦY TỘC', icon: '🌌', rewardName: '150,000 Xu + Lâu Đài Atlantis Dát Vàng + Danh hiệu [VŨ TRỤ LONG VƯƠNG THỦY TỘC]', item: { type: 'coins', amount: 150000 } }
];
