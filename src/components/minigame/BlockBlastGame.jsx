import React, { useState, useCallback, useRef, useEffect } from 'react';
import { sfxMerge, sfxReward, sfxClick } from '../../utils/audio.js';

const GRID_SIZE = 8;
const CELL_PX = 36;

// ── Block shapes (non-rotatable) ──────────────────────────────
const SHAPES = [
  // Single
  [[1]],
  // Dominos
  [[1, 1]],
  [[1], [1]],
  // Triominos
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 0]],
  [[1, 1], [0, 1]],
  [[0, 1], [1, 1]],
  [[1, 0], [1, 1]],
  // Tetrominoes
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  // Pentominoes (select few)
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 0], [0, 1, 1]],
];

const PIECE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FF8C42', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F1948A',
];

const randomColor = () => PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];

const randomShape = () => {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { cells: shape, color: randomColor() };
};

const emptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

// Check if a piece can be placed at (row, col)
const canPlace = (grid, piece, row, col) => {
  for (let r = 0; r < piece.cells.length; r++) {
    for (let c = 0; c < piece.cells[r].length; c++) {
      if (piece.cells[r][c]) {
        const gr = row + r;
        const gc = col + c;
        if (gr < 0 || gr >= GRID_SIZE || gc < 0 || gc >= GRID_SIZE) return false;
        if (grid[gr][gc]) return false;
      }
    }
  }
  return true;
};

// Check if any placement exists for a piece
const canPlaceAnywhere = (grid, piece) => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlace(grid, piece, r, c)) return true;
    }
  }
  return false;
};

