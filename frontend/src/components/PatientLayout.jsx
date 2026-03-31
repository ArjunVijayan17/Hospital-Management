import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Pill, TestTubes, Receipt, LogOut, Activity } from 'lucide-react';
import './AdminLayout.css'; // Reusing the same CSS for identical styling

const navItems = [
  { to: '/portal/appointments', icon: <CalendarDays size={20} />, label: 'Appointments' },
  { to: '/portal/medicines', icon: <Pill size={20} />, label: 'Medicines' },
  { to: '/portal/tests', icon: <TestTubes size={20} />, label: 'Lab Tests' },
  { to: '/portal/bills', icon: <Receipt size={20} />, label: 'Bills' },
];

const PatientLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('chims_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('chims_token');
    localStorage.removeItem('chims_user');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" style={{ backgroundColor: 'white', borderRight: '1px solid var(--border-color)' }}>
        <div className="sidebar-brand">
          <Activity size={28} color="var(--accent-color)" />
          <span className="brand-text" style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Patient Hub</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={({ isActive }) => isActive ? { backgroundColor: 'var(--bg-light)', color: 'var(--primary-color)' } : { color: 'var(--text-secondary)' }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" style={{ backgroundColor: 'var(--primary-color)' }}>{user.name?.charAt(0) || 'P'}</div>
            <div className="user-details">
              <span className="user-name" style={{ color: 'var(--text-primary)' }}>{user.name || 'Patient'}</span>
              <span className="user-role" style={{ color: 'var(--text-secondary)' }}>My Profile</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} style={{ color: 'var(--text-secondary)' }}><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="admin-content" style={{ backgroundColor: 'var(--bg-light)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;
