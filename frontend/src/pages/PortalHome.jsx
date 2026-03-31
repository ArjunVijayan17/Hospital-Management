import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Activity } from 'lucide-react';
import API from '../utils/api';

const PortalHome = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('chims_user'));
    
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '', type: 'in-person', reason: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [apptRes, docsRes] = await Promise.all([
                API.get(`/appointments/patient/${user._id}`),
                API.get('/doctors')
            ]);
            setAppointments(apptRes.data);
            setDoctors(docsRes.data);
        } catch (error) {
            console.error('Error loading portal data:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('chims_token');
        localStorage.removeItem('chims_user');
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const doc = doctors.find(d => d._id === form.doctorId);
            await API.post('/appointments', { 
                ...form, 
                patientId: user._id,
                departmentId: doc?.departmentId?._id || doc?.departmentId 
            });
            setShowModal(false);
            setForm({ doctorId: '', date: '', timeSlot: '', type: 'in-person', reason: '' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error booking appointment');
        }
    };

    const cancelAppointment = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await API.put(`/appointments/${id}/status`, { status: 'cancelled' });
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling appointment');
        }
    };

    return (
        <div style={{ padding: '40px', backgroundColor: 'var(--bg-light)', minHeight: '100vh', fontFamily: 'var(--font-family)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: 'var(--primary-color)', padding: '12px', borderRadius: '12px', color: 'white' }}>
                            <Activity size={32} />
                        </div>
                        <div>
                            <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Welcome back, {user?.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage your health journey.</p>
                        </div>
                    </div>
                    <button className="btn btn-secondary" onClick={handleLogout}>Log Out</button>
                </div>
                
                {/* Actions Board */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    <div className="card" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary-color)', color: 'white' }}>
                        <div>
                            <h2 style={{ color: 'white', margin: '0 0 8px 0' }}>Need to see a doctor?</h2>
                            <p style={{ margin: 0, opacity: 0.9 }}>Schedule your next visit right now.</p>
                        </div>
                        <button 
                            className="btn btn-primary" 
                            style={{ backgroundColor: 'white', color: 'var(--primary-color)', padding: '12px 24px', fontWeight: 600 }}
                            onClick={() => setShowModal(true)}>
                            <CalendarPlus size={20} style={{ marginRight: '8px' }} />
                            Book Appointment
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Your Upcoming Appointments</h3>
                    </div>
                    
                    <div className="data-table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="empty-state" style={{ padding: '40px' }}>
                                                <h3 style={{ color: 'var(--text-secondary)' }}>No recent appointments found</h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    appointments.map(a => (
                                        <tr key={a._id}>
                                            <td style={{ fontWeight: 500 }}>{a.doctorId?.name || '—'}</td>
                                            <td>{new Date(a.date).toLocaleDateString()}</td>
                                            <td>{a.timeSlot}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{a.type}</td>
                                            <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                                            <td>
                                                {a.status === 'scheduled' && (
                                                    <button 
                                                        className="btn btn-secondary" 
                                                        style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'var(--alert-danger)', borderColor: 'var(--alert-danger)' }} 
                                                        onClick={() => cancelAppointment(a._id)}>
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 1000 }}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                        <h2>Book New Appointment</h2>
                        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
                            
                            <div className="form-group">
                                <label>Select Doctor *</label>
                                <select className="form-control" required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                                    <option value="">Select a Doctor</option>
                                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialisation}</option>)}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <input type="date" className="form-control" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="form-group">
                                    <label>Preferred Time Slot</label>
                                    <input className="form-control" placeholder="e.g. Morning, 09:00 - 11:00" value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Visit Type</label>
                                    <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                        <option value="in-person">In-Person Clinic</option>
                                        <option value="teleconsultation">Online Teleconsultation</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Reason for Visit</label>
                                    <input className="form-control" placeholder="Brief description of your problem" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="modal-actions" style={{ marginTop: '32px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortalHome;
