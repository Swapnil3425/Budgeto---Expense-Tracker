import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, Home } from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';
import api from '../services/api';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  // Demo mode – skip backend
  const handleDemo = () => {
    dispatch(setCredentials({
      token: 'demo-token',
      user: { id: 'demo', name: 'Demo User', email: 'demo@budgeto.app', currency: '₹', monthlyBudget: 50000 }
    }));
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0118', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Home button */}
      <Link to="/" style={{ position: 'fixed', top: 20, left: 20, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
        padding: '8px 14px', color: '#d4c8e8', fontSize: 13, fontWeight: 500, textDecoration: 'none',
        backdropFilter: 'blur(8px)', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
        <Home size={15} /> Home
      </Link>
      {/* Background blobs */}
      <div style={{ position: 'fixed', top: '10%', left: '10%', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,119,51,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg,#FF7733,#A855F7)', borderRadius: 12, padding: 9 }}>
            <TrendingUp size={22} color="white" />
          </div>
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 24,
            background: 'linear-gradient(to right,#FF7733,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Budgeto
          </span>
        </div>

        <div className="glass" style={{ padding: 32 }}>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 24, marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: '#9b8cb0', fontSize: 14, marginBottom: 28 }}>Start tracking your expenses smarter</p>

          {error && (
            <div style={{ background: 'rgba(255,93,115,0.1)', border: '1px solid rgba(255,93,115,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#FF5D73' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="#9b8cb0" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="input-field" style={{ paddingLeft: 34 }} placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#9b8cb0" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="input-field" style={{ paddingLeft: 34 }} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#9b8cb0" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="input-field" style={{ paddingLeft: 34, paddingRight: 40 }} type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9b8cb0' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary" style={{ height: 48, fontSize: 15, fontWeight: 700, marginTop: 6 }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: '#9b8cb0' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-secondary" style={{ width: '100%', height: 44, fontSize: 14, fontWeight: 600 }} onClick={handleDemo}>
            🚀 Try Demo (No Sign-up)
          </motion.button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#9b8cb0', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#FF7733', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
