#!/bin/bash
# Little Garden PWA Setup Script

echo "🌱 Starting Little Garden PWA Setup..."

# 1. Create the React app using Vite
echo "📦 Creating Vite React app..."
npx -y create-vite@5 little-garden --template react
cd little-garden

# 2. Install dependencies
echo "📥 Installing dependencies..."
npm install
npm install firebase react-router-dom

# 3. Create EXACT folder structure from blueprint
echo "📂 Creating folder structure..."
mkdir -p src/config src/context src/hooks src/utils
mkdir -p src/components/common src/components/auth src/components/pet src/components/plant src/components/weather src/components/shop src/components/minigame src/components/garden src/components/layout
mkdir -p src/assets

# 4. Create base configuration files
echo "📝 Creating base config files..."
touch src/config/firebase.js src/config/constants.js src/config/plantProfiles.js
touch src/context/AuthContext.js src/context/GameContext.js
touch src/hooks/useAuth.js src/hooks/useGame.js src/hooks/useAutoSave.js src/hooks/useStatDecay.js src/hooks/useMinigameTimer.js
touch src/utils/offlineReconcile.js src/utils/petLogic.js src/utils/plantLogic.js src/utils/weatherLogic.js src/utils/economyLogic.js src/utils/minigameLogic.js src/utils/firestoreService.js src/utils/helpers.js
touch src/components/common/StatBar.js src/components/common/StatBar.css src/components/common/Button.js src/components/common/Button.css src/components/common/Modal.js src/components/common/Modal.css src/components/common/CoinDisplay.js src/components/common/CoinDisplay.css src/components/common/Toast.js src/components/common/Toast.css
touch src/components/auth/LoginScreen.js src/components/auth/LoginScreen.css
touch src/components/pet/PetView.js src/components/pet/PetView.css src/components/pet/HamsterAvatar.js src/components/pet/HamsterAvatar.css src/components/pet/PetActions.js src/components/pet/PetActions.css
touch src/components/plant/PlantView.js src/components/plant/PlantView.css src/components/plant/PlantCard.js src/components/plant/PlantCard.css src/components/plant/PlantDetail.js src/components/plant/PlantDetail.css src/components/plant/PlantAvatar.js src/components/plant/PlantAvatar.css src/components/plant/PlantActions.js src/components/plant/PlantActions.css
touch src/components/weather/WeatherBanner.js src/components/weather/WeatherBanner.css
touch src/components/shop/ShopScreen.js src/components/shop/ShopScreen.css
touch src/components/minigame/MemoryGame.js src/components/minigame/MemoryGame.css
touch src/components/garden/GardenView.js src/components/garden/GardenView.css
touch src/components/layout/Header.js src/components/layout/Header.css src/components/layout/NavBar.js src/components/layout/NavBar.css src/components/layout/OfflineReport.js src/components/layout/OfflineReport.css

# 5. Populate PWA manifest and service worker shell
echo "🌍 Setting up PWA files..."
cat << 'EOF' > public/manifest.json
{
  "short_name": "Little Garden",
  "name": "Little Garden - Virtual Pet & Plant Simulator",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#FF85A2",
  "background_color": "#FFF5F7"
}
EOF

cat << 'EOF' > public/service-worker.js
// Simple Cache-first Service Worker
const CACHE_NAME = 'little-garden-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
EOF

echo "✨ Little Garden Setup Complete!"
echo "👉 Next steps:"
echo "1. Follow the Firebase Setup Instructions."
echo "2. Create the .env file in the little-garden directory."
echo "3. Run 'npm run dev' to start the app."
