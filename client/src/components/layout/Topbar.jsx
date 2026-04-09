import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Bell, X, LogOut, Settings, User, Menu } from 'lucide-react';
import { setShowAddExpense, toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const NOTIFICATIONS = [
  { id: 1, icon: '⚠️', text: 'Food budget at 80% this month', time: '2h ago', color: '#FF7733' },
  { id: 2, icon: '🎯', text: 'Goal "Vacation" is 60% funded!', time: '1d ago', color: '#A855F7' },
  { id: 3, icon: '🔄', text: 'Netflix renewal in 3 days', time: '2d ago', color: '#3B82F6' },
];

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [search, setSearch] = useState('');
  const userRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header style={{
      height: 64, background: 'rgba(10,1,24,0.9)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 10, position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
    }}>

      {/* Mobile hamburger */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => dispatch(toggleSidebar())}
        style={{
          display: 'none', width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
        className="mobile-menu-btn"
      >
        <Menu size={17} color="#9b8cb0" />
      </motion.button>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <Search size={15} color="#9b8cb0" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="input-field"
          style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
          placeholder="Search expenses, categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Add Expense */}
      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13, flexShrink: 0, whiteSpace: 'nowrap' }}
        onClick={() => dispatch(setShowAddExpense(true))}
      >
        <Plus size={16} />
        <span className="hide-xs">Add Expense</span>
      </motion.button>

      {/* Notifications */}
      <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
          style={{
            width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', position: 'relative',
          }}
        >
          <Bell size={16} color="#9b8cb0" />
          <span style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#FF7733' }} />
        </motion.button>

        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 48, right: 0, width: 300,
                background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 100,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b8cb0' }}>
                  <X size={14} />
                </button>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 18 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: '#f1f0f5', lineHeight: 1.5 }}>{n.text}</p>
                    <p style={{ fontSize: 11, color: '#9b8cb0', marginTop: 2 }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User avatar + dropdown */}
      <div ref={userRef} style={{ position: 'relative', flexShrink: 0 }}>
        <motion.button
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
          onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
          style={{
            width: 38, height: 38, borderRadius: 10, cursor: 'pointer',
            background: 'linear-gradient(135deg,#FF7733,#A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white',
            border: showUser ? '2px solid rgba(255,119,51,0.6)' : '2px solid transparent',
            transition: 'border-color 0.2s',
          }}
        >
          {initials}
        </motion.button>

        <AnimatePresence>
          {showUser && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 48, right: 0, width: 240,
                background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 100,
              }}
            >
              {/* User info header */}
              <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg,#FF7733,#A855F7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: 'white',
                  }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f0f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name || 'User'}
                    </p>
                    <p style={{ fontSize: 11, color: '#7a6a96', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding: 8 }}>
                {[
                  { icon: User, label: 'Profile', onClick: () => { navigate('/settings'); setShowUser(false); } },
                  { icon: Settings, label: 'Settings', onClick: () => { navigate('/settings'); setShowUser(false); } },
                ].map(({ icon: Icon, label, onClick }) => (
                  <motion.button key={label} whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onClick={onClick}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 10px', borderRadius: 10, cursor: 'pointer',
                      background: 'transparent', border: 'none', color: '#c4b5d4', fontSize: 13, textAlign: 'left',
                    }}
                  >
                    <Icon size={15} />
                    {label}
                  </motion.button>
                ))}

                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '6px 0' }} />

                <motion.button
                  whileHover={{ backgroundColor: 'rgba(255,93,115,0.1)' }}
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '9px 10px', borderRadius: 10, cursor: 'pointer',
                    background: 'transparent', border: 'none', color: '#FF5D73', fontSize: 13, textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  <LogOut size={15} />
                  Logout
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
