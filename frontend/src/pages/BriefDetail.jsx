import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Clock, 
  Download, 
  Edit, 
  FileCheck, 
  FileText, 
  History, 
  Play, 
  Trash2, 
  User, 
  Users, 
  AlertTriangle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function BriefDetail({ currentPage, setCurrentPage, briefId, setSelectedBriefId }) {
  const [loading, setLoading] = useState(true);
  const [brief, setBrief] = useState(null);
  const [client, setClient] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Status Override Warning Dialog
  const [newStatusPending, setNewStatusPending] = useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const fetchBriefDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await api.briefs.getDetail(briefId);
      setBrief(res.data?.brief);
      setClient(res.data?.client);
      setAuditLogs(res.data?.auditLogs || []);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve brief details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (briefId) {
      fetchBriefDetails();
    }
  }, [briefId]);

  const handleEditClick = () => {
    setSelectedBriefId(briefId);
    setCurrentPage('new_brief');
  };

  const handleStatusChangeRequest = (e) => {
    const nextStatus = e.target.value;
    if (!nextStatus) return;

    // Check pre-production validation gate
    // Rule 4: Cannot move to 'approved' unless completeness >= 80%
    if (nextStatus === 'approved' && brief.completeness_score < 80) {
      setToast({ 
        message: `Validation Gate Blocked: Cannot approve a brief with completeness score below 80% (Current: ${brief.completeness_score}%).`, 
        type: 'error' 
      });
      // reset dropdown selection
      e.target.value = brief.status;
      return;
    }

    // Rule 4: Cannot move to 'in_production' unless status is 'approved'
    if (nextStatus === 'in_production' && brief.status !== 'approved') {
      setToast({ 
        message: "Validation Gate Blocked: Project briefs must be 'Approved' before transitioning to 'In Production'.", 
        type: 'error' 
      });
      e.target.value = brief.status;
      return;
    }

    setNewStatusPending(nextStatus);
    setShowStatusConfirm(true);
  };

  const executeStatusChange = async () => {
    setShowStatusConfirm(false);
    setStatusUpdateLoading(true);
    try {
      await api.briefs.updateStatus(briefId, newStatusPending);
      setToast({ message: `Status updated to ${newStatusPending.replace('_', ' ')}!`, type: 'success' });
      fetchBriefDetails(); // Refresh
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Status transition failed', type: 'error' });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Opening project brief ledger..." />;
  }

  if (error || !brief) {
    return (
      <div className="card text-center" style={{ padding: '3rem 2rem' }}>
        <p className="text-danger" style={{ marginBottom: '1.5rem' }}>{error || 'Brief details not found.'}</p>
        <button onClick={() => setCurrentPage('briefs')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>
    );
  }

  // Parse approval contacts
  let parsedContacts = [];
  if (brief.approval_contacts) {
    try {
      parsedContacts = typeof brief.approval_contacts === 'string'
        ? JSON.parse(brief.approval_contacts)
        : brief.approval_contacts;
    } catch (e) {
      console.error(e);
    }
  }

  // Parse references file paths
  let parsedReferencesFiles = [];
  if (brief.references_file_paths) {
    try {
      parsedReferencesFiles = typeof brief.references_file_paths === 'string'
        ? JSON.parse(brief.references_file_paths)
        : brief.references_file_paths;
    } catch (e) {
      console.error(e);
    }
  }

  // Format budget range text
  const formatBudget = (range) => {
    switch (range) {
      case 'under_1l': return 'Under ₹1 Lakh';
      case '1l_5l': return '₹1 Lakh - ₹5 Lakhs';
      case '5l_15l': return '₹5 Lakhs - ₹15 Lakhs';
      case '15l_50l': return '₹15 Lakhs - ₹50 Lakhs';
      case 'above_50l': return 'Above ₹50 Lakhs';
      default: return 'Not specified';
    }
  };

  const getFileDownloadUrl = (path) => {
    if (!path) return '#';
    // The backend serves uploads statically on /uploads
    return `http://localhost:3001/${path}`;
  };

  const getFileName = (path) => {
    if (!path) return '';
    return path.split(/[/\\]/).pop();
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header / Actions */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => { setSelectedBriefId(null); setCurrentPage('briefs'); }}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Brief #{brief.id}
              </span>
              <StatusBadge status={brief.status} />
              <span className={`priority-badge priority-${brief.priority}`}>{brief.priority}</span>
            </div>
            <h1 style={{ fontSize: '1.75rem' }}>{brief.project_title}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Status:</span>
            <select 
              value={brief.status} 
              onChange={handleStatusChangeRequest}
              disabled={statusUpdateLoading}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="in_production">In Production</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <button onClick={handleEditClick} className="btn btn-secondary">
            <Edit size={16} />
            Edit Brief
          </button>
        </div>
      </div>

      {/* Main Grid: Details (Left) + Sidebar (Right) */}
      <div className="grid-sidebar-layout">
        
        {/* Left Side: Brief Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: Deliverables Detail */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Creative Specifications
            </h3>

            {/* Script */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} className="text-info" />
                Script Details
              </h4>
              {brief.script_text ? (
                <div 
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.2)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary)',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}
                >
                  {brief.script_text}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No script text pasted.</p>
              )}

              {brief.script_file_path && (
                <div style={{ marginTop: '0.75rem' }}>
                  <a 
                    href={getFileDownloadUrl(brief.script_file_path)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <Download size={14} />
                    Download Script File ({getFileName(brief.script_file_path)})
                  </a>
                </div>
              )}
            </div>

            {/* References */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={16} className="text-info" />
                Visual References
              </h4>
              {brief.references_text ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {brief.references_text}
                </p>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No reference description provided.</p>
              )}

              {parsedReferencesFiles.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {parsedReferencesFiles.map((path, idx) => (
                    <a 
                      key={idx}
                      href={getFileDownloadUrl(path)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '0.35rem' }}
                    >
                      <Download size={14} />
                      Ref Asset {idx + 1} ({getFileName(path).substring(0, 15)}...)
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Guidelines */}
            <div>
              <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={16} className="text-info" />
                Brand Guidelines
              </h4>
              {brief.brand_guidelines_text ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {brief.brand_guidelines_text}
                </p>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No brand guideline comments.</p>
              )}

              {brief.brand_guidelines_file_path && (
                <div style={{ marginTop: '0.75rem' }}>
                  <a 
                    href={getFileDownloadUrl(brief.brand_guidelines_file_path)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <Download size={14} />
                    Download Guidelines ({getFileName(brief.brand_guidelines_file_path)})
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* Card 2: Approval contacts & Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} className="text-info" />
              Workflow Approval Contacts
            </h3>

            {parsedContacts.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No approval contacts assigned to this brief.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {parsedContacts.map((contact, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '1rem', 
                      backgroundColor: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.875rem' }}>{contact.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>{contact.role}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>✉ {contact.email}</span>
                    {contact.phone && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {contact.phone}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Audit Trails & Ledger */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} className="text-info" />
              Brief Activity Logs & Audit Trail
            </h3>

            {auditLogs.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No ledger history recorded.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {auditLogs.map((log) => (
                  <div 
                    key={log.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ marginTop: '2px', color: 'var(--primary)' }}>
                      <Clock size={14} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <p style={{ color: '#ffffff', fontWeight: 500 }}>
                        Action: <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{log.action.replace('_', ' ')}</span>
                      </p>
                      {log.field_changed && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                          Changed <code style={{ fontSize: '11px', padding: '1px 4px' }}>{log.field_changed}</code> from <span style={{ textDecoration: 'line-through' }}>{log.old_value || 'null'}</span> to <strong>{log.new_value}</strong>
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.35rem' }}>
                        <span>Actor: {log.performed_by}</span>
                        <span>•</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Completeness score & Client Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Score Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Brief Quality</h3>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: brief.completeness_score >= 80 ? 'var(--success)' : brief.completeness_score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                {brief.completeness_score}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>/100</span>
            </div>

            <div className="progress-container" style={{ height: '10px', marginBottom: '1.25rem' }}>
              <div 
                className="progress-bar"
                style={{ 
                  width: `${brief.completeness_score}%`,
                  backgroundColor: brief.completeness_score >= 80 ? 'var(--success)' : 
                                   brief.completeness_score >= 50 ? 'var(--warning)' : 'var(--danger)'
                }}
              />
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {brief.completeness_score >= 80 ? (
                <p>This brief meets the 80% completeness kickoff gate and is fully approved for production scheduling.</p>
              ) : (
                <p>This brief is in Draft/Incomplete state. Client kickoff reviews require a minimum completeness score of 80%.</p>
              )}
            </div>
          </div>

          {/* Client Info Card */}
          {client && (
            <div className="card">
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} className="text-info" />
                Client Profile
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Company</span>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{client.company_name}</span>
                </div>
                
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Primary Contact</span>
                  <span style={{ color: 'var(--text-primary)' }}>{client.contact_person}</span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Email</span>
                  <span style={{ color: 'var(--primary)' }}>{client.email}</span>
                </div>

                {client.phone && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Phone</span>
                    <span>{client.phone}</span>
                  </div>
                )}

                {client.industry && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Industry</span>
                    <span style={{ textTransform: 'capitalize' }}>{client.industry}</span>
                  </div>
                )}

                {client.address && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Address</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Spec Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Technical Spec</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Delivery Format</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#ffffff' }}>
                  {brief.delivery_format.replace('_', ' ')}
                </span>
              </div>

              {customDeliverySpec && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Custom specifications</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{customDeliverySpec}</span>
                </div>
              )}

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Production Kickoff Target</span>
                <span>{brief.deadline ? new Date(brief.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Budget Tier</span>
                <span>{formatBudget(brief.budget_range)}</span>
              </div>

              {brief.special_requirements && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Special Logistics</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{brief.special_requirements}</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Status Transition Override Confirm dialog */}
      <ConfirmDialog 
        isOpen={showStatusConfirm}
        title="Confirm Status Transition?"
        message={`Are you sure you want to change the project brief status to ${newStatusPending?.replace('_', ' ').toUpperCase()}? This will update the audit log and trigger workflow alerts.`}
        confirmText="Confirm Change"
        cancelText="Cancel"
        onConfirm={executeStatusChange}
        onCancel={() => setShowStatusConfirm(false)}
      />

      {/* Feedback Toast */}
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
