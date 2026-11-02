import { PLANT_PROFILES } from '../config/plantProfiles.js';
import { calculateLevelFromExp, getTotalExpForLevel } from '../config/levelRewards.js';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// Check if it's currently nighttime in Vietnam (UTC+7)
const isNightInVietnam = () => {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (3600000 * 7));
  const hours = vnTime.getHours();
  return hours < 6 || hours >= 18;
};

export const offlineReconcile = (gameState, currentTimestamp) => {
  const lastSave = gameState.profile?.lastSaveTimestamp || currentTimestamp;
  const deltaSeconds = (currentTimestamp - lastSave) / 1000;
  const deltaMinutes = deltaSeconds / 60;
  const deltaHoursUncapped = deltaMinutes / 60;
  
  // Cap deltaHours at 72 hours (3 days) for processing
  const deltaHours = Math.min(deltaHoursUncapped, 72);

  if (deltaHours <= 0) return gameState; // No time passed

  const updatedState = JSON.parse(JSON.stringify(gameState)); // Deep clone
  if (!updatedState.profile) updatedState.profile = {};
  updatedState.profile.lastSaveTimestamp = currentTimestamp;

  // ==========================================
  // 1. PET (BỌ Ú) STAT DECAY & 3-DAY LIFESPAN
  // ==========================================
  const pet = updatedState.pet;
  if (pet && !pet.isDead) {
    // Calibrated decay: ~1.15% per hour.
    // In 24h (overnight/1 day): ~27% decay.
    // In 48h (2 days): ~55% decay.
    // In 72h (3 days): ~82% decay.
    pet.essential.hunger = clamp(pet.essential.hunger - 1.15 * deltaHours, 0, 100);
    pet.essential.thirst = clamp(pet.essential.thirst - 1.15 * deltaHours, 0, 100);
    pet.essential.hygiene = clamp(pet.essential.hygiene - 0.6 * deltaHours, 0, 100);
    pet.essential.bladder = clamp(pet.essential.bladder - 1.5 * deltaHours, 0, 100);

    if (pet.state.isSleeping) {
      const sleepHours = (currentTimestamp - (pet.state.sleepStartTimestamp || currentTimestamp)) / 3600000;
      const energyGained = Math.min(sleepHours, 8) * 8.0;
      pet.essential.energy = clamp(pet.essential.energy + energyGained, 0, 100);
      if (sleepHours >= 8) {
        pet.state.isSleeping = false;
      }
    } else {
      pet.essential.energy = clamp(pet.essential.energy - 0.7 * deltaHours, 0, 100);
    }

    const essentialAvg = (pet.essential.hunger + pet.essential.thirst + pet.essential.energy + pet.essential.hygiene + pet.essential.bladder) / 5;
    const happinessDecay = essentialAvg < 30 ? 1.5 : 0.7;
    
    pet.mental.happiness = clamp(pet.mental.happiness - happinessDecay * deltaHours, 0, 100);
    pet.mental.affection = clamp(pet.mental.affection - 0.3 * deltaHours, 0, 100);
    
    // Boredom increases gently
    pet.mental.boredom = pet.mental.boredom !== undefined ? pet.mental.boredom : 0;
    pet.mental.boredom = clamp(pet.mental.boredom + 0.8 * deltaHours, 0, 100);

    if (essentialAvg < 20 || pet.mental.boredom > 80) {
      pet.mental.stress = clamp(pet.mental.stress + 1.0 * deltaHours, 0, 100);
    } else {
      pet.mental.stress = clamp(pet.mental.stress - 0.4 * deltaHours, 0, 100);
    }

    // Fitness stat
    if (!pet.physical) pet.physical = { fitness: 50 };
    if (pet.physical.fitness === undefined) pet.physical.fitness = 50;
    pet.physical.fitness = clamp(pet.physical.fitness - 0.3 * deltaHours, 0, 100);

    const mentalAvg = (pet.mental.happiness + pet.mental.affection + (100 - pet.mental.stress) + (100 - pet.mental.boredom)) / 4;
    const healthTarget = (essentialAvg * 0.7) + (mentalAvg * 0.3);
    const healthDecayFactor = 1 - Math.exp(-0.035 * deltaHours);
    pet.health.overall = clamp(pet.health.overall + (healthTarget - pet.health.overall) * healthDecayFactor, 0, 100);

    // Initialise petting cooldown timestamp if missing
    if (!pet.state.lastPetTimestamp) pet.state.lastPetTimestamp = null;

    // Pet level & EXP system with progressive scaling
    if (!pet.adoptedAt) pet.adoptedAt = currentTimestamp;
    if (pet.level === undefined) pet.level = 0;
    const baseExp = getTotalExpForLevel(pet.level);
    if (pet.exp === undefined || pet.exp < baseExp) pet.exp = baseExp;
    // Passive exp for healthy survival: +2 EXP per hour offline
    if (pet.health.overall > 30) {
      pet.exp += Math.floor(deltaHours * 2);
    }
    const calculatedPetLevel = calculateLevelFromExp(pet.exp, pet.level);
    pet.level = Math.max(pet.level, calculatedPetLevel);

    // Update permanent levelRewards highestLevel (never resets)
    if (!updatedState.levelRewards) {
      updatedState.levelRewards = {
        bou: { highestLevel: 0, claimed: [] },
        fish: { highestLevel: 0, claimed: [] }
      };
    }
    if (!updatedState.levelRewards.bou) updatedState.levelRewards.bou = { highestLevel: 0, claimed: [] };
    updatedState.levelRewards.bou.highestLevel = Math.max(
      updatedState.levelRewards.bou.highestLevel || 0,
      pet.level
    );

    // ===== 3-DAY PERMA-DEATH GUARANTEE =====
    // Animal CANNOT die if away for less than 72 hours (3 full days).
    // Avoids dying overnight or after 1-2 days without care.
    if (deltaHoursUncapped >= 72) {
      if ((pet.essential.hunger <= 0 || pet.essential.thirst <= 0) && pet.health.overall <= 5) {
        pet.isDead = true;
      }
    } else {
      pet.isDead = false;
    }
  }

  // ==========================================
  // 2. BETTA FISH TANK (BỂ CÁ CHỌI XANH & ĐỎ)
  // ==========================================
  const fishTank = updatedState.fishTank;
  if (fishTank) {
    // Tank environment decay
    if (!fishTank.tank) {
      fishTank.tank = { cleanliness: 100, oxygen: 100, temperature: 26, filterRunning: true };
    }
    const tank = fishTank.tank;
    
    // Water cleanliness decays slowly (~0.65% per hour -> ~15% per day, lasts > 6 days)
    tank.cleanliness = clamp(tank.cleanliness - 0.65 * deltaHours, 0, 100);

    // Oxygen level (filter helps maintain oxygen)
    if (tank.filterRunning) {
      tank.oxygen = clamp(tank.oxygen + 5.0 * deltaHours, 0, 100);
    } else {
      tank.oxygen = clamp(tank.oxygen - 0.5 * deltaHours, 0, 100);
    }

    // Process both fish: Blue Betta & Red Betta
    const processFish = (fish, defaultName, color) => {
      if (!fish) return;
      if (fish.isDead) return;

      if (!fish.name) fish.name = defaultName;
      if (!fish.color) fish.color = color;
      if (fish.hunger === undefined) fish.hunger = 100;
      if (fish.happiness === undefined) fish.happiness = 100;
      if (fish.energy === undefined) fish.energy = 100;
      if (fish.health === undefined) fish.health = 100;
      if (fish.stress === undefined) fish.stress = 0;
      if (!fish.adoptedAt) fish.adoptedAt = currentTimestamp;
      if (fish.level === undefined) fish.level = 0;

      // Hunger decay (~1.15% per hour -> ~27% in 24h, survives > 3 days)
      fish.hunger = clamp(fish.hunger - 1.15 * deltaHours, 0, 100);

      // Energy decay
      fish.energy = clamp(fish.energy - 0.5 * deltaHours, 0, 100);

      // Happiness decay (dirtier water makes fish less happy)
      const waterFactor = tank.cleanliness > 60 ? 1 : tank.cleanliness > 30 ? 1.5 : 2.5;
      fish.happiness = clamp(fish.happiness - 0.7 * waterFactor * deltaHours, 0, 100);

      // Stress from dirty water or low oxygen
      if (tank.cleanliness < 30 || tank.oxygen < 30 || fish.hunger < 20) {
        fish.stress = clamp(fish.stress + 1.2 * deltaHours, 0, 100);
      } else {
        fish.stress = clamp(fish.stress - 0.5 * deltaHours, 0, 100);
      }

      // Health target based on hunger, water cleanliness, oxygen, and stress
      const targetHealth = (fish.hunger * 0.4) + (tank.cleanliness * 0.3) + (tank.oxygen * 0.2) + ((100 - fish.stress) * 0.1);
      const fishHealthFactor = 1 - Math.exp(-0.035 * deltaHours);
      fish.health = clamp(fish.health + (targetHealth - fish.health) * fishHealthFactor, 0, 100);

      // Fish level & EXP system with progressive scaling
      const fishBaseExp = getTotalExpForLevel(fish.level || 0);
      if (fish.exp === undefined || fish.exp < fishBaseExp) fish.exp = fishBaseExp;
      if (fish.health > 30) {
        fish.exp += Math.floor(deltaHours * 2);
      }
      const calculatedFishLevel = calculateLevelFromExp(fish.exp, fish.level || 0);
      fish.level = Math.max(fish.level || 0, calculatedFishLevel);

      // Update permanent levelRewards highestLevel for fish (combined Blue + Red)
      if (!updatedState.levelRewards) {
        updatedState.levelRewards = {
          bou: { highestLevel: 0, claimed: [] },
          fish: { highestLevel: 0, claimed: [] }
        };
      }
      if (!updatedState.levelRewards.fish) updatedState.levelRewards.fish = { highestLevel: 0, claimed: [] };
      updatedState.levelRewards.fish.highestLevel = Math.max(
        updatedState.levelRewards.fish.highestLevel || 0,
        fish.level
      );

      // 3-Day Perma-death Guarantee:
      // Fish CANNOT die in under 72 hours (3 days) of neglect!
      if (deltaHoursUncapped >= 72) {
        if (fish.hunger <= 0 && (tank.cleanliness <= 5 || fish.health <= 5)) {
          fish.isDead = true;
        }
      } else {
        fish.isDead = false;
      }
    };

    processFish(fishTank.blueFish, 'Cá Chọi Xanh (Thanh Long)', 'blue');
    processFish(fishTank.redFish, 'Cá Chọi Đỏ (Hồng Long)', 'red');
  }

  // ==========================================
  // 3. PLANT STAT DECAY & 3-DAY LIFESPAN
  // ==========================================
  const weather = updatedState.weather;
  const weatherMultiplier = weather?.current === 'heatwave' ? 1.5 : 1.0; 
  const nightTime = isNightInVietnam();

  if (Array.isArray(updatedState.plants)) {
    updatedState.plants.forEach(plant => {
      // Skip dead plants
      if (plant.status.growthStage === 'dead') return;

      const profile = PLANT_PROFILES[plant.id] || {};
      // Gentle decay rate: base moisture decay scaled to ~0.7% - 1.2% / hour
      // Ensures 100% moisture lasts > 3 full days (72+ hours)
      const speciesMoistureDecay = (profile.moistureDecay || 2.0) * 0.35;
      const speciesNutrientDecay = (profile.nutrientDecay || 1.0) * 0.2;
      const daysPerStage = profile.daysPerStage || 10;

      const stageMultiplier = plant.status.growthStage === 'seed' ? 0.6 : 1.0;
      
      plant.core.soilMoisture = clamp(plant.core.soilMoisture - speciesMoistureDecay * weatherMultiplier * deltaHours, 0, 100);
      plant.core.nutrients = clamp(plant.core.nutrients - speciesNutrientDecay * stageMultiplier * deltaHours, 0, 100);
      plant.advanced.hydration = clamp(plant.core.soilMoisture * 0.8 + plant.core.humidity * 0.2, 0, 100);
      
      // Cleanliness & pest risk decay slowly
      plant.status.cleanliness = clamp(plant.status.cleanliness - 0.4 * deltaHours, 0, 100);
      plant.status.pestRisk = clamp(100 - plant.status.cleanliness, 0, 100);

      const phDrift = (Math.random() * 0.05 - 0.025) * deltaHours;
      plant.advanced.soilPH = clamp(plant.advanced.soilPH + phDrift, 4.0, 9.0);

      // Aeration decays very slowly
      plant.advanced.aeration = clamp((plant.advanced.aeration || 70) - 0.15 * deltaHours, 0, 100);

      // Sunlight decays unless sunny
      if (weather?.current === 'sunny') {
        plant.core.sunlight = 100;
      } else {
        plant.core.sunlight = clamp((plant.core.sunlight || 60) - 0.6 * deltaHours, 0, 100);
      }

      // Overwatering damage for sensitive species
      const overwaterSens = profile.overwaterSensitivity || 1.0;
      if (plant.core.soilMoisture > 92 && overwaterSens > 1.2) {
        plant.status.vitality = clamp(
          plant.status.vitality - (overwaterSens - 1.0) * 1.0 * deltaHours, 0, 100
        );
      }

      // Vitality calculation
      const moistureScore = (plant.core.soilMoisture >= 25 && plant.core.soilMoisture <= 85) ? 100 : (plant.core.soilMoisture > 0 ? 55 : 20);
      const phScore = (plant.advanced.soilPH >= 5.5 && plant.advanced.soilPH <= 7.0) ? 100 : 50;
      
      const vitalityTarget = (moistureScore * 0.3) + (plant.core.nutrients * 0.25) + ((plant.core.sunlight || 60) * 0.2) + (phScore * 0.15) + ((plant.advanced.aeration || 70) * 0.1);
      const plantVitalityFactor = 1 - Math.exp(-0.035 * deltaHours);
      plant.status.vitality = clamp(plant.status.vitality + (vitalityTarget - plant.status.vitality) * plantVitalityFactor, 0, 100);

      // Realistic growth
      const baseGrowthPerHour = 100 / (daysPerStage * 24);
      
      let growthMultiplier = 0;
      if (plant.status.vitality >= 70) growthMultiplier = 1.0;
      else if (plant.status.vitality >= 40) growthMultiplier = 0.5;
      else if (plant.status.vitality >= 20) growthMultiplier = 0.15;

      let growthPerHour = baseGrowthPerHour * growthMultiplier;

      // Aeration boost
      if ((plant.advanced.aeration || 0) >= 80) {
        growthPerHour *= 1.5;
      }

      // Grow light
      if (plant.hasGrowLight && nightTime) {
        plant.core.sunlight = Math.max(plant.core.sunlight || 0, 90);
      }

      plant.status.growthProgress += growthPerHour * deltaHours;

      // Stage transitions
      if (plant.status.growthProgress >= 200) plant.status.growthStage = "mature";
      else if (plant.status.growthProgress >= 150) plant.status.growthStage = "plant";
      else if (plant.status.growthProgress >= 100) plant.status.growthStage = "sprout";
      else plant.status.growthStage = "seed";

      // Plant level system: +1 LV every 3 days from mature
      const isMatureStage = plant.status.growthStage === 'plant' || plant.status.growthStage === 'mature';
      if (isMatureStage && !plant.matureAt) {
        plant.matureAt = currentTimestamp;
      }
      if (plant.level === undefined) plant.level = 0;
      if (plant.matureAt && isMatureStage) {
        const daysSinceMature = (currentTimestamp - plant.matureAt) / (1000 * 60 * 60 * 24);
        plant.level = Math.floor(daysSinceMature / 3);
      }

      // Night blooming
      if (plant.id === 'cay_hoa_quynh' && plant.status.growthStage === 'mature') {
        plant.isBlooming = nightTime;
      } else if (plant.id === 'cay_hoa_quynh') {
        plant.isBlooming = false;
      }

      // ===== 3-DAY PLANT PERMA-DEATH GUARANTEE =====
      // Plant CANNOT die if neglected for less than 72 hours (3 full days)!
      // No more dying overnight or after 1-2 days without water.
      if (deltaHoursUncapped >= 72) {
        if (plant.core.soilMoisture <= 0 && plant.status.vitality <= 5) {
          plant.status.growthStage = 'dead';
        }
      }
    });
  }

  return updatedState;
};
