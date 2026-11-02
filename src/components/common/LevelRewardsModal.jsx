import React, { useState } from 'react';
import './LevelRewardsModal.css';
import { BOU_LEVEL_REWARDS, FISH_LEVEL_REWARDS, getExpProgress } from '../../config/levelRewards.js';
import { sfxClick, sfxReward } from '../../utils/audio.js';

export default function LevelRewardsModal({
  isOpen,
  onClose,
  gameState,
  onClaimReward,
  onClaimAll
}) {
  const [activeTrack, setActiveTrack] = useState('bou'); // 'bou' or 'fish'

  if (!isOpen) return null;

  // Track Bọ Ú
  const bouCurrentLevel = Math.max(
    gameState.pet?.level || 0,
    gameState.levelRewards?.bou?.highestLevel || 0
  );
  const bouClaimed = gameState.levelRewards?.bou?.claimed || [];

  // Track Fish (Blue + Red shared)
  const blueFishLevel = gameState.fishTank?.blueFish?.level || 0;
  const redFishLevel = gameState.fishTank?.redFish?.level || 0;
  const fishCurrentLevel = Math.max(
    blueFishLevel,
    redFishLevel,
    gameState.levelRewards?.fish?.highestLevel || 0
  );
  const fishClaimed = gameState.levelRewards?.fish?.claimed || [];

  const currentLevel = activeTrack === 'bou' ? bouCurrentLevel : fishCurrentLevel;
  const claimedList = activeTrack === 'bou' ? bouClaimed : fishClaimed;
  const rewardList = activeTrack === 'bou' ? BOU_LEVEL_REWARDS : FISH_LEVEL_REWARDS;

  // Unclaimed ready rewards count
  const readyToClaim = rewardList.filter(
    m => currentLevel >= m.level && !claimedList.includes(m.level)
  );

  // Next milestone calculation
  const nextMilestone = rewardList.find(m => m.level > currentLevel) || rewardList[rewardList.length - 1];

  const handleClaimSingle = (level) => {
    sfxReward();
    onClaimReward(activeTrack, level);
  };

  const handleClaimAllClick = () => {
    sfxReward();
    onClaimAll(activeTrack);
  };

  return (
    <div className="level-rewards-overlay" onClick={onClose}>
      <div className="level-rewards-modal" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="level-rewards-header">
          <div className="header-info">
            <h2>🏆 Hành Trình Cấp Độ 500</h2>
            <p>Mỗi 10 cấp 1 phần thưởng lớn • Bảo lưu vĩnh viễn không bao giờ reset!</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* TRACK SWITCHER TABS */}
        <div className="rewards-track-tabs">
          <button
            className={`track-tab-btn ${activeTrack === 'bou' ? 'active-bou' : ''}`}
            onClick={() => { sfxClick(); setActiveTrack('bou'); }}
          >
            🐹 Bọ Ú (LV {bouCurrentLevel})
            {readyToClaim.length > 0 && activeTrack !== 'bou' && (
              <span className="unclaimed-badge">!</span>
            )}
          </button>
          <button
            className={`track-tab-btn ${activeTrack === 'fish' ? 'active-fish' : ''}`}
            onClick={() => { sfxClick(); setActiveTrack('fish'); }}
          >
            🐠 Bể Cá Chọi (LV {fishCurrentLevel})
            {readyToClaim.length > 0 && activeTrack !== 'fish' && (
              <span className="unclaimed-badge">!</span>
            )}
          </button>
        </div>

        {/* CURRENT PROGRESS HERO CARD */}
        <div className={`rewards-hero-card ${activeTrack === 'bou' ? 'hero-bou' : 'hero-fish'}`}>
          <div className="hero-stats">
            <div className="hero-stat-block">
              <span className="hero-label">Cấp độ hiện tại</span>
              <strong className="hero-value">LV {currentLevel}</strong>
              <span className="hero-sub">
                {currentLevel >= 500 ? 'Đã đạt đỉnh cao!' : `Mục tiêu kế: Cấp ${nextMilestone.level}`}
              </span>
            </div>

            <div className="hero-stat-block right">
              <span className="hero-label">Đã nhận quà</span>
              <strong className="hero-value">{claimedList.length} / 50</strong>
              <span className="hero-sub">mốc đã chinh phục</span>
            </div>
          </div>

          {/* Progress bar to Lv 500 */}
          <div className="hero-progress-wrap">
            <div className="hero-progress-labels">
              <span>Tiến trình cấp độ</span>
              <span>{Math.min(100, ((currentLevel / 500) * 100)).toFixed(1)}% (Mốc tối đa LV 500)</span>
            </div>
            <div className="hero-progress-track">
              <div
                className="hero-progress-fill"
                style={{ width: `${Math.min(100, (currentLevel / 500) * 100)}%` }}
              ></div>
            </div>
            {(() => {
              const currentExp = activeTrack === 'bou'
                ? (gameState.pet?.exp || 0)
                : Math.max(gameState.fishTank?.blueFish?.exp || 0, gameState.fishTank?.redFish?.exp || 0);
              const prog = getExpProgress(currentExp, currentLevel);
              return (
                <div style={{ marginTop: '6px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', opacity: 0.92 }}>
                  <span>Kinh nghiệm lên Cấp {currentLevel + 1}:</span>
                  <strong>{prog.currentLevelExp} / {prog.expNeeded} EXP ({prog.percent}%)</strong>
                </div>
              );
            })()}
          </div>

          {/* Claim All Button if available */}
          {readyToClaim.length > 0 && (
            <div className="claim-all-banner">
              <span>🎉 Có <strong>{readyToClaim.length}</strong> mốc quà sẵn sàng nhận!</span>
              <button className="claim-all-btn" onClick={handleClaimAllClick}>
                🎁 Nhận Tất Cả Quà
              </button>
            </div>
          )}
        </div>

        {/* MILESTONE REWARDS LIST */}
        <div className="milestones-scroll-list">
          {rewardList.map((m) => {
            const isReached = currentLevel >= m.level;
            const isClaimed = claimedList.includes(m.level);
            const isCurrentNext = !isReached && m.level === nextMilestone.level;

            return (
              <div
                key={m.level}
                className={`milestone-card ${isClaimed ? 'status-claimed' : isReached ? 'status-ready' : 'status-locked'} ${isCurrentNext ? 'status-next' : ''}`}
              >
                {/* Milestone Level Badge */}
                <div className="milestone-badge">
                  <span className="ms-level-num">LV {m.level}</span>
                  <span className="ms-icon">{m.icon}</span>
                </div>

                {/* Milestone Content */}
                <div className="milestone-details">
                  <div className="ms-title-row">
                    <h4 className="ms-name">{m.rewardName}</h4>
                    {m.title && <span className="ms-title-tag">Danh hiệu: {m.title}</span>}
                  </div>
                  <p className="ms-desc">
                    {m.coins > 0 && `💰 +${m.coins.toLocaleString('vi-VN')} Xu `}
                    {m.cosmeticId && `• 🎀 Phụ kiện độc quyền: ${m.rewardName.split('+')[1] || ''} `}
                  </p>
                </div>

                {/* Action button / Status */}
                <div className="milestone-action">
                  {isClaimed ? (
                    <span className="claimed-tag">
                      <span className="tag-check">✓</span> Đã Nhận
                    </span>
                  ) : isReached ? (
                    <button
                      className="claim-single-btn"
                      onClick={() => handleClaimSingle(m.level)}
                    >
                      🎁 Nhận Quà
                    </button>
                  ) : (
                    <span className="locked-tag">
                      🔒 Cần Cấp {m.level}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER NOTICE */}
        <div className="level-rewards-footer">
          <p>
            🛡️ <strong>Bảo lưu vĩnh viễn:</strong> Khi thú cưng hoặc cá qua đời, toàn bộ phần thưởng trong kho đồ và cấp độ cao nhất không bao giờ bị mất hay reset!
          </p>
        </div>
      </div>
    </div>
  );
}
