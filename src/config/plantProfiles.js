/**
 * Central plant species database.
 * All 21 species (9 original + 12 new Vietnamese plants).
 *
 * daysPerStage  — real-time days to advance one growth stage (7–14).
 * purchasePrice — seed cost in coins.
 * moistureDecay — soil moisture loss per hour.
 * nutrientDecay — nutrient loss per hour.
 * lightNeed     — 0-1 scale, how much sunlight the plant demands.
 * overwaterSensitivity — multiplier for damage when moisture > 90%.
 */

export const PLANT_PROFILES = {
  // ============ ORIGINAL 9 SPECIES ============
  sen_da_hong_sao: {
    nameVi: 'Sen đá hồng sao',
    daysPerStage: 8,
    purchasePrice: 50,
    moistureDecay: 2.0,
    nutrientDecay: 1.0,
    lightNeed: 0.6,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 70, nutrients: 80, sunlight: 60, humidity: 55 },
  },
  cay_kim_tien: {
    nameVi: 'Cây kim tiền',
    daysPerStage: 10,
    purchasePrice: 50,
    moistureDecay: 2.5,
    nutrientDecay: 1.0,
    lightNeed: 0.4,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 60, nutrients: 75, sunlight: 40, humidity: 50 },
  },
  cay_luoi_ho: {
    nameVi: 'Cây lưỡi hổ',
    daysPerStage: 7,
    purchasePrice: 50,
    moistureDecay: 1.5,
    nutrientDecay: 0.8,
    lightNeed: 0.35,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 50, nutrients: 70, sunlight: 35, humidity: 45 },
  },
  cay_phat_tai: {
    nameVi: 'Cây Phát Tài',
    daysPerStage: 9,
    purchasePrice: 80,
    moistureDecay: 2.5,
    nutrientDecay: 1.0,
    lightNeed: 0.5,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 60, nutrients: 70, sunlight: 50, humidity: 60 },
  },
  sen_da_do_la: {
    nameVi: 'Sen Đá Đô La',
    daysPerStage: 11,
    purchasePrice: 80,
    moistureDecay: 1.5,
    nutrientDecay: 0.8,
    lightNeed: 0.8,
    overwaterSensitivity: 1.2,
    core: { soilMoisture: 40, nutrients: 60, sunlight: 80, humidity: 30 },
  },
  cay_van_loc: {
    nameVi: 'Cây Vạn Lộc',
    daysPerStage: 10,
    purchasePrice: 100,
    moistureDecay: 3.0,
    nutrientDecay: 1.2,
    lightNeed: 0.4,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 75, nutrients: 85, sunlight: 40, humidity: 70 },
  },
  cay_trau_ba: {
    nameVi: 'Cây Trầu Bà Đế Vương',
    daysPerStage: 9,
    purchasePrice: 70,
    moistureDecay: 3.5,
    nutrientDecay: 1.0,
    lightNeed: 0.5,
    overwaterSensitivity: 0.8,
    core: { soilMoisture: 80, nutrients: 75, sunlight: 50, humidity: 65 },
  },
  cay_thiet_moc_lan: {
    nameVi: 'Cây Thiết Mộc Lan',
    daysPerStage: 12,
    purchasePrice: 60,
    moistureDecay: 1.5,
    nutrientDecay: 0.7,
    lightNeed: 0.4,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 45, nutrients: 60, sunlight: 40, humidity: 45 },
  },
  cay_hoa_quynh: {
    nameVi: 'Cây Hoa Quỳnh',
    daysPerStage: 14,
    purchasePrice: 200,
    moistureDecay: 1.2,
    nutrientDecay: 0.6,
    lightNeed: 0.5,
    overwaterSensitivity: 1.3,
    core: { soilMoisture: 35, nutrients: 50, sunlight: 50, humidity: 40 },
  },

  // ============ 12 NEW VIETNAMESE SPECIES ============
  tung_bong_lai: {
    nameVi: 'Tùng Bồng Lai',
    daysPerStage: 14,
    purchasePrice: 120,
    moistureDecay: 1.5,
    nutrientDecay: 0.6,
    lightNeed: 0.5,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 45, nutrients: 70, sunlight: 50, humidity: 50 },
  },
  hanh_phuc_mini: {
    nameVi: 'Hạnh Phúc Mini',
    daysPerStage: 10,
    purchasePrice: 80,
    moistureDecay: 3.0,
    nutrientDecay: 1.0,
    lightNeed: 0.8,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 65, nutrients: 75, sunlight: 80, humidity: 55 },
  },
  kim_ngan_luong: {
    nameVi: 'Kim Ngân Lượng',
    daysPerStage: 14,
    purchasePrice: 150,
    moistureDecay: 2.0,
    nutrientDecay: 0.8,
    lightNeed: 0.5,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 55, nutrients: 80, sunlight: 50, humidity: 60 },
  },
  duoi_cong: {
    nameVi: 'Đuôi Công',
    daysPerStage: 10,
    purchasePrice: 100,
    moistureDecay: 3.0,
    nutrientDecay: 1.0,
    lightNeed: 0.6,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 70, nutrients: 75, sunlight: 60, humidity: 65 },
  },
  bang_singapore: {
    nameVi: 'Bàng Singapore Mini',
    daysPerStage: 10,
    purchasePrice: 90,
    moistureDecay: 4.0,
    nutrientDecay: 1.2,
    lightNeed: 0.7,
    overwaterSensitivity: 0.8,
    core: { soilMoisture: 75, nutrients: 80, sunlight: 70, humidity: 60 },
  },
  huong_thao: {
    nameVi: 'Hương Thảo (Rosemary)',
    daysPerStage: 12,
    purchasePrice: 70,
    moistureDecay: 1.0,
    nutrientDecay: 0.7,
    lightNeed: 0.8,
    overwaterSensitivity: 2.0, // Very sensitive to overwatering
    core: { soilMoisture: 30, nutrients: 55, sunlight: 80, humidity: 30 },
  },
  day_nhen: {
    nameVi: 'Dây Nhện',
    daysPerStage: 8,
    purchasePrice: 60,
    moistureDecay: 3.0,
    nutrientDecay: 1.0,
    lightNeed: 0.4,
    overwaterSensitivity: 0.8,
    core: { soilMoisture: 65, nutrients: 70, sunlight: 40, humidity: 60 },
  },
  truc_phat_tai: {
    nameVi: 'Trúc Phát Tài',
    daysPerStage: 12,
    purchasePrice: 110,
    moistureDecay: 2.5,
    nutrientDecay: 0.9,
    lightNeed: 0.5,
    overwaterSensitivity: 0.7,
    core: { soilMoisture: 70, nutrients: 75, sunlight: 50, humidity: 65 },
  },
  ngu_gia_bi: {
    nameVi: 'Ngũ Gia Bì Mini',
    daysPerStage: 9,
    purchasePrice: 85,
    moistureDecay: 2.0,
    nutrientDecay: 0.8,
    lightNeed: 0.5,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 60, nutrients: 75, sunlight: 50, humidity: 55 },
  },
  van_loc_new: {
    nameVi: 'Vạn Lộc (Lá Sọc)',
    daysPerStage: 11,
    purchasePrice: 130,
    moistureDecay: 3.0,
    nutrientDecay: 1.0,
    lightNeed: 0.5,
    overwaterSensitivity: 1.0,
    core: { soilMoisture: 70, nutrients: 80, sunlight: 50, humidity: 65 },
  },
  thuong_xuan: {
    nameVi: 'Thường Xuân (Ivy)',
    daysPerStage: 7,
    purchasePrice: 55,
    moistureDecay: 4.0,
    nutrientDecay: 1.2,
    lightNeed: 0.4,
    overwaterSensitivity: 0.7,
    core: { soilMoisture: 75, nutrients: 70, sunlight: 40, humidity: 70 },
  },
  nhat_mat_huong: {
    nameVi: 'Nhất Mạt Hương',
    daysPerStage: 10,
    purchasePrice: 75,
    moistureDecay: 3.5,
    nutrientDecay: 1.0,
    lightNeed: 0.5,
    overwaterSensitivity: 0.9,
    core: { soilMoisture: 70, nutrients: 75, sunlight: 50, humidity: 65 },
  },
};

/**
 * Look up purchase price for any species.
 */
export const getSeedPrice = (speciesId) => {
  return PLANT_PROFILES[speciesId]?.purchasePrice || 50;
};

/**
 * Stage-based sell price as percentage of purchase price.
 *   seed   → 40%
 *   sprout → 80%
 *   mature → 120%
 *   dead   → 0
 */
export const getPlantSellPrice = (plant) => {
  const profile = PLANT_PROFILES[plant.id];
  if (!profile) return 0;
  const base = profile.purchasePrice;
  const stage = plant.status?.growthStage || 'seed';
  switch (stage) {
    case 'seed':   return Math.floor(base * 0.40);
    case 'sprout': return Math.floor(base * 0.80);
    case 'plant':
    case 'mature': return Math.floor(base * 1.20);
    case 'dead':   return 0;
    default:       return Math.floor(base * 0.40);
  }
};
