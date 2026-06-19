import React, { useState, useEffect, useRef } from 'react';
import './Game2048.css';
import { sfxMerge, sfxReward } from '../../utils/audio.js';

const Game2048 = ({ onReward }) => {
  const [board, setBoard] = useState(getEmptyBoard());
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [gameOver, setGameOver] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  function getEmptyBoard() {
    return [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
  }

  const addRandomTile = (currentBoard) => {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    let { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const startGame = () => {
    let newBoard = getEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setCoinsEarned(0);
  };

  useEffect(() => {
    startGame();
    // eslint-disable-next-line
  }, []);

  const moveLeft = (board) => {
    let newBoard = [];
    let addedScore = 0;
    for (let r = 0; r < 4; r++) {
      let row = board[r].filter(val => val !== 0);
      for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i+1]) {
          row[i] *= 2;
          addedScore += row[i];
          row.splice(i + 1, 1);
        }
      }
      while (row.length < 4) row.push(0);
      newBoard.push(row);
    }
    return { newBoard, addedScore };
  };

  const moveRight = (board) => {
    let newBoard = [];
    let addedScore = 0;
    for (let r = 0; r < 4; r++) {
      let row = board[r].filter(val => val !== 0);
      for (let i = row.length - 1; i > 0; i--) {
        if (row[i] === row[i-1]) {
          row[i] *= 2;
          addedScore += row[i];
          row.splice(i - 1, 1);
          i--;
        }
      }
      let newRow = Array(4 - row.length).fill(0).concat(row);
      newBoard.push(newRow);
    }
    return { newBoard, addedScore };
  };

  const transpose = (matrix) => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };

  const moveUp = (board) => {
    let transposed = transpose(board);
    let { newBoard, addedScore } = moveLeft(transposed);
    return { newBoard: transpose(newBoard), addedScore };
  };

  const moveDown = (board) => {
    let transposed = transpose(board);
    let { newBoard, addedScore } = moveRight(transposed);
    return { newBoard: transpose(newBoard), addedScore };
  };

  const checkGameOver = (board) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return false;
        if (c < 3 && board[r][c] === board[r][c+1]) return false;
        if (r < 3 && board[r][c] === board[r+1][c]) return false;
      }
    }
    return true;
  };

  const handleMove = (direction) => {
    if (gameOver) return;
    
    let result;
    if (direction === 'UP') result = moveUp(board);
    else if (direction === 'DOWN') result = moveDown(board);
    else if (direction === 'LEFT') result = moveLeft(board);
    else if (direction === 'RIGHT') result = moveRight(board);

    if (JSON.stringify(board) !== JSON.stringify(result.newBoard)) {
      let nextBoard = addRandomTile(result.newBoard);
      setBoard(nextBoard);
      if (result.addedScore > 0) sfxMerge();
      setScore(s => {
        const newScore = s + result.addedScore;
        scoreRef.current = newScore;
        return newScore;
      });
      if (checkGameOver(nextBoard)) {
        handleGameOver();
      }
    }
  };

  const handleGameOver = () => {
    setGameOver(true);
    const reward = Math.floor(scoreRef.current / 100);
    setCoinsEarned(reward);
    if (reward > 0) {
      onReward(reward);
      sfxReward();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') handleMove('UP');
      if (e.key === 'ArrowDown') handleMove('DOWN');
      if (e.key === 'ArrowLeft') handleMove('LEFT');
      if (e.key === 'ArrowRight') handleMove('RIGHT');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const claimReward = () => {
    startGame();
  };

  const getTileColor = (val) => {
    const colors = {
      0: '#cdc1b4', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179',
      16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72',
      256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e'
    };
    return colors[val] || '#3c3a32';
  };

  return (
    <div className="game2048-container">
      <div className="header-2048">
        <div className="score-box">
          <span>Điểm</span>
          <strong>{score}</strong>
        </div>
        <button className="restart-btn" onClick={startGame}>Chơi lại</button>
      </div>

      <div className="board-2048">
        {board.map((row, rIdx) => (
          row.map((val, cIdx) => (
            <div 
              key={`${rIdx}-${cIdx}`} 
              className={`tile-2048 ${val !== 0 ? 'active' : ''}`}
              style={{ 
                backgroundColor: getTileColor(val),
                color: val <= 4 ? '#776e65' : '#f9f6f2',
                fontSize: val > 1000 ? '24px' : '32px'
              }}
            >
              {val !== 0 ? val : ''}
            </div>
          ))
        ))}
      </div>

      <div className="controls-2048">
        <div className="control-row">
          <button onClick={() => handleMove('UP')}>⬆️</button>
        </div>
        <div className="control-row">
          <button onClick={() => handleMove('LEFT')}>⬅️</button>
          <button onClick={() => handleMove('DOWN')}>⬇️</button>
          <button onClick={() => handleMove('RIGHT')}>➡️</button>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <h3>Trò chơi kết thúc!</h3>
          <p>Điểm của bạn: {score}</p>
          <p>Nhận được: {coinsEarned} 💰</p>
          <button onClick={claimReward}>Chơi lại</button>
        </div>
      )}
    </div>
  );
};

export default Game2048;
