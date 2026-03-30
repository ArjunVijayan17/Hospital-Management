import React, { useState, useEffect } from 'react';
import { CalendarPlus } from 'lucide-react';
import API from '../utils/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', timeSlot: '', type: 'in-person', reason: '' });

  const load = () => {
    API.get('/appointments').then(r => setAppointments(r.data)).catch(console.error);
    API.get('/patients').then(r => setPatients(r.data)).catch(console.error);
    API.get('/doctors').then(r => setDoctors(r.data)).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const doc = doctors.find(d => d._id === form.doctorId);
      await API.post('/appointments', { ...form, departmentId: doc?.departmentId?._id || doc?.departmentId });
      setShowModal(false);
      setForm({ patientId: '', doctorId: '', date: '', timeSlot: '', type: 'in-person', reason: '' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    await API.put(`/appointments/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Appointments</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><CalendarPlus size={18} /> Book Appointment</button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {appointments.length === 0 ? <tr><td colSpan={8}><div className="empty-state"><h3>No appointments</h3></div></td></tr> :
              appointments.map(a => (
                <tr key={a._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{a.appointmentId}</td>
                  <td>{a.patientId?.name || '—'}</td>
                  <td>{a.doctorId?.name || '—'}</td>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.timeSlot}</td>
                  <td>{a.type}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    {a.status === 'scheduled' && <>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', marginRight: 4 }} onClick={() => updateStatus(a._id, 'completed')}>Complete</button>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--alert-danger)', borderColor: 'var(--alert-danger)' }} onClick={() => updateStatus(a._id, 'cancelled')}>Cancel</button>
                    </>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Book Appointment</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Patient *</label>
                  <select className="form-control" required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Doctor *</label>
                  <select className="form-control" required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialisation}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date *</label><input type="date" className="form-control" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
                <div className="form-group"><label>Time Slot</label><input className="form-control" placeholder="09:00 - 09:30" value={form.timeSlot} onChange={e => setForm({...form, timeSlot: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Type</label>
                  <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="in-person">In-Person</option>
                    <option value="teleconsultation">Teleconsultation</option>
                  </select>
                </div>
                <div className="form-group"><label>Reason</label><input className="form-control" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
