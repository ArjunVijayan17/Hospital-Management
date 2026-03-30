import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Stethoscope, CalendarDays, Pill, FlaskConical, TestTubes, Receipt, LogOut, Activity } from 'lucide-react';
import './AdminLayout.css';

const navItems = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/admin/patients', icon: <Users size={20} />, label: 'Patients' },
  { to: '/admin/doctors', icon: <Stethoscope size={20} />, label: 'Doctors & Staff' },
  { to: '/admin/appointments', icon: <CalendarDays size={20} />, label: 'Appointments' },
  { to: '/admin/prescriptions', icon: <Pill size={20} />, label: 'Prescriptions' },
  { to: '/admin/pharmacy', icon: <FlaskConical size={20} />, label: 'Pharmacy' },
  { to: '/admin/trials', icon: <TestTubes size={20} />, label: 'Clinical Trials' },
  { to: '/admin/billing', icon: <Receipt size={20} />, label: 'Billing' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('chims_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('chims_token');
    localStorage.removeItem('chims_user');
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Activity size={28} color="var(--accent-color)" />
          <span className="brand-text" style={{ color: 'white', fontSize: '1.2rem' }}>Christ Hospital</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.name?.charAt(0) || 'A'}</div>
            <div className="user-details">
              <span className="user-name">{user.name || 'Admin'}</span>
              <span className="user-role">{user.role || 'superAdmin'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /></button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
