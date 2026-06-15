import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        width: '100%',
      }}
    >
      <div 
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(59, 130, 246, 0.1)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem',
        }}
      />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{message}</p>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
