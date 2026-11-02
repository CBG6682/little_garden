import React from 'react';
import './Toast.css';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const typeClass = toast.type || 'info'; // 'success', 'warning', 'error', 'info', 'coins'
        const icon =
          toast.icon ||
          (typeClass === 'success' ? '✨' :
           typeClass === 'warning' ? '⚠️' :
           typeClass === 'error' ? '❌' :
           typeClass === 'coins' ? '💰' : '💡');

        return (
          <div
            key={toast.id}
            className={`toast-item toast-${typeClass}`}
            onClick={() => onDismiss && onDismiss(toast.id)}
          >
            <span className="toast-icon">{icon}</span>
            <span className="toast-message">{toast.message}</span>
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss && onDismiss(toast.id);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
