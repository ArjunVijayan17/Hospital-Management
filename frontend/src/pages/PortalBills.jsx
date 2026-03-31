import React, { useState, useEffect } from 'react';
import { Receipt } from 'lucide-react';
import API from '../utils/api';

const PortalBills = () => {
    const user = JSON.parse(localStorage.getItem('chims_user'));
    const [bills, setBills] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await API.get(`/bills/patient/${user.patientId}`);
            setBills(res.data);
        } catch (error) {
            console.error('Error loading bills:', error);
        }
    };

    return (
        <div>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Receipt size={28} color="var(--accent-color)" /> My Bills
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View your invoices and payment history.</p>
                </div>
            </div>

            {bills.length === 0 ? (
                <div className="card empty-state" style={{ padding: '60px', marginTop: '20px' }}>
                    <Receipt size={48} color="var(--border-color)" style={{ marginBottom: '16px' }} />
                    <h3>No bills found</h3>
                    <p>You don't have any pending or historical invoices.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {bills.map(bill => (
                        <div key={bill._id} className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Invoice {bill.billId}</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date: {new Date(bill.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                                        ${bill.totalAmount?.toFixed(2) || '0.00'}
                                    </div>
                                    <span className={`badge badge-${bill.status}`} style={{ marginTop: '4px', display: 'inline-block' }}>{bill.status}</span>
                                </div>
                            </div>
                            
                            {bill.lineItems && bill.lineItems.length > 0 && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '8px 0', fontWeight: 500 }}>Description</th>
                                            <th style={{ padding: '8px 0', fontWeight: 500, textAlign: 'center' }}>Qty</th>
                                            <th style={{ padding: '8px 0', fontWeight: 500, textAlign: 'right' }}>Unit Price</th>
                                            <th style={{ padding: '8px 0', fontWeight: 500, textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bill.lineItems.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--bg-light)' }}>
                                                <td style={{ padding: '12px 0' }}>{item.description || item.type}</td>
                                                <td style={{ padding: '12px 0', textAlign: 'center' }}>{item.quantity || 1}</td>
                                                <td style={{ padding: '12px 0', textAlign: 'right' }}>${item.unitPrice?.toFixed(2) || '0.00'}</td>
                                                <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 500 }}>${item.total?.toFixed(2) || '0.00'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                                <div style={{ minWidth: '200px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                        <span>Subtotal</span>
                                        <span>${bill.subtotal?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                        <span>Discount</span>
                                        <span>${bill.discount?.amount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                        <span>Amount Paid</span>
                                        <span style={{ color: 'var(--alert-success)', fontWeight: 500 }}>-${bill.amountPaid?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid var(--border-color)', fontWeight: 600, fontSize: '1.1rem' }}>
                                        <span>Balance Due</span>
                                        <span style={{ color: (bill.totalAmount - bill.amountPaid) > 0 ? 'var(--alert-danger)' : 'var(--text-primary)' }}>
                                            ${Math.max(0, bill.totalAmount - bill.amountPaid).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PortalBills;
