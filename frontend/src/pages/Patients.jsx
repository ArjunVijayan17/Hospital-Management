import React, { useState, useEffect } from 'react';
import { UserPlus, Search } from 'lucide-react';
import API from '../utils/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', dob: '', gender: 'Male', bloodGroup: '', phone: '', email: '', address: { street: '', city: '', state: '', pincode: '' } });

  const load = () => API.get('/patients').then(r => setPatients(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const age = form.dob ? Math.floor((Date.now() - new Date(form.dob)) / 31557600000) : 0;
      await API.post('/patients', { ...form, age });
      setShowModal(false);
      setForm({ name: '', dob: '', gender: 'Male', bloodGroup: '', phone: '', email: '', address: { street: '', city: '', state: '', pincode: '' } });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.patientId?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <h1>Patient Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><UserPlus size={18} /> Register Patient</button>
      </div>

      <div className="toolbar">
        <input className="search-input" placeholder="Search patients by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Patient ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Blood Group</th><th>Phone</th><th>City</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><h3>No patients found</h3><p>Register a new patient to get started</p></div></td></tr> :
              filtered.map(p => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.patientId}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td><span className="badge badge-active">{p.bloodGroup || '—'}</span></td>
                  <td>{p.phone}</td>
                  <td>{p.address?.city || '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Register New Patient</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="form-group"><label>Date of Birth</label><input type="date" className="form-control" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Gender</label><select className="form-control" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div>
                <div className="form-group"><label>Blood Group</label><select className="form-control" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})}><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>City</label><input className="form-control" value={form.address.city} onChange={e => setForm({...form, address: {...form.address, city: e.target.value}})} /></div>
                <div className="form-group"><label>State</label><input className="form-control" value={form.address.state} onChange={e => setForm({...form, address: {...form.address, state: e.target.value}})} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
