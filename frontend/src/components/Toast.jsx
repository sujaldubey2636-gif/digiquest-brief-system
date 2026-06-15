import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ 
  message, 
  type = 'success', // 'success', 'error', 'info'
  onClose, 
  duration = 4000 
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          icon: AlertTriangle,
        };
      case 'info':
        return {
          backgroundColor: '#4f46e5',
          borderColor: '#4338ca',
          icon: Info,
        };
      case 'success':
      default:
        return {
          backgroundColor: '#10b981',
          borderColor: '#059669',
          icon: CheckCircle,
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: styles.backgroundColor,
        color: '#ffffff',
        padding: '0.875rem 1.25rem',
        borderRadius: '8px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        border: `1px solid ${styles.borderColor}`,
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        maxWidth: '360px',
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          marginLeft: 'auto'
        }}
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
