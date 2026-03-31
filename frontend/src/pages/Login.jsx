import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity } from 'lucide-react';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleGroup, setRoleGroup] = useState('patient'); // 'patient' or 'admin'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignup) {
        // Register flow
        const res = await axios.post('http://localhost:5001/api/auth/register', {
          name, email, password, role: 'patient' // Admin signup usually separate or handled by Super Admin
        });
        
        const { token, user } = res.data;
        localStorage.setItem('chims_token', token);
        localStorage.setItem('chims_user', JSON.stringify(user));
        navigate('/portal/appointments');
      } else {
        // Login flow
        const payloadRole = roleGroup === 'patient' ? 'patient' : 'superAdmin'; 
        
        const res = await axios.post('http://localhost:5001/api/auth/login', {
          email, password, role: payloadRole
        });

        const { token, user } = res.data;
        localStorage.setItem('chims_token', token);
        localStorage.setItem('chims_user', JSON.stringify(user));

        if (user.role === 'patient') {
          navigate('/portal/appointments');
        } else {
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      {/* Left side branding */}
      <div style={{ flex: 1, backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', flexDirection: 'column', padding: '64px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Activity size={48} color="var(--accent-color)" />
          <h1 className="brand-text" style={{ fontSize: '3rem', color: 'white', margin: 0 }}>Christ Hospital</h1>
        </div>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '400px' }}>
          Seamless healthcare management. Unified records. A higher standard of care.
        </p>
      </div>

      {/* Right side login/signup */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px' }}>
          <h2 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {isSignup ? 'Register as a new patient.' : 'Please login to your account.'}
          </p>
          
          <form onSubmit={handleAuth}>
            {error && <div style={{ color: 'white', backgroundColor: 'var(--alert-danger)', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

            {/* Role Toggle (Only for Login) */}
            {!isSignup && (
                <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
                <button
                    type="button"
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', backgroundColor: roleGroup === 'patient' ? 'var(--bg-light)' : 'transparent', fontWeight: roleGroup === 'patient' ? 600 : 400, color: roleGroup === 'patient' ? 'var(--primary-color)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setRoleGroup('patient')}
                >
                    Patient
                </button>
                <button
                    type="button"
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', backgroundColor: roleGroup === 'admin' ? 'var(--bg-light)' : 'transparent', fontWeight: roleGroup === 'admin' ? 600 : 400, color: roleGroup === 'admin' ? 'var(--primary-color)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setRoleGroup('admin')}
                >
                    Staff / Admin
                </button>
                </div>
            )}

            {isSignup && (
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="John Doe"
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="john@example.com"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
                {!isSignup && <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 500 }}>Forgot Password?</span>}
              </div>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '16px' }}>
              {isSignup ? 'Sign Up' : 'Sign In'}
            </button>
            
            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span 
                    style={{ color: 'var(--accent-color)', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => { setIsSignup(!isSignup); setError(''); }}
                >
                    {isSignup ? 'Log in' : 'Sign up'}
                </span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
