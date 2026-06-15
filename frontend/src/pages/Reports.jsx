import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Award, 
  Users, 
  FileText, 
  Clock,
  PieChart
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

// Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [byTypeData, setByTypeData] = useState([]);
  const [byClientData, setByClientData] = useState([]);
  const [completenessData, setCompletenessData] = useState([]);
  const [error, setError] = useState('');

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const [summary, byType, byClient, completeness] = await Promise.all([
        api.reports.getSummary(),
        api.reports.getByType(),
        api.reports.getByClient(),
        api.reports.getCompleteness()
      ]);

      setSummaryData(summary.data);
      setByTypeData(byType.data || []);
      setByClientData(byClient.data || []);
      setCompletenessData(completeness.data || []);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics reports from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating creative analytics charts..." />;
  }

  if (error) {
    return (
      <div className="card text-center" style={{ padding: '3rem 2rem' }}>
        <p className="text-danger">{error}</p>
        <button onClick={loadReportData} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    );
  }

  // Global Chart config defaults
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb',
          font: { family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#9ca3af' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  // 1. Briefs by Type Chart Data
  const typeLabels = byTypeData.map(t => t.project_type.replace('_', ' ').toUpperCase());
  const typeValues = byTypeData.map(t => t.count);
  const byTypeChartData = {
    labels: typeLabels,
    datasets: [
      {
        label: 'Number of Briefs',
        data: typeValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  // 2. Status Distribution Donut Data
  const statusLabels = summaryData?.statusCounts?.map(s => s.status.replace('_', ' ').toUpperCase()) || [];
  const statusValues = summaryData?.statusCounts?.map(s => s.count) || [];
  const doughnutChartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusValues,
        backgroundColor: [
          'rgba(156, 163, 175, 0.65)', // Draft
          'rgba(99, 102, 241, 0.65)',  // Submitted
          'rgba(245, 158, 11, 0.65)',  // Under Review
          'rgba(16, 185, 129, 0.65)',  // Approved
          'rgba(239, 68, 68, 0.65)',   // Revision Requested
          'rgba(59, 130, 246, 0.65)',   // In Production
          'rgba(16, 185, 129, 0.85)',  // Completed
          'rgba(55, 65, 81, 0.65)'      // Archived
        ],
        hoverOffset: 4,
        borderWidth: 0
      }
    ]
  };

  // 3. Completeness score distribution Line Chart
  const completenessLabels = completenessData.map(c => c.project_title.substring(0, 15) + '...');
  const completenessValues = completenessData.map(c => c.completeness_score);
  const lineChartData = {
    labels: completenessLabels,
    datasets: [
      {
        label: 'Completeness Score %',
        data: completenessValues,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        tension: 0.3,
        pointBackgroundColor: '#60a5fa',
        pointHoverRadius: 6,
      }
    ]
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Reports & Analytics</h1>
          <p>Creative department performance, brief validation rates, and client aggregates.</p>
        </div>
        <a 
          href={api.reports.getExportUrl()} 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <Download size={18} />
          Export CSV Summary
        </a>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        {/* Total briefs */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.875rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Total Registered Briefs</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: 1.2 }}>{summaryData?.totalBriefs || 0}</h2>
          </div>
        </div>

        {/* Avg Completeness */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.875rem', borderRadius: '12px', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Average Quality Score</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: 1.2 }}>{Math.round(summaryData?.avgCompleteness || 0)}%</h2>
          </div>
        </div>

        {/* Kickoff Pass Rate */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '0.875rem', borderRadius: '12px', color: '#8b5cf6' }}>
            <Award size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Kickoff Gate Pass Rate</p>
            <h2 style={{ fontSize: '1.75rem', lineHeight: 1.2 }}>
              {summaryData?.totalBriefs > 0 
                ? Math.round(((summaryData?.statusCounts?.find(s => s.status === 'approved')?.count || 0) + 
                             (summaryData?.statusCounts?.find(s => s.status === 'in_production')?.count || 0) + 
                             (summaryData?.statusCounts?.find(s => s.status === 'completed')?.count || 0)) / summaryData.totalBriefs * 100)
                : 0}%
            </h2>
          </div>
        </div>
      </div>

      {/* First Charts Row: Bar Chart & Doughnut Chart */}
      <div className="grid-sidebar-layout" style={{ marginBottom: '2.5rem' }}>
        
        {/* Left: Bar Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} className="text-info" />
            Briefs Grouped by Project Type
          </h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar data={byTypeChartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Doughnut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} className="text-info" />
            Status Distribution
          </h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Doughnut 
              data={doughnutChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'right',
                    labels: { color: '#e5e7eb', boxWidth: 12, font: { size: 10 } }
                  }
                }
              }} 
            />
          </div>
        </div>

      </div>

      {/* Second Row: Line Chart + Top Clients Table */}
      <div className="grid-sidebar-layout">
        
        {/* Left: Line Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} className="text-info" />
            Completeness Scores across Submissions
          </h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Right: Top Clients Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} className="text-info" />
            Client Brief Aggregates
          </h3>
          
          <div style={{ overflowX: 'auto', flexGrow: 1 }}>
            {byClientData.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '3rem 1rem' }}>No client aggregate data available.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>Client Studio</th>
                    <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>Total Briefs</th>
                    <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, textAlign: 'right' }}>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {byClientData.map((client, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 500, color: '#ffffff' }}>{client.company_name}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.8125rem', textAlign: 'center' }}>{client.brief_count}</td>
                      <td style={{ padding: '0.75rem', fontSize: '0.8125rem', textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                        {Math.round(client.avg_completeness)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
