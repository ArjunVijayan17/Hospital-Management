import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import API from '../utils/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', specialisation: '', departmentId: '', consultationFee: '', phone: '', email: '', qualification: '' });

  const load = () => {
    API.get('/doctors').then(r => setDoctors(r.data)).catch(console.error);
    API.get('/departments').then(r => setDepartments(r.data)).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/doctors', { ...form, qualification: form.qualification.split(',').map(q => q.trim()), consultationFee: Number(form.consultationFee) });
      setShowModal(false);
      setForm({ name: '', specialisation: '', departmentId: '', consultationFee: '', phone: '', email: '', qualification: '' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Doctors & Staff</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><UserPlus size={18} /> Add Doctor</button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Employee ID</th><th>Name</th><th>Specialisation</th><th>Department</th><th>Fee (₹)</th><th>Phone</th></tr></thead>
          <tbody>
            {doctors.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><h3>No doctors found</h3></div></td></tr> :
              doctors.map(d => (
                <tr key={d._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{d.employeeId}</td>
                  <td><strong>{d.name}</strong><br/><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.qualification?.join(', ')}</span></td>
                  <td>{d.specialisation}</td>
                  <td>{d.departmentId?.name || '—'}</td>
                  <td>₹{d.consultationFee}</td>
                  <td>{d.phone}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Doctor</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="form-group"><label>Specialisation</label><input className="form-control" value={form.specialisation} onChange={e => setForm({...form, specialisation: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Department</label>
                  <select className="form-control" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Consultation Fee (₹)</label><input type="number" className="form-control" value={form.consultationFee} onChange={e => setForm({...form, consultationFee: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Qualifications (comma separated)</label><input className="form-control" placeholder="MBBS, MD Cardiology" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
