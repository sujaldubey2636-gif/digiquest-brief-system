import React from 'react';
import { Bell, Film, Sparkles } from 'lucide-react';

export default function Navbar({ unreadAlertsCount, onNotificationsClick }) {
  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-navbar)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 50,
      }}
    >
      {/* Logo Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div 
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        >
          <Film size={20} color="#ffffff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            DigiQuest <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Studio</span>
            <Sparkles size={14} className="text-warning" style={{ animation: 'pulse 1.5s infinite' }} />
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pre-Production Briefs</p>
        </div>
      </div>

      {/* User / Actions Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Notification Bell */}
        <button 
          onClick={onNotificationsClick}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            color: 'var(--text-primary)',
            transition: 'var(--transition-all)',
          }}
          className="btn-secondary"
        >
          <Bell size={18} />
          {unreadAlertsCount > 0 && (
            <span 
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--danger)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                minWidth: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid var(--bg-navbar)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              color: 'var(--primary)',
              fontSize: '0.875rem'
            }}
          >
            SD
          </div>
          <div style={{ display: 'none', flexDirection: 'column' }} className="d-lg-flex">
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#ffffff' }}>Sujal Dubey</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Studio Staff</span>
          </div>
        </div>
      </div>
    </header>
  );
}
