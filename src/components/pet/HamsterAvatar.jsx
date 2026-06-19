import React, { useState } from 'react';
import './HamsterAvatar.css';

const HamsterAvatar = ({ mood = 'happy', isEating = false, isRunning = false, isPetting = false, equippedHat = null }) => {
  const [isJumping, setIsJumping] = useState(false);

  const handleClick = () => {
    if (!isJumping && !isRunning) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 500);
    }
  };

  return (
    <div 
      className={`hamster-container ${mood} ${isEating ? 'eating' : ''} ${isJumping ? 'jumping' : ''} ${isRunning ? 'running' : ''} ${isPetting ? 'petting' : ''}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Terrarium Background Elements */}
      <div className="water-bottle"></div>
      
      {/* Hamster Wheel */}
      <div className="wheel-stand"></div>
      <div className={`hamster-wheel ${isRunning ? 'spinning' : ''}`}>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
        <div className="wheel-spoke"></div>
      </div>

      <div className="hamster-body">
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

        <div className="hamster-ear left"></div>
        <div className="hamster-ear right"></div>
        <div className="hamster-face">
          <div className="hamster-eye left"></div>
          <div className="hamster-eye right"></div>
          <div className="hamster-nose"></div>
          <div className="hamster-mouth"></div>
          <div className="hamster-cheek left"></div>
          <div className="hamster-cheek right"></div>
        </div>
        <div className="hamster-belly"></div>
        <div className="hamster-paw left"></div>
        <div className="hamster-paw right"></div>
        <div className="hamster-foot left"></div>
        <div className="hamster-foot right"></div>
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

export default HamsterAvatar;
