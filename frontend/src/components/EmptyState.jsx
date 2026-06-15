import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  title = 'No records found', 
  message = 'Try adjusting your filters or search query.', 
  actionLabel, 
  onAction 
}) {
  return (
    <div 
      className="card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: 'rgba(17, 24, 39, 0.4)',
        borderStyle: 'dashed',
      }}
    >
      <div 
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)',
        }}
      >
        <Inbox size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>{message}</p>
      
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
