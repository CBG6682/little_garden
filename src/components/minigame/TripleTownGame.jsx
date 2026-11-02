import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sfxMerge, sfxReward, sfxClick, sfxSell } from '../../utils/audio.js';
import './TripleTownGame.css';

const GRID_SIZE = 6;

export const ITEM_DEFS = {
  grass:           { tier: 0, name: 'Cỏ Xanh',         emoji: '🌿', next: 'bush',            score: 5 },
  bush:            { tier: 1, name: 'Bụi Rậm',         emoji: '🌳', next: 'tree',            score: 20 },
  tree:            { tier: 2, name: 'Cây Cổ Thụ',      emoji: '🌲', next: 'hut',             score: 100 },
  hut:             { tier: 3, name: 'Nhà Gỗ Nhỏ',      emoji: '🛖', next: 'house',           score: 500 },
  house:           { tier: 4, name: 'Nhà Khang Trang', emoji: '🏡', next: 'mansion',         score: 1500 },
  mansion:         { tier: 5, name: 'Dinh Thự Lớn',    emoji: '🏰', next: 'castle',          score: 5000 },
  castle:          { tier: 6, name: 'Lâu Đài Vàng',    emoji: '🏯', next: 'floating_castle', score: 20000 },
  floating_castle: { tier: 7, name: 'Thành Phố Bay',   emoji: '🏙️', next: null,              score: 100000 },
  
  // Special Bear & Church branch
  bear:            { tier: -1, name: 'Gấu Nâu',        emoji: '🐻', next: null,              score: 0 },
  tombstone:       { tier: 10, name: 'Bia Đá',         emoji: '🪨', next: 'church',          score: 100 },
  church:          { tier: 11, name: 'Nhà Thờ',        emoji: '⛪', next: 'cathedral',       score: 1000 },
  cathedral:       { tier: 12, name: 'Thánh Đường',    emoji: '🕍', next: 'treasure',        score: 5000 },
  treasure:        { tier: 13, name: 'Rương Vàng',     emoji: '💰', next: null,              score: 10000 },

  // Tools
  crystal:         { tier: 99, name: 'Pha Lê',         emoji: '💎', next: null,              score: 0 },
  bot:             { tier: 98, name: 'Robot Tiêu Diệt',emoji: '🤖', next: null,              score: 0 }
};

