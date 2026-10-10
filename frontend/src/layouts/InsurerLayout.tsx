import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CheckSquare, Brain, Files, BarChart2, User, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/ui/NotificationBell';
import { getInitials } from '../utils/helpers';

const navItems = [
  { to: '/insurer/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/insurer/pending', icon: <CheckSquare size={18} />, label: 'Pending Reviews' },
  { to: '/insurer/all-claims', icon: <FileText size={18} />, label: 'All Claims' },
  { to: '/insurer/ai-analysis', icon: <Brain size={18} />, label: 'AI Analysis' },
  { to: '/insurer/documents', icon: <Files size={18} />, label: 'Documents' },
  { to: '/insurer/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
  { to: '/insurer/profile', icon: <User size={18} />, label: 'Profile' },
  { to: '/insurer/settings', icon: <Settings size={18} />, label: 'Settings' },
];


export const InsurerLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>M</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>MediAuth AI</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>Insurer Portal</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '12px 0', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to} to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#0f766e',
            }}>
              {getInitials(user?.name || 'IN')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Insurer</div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div style={{ flex: 1 }} />
        <NotificationBell />
      </header>

      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
};
