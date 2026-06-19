import { PLANT_PROFILES } from '../config/plantProfiles.js';

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
  const lastSave = gameState.profile.lastSaveTimestamp || currentTimestamp;
  const deltaSeconds = (currentTimestamp - lastSave) / 1000;
  const deltaMinutes = deltaSeconds / 60;
  const deltaHoursUncapped = deltaMinutes / 60;
  
  // Cap at 72 hours
  const deltaHours = Math.min(deltaHoursUncapped, 72);

  if (deltaHours <= 0) return gameState; // No time passed

  const updatedState = JSON.parse(JSON.stringify(gameState)); // Deep clone
  updatedState.profile.lastSaveTimestamp = currentTimestamp;

  // 1. Pet Stat Decay
  const pet = updatedState.pet;
  if (pet && !pet.isDead) {
    pet.essential.hunger = clamp(pet.essential.hunger - 4.0 * deltaHours, 0, 100);
    pet.essential.thirst = clamp(pet.essential.thirst - 5.0 * deltaHours, 0, 100);
    pet.essential.hygiene = clamp(pet.essential.hygiene - 2.0 * deltaHours, 0, 100);
    pet.essential.bladder = clamp(pet.essential.bladder - 6.0 * deltaHours, 0, 100);

    if (pet.state.isSleeping) {
      const sleepHours = (currentTimestamp - pet.state.sleepStartTimestamp) / 3600000;
      const energyGained = Math.min(sleepHours, 8) * 8.0;
      pet.essential.energy = clamp(pet.essential.energy + energyGained, 0, 100);
      if (sleepHours >= 8) {
        pet.state.isSleeping = false;
      }
    } else {
      pet.essential.energy = clamp(pet.essential.energy - 3.0 * deltaHours, 0, 100);
    }

    const essentialAvg = (pet.essential.hunger + pet.essential.thirst + pet.essential.energy + pet.essential.hygiene + pet.essential.bladder) / 5;
    const happinessDecay = essentialAvg < 30 ? 5.0 : 2.0;
    
    pet.mental.happiness = clamp(pet.mental.happiness - happinessDecay * deltaHours, 0, 100);
    pet.mental.affection = clamp(pet.mental.affection - 1.0 * deltaHours, 0, 100);
    
    // Boredom increases over time
    pet.mental.boredom = pet.mental.boredom !== undefined ? pet.mental.boredom : 0;
    pet.mental.boredom = clamp(pet.mental.boredom + 3.0 * deltaHours, 0, 100);

    if (essentialAvg < 20 || pet.mental.boredom > 80) {
      pet.mental.stress = clamp(pet.mental.stress + 4.0 * deltaHours, 0, 100);
    } else {
      pet.mental.stress = clamp(pet.mental.stress - 1.0 * deltaHours, 0, 100);
    }

    // Fitness stat — initialise if missing, decay slowly
    if (!pet.physical) pet.physical = { fitness: 50 };
    if (pet.physical.fitness === undefined) pet.physical.fitness = 50;
    pet.physical.fitness = clamp(pet.physical.fitness - 1.0 * deltaHours, 0, 100);

    const mentalAvg = (pet.mental.happiness + pet.mental.affection + (100 - pet.mental.stress) + (100 - pet.mental.boredom)) / 4;
    const healthTarget = (essentialAvg * 0.7) + (mentalAvg * 0.3);
    pet.health.overall = clamp(pet.health.overall + (healthTarget - pet.health.overall) * 0.1 * deltaHours, 0, 100);

    // Initialise petting cooldown timestamp if missing
    if (!pet.state.lastPetTimestamp) pet.state.lastPetTimestamp = null;

    // ===== PERMA-DEATH CHECK =====
    // Death triggers: Hunger < 5%, Thirst < 5%, Health < 5%
    // Exceptions: Energy can be 0, Boredom can be 0 (ideal)
    if (
      pet.essential.hunger < 5 ||
      pet.essential.thirst < 5 ||
      pet.health.overall < 5
    ) {
      pet.isDead = true;
    }
  }

  // 2. Plant Stat Decay
  const weather = updatedState.weather;
  const weatherMultiplier = weather?.current === 'heatwave' ? 2.0 : 1.0; 
  const nightTime = isNightInVietnam();

  updatedState.plants.forEach(plant => {
    // Skip dead plants
    if (plant.status.growthStage === 'dead') return;

    const profile = PLANT_PROFILES[plant.id] || {};
    const speciesMoistureDecay = profile.moistureDecay || 3.0;
    const speciesNutrientDecay = profile.nutrientDecay || 1.0;
    const daysPerStage = profile.daysPerStage || 10;

    const stageMultiplier = plant.status.growthStage === 'seed' ? 0.5 : 1.0;
    
    plant.core.soilMoisture = clamp(plant.core.soilMoisture - speciesMoistureDecay * weatherMultiplier * deltaHours, 0, 100);
    plant.core.nutrients = clamp(plant.core.nutrients - speciesNutrientDecay * stageMultiplier * deltaHours, 0, 100);
    plant.advanced.hydration = clamp(plant.core.soilMoisture * 0.8 + plant.core.humidity * 0.2, 0, 100);
    plant.status.cleanliness = clamp(plant.status.cleanliness - 1.5 * deltaHours, 0, 100);
    plant.status.pestRisk = clamp(100 - plant.status.cleanliness, 0, 100);

    const phDrift = (Math.random() * 0.2 - 0.1) * deltaHours;
    plant.advanced.soilPH = clamp(plant.advanced.soilPH + phDrift, 4.0, 9.0);

    // Aeration decays very slowly
    plant.advanced.aeration = clamp((plant.advanced.aeration || 70) - 0.5 * deltaHours, 0, 100);

    // Sunlight decays (unless weather is sunny)
    if (weather?.current === 'sunny') {
      plant.core.sunlight = 100;
    } else {
      plant.core.sunlight = clamp((plant.core.sunlight || 60) - 2.0 * deltaHours, 0, 100);
    }

    // Overwatering damage for sensitive species
    const overwaterSens = profile.overwaterSensitivity || 1.0;
    if (plant.core.soilMoisture > 90 && overwaterSens > 1.0) {
      plant.status.vitality = clamp(
        plant.status.vitality - (overwaterSens - 1.0) * 5.0 * deltaHours, 0, 100
      );
    }

    // Vitality
    const moistureScore = (plant.core.soilMoisture >= 30 && plant.core.soilMoisture <= 80) ? 100 : 50;
    const phScore = (plant.advanced.soilPH >= 5.5 && plant.advanced.soilPH <= 7.0) ? 100 : 50;
    
    const vitalityTarget = (moistureScore * 0.25) + (plant.core.nutrients * 0.25) + ((plant.core.sunlight || 60) * 0.2) + (phScore * 0.15) + ((plant.advanced.aeration || 70) * 0.15);
    plant.status.vitality = clamp(plant.status.vitality + (vitalityTarget - plant.status.vitality) * 0.05 * deltaHours, 0, 100);

    // ===== REALISTIC GROWTH =====
    // Growth rate: 100 progress points = 1 stage.
    // Time for 1 stage = daysPerStage days = daysPerStage * 24 hours
    // growthPerHour at max vitality = 100 / (daysPerStage * 24)
    const baseGrowthPerHour = 100 / (daysPerStage * 24);
    
    let growthMultiplier = 0;
    if (plant.status.vitality >= 70) growthMultiplier = 1.0;
    else if (plant.status.vitality >= 40) growthMultiplier = 0.5;
    else if (plant.status.vitality >= 20) growthMultiplier = 0.15;

    let growthPerHour = baseGrowthPerHour * growthMultiplier;

    // Aeration boost: if soil quality >= 80, grow 1.5x faster
    if ((plant.advanced.aeration || 0) >= 80) {
      growthPerHour *= 1.5;
    }

    // Grow light: enables max growth even at night
    if (plant.hasGrowLight && nightTime) {
      // Grow light compensates for night — keep sunlight high
      plant.core.sunlight = Math.max(plant.core.sunlight || 0, 90);
    }

    plant.status.growthProgress += growthPerHour * deltaHours;

    // Stage transitions: seed(0-99) → sprout(100-199) → mature(200+)
    // Keep "plant" as intermediate alias for CSS compatibility
    if (plant.status.growthProgress >= 200) plant.status.growthStage = "mature";
    else if (plant.status.growthProgress >= 150) plant.status.growthStage = "plant";
    else if (plant.status.growthProgress >= 100) plant.status.growthStage = "sprout";
    else plant.status.growthStage = "seed";

    // Hoa Quỳnh night-blooming logic
    if (plant.id === 'cay_hoa_quynh' && plant.status.growthStage === 'mature') {
      plant.isBlooming = nightTime;
    } else if (plant.id === 'cay_hoa_quynh') {
      plant.isBlooming = false;
    }

    // ===== PERMA-DEATH CHECK =====
    // Death triggers: soilMoisture < 5% OR vitality < 5% OR nutrients < 5%
    if (plant.core.soilMoisture < 5 || plant.status.vitality < 5 || plant.core.nutrients < 5) {
      plant.status.growthStage = 'dead';
    }
  });

  return updatedState;
};
