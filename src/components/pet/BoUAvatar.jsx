import React, { useState } from 'react';
import './BoUAvatar.css';

const BoUAvatar = ({ mood = 'happy', isEating = false, isRunning = false, isPetting = false, equippedHat = null, isDead = false }) => {
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
      className={`bou-container ${mood} ${isEating ? 'eating' : ''} ${isJumping ? 'jumping' : ''} ${isRunning ? 'running' : ''} ${isPetting ? 'petting' : ''}`}
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
