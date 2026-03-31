import React, { useState, useEffect } from 'react';
import { CalendarPlus, CalendarDays } from 'lucide-react';
import API from '../utils/api';

const PortalAppointments = () => {
    const user = JSON.parse(localStorage.getItem('chims_user'));
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '', type: 'in-person', reason: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const docsRes = await API.get('/doctors');
            setDoctors(docsRes.data);
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
        
        try {
            if (user.patientId) {
                const apptRes = await API.get(`/appointments/patient/${user.patientId}`);
                setAppointments(apptRes.data);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user.patientId) {
            alert("Your session token is outdated and missing a clinical Patient ID. We are refreshing your session. Please log back in!");
            localStorage.removeItem('chims_token');
            localStorage.removeItem('chims_user');
            window.location.href = '/login';
            return;
        }

        try {
            const doc = doctors.find(d => d._id === form.doctorId);
            await API.post('/appointments', { 
                ...form, 
                patientId: user.patientId,
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
        <div>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CalendarDays size={28} color="var(--accent-color)" /> My Appointments
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your scheduled visits and book new ones.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <CalendarPlus size={18} style={{ marginRight: '8px' }} />
                    Book Appointment
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                                        <div className="empty-state" style={{ padding: '60px' }}>
                                            <CalendarDays size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
                                            <h3>No upcoming appointments</h3>
                                            <p>You haven't booked any appointments recently.</p>
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
                                                    style={{ padding: '4px 12px', fontSize: '0.8rem', color: 'var(--alert-danger)', borderColor: 'var(--alert-danger)' }} 
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
                                    <input className="form-control" placeholder="e.g. 09:00 - 11:00" value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} />
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

export default PortalAppointments;
