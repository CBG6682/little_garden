import React, { useState, useEffect } from 'react';
import './RenameModal.css';
import { sfxClick, sfxReward } from '../../utils/audio.js';

export default function RenameModal({
  isOpen,
  onClose,
  targetType = 'bou', // 'bou', 'blueFish', 'redFish'
  currentName = '',
  onSaveName
}) {
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNameInput(currentName || '');
      setErrorMsg('');
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const getTargetMeta = () => {
    switch (targetType) {
      case 'blueFish':
        return {
          title: 'Đổi Tên Cá Chọi Xanh',
          icon: '🔵',
          defaultName: 'Cá Chọi Xanh (Thanh Long)',
          suggestions: ['Thanh Long', 'Sapphire', 'Bão Biển', 'Poseidon', 'Lam Ngọc', 'Tsunami', 'Gió Lạnh']
        };
      case 'redFish':
        return {
          title: 'Đổi Tên Cá Chọi Đỏ',
          icon: '🔴',
          defaultName: 'Cá Chọi Đỏ (Hồng Long)',
          suggestions: ['Hồng Long', 'Hỏa Diệm', 'Ruby', 'Phượng Hoàng', 'Bình Minh', 'Xích Long', 'Huyết Nguyệt']
        };
      case 'bou':
      default:
        return {
          title: 'Đổi Tên Bọ Ú',
          icon: '🐹',
          defaultName: 'Bọ Ú',
          suggestions: ['Bé Bự', 'Mochi', 'Bông Gòn', 'Đậu Phộng', 'Bắp Rang', 'Hạt Dẻ', 'Củ Cải']
        };
    }
  };

  const meta = getTargetMeta();

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập tên cho bé!');
      return;
    }
    if (trimmed.length > 25) {
      setErrorMsg('Tên không được vượt quá 25 ký tự.');
      return;
    }

    sfxReward();
    onSaveName(trimmed, targetType);
    onClose();
  };

  const handleSuggestionClick = (sug) => {
    sfxClick();
    setNameInput(sug);
    setErrorMsg('');
  };

  return (
    <div className="rename-overlay" onClick={onClose}>
      <div className="rename-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rename-header">
          <div className="rename-title-icon">{meta.icon}</div>
          <div className="rename-header-text">
            <h3>{meta.title}</h3>
            <p>Đặt biệt danh dễ thương cho bé yêu của bạn</p>
          </div>
          <button className="rename-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSave} className="rename-form">
          <div className="rename-input-wrap">
            <label htmlFor="rename-input">Tên mới:</label>
            <input
              id="rename-input"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={`VD: ${meta.suggestions[0]}`}
              maxLength={25}
              autoFocus
            />
            <span className="char-count">{nameInput.length}/25</span>
          </div>

          {errorMsg && <div className="rename-error">{errorMsg}</div>}

          <div className="rename-suggestions">
            <span className="sug-label">Gợi ý tên hay:</span>
            <div className="sug-tags">
              {meta.suggestions.map((sug, idx) => (
                <button
                  type="button"
                  key={idx}
                  className="sug-tag"
                  onClick={() => handleSuggestionClick(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="rename-actions">
            <button type="button" className="rename-cancel-btn" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="rename-save-btn">
              💾 Lưu Tên Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
