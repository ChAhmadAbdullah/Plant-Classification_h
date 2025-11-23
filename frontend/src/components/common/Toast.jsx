import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const icon = {
    success: 'bi-check-circle',
    error: 'bi-x-circle',
    warning: 'bi-exclamation-triangle',
    info: 'bi-info-circle'
  };

  return (
    <div className={`${bgColor[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`}>
      <i className={`bi ${icon[type]} text-xl`}></i>
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="hover:opacity-80">
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
};

export default Toast;

