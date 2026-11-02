import React, { useState } from 'react';
import './BoUAvatar.css';

const BoUAvatar = ({
  mood = 'happy',
  isEating = false,
  isRunning = false,
  isPetting = false,
  isGrooming = false,
  isPlayingBall = false,
  isLullaby = false,
  isTrick = false,
  snapFlash = false,
  equippedHat = null,
  isDead = false
}) => {
  const [isJumping, setIsJumping] = useState(false);

  const handleClick = () => {
    if (!isJumping && !isRunning && !isDead) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
  };

  if (isDead) {
    return (
      <div className="bou-container dead-pet" onClick={handleClick} style={{ cursor: 'default' }}>
        <div className="tombstone">
          <div className="tombstone-stone">
            <div className="tombstone-cross">✝</div>
            <div className="tombstone-text">R.I.P</div>
          </div>
          <div className="tombstone-base"></div>
          <div className="ghost-float">
            <div className="ghost-body">
              <div className="ghost-eye left"></div>
              <div className="ghost-eye right"></div>
              <div className="ghost-blush left"></div>
              <div className="ghost-blush right"></div>
            </div>
          </div>
        </div>
        <div className="wood-shavings"></div>
      </div>
    );
  }

  return (
    <div 
      className={`bou-container ${mood} ${isEating ? 'eating' : ''} ${isJumping ? 'jumping' : ''} ${isRunning ? 'running' : ''} ${isPetting ? 'petting' : ''} ${isGrooming ? 'grooming' : ''} ${isTrick ? 'trick' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Terrarium Background Elements */}
      <div className="water-bottle"></div>
      
      {/* Exercise Wheel */}
      <div className="wheel-stand"></div>
      <div className={`bou-wheel ${isRunning ? 'spinning' : ''}`}>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
      </div>

      <div className="bou-body">
        {/* Equipped Hat Accessory */}
        {equippedHat === 'top_hat' && (
          <div className="accessory-hat top-hat">
            <div className="hat-brim"></div>
            <div className="hat-crown"></div>
          </div>
        )}
        {equippedHat === 'pink_bow' && (
          <div className="accessory-hat pink-bow">
            <div className="bow-left"></div>
            <div className="bow-center"></div>
            <div className="bow-right"></div>
          </div>
        )}
        {equippedHat === 'summer_hat' && (
          <div className="accessory-hat summer-hat">
            <div className="straw-brim"></div>
            <div className="straw-crown"></div>
            <div className="straw-ribbon"></div>
          </div>
        )}
        {equippedHat === 'pink_bowtie' && (
          <div className="accessory-neck pink-bowtie-acc">
            <div className="bowtie-left"></div>
            <div className="bowtie-center"></div>
            <div className="bowtie-right"></div>
          </div>
        )}
        {equippedHat === 'sakura_flower' && (
          <div className="accessory-hat sakura-flower">
            <div className="sakura-petals">
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
              <div className="sakura-petal"></div>
            </div>
            <div className="sakura-center"></div>
            <div className="sakura-stamen"></div>
            <div className="sakura-stamen"></div>
            <div className="sakura-stamen"></div>
            <div className="sakura-stamen"></div>
            <div className="sakura-stamen"></div>
            <div className="sakura-stamen"></div>
          </div>
        )}
        {equippedHat === 'prince_crown' && (
          <div className="accessory-hat prince-crown-acc">
            <span className="prince-crown-icon">👑</span>
          </div>
        )}
        {equippedHat === 'cool_sunglasses' && (
          <div className="accessory-face cool-sunglasses-acc">
            <span className="cool-glasses-icon">🕶️</span>
          </div>
        )}
        {equippedHat === 'reindeer_antlers' && (
          <div className="accessory-hat reindeer-antlers-acc">
            <span className="reindeer-antlers-icon">🦌</span>
          </div>
        )}

        {/* Milestone Rewards Exclusive Hats */}
        {(equippedHat === 'crown_gold' || equippedHat === 'diamond_crown') && (
          <div className={`accessory-hat royal-crown ${equippedHat === 'diamond_crown' ? 'diamond-mode' : ''}`}>
            <span className="crown-jewel">💎</span>
            <div className="crown-peaks">👑</div>
          </div>
        )}
        {equippedHat === 'angel_halo' && (
          <div className="accessory-hat angel-halo-acc">
            <div className="halo-ring"></div>
          </div>
        )}
        {equippedHat === 'chef_hat' && (
          <div className="accessory-hat chef-hat-acc">
            <span className="emoji-hat">👨‍🍳</span>
          </div>
        )}
        {equippedHat === 'wizard_hat' && (
          <div className="accessory-hat wizard-hat-acc">
            <span className="emoji-hat">🧙‍♂️</span>
          </div>
        )}
        {equippedHat === 'detective_hat' && (
          <div className="accessory-hat detective-hat-acc">
            <span className="emoji-hat">🕵️</span>
          </div>
        )}
        {equippedHat === 'party_hat' && (
          <div className="accessory-hat party-hat-acc">
            <span className="emoji-hat">🥳</span>
          </div>
        )}
        {equippedHat === 'sunglasses' && (
          <div className="accessory-face sunglasses-acc">
            <span className="glasses-icon">🕶️</span>
          </div>
        )}
        {equippedHat === 'bunny_ears' && (
          <div className="accessory-hat bunny-ears-acc">
            <span className="ears-icon">🐰</span>
          </div>
        )}
        {equippedHat === 'cosmic_aura' && (
          <div className="accessory-cosmic-aura">
            <span className="aura-sparkle a1">✨</span>
            <span className="aura-sparkle a2">🌌</span>
            <span className="aura-sparkle a3">⭐</span>
          </div>
        )}

        <div className="bou-ear left"></div>
        <div className="bou-ear right"></div>
        <div className="bou-face">
          <div className="bou-eye left"></div>
          <div className="bou-eye right"></div>
          <div className="bou-nose"></div>
          <div className="bou-mouth"></div>
          <div className="bou-cheek left"></div>
          <div className="bou-cheek right"></div>
          <div className="bou-whisker left"></div>
          <div className="bou-whisker right"></div>
        </div>
        <div className="bou-belly"></div>
        <div className="bou-paw left"></div>
        <div className="bou-paw right"></div>
        <div className="bou-foot left"></div>
        <div className="bou-foot right"></div>
      </div>
      
      {/* Petting hearts */}
      {isPetting && (
        <div className="petting-hearts">
          <span className="heart h1">💕</span>
          <span className="heart h2">❤️</span>
          <span className="heart h3">💗</span>
        </div>
      )}

      {/* Grooming brush */}
      {isGrooming && (
        <div className="grooming-brush-anim">
          <span className="brush-icon">🪮</span>
          <span className="sparkle sp1">✨</span>
          <span className="sparkle sp2">✨</span>
          <span className="sparkle sp3">💕</span>
        </div>
      )}

      {/* Jingle bell ball */}
      {isPlayingBall && (
        <div className="jingle-ball-anim">
          <div className="jingle-ball">⚽</div>
          <span className="bell-sound">🔔</span>
        </div>
      )}

      {/* Lullaby notes */}
      {isLullaby && (
        <div className="lullaby-notes-anim">
          <span className="note n1">🎵</span>
          <span className="note n2">🎶</span>
          <span className="note n3">🎼</span>
        </div>
      )}

      {/* Camera flash overlay */}
      {snapFlash && <div className="camera-flash-overlay"></div>}

      {mood === 'sleepy' && !isRunning && (
        <div className="zzz-container">
          <span className="z1">Z</span>
          <span className="z2">z</span>
          <span className="z3">z</span>
        </div>
      )}

      <div className="wood-shavings"></div>
    </div>
  );
};

export default BoUAvatar;
