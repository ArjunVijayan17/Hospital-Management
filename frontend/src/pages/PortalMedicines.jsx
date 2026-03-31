import React, { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import API from '../utils/api';

const PortalMedicines = () => {
    const user = JSON.parse(localStorage.getItem('chims_user'));
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await API.get(`/prescriptions/patient/${user.patientId}`);
            setPrescriptions(res.data);
        } catch (error) {
            console.error('Error loading prescriptions:', error);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Pill size={28} color="var(--accent-color)" /> My Medicines
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View your active prescriptions and medications.</p>
                </div>
            </div>

            {prescriptions.length === 0 ? (
                <div className="card empty-state" style={{ padding: '60px', marginTop: '20px' }}>
                    <Pill size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
                    <h3>No prescriptions found</h3>
                    <p>You don't have any prescribed medicines yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {prescriptions.map(rx => (
                        <div key={rx._id} className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Prescribed by {rx.doctorId?.name || 'Doctor'}</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date: {new Date(rx.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Prescription ID</div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', backgroundColor: 'var(--bg-light)', padding: '4px 8px', borderRadius: '4px' }}>{rx.prescriptionId}</span>
                                </div>
                            </div>
                            
                            {rx.medicines && rx.medicines.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '8px 0', fontWeight: 500 }}>Medicine</th>
                                            <th style={{ padding: '8px 0', fontWeight: 500 }}>Dosage</th>
                                            <th style={{ padding: '8px 0', fontWeight: 500 }}>Frequency</th>
                                            <th style={{ padding: '8px 0', fontWeight: 500 }}>Duration</th>
                                            <th style={{ padding: '8px 0', fontWeight: 500 }}>Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rx.medicines.map((med, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--bg-light)' }}>
                                                <td style={{ padding: '12px 0', fontWeight: 600, color: 'var(--primary-color)' }}>{med.medicineName || '—'}</td>
                                                <td style={{ padding: '12px 0' }}>{med.dosage || '—'}</td>
                                                <td style={{ padding: '12px 0' }}>{med.frequency || '—'}</td>
                                                <td style={{ padding: '12px 0' }}>{med.duration || '—'}</td>
                                                <td style={{ padding: '12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{med.instructions || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No medicines listed for this prescription.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortalMedicines;