export default function TripleTownGame({ onReward }) {
  const [grid, setGrid] = useState(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState('grass');
  const [storedItem, setStoredItem] = useState(null);
  const [justMergedPos, setJustMergedPos] = useState(null);
  const [isBotActive, setIsBotActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [rewardCoins, setRewardCoins] = useState(0);

  // Generate next random spawn item
  const getRandomItem = () => {
    const r = Math.random();
    if (r < 0.55) return 'grass';
    if (r < 0.77) return 'bush';
    if (r < 0.88) return 'tree';
    if (r < 0.94) return 'bear';
    if (r < 0.97) return 'crystal';
    return 'bot';
  };

  // Initialize new game board
  const initGame = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    // Seed board with 3-4 random starter elements
    const seeds = [
      { r: 1, c: 2, item: 'grass' },
      { r: 2, c: 4, item: 'bush' },
      { r: 4, c: 1, item: 'grass' },
      { r: 4, c: 3, item: 'tree' }
    ];
    seeds.forEach(s => { newGrid[s.r][s.c] = s.item; });

    setGrid(newGrid);
    setScore(0);
    setCurrentItem(getRandomItem());
    setStoredItem(null);
    setIsBotActive(false);
    setIsGameOver(false);
    setRewardCoins(0);
    setJustMergedPos(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Find connected matching items using BFS (orthogonally adjacent)
  const getConnectedGroup = (board, startR, startC, targetItem) => {
    const visited = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
    const queue = [[startR, startC]];
    const group = [];
    visited[startR][startC] = true;

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      group.push([r, c]);

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 && nr < GRID_SIZE &&
          nc >= 0 && nc < GRID_SIZE &&
          !visited[nr][nc] &&
          board[nr][nc] === targetItem
        ) {
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
    return group;
  };

  // Recursive cascading merge engine
  const executeMergeAt = (board, r, c, itemToMerge) => {
    const itemDef = ITEM_DEFS[itemToMerge];
    if (!itemDef || !itemDef.next) return { board, scoreGain: 0 };

    const group = getConnectedGroup(board, r, c, itemToMerge);

    if (group.length >= 3) {
      // Clear all items in group except destination (r, c)
      group.forEach(([gr, gc]) => {
        board[gr][gc] = null;
      });

      const upgradedItem = itemDef.next;
      board[r][c] = upgradedItem;
      const upgradedDef = ITEM_DEFS[upgradedItem];
      let scoreGain = upgradedDef.score;

      sfxMerge();

      // Check for cascading chain merge
      const cascade = executeMergeAt(board, r, c, upgradedItem);
      return {
        board: cascade.board,
        scoreGain: scoreGain + cascade.scoreGain
      };
    }

    return { board, scoreGain: 0 };
  };

  // Move bears across the board
  const moveBearsAndTrap = (board) => {
    const bearPositions = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === 'bear') {
          bearPositions.push([r, c]);
        }
      }
    }

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let totalScore = 0;

    bearPositions.forEach(([r, c]) => {
      // Find empty orthogonal neighbors
      const emptyNeighbors = [];
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc] === null) {
          emptyNeighbors.push([nr, nc]);
        }
      });

      if (emptyNeighbors.length > 0) {
        // Bear wanders into a random empty tile
        const [nextR, nextC] = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
        board[r][c] = null;
        board[nextR][nextC] = 'bear';
      } else {
        // Bear is TRAPPED! Turns into Tombstone
        board[r][c] = 'tombstone';
        // Check if tombstone merges into Church
        const tombMerge = executeMergeAt(board, r, c, 'tombstone');
        board = tombMerge.board;
        totalScore += tombMerge.scoreGain;
      }
    });

    return { board, scoreGain: totalScore };
  };

  // Check Game Over
  const checkGameOver = (board) => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === null) return false;
      }
    }
    return true;
  };

  // Handle cell click
  const handleCellClick = (r, c) => {
    if (isGameOver) return;

    // BOT ACTION: Destroy clicked cell
    if (isBotActive || currentItem === 'bot') {
      if (grid[r][c] !== null) {
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = null;
        setGrid(newGrid);
        sfxClick();
        setIsBotActive(false);
        setCurrentItem(getRandomItem());
      }
      return;
    }

    // Normal placement requires empty cell
    if (grid[r][c] !== null) {
      // If clicking on Treasure Chest, claim reward!
      if (grid[r][c] === 'treasure') {
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = null;
        setGrid(newGrid);
        setScore(s => s + 5000);
        sfxSell();
        if (onReward) onReward(2);
      }
      return;
    }

    let newGrid = grid.map(row => [...row]);
    let placedItem = currentItem;
    let turnScore = 0;

    // CRYSTAL WILDCARD ACTION
    if (placedItem === 'crystal') {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      let bestItem = null;
      let maxGroupSize = 0;

      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc]) {
          const neighborItem = newGrid[nr][nc];
          if (ITEM_DEFS[neighborItem]?.next) {
            newGrid[r][c] = neighborItem;
            const group = getConnectedGroup(newGrid, r, c, neighborItem);
            if (group.length >= 3 && group.length > maxGroupSize) {
              maxGroupSize = group.length;
              bestItem = neighborItem;
            }
            newGrid[r][c] = null;
          }
        }
      });

      if (bestItem) {
        placedItem = bestItem;
      } else {
        placedItem = 'tombstone'; // Crystal with no match becomes a rock
      }
    }

    // Place item on board
    newGrid[r][c] = placedItem;
    sfxClick();

    // Execute merge
    const mergeResult = executeMergeAt(newGrid, r, c, placedItem);
    newGrid = mergeResult.board;
    turnScore += mergeResult.scoreGain;

    if (mergeResult.scoreGain > 0) {
      setJustMergedPos(`${r}-${c}`);
      setTimeout(() => setJustMergedPos(null), 450);
    }

    // Move bears
    const bearResult = moveBearsAndTrap(newGrid);
    newGrid = bearResult.board;
    turnScore += bearResult.scoreGain;

    // Update state
    setGrid(newGrid);
    const newTotalScore = score + turnScore;
    setScore(newTotalScore);
    setCurrentItem(getRandomItem());

    // Check game over
    if (checkGameOver(newGrid)) {
      setIsGameOver(true);
      // Scaled coin reward: 1000 points = 1 coin, max 20 coins
      const earnedCoins = Math.min(20, Math.max(1, Math.floor(newTotalScore / 1000)));
      setRewardCoins(earnedCoins);
      sfxReward();
      if (onReward) onReward(earnedCoins);
    }
  };

  // Swap with Store Slot
  const handleStoreSlotClick = () => {
    sfxClick();
    if (storedItem === null) {
      setStoredItem(currentItem);
      setCurrentItem(getRandomItem());
    } else {
      const temp = currentItem;
      setCurrentItem(storedItem);
      setStoredItem(temp);
    }
  };

  const currentDef = ITEM_DEFS[currentItem] || ITEM_DEFS.grass;
  const storedDef = storedItem ? ITEM_DEFS[storedItem] : null;

  return (
    <div className="tripletown-container">
      {/* Header with Score and Current/Stored Items */}
      <div className="tripletown-header">
        <div className="tripletown-score-badge">
          <div className="tripletown-score-label">ĐIỂM SỐ 🏡</div>
          <div className="tripletown-score-val">{score}</div>
        </div>

        <div className="tripletown-slots-panel">
          {/* Current Spawn Item */}
          <div className="tripletown-slot-box" title={currentDef.name}>
            <span className="tripletown-slot-tag">Sắp đặt</span>
            <span className="tripletown-slot-item">{currentDef.emoji}</span>
          </div>

          {/* Stored / Hold Item */}
          <div
            className="tripletown-slot-box is-store"
            onClick={handleStoreSlotClick}
            title={storedDef ? `Bấm để đổi với ${storedDef.name}` : 'Bấm để cất giữ vật phẩm này'}
          >
            <span className="tripletown-slot-tag">Giữ đồ 📥</span>
            <span className="tripletown-slot-item">{storedDef ? storedDef.emoji : '➖'}</span>
          </div>
        </div>
      </div>

      {/* 6x6 Board */}
      <div className="tripletown-board">
        {grid.map((row, r) =>
          row.map((cellItem, c) => {
            const def = cellItem ? ITEM_DEFS[cellItem] : null;
            const isJustMerged = justMergedPos === `${r}-${c}`;
            const isBotTarget = (isBotActive || currentItem === 'bot') && cellItem !== null;

            return (
              <div
                key={`${r}-${c}`}
                className={`tripletown-cell ${cellItem ? 'occupied' : ''} ${isJustMerged ? 'just-merged' : ''} ${isBotTarget ? 'bot-target' : ''}`}
                onClick={() => handleCellClick(r, c)}
              >
                {def && (
                  <span className="tripletown-item-emoji" title={def.name}>
                    {def.emoji}
                  </span>
                )}
                {def && def.tier >= 0 && def.tier <= 7 && (
                  <span className="tripletown-item-level">L{def.tier + 1}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Evolution Hierarchy Chart */}
      <div className="tripletown-tree-chart">
        <span>🌿 Cỏ</span>
        <span className="tripletown-tree-sep">➔</span>
        <span>🌳 Bụi</span>
        <span className="tripletown-tree-sep">➔</span>
        <span>🌲 Cây</span>
        <span className="tripletown-tree-sep">➔</span>
        <span>🛖 Nhà</span>
        <span className="tripletown-tree-sep">➔</span>
        <span>🏡 Biệt thự</span>
        <span className="tripletown-tree-sep">➔</span>
        <span>🏰 Dinh thự</span>
        <span className="tripletown-tree-sep">➔</span>
        <span>🏯 Lâu đài</span>
      </div>

      <div className="tripletown-footer">
        💡 <b>Cách chơi:</b> Ghép 3 vật phẩm giống nhau liền kề để nâng cấp công trình lớn hơn. Nhốt gấu 🐻 biến thành bia đá 🪨 ➔ Nhà thờ ⛪ ➔ Rương vàng 💰! Đạt 1000 điểm = 1 xu (tối đa 20 xu/ván). Mở rương vàng thưởng +2 xu.
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="tripletown-modal-overlay">
          <div className="tripletown-modal-card">
            <div style={{ fontSize: '50px', marginBottom: '8px' }}>🏙️✨</div>
            <h3 className="tripletown-modal-title">THỊ TRẤN HOÀN THÀNH</h3>
            <div className="tripletown-modal-score">{score} điểm</div>
            <div className="tripletown-modal-reward">
              <span>Thưởng xây dựng:</span>
              <b>+{rewardCoins} Xu 💰</b>
            </div>
            <button className="tripletown-modal-btn" onClick={initGame}>
              Xây Dựng Thị Trấn Mới 🏡
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
