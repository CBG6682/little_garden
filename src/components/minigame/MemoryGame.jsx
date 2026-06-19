import React, { useState, useEffect, useRef } from 'react';
import './MemoryGame.css';
import { sfxMerge, sfxReward } from '../../utils/audio.js';

const EMOJIS = ['🐹', '🌱', '💧', '☀️', '🌸', '🍓', '🥕', '🍎'];

const generateBoard = () => {
  const deck = [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, idx) => ({ id: idx, emoji, isFlipped: false, isMatched: false }));
  return deck;
};

const MemoryGame = ({ onReward }) => {
  const [board, setBoard] = useState(generateBoard());
  const [flippedCards, setFlippedCards] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matches, setMatches] = useState(0);
  const matchesRef = useRef(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setBoard(generateBoard());
    setFlippedCards([]);
    setTimeLeft(60);
    setMatches(0);
    matchesRef.current = 0;
    setIsPlaying(true);
    setGameOver(false);
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    const finalMatches = matchesRef.current;
    // Balanced high-grind reward: matches * 2 + perfect bonus of 10 coins
    const coinsEarned = finalMatches * 2 + (finalMatches === 8 ? 10 : 0);
    onReward(coinsEarned);
    sfxReward();
  };

  const handleCardClick = (id) => {
    if (!isPlaying || flippedCards.length === 2 || board.find(c => c.id === id).isFlipped) return;

    const newBoard = board.map(card => card.id === id ? { ...card, isFlipped: true } : card);
    setBoard(newBoard);
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newBoard.find(c => c.id === first).emoji === newBoard.find(c => c.id === second).emoji) {
        setTimeout(() => {
          setBoard(prev => prev.map(card => 
            (card.id === first || card.id === second) ? { ...card, isMatched: true } : card
          ));
          setFlippedCards([]);
          sfxMerge();
          setMatches(prev => {
            const newMatches = prev + 1;
            matchesRef.current = newMatches;
            if (newMatches === 8) endGame();
            return newMatches;
          });
        }, 500);
      } else {
        setTimeout(() => {
          setBoard(prev => prev.map(card => 
            (card.id === first || card.id === second) ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="memory-game">
      <div className="game-header">
        <div className="timer">⏳ {timeLeft}s</div>
        <div className="matches">Cặp khớp: {matches}/8</div>
      </div>

      {!isPlaying && !gameOver && (
        <div className="start-screen">
          <h3>Trận Chiến Trí Nhớ 🧠</h3>
          <p>Tìm tất cả các cặp giống nhau trước khi hết thời gian!</p>
          <button onClick={startGame} className="start-btn">
            Chơi Ngay (Miễn phí)
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="card-grid">
          {board.map(card => (
            <div 
              key={card.id} 
              className={`card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="card-inner">
                <div className="card-front">❓</div>
                <div className="card-back">{card.emoji}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {gameOver && (
        <div className="game-over">
          <h3>{matches === 8 ? "Bạn Đã Thắng! 🎉" : "Hết Giờ! ⏱️"}</h3>
          <p>Bạn nhận được {matches * 2 + (matches === 8 ? 10 : 0)} xu!</p>
          <button onClick={() => setGameOver(false)} className="close-btn">Đóng</button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
