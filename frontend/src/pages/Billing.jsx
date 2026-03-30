import React, { useState, useEffect } from 'react';
import { FilePlus } from 'lucide-react';
import API from '../utils/api';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', lineItems: [{ type: 'consultation', description: '', quantity: 1, unitPrice: 0, total: 0 }], status: 'pending' });

  const load = () => {
    API.get('/bills').then(r => setBills(r.data)).catch(console.error);
    API.get('/patients').then(r => setPatients(r.data)).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const addLineItem = () => setForm({ ...form, lineItems: [...form.lineItems, { type: 'medicine', description: '', quantity: 1, unitPrice: 0, total: 0 }] });

  const updateLineItem = (i, field, val) => {
    const items = [...form.lineItems];
    items[i][field] = field === 'quantity' || field === 'unitPrice' ? Number(val) : val;
    items[i].total = items[i].quantity * items[i].unitPrice;
    setForm({ ...form, lineItems: items });
  };

  const subtotal = form.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bills', { ...form, subtotal, totalAmount: subtotal, amountPaid: 0 });
      setShowModal(false);
      setForm({ patientId: '', lineItems: [{ type: 'consultation', description: '', quantity: 1, unitPrice: 0, total: 0 }], status: 'pending' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Billing & Finance</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FilePlus size={18} /> Create Bill</button>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Bill ID</th><th>Patient</th><th>Items</th><th>Total (₹)</th><th>Paid (₹)</th><th>Due (₹)</th><th>Status</th></tr></thead>
          <tbody>
            {bills.length === 0 ? <tr><td colSpan={7}><div className="empty-state"><h3>No bills</h3></div></td></tr> :
              bills.map(b => (
                <tr key={b._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{b.billId}</td>
                  <td>{b.patientId?.name || '—'}</td>
                  <td>{b.lineItems?.length || 0}</td>
                  <td>₹{b.totalAmount?.toLocaleString()}</td>
                  <td>₹{b.amountPaid?.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: (b.totalAmount - b.amountPaid) > 0 ? '#DC2626' : '#059669' }}>₹{(b.totalAmount - b.amountPaid)?.toLocaleString()}</td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <h2>Create Bill</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Patient *</label>
                <select className="form-control" required value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})}>
                  <option value="">Select</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
                </select>
              </div>

              <h3 style={{ margin: '16px 0 12px', fontSize: '1rem' }}>Line Items</h3>
              {form.lineItems.map((item, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 8 }}><label>Type</label>
                      <select className="form-control" value={item.type} onChange={e => updateLineItem(i, 'type', e.target.value)}>
                        <option value="consultation">Consultation</option><option value="medicine">Medicine</option><option value="lab">Lab Test</option><option value="procedure">Procedure</option><option value="room">Room</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}><label>Description</label><input className="form-control" value={item.description} onChange={e => updateLineItem(i, 'description', e.target.value)} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}><label>Qty</label><input type="number" className="form-control" value={item.quantity} onChange={e => updateLineItem(i, 'quantity', e.target.value)} /></div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label>Unit Price (₹)</label><input type="number" className="form-control" value={item.unitPrice} onChange={e => updateLineItem(i, 'unitPrice', e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.85rem', marginBottom: 16 }} onClick={addLineItem}>+ Add Line Item</button>

              <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Total: ₹{subtotal.toLocaleString()}</div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Bill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
