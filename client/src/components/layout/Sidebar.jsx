import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, BarChart3, Target, RefreshCcw,
  Receipt, Settings, ChevronLeft, ChevronRight, LogOut, TrendingUp,
  CalendarDays, Users
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const NAV = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/expenses', icon: Wallet, label: 'Expenses' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/subscriptions', icon: RefreshCcw, label: 'Subscriptions' },
  { path: '/groups', icon: Users, label: 'Groups' },
  { path: '/receipts', icon: Receipt, label: 'Receipts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

/* Tooltip that pops to the right on hover (only in collapsed mode) */
function Tooltip({ label, children, show }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {show && hovered && (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              left: 'calc(100% + 12px)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#1c0a36',
              border: '1px solid rgba(255,119,51,0.35)',
              borderRadius: 8,
              padding: '5px 12px',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: '#f1f0f5',
              pointerEvents: 'none',
              zIndex: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            {/* Arrow */}
            <div style={{
              position: 'absolute', left: -5, top: '50%', transform: 'translateY(-50%)',
              width: 8, height: 8, background: '#1c0a36',
              border: '1px solid rgba(255,119,51,0.35)', borderRight: 'none', borderTop: 'none',
              rotate: '45deg',
            }} />
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* User avatar circle showing first letter */
function UserAvatar({ name, size = 32 }) {
  const letter = (name || 'U')[0].toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#FF7733,#A855F7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: 'white', fontFamily: 'Poppins',
    }}>
      {letter}
    </div>
  );
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const collapsed = useSelector(s => s.ui.sidebarCollapsed);
  const user = useSelector(s => s.auth.user);

  const w = collapsed ? 68 : 230;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen shrink-0 z-30"
      style={{
        background: 'linear-gradient(180deg, #120528 0%, #0d0220 100%)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(to right, #FF7733, #FF5D73, #A855F7)',
      }} />

      {/* Logo */}
      <div
        style={{
          display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0 0' : '0 18px',
          height: 64, flexShrink: 0, overflow: 'hidden',
          transition: 'padding 0.3s ease',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg,#FF7733,#A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(255,119,51,0.4)',
        }}>
          <TrendingUp size={17} color="white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
              style={{
                fontFamily: 'Poppins', fontWeight: 800, fontSize: 21, whiteSpace: 'nowrap',
                background: 'linear-gradient(to right,#FF7733,#A855F7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              Budgeto
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ path, icon: Icon, label }) => (
          <Tooltip key={path} label={label} show={collapsed}>
            <NavLink to={path} style={{ display: 'block', textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3, backgroundColor: isActive ? undefined : 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 11,
                    padding: collapsed ? '10px 0' : '9px 12px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    background: isActive ? 'rgba(255,119,51,0.14)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(255,119,51,0.28)' : 'transparent'}`,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  {/* Active left bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, borderRadius: '0 3px 3px 0',
                        background: 'linear-gradient(to bottom, #FF7733, #FF5D73)',
                        boxShadow: '0 0 8px #FF7733',
                      }}
                    />
                  )}

                  {/* Active glow background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      style={{
                        position: 'absolute', inset: 0, borderRadius: 12, pointerEvents: 'none',
                        background: 'radial-gradient(ellipse at 20% 50%, rgba(255,119,51,0.18) 0%, transparent 70%)',
                      }}
                    />
                  )}

                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'rgba(255,119,51,0.2)' : 'rgba(255,255,255,0.04)',
                    transition: 'background 0.2s',
                  }}>
                    <Icon
                      size={17}
                      color={isActive ? '#FF7733' : '#7a6a96'}
                      strokeWidth={isActive ? 2.3 : 1.8}
                    />
                  </div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                        style={{
                          fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#f1f0f5' : '#7a6a96',
                          whiteSpace: 'nowrap', letterSpacing: '0.01em',
                        }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </NavLink>
          </Tooltip>
        ))}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 12px 8px' }} />

      {/* Logout only */}
      <div style={{ padding: '0 8px 16px' }}>
        <Tooltip label="Logout" show={collapsed}>
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,93,115,0.1)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 11, width: '100%',
              padding: collapsed ? '9px 0' : '9px 12px',
              borderRadius: 12, background: 'transparent',
              border: '1px solid transparent', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,93,115,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,93,115,0.1)', flexShrink: 0,
            }}>
              <LogOut size={16} color="#FF5D73" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 13.5, color: '#FF5D73', whiteSpace: 'nowrap', fontWeight: 500 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </Tooltip>
      </div>

      {/* Collapse toggle button */}
      <motion.button
        onClick={() => dispatch(toggleSidebar())}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'absolute', top: '50%', right: -13, transform: 'translateY(-50%)',
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg,#230F41,#130624)',
          border: '1.5px solid rgba(255,119,51,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 50,
          boxShadow: '0 0 16px rgba(255,119,51,0.25), 0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {collapsed
          ? <ChevronRight size={13} color="#FF7733" />
          : <ChevronLeft size={13} color="#FF7733" />
        }
      </motion.button>
    </motion.aside>
  );
}
