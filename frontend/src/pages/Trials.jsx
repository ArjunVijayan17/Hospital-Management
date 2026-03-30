import React, { useState, useEffect } from 'react';
import { FlaskConical } from 'lucide-react';
import API from '../utils/api';

const Trials = () => {
  const [trials, setTrials] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phase: 'III', sponsor: '', principalInvestigatorId: '', departmentId: '', objectives: '', inclusionCriteria: '', exclusionCriteria: '', startDate: '', endDate: '', targetEnrollment: '', status: 'planning' });

  const load = () => {
    API.get('/trials').then(r => setTrials(r.data)).catch(console.error);
    API.get('/doctors').then(r => setDoctors(r.data)).catch(console.error);
    API.get('/departments').then(r => setDepartments(r.data)).catch(console.error);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/trials', { ...form, targetEnrollment: Number(form.targetEnrollment) });
      setShowModal(false);
      setForm({ name: '', phase: 'III', sponsor: '', principalInvestigatorId: '', departmentId: '', objectives: '', inclusionCriteria: '', exclusionCriteria: '', startDate: '', endDate: '', targetEnrollment: '', status: 'planning' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Clinical Trials</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FlaskConical size={18} /> New Trial</button>
      </div>

      {/* Trial Cards */}
      {trials.length === 0 ? <div className="empty-state card"><h3>No clinical trials</h3><p>Create a new trial to get started</p></div> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
          {trials.map(t => (
            <div className="card" key={t._id} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: 4 }}>{t.name}</h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.trialId}</span>
                </div>
                <span className={`badge badge-${t.status}`}>{t.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', fontSize: '0.9rem', marginBottom: 16 }}>
                <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Phase</span><br/><strong>Phase {t.phase}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Sponsor</span><br/><strong>{t.sponsor || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>PI</span><br/><strong>{t.principalInvestigatorId?.name || '—'}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Department</span><br/><strong>{t.departmentId?.name || '—'}</strong></div>
              </div>

              {/* Enrollment progress */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span>Enrollment</span>
                  <span>{t.currentEnrollment || 0} / {t.targetEnrollment || 0}</span>
                </div>
                <div style={{ background: '#E2E8F0', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                  <div style={{ background: 'var(--accent-color)', height: '100%', width: `${t.targetEnrollment ? (t.currentEnrollment / t.targetEnrollment) * 100 : 0}%`, borderRadius: 8, transition: 'width 0.3s' }} />
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 12 }}>{t.objectives?.substring(0, 120)}{t.objectives?.length > 120 ? '...' : ''}</p>
            </div>
          ))}
        </div>
      }

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <h2>Create Clinical Trial</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Trial Name *</label><input className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Phase</label>
                  <select className="form-control" value={form.phase} onChange={e => setForm({...form, phase: e.target.value})}>
                    <option value="I">Phase I</option><option value="II">Phase II</option><option value="III">Phase III</option><option value="IV">Phase IV</option>
                  </select>
                </div>
                <div className="form-group"><label>Sponsor</label><input className="form-control" value={form.sponsor} onChange={e => setForm({...form, sponsor: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Principal Investigator</label>
                  <select className="form-control" value={form.principalInvestigatorId} onChange={e => setForm({...form, principalInvestigatorId: e.target.value})}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Department</label>
                  <select className="form-control" value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}>
                    <option value="">Select</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Objectives</label><textarea className="form-control" rows={2} value={form.objectives} onChange={e => setForm({...form, objectives: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label>Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                <div className="form-group"><label>End Date</label><input type="date" className="form-control" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Target Enrollment</label><input type="number" className="form-control" value={form.targetEnrollment} onChange={e => setForm({...form, targetEnrollment: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="planning">Planning</option><option value="recruiting">Recruiting</option><option value="active">Active</option><option value="completed">Completed</option><option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Trial</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trials;
