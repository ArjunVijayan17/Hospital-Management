import React, { useState, useEffect } from 'react';
import { PackagePlus, AlertTriangle } from 'lucide-react';
import API from '../utils/api';

const Pharmacy = () => {
  const [stock, setStock] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [stockForm, setStockForm] = useState({ medicineId: '', batchNumber: '', expiryDate: '', quantityInStock: '', purchasePrice: '', sellingPrice: '', supplier: '' });
  const [medForm, setMedForm] = useState({ genericName: '', brandName: '', category: '', manufacturer: '', unit: 'Tablet' });

  const load = () => {
    API.get('/pharmacy/stock').then(r => setStock(r.data)).catch(console.error);
    API.get('/pharmacy/medicines').then(r => setMedicines(r.data)).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await API.post('/pharmacy/stock', { ...stockForm, quantityInStock: Number(stockForm.quantityInStock), purchasePrice: Number(stockForm.purchasePrice), sellingPrice: Number(stockForm.sellingPrice) });
      setShowStockModal(false);
      setStockForm({ medicineId: '', batchNumber: '', expiryDate: '', quantityInStock: '', purchasePrice: '', sellingPrice: '', supplier: '' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleAddMed = async (e) => {
    e.preventDefault();
    try {
      await API.post('/pharmacy/medicines', medForm);
      setShowMedModal(false);
      setMedForm({ genericName: '', brandName: '', category: '', manufacturer: '', unit: 'Tablet' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const categories = ['Antibiotic','Analgesic','Anti-inflammatory','Antihypertensive','Antidiabetic','Cardiovascular','Neurological','Vitamins & Supplements','Gastrointestinal','Topical'];

  return (
    <div>
      <div className="page-header">
        <h1>Pharmacy Management</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowMedModal(true)}>+ Add Medicine</button>
          <button className="btn btn-primary" onClick={() => setShowStockModal(true)}><PackagePlus size={18} /> Add Stock</button>
        </div>
      </div>

      {/* Low stock warnings */}
      {stock.filter(s => s.quantityInStock <= s.lowStockThreshold).length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={20} color="#D97706" />
          <span style={{ fontWeight: 500, color: '#92400E' }}>
            {stock.filter(s => s.quantityInStock <= s.lowStockThreshold).length} item(s) are below the low stock threshold!
          </span>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>Medicine</th><th>Category</th><th>Batch</th><th>Qty</th><th>Threshold</th><th>Buy (₹)</th><th>Sell (₹)</th><th>Expiry</th><th>Status</th></tr></thead>
          <tbody>
            {stock.length === 0 ? <tr><td colSpan={9}><div className="empty-state"><h3>No stock entries</h3></div></td></tr> :
              stock.map(s => {
                const isLow = s.quantityInStock <= s.lowStockThreshold;
                const isExpiring = s.expiryDate && new Date(s.expiryDate) < new Date(Date.now() + 30 * 86400000);
                return (
                  <tr key={s._id}>
                    <td><strong>{s.medicineId?.brandName || '—'}</strong><br/><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.medicineId?.genericName}</span></td>
                    <td>{s.medicineId?.category || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{s.batchNumber}</td>
                    <td style={{ fontWeight: 600, color: isLow ? '#DC2626' : 'inherit' }}>{s.quantityInStock}</td>
                    <td>{s.lowStockThreshold}</td>
                    <td>₹{s.purchasePrice}</td>
                    <td>₹{s.sellingPrice}</td>
                    <td style={{ color: isExpiring ? '#DC2626' : 'inherit' }}>{s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : '—'}</td>
                    <td>
                      {s.quantityInStock === 0 ? <span className="badge badge-cancelled">Out of Stock</span> :
                       isLow ? <span className="badge badge-pending">Low Stock</span> :
                       <span className="badge badge-completed">In Stock</span>}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {showStockModal && (
        <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Stock Entry</h2>
            <form onSubmit={handleAddStock}>
              <div className="form-group"><label>Medicine *</label>
                <select className="form-control" required value={stockForm.medicineId} onChange={e => setStockForm({...stockForm, medicineId: e.target.value})}>
                  <option value="">Select</option>
                  {medicines.map(m => <option key={m._id} value={m._id}>{m.brandName} ({m.genericName})</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Batch Number</label><input className="form-control" value={stockForm.batchNumber} onChange={e => setStockForm({...stockForm, batchNumber: e.target.value})} /></div>
                <div className="form-group"><label>Expiry Date</label><input type="date" className="form-control" value={stockForm.expiryDate} onChange={e => setStockForm({...stockForm, expiryDate: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Quantity</label><input type="number" className="form-control" required value={stockForm.quantityInStock} onChange={e => setStockForm({...stockForm, quantityInStock: e.target.value})} /></div>
                <div className="form-group"><label>Supplier</label><input className="form-control" value={stockForm.supplier} onChange={e => setStockForm({...stockForm, supplier: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Purchase Price (₹)</label><input type="number" className="form-control" value={stockForm.purchasePrice} onChange={e => setStockForm({...stockForm, purchasePrice: e.target.value})} /></div>
                <div className="form-group"><label>Selling Price (₹)</label><input type="number" className="form-control" value={stockForm.sellingPrice} onChange={e => setStockForm({...stockForm, sellingPrice: e.target.value})} /></div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMedModal && (
        <div className="modal-overlay" onClick={() => setShowMedModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Medicine to Master List</h2>
            <form onSubmit={handleAddMed}>
              <div className="form-row">
                <div className="form-group"><label>Generic Name *</label><input className="form-control" required value={medForm.genericName} onChange={e => setMedForm({...medForm, genericName: e.target.value})} /></div>
                <div className="form-group"><label>Brand Name</label><input className="form-control" value={medForm.brandName} onChange={e => setMedForm({...medForm, brandName: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Category</label>
                  <select className="form-control" value={medForm.category} onChange={e => setMedForm({...medForm, category: e.target.value})}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Manufacturer</label><input className="form-control" value={medForm.manufacturer} onChange={e => setMedForm({...medForm, manufacturer: e.target.value})} /></div>
              </div>
              <div className="form-group"><label>Unit</label>
                <select className="form-control" value={medForm.unit} onChange={e => setMedForm({...medForm, unit: e.target.value})}>
                  <option>Tablet</option><option>Capsule</option><option>ml</option><option>mg</option><option>Injection</option><option>Syrup</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMedModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
