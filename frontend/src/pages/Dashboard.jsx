import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  Percent, 
  ChevronRight, 
  Plus, 
  Trash2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({ setCurrentPage, setSelectedBriefId }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentBriefs, setRecentBriefs] = useState([]);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const summaryData = await api.dashboard.getSummary();
      setSummary(summaryData.data);
      
      const alertsData = await api.dashboard.getAlerts();
      setAlerts(alertsData.data || []);
      
      const briefsData = await api.briefs.list({ limit: 5, sort: 'created_at', order: 'desc' });
      setRecentBriefs(briefsData.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.dashboard.markAlertRead(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to mark alert as read', err);
    }
  };

  const handleViewBrief = (id) => {
    setSelectedBriefId(id);
    setCurrentPage('detail');
  };

  if (loading) {
    return <LoadingSpinner message="Assembling your studio workspace..." />;
  }

  if (error) {
    return (
      <div className="card text-center" style={{ padding: '3rem 2rem', margin: '2rem 0' }}>
        <AlertCircle size={48} className="text-danger" style={{ marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Connection Failed</h3>
        <p style={{ marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={loadDashboardData} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  // Calculate default values if no data
  const total = summary?.total_briefs || 0;
  const pending = summary?.pending_review || 0;
  const urgent = summary?.approaching_deadline || 0;
  const avgCompleteness = Math.round(summary?.avg_completeness || 0);

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Studio Dashboard</h1>
          <p>Real-time pre-production briefs overview for DigiQuest Studio.</p>
        </div>
        <button onClick={() => setCurrentPage('new_brief')} className="btn btn-primary">
          <Plus size={18} />
          Create New Brief
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {/* Total Briefs */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            border: '1px solid rgba(59, 130, 246, 0.2)',
            padding: '0.875rem', 
            borderRadius: '12px',
            color: 'var(--primary)'
          }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Total Briefs</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: '1.2' }}>{total}</h2>
          </div>
        </div>

        {/* Pending Review */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '0.875rem', 
            borderRadius: '12px',
            color: 'var(--warning)'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Pending Review</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: '1.2' }}>{pending}</h2>
          </div>
        </div>

        {/* Approaching Deadline */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.875rem', 
            borderRadius: '12px',
            color: 'var(--danger)'
          }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Approaching Deadline</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: '1.2' }}>{urgent}</h2>
          </div>
        </div>

        {/* Average Completeness */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '0.875rem', 
            borderRadius: '12px',
            color: 'var(--success)'
          }}>
            <Percent size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Avg Completeness</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: '1.2' }}>{avgCompleteness}%</h2>
          </div>
        </div>
      </div>

      {/* Main Grid: Alerts + Recent Briefs */}
      <div className="grid-sidebar-layout">
        {/* Left Side: Recent Briefs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ height: '100%' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} className="text-info" />
                Recent Brief Submissions
              </h3>
              <button 
                onClick={() => setCurrentPage('briefs')} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                View all briefs
                <ArrowRight size={14} />
              </button>
            </div>

            {recentBriefs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No briefs submitted yet. Click "Create New Brief" to start.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentBriefs.map(brief => (
                  <div 
                    key={brief.id}
                    onClick={() => handleViewBrief(brief.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'var(--transition-all)',
                    }}
                    className="card"
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden', paddingRight: '1rem' }}>
                      <h4 style={{ fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {brief.project_title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 500 }}>{brief.company_name}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{brief.project_type.replace('_', ' ')}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                      {/* Completeness bar */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '80px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Completeness</span>
                          <span style={{ fontWeight: 600 }}>{brief.completeness_score}%</span>
                        </div>
                        <div className="progress-container">
                          <div 
                            className="progress-bar"
                            style={{ 
                              width: `${brief.completeness_score}%`,
                              backgroundColor: brief.completeness_score >= 80 ? 'var(--success)' : 
                                               brief.completeness_score >= 50 ? 'var(--warning)' : 'var(--danger)'
                            }}
                          />
                        </div>
                      </div>
                      
                      <StatusBadge status={brief.status} />
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Alerts Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ height: '100%' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} className="text-warning" />
              Alert Notifications
            </h3>

            {alerts.length === 0 ? (
              <div 
                style={{ 
                  textAlign: 'center', 
                  padding: '4rem 1rem', 
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle size={20} />
                </div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#ffffff' }}>All clear!</p>
                <p style={{ fontSize: '0.75rem' }}>No pending alerts or workflow delays.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                {alerts.map(alert => (
                  <div 
                    key={alert.id}
                    onClick={() => handleViewBrief(alert.brief_id)}
                    className="alert-item unread"
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
                      <p style={{ fontSize: '0.8125rem', color: '#ffffff', fontWeight: 500, paddingRight: '1.5rem' }}>
                        {alert.message}
                      </p>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} />
                        {new Date(alert.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => handleMarkRead(alert.id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: '4px',
                      }}
                      className="btn-secondary"
                      title="Dismiss alert"
                    >
                      <Trash2 size={14} className="text-danger" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
