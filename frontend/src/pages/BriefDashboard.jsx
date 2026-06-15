import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Layers,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';

export default function BriefDashboard({ setCurrentPage, setSelectedBriefId }) {
  const [loading, setLoading] = useState(true);
  const [briefs, setBriefs] = useState([]);
  const [error, setError] = useState('');
  
  // Search & Filters State
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  
  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const statusTabs = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Drafts' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'under_review', label: 'In Review' },
    { id: 'approved', label: 'Approved' },
    { id: 'in_production', label: 'In Prod.' },
    { id: 'completed', label: 'Completed' },
  ];

  const projectTypes = [
    { value: 'film', label: 'Feature Film' },
    { value: 'web_series', label: 'Web Series' },
    { value: 'advertisement', label: 'TVC/Advertisement' },
    { value: 'corporate', label: 'Corporate Video' },
    { value: 'animation', label: 'Animation' },
    { value: 'vfx', label: 'VFX Project' },
    { value: 'dubbing', label: 'Dubbing/Localization' },
  ];

  const fetchBriefs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        page,
        limit,
        sort,
        order,
        search,
        status: selectedStatus === 'all' ? '' : selectedStatus,
        project_type: selectedType,
        priority: selectedPriority
      };
      
      const res = await api.briefs.list(filters);
      setBriefs(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalRecords(res.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch briefs. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefs();
  }, [page, selectedStatus, selectedType, selectedPriority, sort, order]);

  // Debounced/Submit search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBriefs();
  };

  const handleSort = (field) => {
    const isAsc = sort === field && order === 'asc';
    setSort(field);
    setOrder(isAsc ? 'desc' : 'asc');
  };

  const handleView = (id) => {
    setSelectedBriefId(id);
    setCurrentPage('detail');
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    setSelectedBriefId(id);
    setCurrentPage('new_brief'); // Form page handles editing if selectedBriefId is set
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Production Briefs</h1>
          <p>View, filter, and manage all pre-production brief submissions.</p>
        </div>
        <button onClick={() => { setSelectedBriefId(null); setCurrentPage('new_brief'); }} className="btn btn-primary">
          <Plus size={18} />
          Create New Brief
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <input 
              type="text" 
              className="form-control"
              placeholder="Search by title, client, script content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Project Type */}
          <div style={{ minWidth: '160px' }}>
            <select 
              className="form-control"
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              {projectTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div style={{ minWidth: '140px' }}>
            <select 
              className="form-control"
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setPage(1); }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-secondary">Search</button>
            <button 
              type="button" 
              onClick={() => {
                setSearch('');
                setSelectedStatus('all');
                setSelectedType('');
                setSelectedPriority('');
                setPage(1);
                setSort('created_at');
                setOrder('desc');
              }} 
              className="btn btn-secondary"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Status Navigation Tabs */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)', 
          marginBottom: '1.5rem', 
          overflowX: 'auto',
          gap: '1.5rem',
          paddingBottom: '2px'
        }}
      >
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setSelectedStatus(tab.id); setPage(1); }}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.75rem 0.25rem',
              fontSize: '0.875rem',
              color: selectedStatus === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: selectedStatus === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: selectedStatus === tab.id ? 600 : 400,
              whiteSpace: 'nowrap',
              transition: 'var(--transition-all)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Briefs Data Table Container */}
      {loading ? (
        <LoadingSpinner message="Fetching brief repository..." />
      ) : error ? (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <p className="text-danger" style={{ marginBottom: '1rem' }}>{error}</p>
          <button onClick={fetchBriefs} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} style={{ marginRight: '0.25rem' }} /> Retry
          </button>
        </div>
      ) : briefs.length === 0 ? (
        <EmptyState 
          title="No briefs matching criteria" 
          message="We couldn't find any pre-production briefs. Create a new one or modify your filter settings."
          actionLabel="Create Brief"
          onAction={() => { setSelectedBriefId(null); setCurrentPage('new_brief'); }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Table Card */}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <th 
                    onClick={() => handleSort('project_title')}
                    style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Project Title <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th 
                    onClick={() => handleSort('company_name')}
                    style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Client <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Type</th>
                  <th 
                    onClick={() => handleSort('priority')}
                    style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Priority <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th 
                    onClick={() => handleSort('completeness_score')}
                    style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Score <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Status <ArrowUpDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
                  </th>
                  <th style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {briefs.map((brief) => (
                  <tr 
                    key={brief.id} 
                    onClick={() => handleView(brief.id)}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Project Title */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>{brief.project_title}</span>
                    </td>
                    
                    {/* Client Name */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{brief.company_name}</span>
                    </td>
                    
                    {/* Project Type */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span 
                        style={{ 
                          fontSize: '0.8125rem', 
                          padding: '0.15rem 0.4rem', 
                          borderRadius: '4px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          textTransform: 'capitalize',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {brief.project_type.replace('_', ' ')}
                      </span>
                    </td>
                    
                    {/* Priority */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`priority-badge priority-${brief.priority}`}>
                        {brief.priority}
                      </span>
                    </td>
                    
                    {/* Completeness score */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, width: '32px' }}>{brief.completeness_score}%</span>
                        <div className="progress-container" style={{ width: '60px' }}>
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
                    </td>
                    
                    {/* Status */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <StatusBadge status={brief.status} />
                    </td>
                    
                    {/* Actions */}
                    <td 
                      style={{ padding: '1rem 1.5rem', textAlign: 'right' }}
                      onClick={(e) => e.stopPropagation()} // Stop row click trigger
                    >
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleView(brief.id)} 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleEdit(brief.id, e)} 
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Brief"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex-between" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Showing {briefs.length} of {totalRecords} briefs
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
