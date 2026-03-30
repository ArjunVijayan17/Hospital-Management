import React from 'react';
import { useNavigate } from 'react-router-dom';

const PortalHome = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('chims_token');
        localStorage.removeItem('chims_user');
        navigate('/login');
    };

    return (
        <div style={{ padding: '40px', backgroundColor: 'var(--bg-light)', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: 'var(--accent-color)' }}>Patient Portal</h1>
                <button className="btn btn-secondary" onClick={handleLogout}>Log Out</button>
            </div>
            
            <div style={{ marginTop: '24px' }}>
                <div className="card">
                    <h3>Welcome to your health hub</h3>
                    <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
                        This is a placeholder for the Patient Portal Home.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortalHome;
