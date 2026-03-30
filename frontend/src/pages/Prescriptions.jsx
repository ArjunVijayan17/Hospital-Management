import React, { useState, useEffect } from 'react';
import { FilePlus } from 'lucide-react';
import API from '../utils/api';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stock, setStock] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', doctorId: '', diagnosis: '', notes: '', medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }] });

  const load = () => {
    API.get('/prescriptions').then(r => setPrescriptions(r.data)).catch(console.error);
    API.get('/patients').then(r => setPatients(r.data)).catch(console.error);
    API.get('/doctors').then(r => setDoctors(r.data)).catch(console.error);
    API.get('/pharmacy/stock/available').then(r => setStock(r.data)).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const addMedicine = () => setForm({ ...form, medicines: [...form.medicines, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }] });

  const updateMedicine = (i, field, val) => {
    const meds = [...form.medicines];
    meds[i][field] = val;
    setForm({ ...form, medicines: meds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/prescriptions', form);
      setShowModal(false);
      setForm({ patientId: '', doctorId: '', diagnosis: '', notes: '', medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Prescriptions</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FilePlus size={18} /> New Prescription</button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Rx ID</th><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {prescriptions.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><h3>No prescriptions</h3></div></td></tr> :
              prescriptions.map(p => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{p.prescriptionId}</td>
                  <td>{p.patientId?.name || '—'}</td>
                  <td>{p.doctorId?.name || '—'}</td>
                  <td>{p.diagnosis || '—'}</td>
                  <td>{p.medicines?.length || 0} items</td>
                  <td><span className={`badge badge-${p.dispensingStatus}`}>{p.dispensingStatus}</span></td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <h2>Create Prescription</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Patient *</label>
                  <select className="form-control" required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                    <option value="">Select</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Doctor *</label>
                  <select className="form-control" required value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                    <option value="">Select</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Diagnosis</label><input className="form-control" value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} /></div>

              <h3 style={{ margin: '20px 0 12px', fontSize: '1rem' }}>Medicines (from Pharmacy Stock)</h3>
              {form.medicines.map((m, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 8 }}><label>Medicine</label>
                      <select className="form-control" value={m.medicineName} onChange={e => updateMedicine(i, 'medicineName', e.target.value)}>
                        <option value="">Select (in-stock only)</option>
                        {stock.map(s => <option key={s._id} value={s.medicineId?.brandName || s.medicineId?.genericName}>{s.medicineId?.brandName} ({s.medicineId?.genericName}) — Qty: {s.quantityInStock}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}><label>Dosage</label><input className="form-control" placeholder="500mg" value={m.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}><label>Frequency</label><input className="form-control" placeholder="Twice daily" value={m.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} /></div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label>Duration</label><input className="form-control" placeholder="7 days" value={m.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem', marginBottom: 16 }} onClick={addMedicine}>+ Add Medicine</button>

              <div className="form-group"><label>Notes</label><textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
