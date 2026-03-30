import React, { useState, useEffect } from 'react';
import { Users, Stethoscope, CalendarDays, AlertTriangle, TestTubes, Receipt } from 'lucide-react';
import API from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Patients', value: stats.totalPatients || 0, icon: <Users size={24} />, bg: '#DBEAFE', color: '#1E40AF' },
    { label: 'Doctors on Staff', value: stats.totalDoctors || 0, icon: <Stethoscope size={24} />, bg: '#D1FAE5', color: '#065F46' },
    { label: 'Appointments Today', value: stats.todayAppointments || 0, icon: <CalendarDays size={24} />, bg: '#FED7AA', color: '#9A3412' },
    { label: 'Low Stock Alerts', value: stats.lowStock || 0, icon: <AlertTriangle size={24} />, bg: '#FEE2E2', color: '#991B1B' },
    { label: 'Active Trials', value: stats.activeTrials || 0, icon: <TestTubes size={24} />, bg: '#CCFBF1', color: '#0F766E' },
    { label: 'Pending Bills', value: stats.pendingBills || 0, icon: <Receipt size={24} />, bg: '#DDD6FE', color: '#5B21B6' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to Christ Hospital Management System</p>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="stats-grid">
          {cards.map((c, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
              <div className="stat-info">
                <h3>{c.value}</h3>
                <p>{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
