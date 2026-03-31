import React, { useState, useEffect } from 'react';
import { TestTubes } from 'lucide-react';
import API from '../utils/api';

const PortalTests = () => {
    const user = JSON.parse(localStorage.getItem('chims_user'));
    const [prescriptions, setPrescriptions] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await API.get(`/prescriptions/patient/${user.patientId}`);
            // Filter only prescriptions that have lab tests ordered
            setPrescriptions(res.data.filter(rx => rx.labTestsOrdered && rx.labTestsOrdered.length > 0));
        } catch (error) {
            console.error('Error loading tests:', error);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TestTubes size={28} color="var(--accent-color)" /> My Lab Tests
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View tests ordered by your physicians.</p>
                </div>
            </div>

            {prescriptions.length === 0 ? (
                <div className="card empty-state" style={{ padding: '60px', marginTop: '20px' }}>
                    <TestTubes size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
                    <h3>No lab tests ordered</h3>
                    <p>You don't have any pending or completed test orders.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {prescriptions.map(rx => (
                        <div key={rx._id} className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Ordered by {rx.doctorId?.name || 'Doctor'}</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date: {new Date(rx.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Source Prescription ID</div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', backgroundColor: 'var(--bg-light)', padding: '4px 8px', borderRadius: '4px' }}>{rx.prescriptionId}</span>
                                </div>
                            </div>
                            
                            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Requested Tests:</h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-primary)' }}>
                                {rx.labTestsOrdered.map((test, idx) => (
                                    <li key={idx} style={{ marginBottom: '8px', fontWeight: 500 }}>
                                        {test}
                                    </li>
                                ))}
                            </ul>
                            
                            {rx.diagnosis && (
                                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg-light)', borderRadius: '8px' }}>
                                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Related Diagnosis:</strong>
                                    {rx.diagnosis}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortalTests;
