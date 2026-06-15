import React, { useState, useEffect } from 'react';
import { api } from './utils/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BriefEntryForm from './pages/BriefEntryForm';
import BriefDashboard from './pages/BriefDashboard';
import BriefDetail from './pages/BriefDetail';
import Reports from './pages/Reports';
import Toast from './components/Toast';
import { X, AlertCircle, Calendar } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBriefId, setSelectedBriefId] = useState(null);
  
  // Real-time alert counts
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Fetch real-time alert count
  const fetchUnreadAlerts = async () => {
    try {
      const res = await api.dashboard.getAlerts();
      const unread = res.data || [];
      setAlerts(unread);
      setUnreadAlertsCount(unread.length);
    } catch (err) {
      console.error('Failed to sync alerts', err);
    }
  };

  useEffect(() => {
    fetchUnreadAlerts();
    
    // Sync alerts every 30 seconds
    const interval = setInterval(fetchUnreadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.dashboard.markAlertRead(id);
      setAlerts(alerts.filter(a => a.id !== id));
      setUnreadAlertsCount(prev => Math.max(prev - 1, 0));
      setToast({ message: 'Notification dismissed', type: 'success' });
    } catch (err) {
      console.error('Failed to dismiss alert', err);
    }
  };

  const handleAlertClick = (briefId, alertId) => {
    setSelectedBriefId(briefId);
    setCurrentPage('detail');
    setShowNotificationsPanel(false);
    // Auto mark read on click
    handleMarkRead(alertId);
  };

  // Page Routing Switch
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setSelectedBriefId={setSelectedBriefId} 
          />
        );
      case 'new_brief':
        return (
          <BriefEntryForm 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage} 
            selectedBriefId={selectedBriefId} 
            setSelectedBriefId={setSelectedBriefId}
          />
        );
      case 'briefs':
        return (
          <BriefDashboard 
            setCurrentPage={setCurrentPage} 
            setSelectedBriefId={setSelectedBriefId} 
          />
        );
      case 'detail':
        return (
          <BriefDetail 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage} 
            briefId={selectedBriefId} 
            setSelectedBriefId={setSelectedBriefId} 
          />
        );
      case 'reports':
        return <Reports />;
      default:
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setSelectedBriefId={setSelectedBriefId} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar 
        unreadAlertsCount={unreadAlertsCount} 
        onNotificationsClick={() => setShowNotificationsPanel(!showNotificationsPanel)} 
      />

      {/* Navigation Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={(pageName) => {
          // Reset brief edit state when clicking sidebar tabs
          if (pageName !== 'new_brief') {
            setSelectedBriefId(null);
          }
          setCurrentPage(pageName);
        }} 
      />

      {/* Main Content Pane */}
      <main className="main-content">
        <div className="page-container">
          {renderPage()}
        </div>
      </main>

      {/* Slide-out Notification Drawer panel */}
      {showNotificationsPanel && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '360px',
            backgroundColor: '#0b0f1d',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Drawer Header */}
          <div 
            style={{ 
              padding: '1.25rem', 
              borderBottom: '1px solid var(--border-color)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} className="text-warning" />
              Notifications ({unreadAlertsCount})
            </h3>
            <button 
              onClick={() => setShowNotificationsPanel(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              className="btn-secondary"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body list */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#ffffff', marginBottom: '0.25rem' }}>All Caught Up!</p>
                <p style={{ fontSize: '0.75rem' }}>You have no pending system alerts.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    onClick={() => handleAlertClick(alert.brief_id, alert.id)}
                    className="alert-item unread"
                    style={{ cursor: 'pointer', margin: 0 }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 500, lineHeight: '1.4' }}>
                        {alert.message}
                      </p>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
                        <Calendar size={12} />
                        {new Date(alert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(alert.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      className="btn-secondary"
                      title="Dismiss notification"
                    >
                      <X size={14} className="text-danger" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <style>{`
            @keyframes slideLeft {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </div>
      )}

      {/* Global feedbacks toasts */}
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />
      )}
    </div>
  );
}