const BlockBlastGame = ({ onReward }) => {
  const [grid, setGrid] = useState(emptyGrid);
  const [pieces, setPieces] = useState([null, null, null]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [dragging, setDragging] = useState(null); // { pieceIdx, piece }
  const [hoverCell, setHoverCell] = useState(null); // { row, col }
  const [clearingLines, setClearingLines] = useState(null); // { rows: Set, cols: Set }
  const [lastComboText, setLastComboText] = useState('');
  
  const gridRef = useRef(null);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);

  // Generate 3 new pieces
  const generatePieces = useCallback(() => {
    return [randomShape(), randomShape(), randomShape()];
  }, []);

  const resetGame = useCallback(() => {
    setGrid(emptyGrid());
    const newPieces = generatePieces();
    setPieces(newPieces);
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    setCoinsEarned(0);
    setDragging(null);
    setHoverCell(null);
    setClearingLines(null);
    setLastComboText('');
  }, [generatePieces]);

  // Place piece on the grid and handle line clearing
  const placePiece = useCallback((pieceIdx, row, col) => {
    const piece = pieces[pieceIdx];
    if (!piece || !canPlace(grid, piece, row, col)) return;

    // Place blocks
    const newGrid = grid.map(r => [...r]);
    let cellsPlaced = 0;
    for (let r = 0; r < piece.cells.length; r++) {
      for (let c = 0; c < piece.cells[r].length; c++) {
        if (piece.cells[r][c]) {
          newGrid[row + r][col + c] = piece.color;
          cellsPlaced++;
        }
      }
    }

    // Check for full rows and columns
    const fullRows = new Set();
    const fullCols = new Set();
    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r].every(cell => cell !== null)) fullRows.add(r);
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      let full = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newGrid[r][c] === null) { full = false; break; }
      }
      if (full) fullCols.add(c);
    }

    const linesCleared = fullRows.size + fullCols.size;

    // Update combo
    let newCombo = comboRef.current;
    if (linesCleared > 0) {
      newCombo += 1;
    } else {
      newCombo = 0;
    }
    comboRef.current = newCombo;
    setCombo(newCombo);

    // Scoring: 10 pts per cell placed + 100 per line cleared × combo multiplier
    const comboMultiplier = Math.max(1, newCombo);
    const linePoints = linesCleared * 100 * comboMultiplier;
    const placePoints = cellsPlaced * 10;
    const turnPoints = placePoints + linePoints;

    const newScore = scoreRef.current + turnPoints;
    scoreRef.current = newScore;
    setScore(newScore);

    // Show combo text
    if (newCombo >= 2) {
      setLastComboText(`🔥 COMBO x${newCombo}!`);
      setTimeout(() => setLastComboText(''), 1200);
    }

    // Animate line clears
    if (linesCleared > 0) {
      sfxMerge();
      setClearingLines({ rows: fullRows, cols: fullCols });

      // After animation, clear the lines
      setTimeout(() => {
        const clearedGrid = newGrid.map(r => [...r]);
        fullRows.forEach(r => {
          for (let c = 0; c < GRID_SIZE; c++) clearedGrid[r][c] = null;
        });
        fullCols.forEach(c => {
          for (let r = 0; r < GRID_SIZE; r++) clearedGrid[r][c] = null;
        });
        setGrid(clearedGrid);
        setClearingLines(null);

        // Update pieces and check game over after clearing
        const newPieces = [...pieces];
        newPieces[pieceIdx] = null;
        const allUsed = newPieces.every(p => p === null);
        const finalPieces = allUsed ? generatePieces() : newPieces;
        setPieces(finalPieces);

        // Check game over
        const anyPlaceable = finalPieces.some(p => p && canPlaceAnywhere(clearedGrid, p));
        if (!anyPlaceable) {
          endGame(newScore);
        }
      }, 350);
    } else {
      setGrid(newGrid);

      // Remove the used piece
      const newPieces = [...pieces];
      newPieces[pieceIdx] = null;
      const allUsed = newPieces.every(p => p === null);
      const finalPieces = allUsed ? generatePieces() : newPieces;
      setPieces(finalPieces);

      // Check game over
      const anyPlaceable = finalPieces.some(p => p && canPlaceAnywhere(newGrid, p));
      if (!anyPlaceable) {
        endGame(newScore);
      }
    }

    sfxClick();
  }, [grid, pieces, generatePieces]);

  const endGame = useCallback((finalScore) => {
    setIsPlaying(false);
    setGameOver(true);
    const reward = Math.floor(finalScore / 50);
    setCoinsEarned(reward);
    if (reward > 0) {
      onReward(reward);
      sfxReward();
    }
  }, [onReward]);

  // ── Drag & Drop (mouse) ─────────────────────────────────────
  const handlePieceMouseDown = (e, idx) => {
    if (!isPlaying || !pieces[idx]) return;
    e.preventDefault();
    setDragging({ pieceIdx: idx, piece: pieces[idx] });
  };

  const handleGridMouseMove = useCallback((e) => {
    if (!dragging || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const piece = dragging.piece;
    const pieceH = piece.cells.length;
    const pieceW = piece.cells[0].length;

    const col = Math.floor((e.clientX - rect.left) / CELL_PX - pieceW / 2);
    const row = Math.floor((e.clientY - rect.top) / CELL_PX - pieceH / 2);
    setHoverCell({ row, col });
  }, [dragging]);

  const handleGridMouseUp = useCallback(() => {
    if (!dragging || !hoverCell) { setDragging(null); setHoverCell(null); return; }
    if (canPlace(grid, dragging.piece, hoverCell.row, hoverCell.col)) {
      placePiece(dragging.pieceIdx, hoverCell.row, hoverCell.col);
    }
    setDragging(null);
    setHoverCell(null);
  }, [dragging, hoverCell, grid, placePiece]);

  // ── Drag & Drop (touch) ─────────────────────────────────────
  const handlePieceTouchStart = (e, idx) => {
    if (!isPlaying || !pieces[idx]) return;
    setDragging({ pieceIdx: idx, piece: pieces[idx] });
  };

  const handleTouchMove = useCallback((e) => {
    if (!dragging || !gridRef.current) return;
    const touch = e.touches[0];
    const rect = gridRef.current.getBoundingClientRect();
    const piece = dragging.piece;
    const pieceH = piece.cells.length;
    const pieceW = piece.cells[0].length;

    // Offset up so finger doesn't cover the drop area
    const col = Math.floor((touch.clientX - rect.left) / CELL_PX - pieceW / 2);
    const row = Math.floor((touch.clientY - rect.top - 50) / CELL_PX - pieceH / 2);
    setHoverCell({ row, col });
  }, [dragging]);

  const handleTouchEnd = useCallback(() => {
    if (!dragging || !hoverCell) { setDragging(null); setHoverCell(null); return; }
    if (canPlace(grid, dragging.piece, hoverCell.row, hoverCell.col)) {
      placePiece(dragging.pieceIdx, hoverCell.row, hoverCell.col);
    }
    setDragging(null);
    setHoverCell(null);
  }, [dragging, hoverCell, grid, placePiece]);

  // Global mouse/touch listeners for drag
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleGridMouseMove);
      window.addEventListener('mouseup', handleGridMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleGridMouseMove);
      window.removeEventListener('mouseup', handleGridMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, handleGridMouseMove, handleGridMouseUp, handleTouchMove, handleTouchEnd]);

  // Build hover preview cells
  const hoverPreview = new Set();
  let hoverValid = false;
  if (dragging && hoverCell) {
    hoverValid = canPlace(grid, dragging.piece, hoverCell.row, hoverCell.col);
    for (let r = 0; r < dragging.piece.cells.length; r++) {
      for (let c = 0; c < dragging.piece.cells[r].length; c++) {
        if (dragging.piece.cells[r][c]) {
          hoverPreview.add(`${hoverCell.row + r}-${hoverCell.col + c}`);
        }
      }
    }
  }

  // Clearing animation cells
  const clearingCells = new Set();
  if (clearingLines) {
    clearingLines.rows.forEach(r => {
      for (let c = 0; c < GRID_SIZE; c++) clearingCells.add(`${r}-${c}`);
    });
    clearingLines.cols.forEach(c => {
      for (let r = 0; r < GRID_SIZE; r++) clearingCells.add(`${r}-${c}`);
    });
  }

  const renderMiniBlock = (piece, scale = 0.55) => {
    if (!piece) return null;
    const rows = piece.cells.length;
    const cols = piece.cells[0].length;
    const sz = CELL_PX * scale;
    return (
      <div style={{ display: 'inline-grid', gridTemplateRows: `repeat(${rows}, ${sz}px)`, gridTemplateColumns: `repeat(${cols}, ${sz}px)`, gap: '1px' }}>
        {piece.cells.map((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} style={{
              width: sz, height: sz,
              borderRadius: '3px',
              background: cell ? piece.color : 'transparent',
              boxShadow: cell ? `inset 0 -2px 0 rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)` : 'none',
            }} />
          ))
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Score bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: `${CELL_PX * GRID_SIZE + 16}px`, fontWeight: 'bold', fontSize: '14px' }}>
        <div style={{ color: 'var(--pink-dark)' }}>🏆 Điểm: {score}</div>
        <div style={{ color: 'var(--green)' }}>💰 ≈ {Math.floor(score / 50)} xu</div>
      </div>

      {/* Combo indicator */}
      {combo >= 2 && (
        <div style={{
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          color: 'white',
          padding: '4px 16px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '13px',
          animation: 'pulse 0.5s ease-in-out',
          boxShadow: '0 2px 10px rgba(255,107,107,0.5)',
        }}>
          🔥 COMBO x{combo}! (Điểm x{combo})
        </div>
      )}

      {/* Floating combo text */}
      {lastComboText && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#FF6B6B',
          textShadow: '0 2px 10px rgba(255,107,107,0.6)',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'comboFloat 1.2s ease-out forwards',
        }}>
          {lastComboText}
        </div>
      )}

      {/* Grid */}
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_PX}px)`,
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_PX}px)`,
          gap: '2px',
          background: '#2c3e50',
          padding: '8px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 0 30px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`;
            const isHover = hoverPreview.has(key);
            const isClearing = clearingCells.has(key);
            return (
              <div
                key={key}
                style={{
                  width: CELL_PX,
                  height: CELL_PX,
                  borderRadius: '4px',
                  background: isClearing
                    ? '#fff'
                    : cell
                      ? cell
                      : isHover
                        ? (hoverValid ? 'rgba(76, 175, 80, 0.35)' : 'rgba(244, 67, 54, 0.3)')
                        : 'rgba(255,255,255,0.06)',
                  boxShadow: cell
                    ? `inset 0 -3px 0 rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.2)`
                    : 'none',
                  transition: isClearing ? 'all 0.3s ease-out' : 'background 0.1s',
                  transform: isClearing ? 'scale(0)' : 'scale(1)',
                  opacity: isClearing ? 0 : 1,
                }}
              />
            );
          })
        )}

        {/* Overlays */}
        {!isPlaying && !gameOver && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: '20px', boxSizing: 'border-box',
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--pink-dark)', fontSize: '20px' }}>🧱 Block Blast</h3>
            <p style={{ margin: '0 0 6px 0', fontSize: '12px', textAlign: 'center', color: '#555', lineHeight: '1.4' }}>
              Kéo thả các khối hình vào lưới 8×8.<br />
              Lấp đầy hàng ngang hoặc cột dọc để phá hủy và ghi điểm!
            </p>
            <p style={{ margin: '0 0 16px 0', fontSize: '11px', textAlign: 'center', color: '#888' }}>
              ⚡ Combo liên tiếp = điểm nhân gấp bội!
            </p>
            <button onClick={resetGame} style={{
              padding: '10px 24px', backgroundColor: 'var(--pink-primary)', color: 'white',
              border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            }}>Bắt đầu</button>
          </div>
        )}

        {gameOver && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(255,255,255,0.94)',
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            padding: '20px', boxSizing: 'border-box',
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#e74c3c', fontSize: '20px' }}>Kết Thúc! 💥</h3>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '15px' }}>Điểm: {score}</p>
            {combo >= 2 && <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#FF6B6B' }}>Combo cao nhất: x{combo}</p>}
            <p style={{ margin: '0 0 20px 0', color: '#4CAF50', fontWeight: 'bold', fontSize: '15px' }}>Nhận: +{coinsEarned} Xu 💰</p>
            <button onClick={resetGame} style={{
              padding: '10px 24px', backgroundColor: 'var(--pink-primary)', color: 'white',
              border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            }}>Chơi lại</button>
          </div>
        )}
      </div>

      {/* Pieces tray */}
      {isPlaying && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '12px',
          padding: '12px 16px',
          background: 'white',
          borderRadius: '14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '2px solid var(--pink-light)',
          minHeight: '70px',
          alignItems: 'center',
        }}>
          {pieces.map((piece, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => handlePieceMouseDown(e, idx)}
              onTouchStart={(e) => handlePieceTouchStart(e, idx)}
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: piece ? (dragging?.pieceIdx === idx ? 'var(--pink-light)' : '#f8f9fa') : 'transparent',
                cursor: piece ? 'grab' : 'default',
                opacity: piece ? (dragging?.pieceIdx === idx ? 0.5 : 1) : 0.2,
                transition: 'all 0.2s',
                border: piece ? '2px dashed #ddd' : '2px dashed transparent',
                minWidth: '50px',
                minHeight: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {piece ? renderMiniBlock(piece) : (
                <div style={{ fontSize: '20px', color: '#ccc' }}>✓</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scoring info */}
      <div style={{ fontSize: '11px', color: 'var(--text-light)', textAlign: 'center', maxWidth: '300px', lineHeight: '1.5' }}>
        📋 <b>Cách tính điểm:</b> Đặt khối +10đ/ô • Phá hàng/cột +100đ × combo<br />
        💰 <b>Quy đổi xu:</b> Mỗi 50 điểm = 1 xu
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes comboFloat {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
          100% { opacity: 0; transform: translate(-50%, -80%) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default BlockBlastGame;
