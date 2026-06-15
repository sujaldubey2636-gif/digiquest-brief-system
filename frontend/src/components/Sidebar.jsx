import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  BarChart3, 
  Users, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_brief', label: 'New Brief', icon: FilePlus },
    { id: 'briefs', label: 'All Briefs', icon: FileText },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        paddingTop: 'calc(var(--navbar-height) + 1.5rem)',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'between',
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexGrow: 1 }}>
        <p 
          style={{ 
            fontSize: '0.6875rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            color: 'var(--text-muted)',
            fontWeight: 600,
            paddingLeft: '0.75rem',
            marginBottom: '0.5rem'
          }}
        >
          Navigation
        </p>

        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id || (item.id === 'briefs' && currentPage === 'detail');
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                textAlign: 'left',
                transition: 'var(--transition-all)',
              }}
              className={isActive ? '' : 'btn-secondary'}
            >
              <IconComponent size={18} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ paddingBottom: '1.5rem' }}>
        <button
          onClick={() => alert('Logout is not implemented in this prototype.')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            textAlign: 'left',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            transition: 'var(--transition-all)',
          }}
          className="btn-secondary"
        >
          <LogOut size={18} />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
