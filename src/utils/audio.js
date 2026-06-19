// Sound effects using Web Audio API oscillators (no external files needed)
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let isMuted = false;

// BGM state
let bgmGain = null;
let bgmStarted = false;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new AudioCtx();
    } catch (e) {
      console.warn('Web Audio API not available:', e);
      return null;
    }
  }
  // Resume suspended context (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// --- Utility: play a tone ---
function playTone(freq, duration = 0.15, type = 'sine', vol = 0.12) {
  if (isMuted) return;
  const c = getCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback error:', e);
  }
}

// --- SFX Library ---
export function sfxClick() {
  playTone(800, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(1200, 0.06, 'sine', 0.07), 30);
}

export function sfxWater() {
  playTone(400, 0.3, 'sine', 0.1);
  setTimeout(() => playTone(600, 0.2, 'sine', 0.08), 100);
  setTimeout(() => playTone(500, 0.25, 'sine', 0.06), 200);
}

export function sfxFeed() {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => playTone(300 + i * 50, 0.1, 'square', 0.06), i * 80);
  }
}

export function sfxMerge() {
  playTone(523, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 60);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.08), 120);
}

export function sfxReward() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2, 'sine', 0.1), i * 100));
}

export function sfxEquip() {
  playTone(440, 0.15, 'triangle', 0.1);
  setTimeout(() => playTone(880, 0.2, 'triangle', 0.08), 80);
}

export function sfxSell() {
  // Descending coin-drop sound
  playTone(880, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.09), 80);
  setTimeout(() => playTone(440, 0.15, 'sine', 0.08), 160);
  setTimeout(() => playTone(330, 0.2, 'triangle', 0.06), 240);
}

// --- Lofi BGM Generator ---
export function startBGM() {
  if (bgmStarted) return;
  const c = getCtx();
  if (!c) return;

  try {
    bgmGain = c.createGain();
    bgmGain.gain.setValueAtTime(isMuted ? 0 : 0.04, c.currentTime);
    bgmGain.connect(c.destination);

    // Chord progression loop
    const chords = [
      [261, 329, 392],  // C
      [293, 349, 440],  // Dm
      [349, 440, 523],  // F
      [392, 493, 587],  // G
    ];

    let chordIdx = 0;
    function playChord() {
      if (!bgmGain) return;
      const cc = getCtx();
      if (!cc) return;
      const chord = chords[chordIdx % chords.length];
      chord.forEach(freq => {
        try {
          const osc = cc.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, cc.currentTime);
          const g = cc.createGain();
          g.gain.setValueAtTime(0.02, cc.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, cc.currentTime + 2.8);
          osc.connect(g);
          g.connect(bgmGain);
          osc.start();
          osc.stop(cc.currentTime + 3);
        } catch (e) { /* ignore */ }
      });
      chordIdx++;
      setTimeout(playChord, 3000);
    }

    playChord();
    bgmStarted = true;
  } catch (e) {
    console.warn('BGM initialization error:', e);
  }
}

// --- Mute controls ---
export function setMuted(muted) {
  isMuted = muted;
  if (bgmGain) {
    const c = getCtx();
    if (c) {
      bgmGain.gain.setValueAtTime(muted ? 0 : 0.04, c.currentTime);
    }
  }
}

export function getMuted() {
  return isMuted;
}
