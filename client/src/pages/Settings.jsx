import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { User, Shield, Bell, CreditCard, Globe, Plus, X, Check, Lock, Eye, EyeOff, Smartphone, AlertTriangle } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import { setCurrency, fetchRates, addCustomCurrency, CURRENCIES } from '../store/slices/currencySlice';

export default function Settings() {
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const { selected: selectedCurrency, symbol, rates, customCurrencies } = useSelector(s => s.currency);
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 50000);
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('Profile');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const contentRef = useRef(null);

  const allCurrencies = [...CURRENCIES, ...customCurrencies];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCurrencyChange = (code) => {
    dispatch(setCurrency(code));
    dispatch(fetchRates());
  };

  const handleAddCustom = () => {
    if (!customCode.trim() || !customSymbol.trim()) return;
    const newC = {
      code: customCode.toUpperCase().trim(),
      symbol: customSymbol.trim(),
      name: customName.trim() || customCode.toUpperCase(),
      flag: '🌐',
    };
    dispatch(addCustomCurrency(newC));
    dispatch(setCurrency(newC.code));
    dispatch(fetchRates());
    setCustomCode(''); setCustomSymbol(''); setCustomName('');
    setShowCustomModal(false);
  };

  const scrollTo = (label) => {
    setActiveSection(label);
    const container = contentRef.current;
    const el = document.getElementById(`settings-${label.toLowerCase()}`);
    if (!el || !container) return;
    const offset = el.offsetTop - container.offsetTop - 12;
    container.scrollTo({ top: offset, behavior: 'smooth' });
  };

  // Rate in INR: how many INR = 1 unit of this currency
  const inrPerUnit = (code) => {
    if (code === 'INR') return null;
    const rate = rates[code];
    if (!rate || rate === 0) return null;
    return (1 / rate).toFixed(2);
  };

  const sections = [
    { icon: User, label: 'Profile', color: '#FF7733' },
    { icon: Globe, label: 'Currency', color: '#06B6D4' },
    { icon: CreditCard, label: 'Budget', color: '#A855F7' },
    { icon: Bell, label: 'Notifications', color: '#3B82F6' },
    { icon: Shield, label: 'Security', color: '#22C55E' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#9b8cb0', fontSize: 14 }}>Manage your account and preferences</p>
      </motion.div>

      <div className="settings-layout">
        {/* Sidebar nav — sticky */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="glass-card settings-sidebar" style={{ padding: 12 }}>
          {sections.map(({ icon: Icon, label, color }) => {
            const isActive = activeSection === label;
            return (
              <motion.div key={label} whileHover={{ x: 2 }}
                onClick={() => scrollTo(label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                  background: isActive ? `${color}18` : 'transparent',
                  border: `1px solid ${isActive ? `${color}44` : 'transparent'}`,
                  transition: 'all 0.2s',
                }}>
                <Icon size={16} color={isActive ? color : '#9b8cb0'} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? '#f1f0f5' : '#9b8cb0' }}>{label}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Right scrollable column */}
        <div ref={contentRef} className="settings-content">

          {/* Profile */}
          <motion.div id="settings-profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Profile Settings</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#FF7733,#A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white' }}>
                {(name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15 }}>{name || 'Your Name'}</p>
                <p style={{ fontSize: 13, color: '#9b8cb0' }}>{user?.email || 'your@email.com'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Display Name</label>
                <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Email</label>
                <input className="input-field" value={user?.email || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              </div>
            </div>
          </motion.div>

          {/* Currency */}
          <motion.div id="settings-currency" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Globe size={17} color="#06B6D4" />
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16 }}>Currency</h3>
            </div>
            <p style={{ fontSize: 13, color: '#9b8cb0', marginBottom: 16 }}>
              All amounts displayed in selected currency using live exchange rates.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {allCurrencies.map(c => {
                const isSelected = c.code === selectedCurrency;
                const inrVal = inrPerUnit(c.code);
                return (
                  <motion.button key={c.code} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleCurrencyChange(c.code)}
                    style={{
                      padding: '10px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isSelected ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      boxShadow: isSelected ? '0 0 12px rgba(6,182,212,0.2)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 16 }}>{c.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#06B6D4' : '#f1f0f5' }}>{c.symbol}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? '#06B6D4' : '#9b8cb0' }}>{c.code}</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#9b8cb0', marginBottom: inrVal ? 2 : 0 }}>{c.name}</p>
                    {inrVal && (
                      <p style={{ fontSize: 10, color: '#22C55E', fontWeight: 600 }}>
                        1 {c.code} = ₹{inrVal}
                      </p>
                    )}
                  </motion.button>
                );
              })}

              {/* Add custom currency button */}
              <motion.button
                whileHover={{ scale: 1.03, borderColor: 'rgba(168,85,247,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCustomModal(true)}
                style={{
                  padding: '10px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: 'rgba(168,85,247,0.06)',
                  border: '1.5px dashed rgba(168,85,247,0.3)',
                  transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}>
                <Plus size={20} color="#A855F7" />
                <p style={{ fontSize: 11, color: '#A855F7', fontWeight: 600 }}>Add Currency</p>
              </motion.button>
            </div>

            {selectedCurrency !== 'INR' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <p style={{ fontSize: 12, color: '#06B6D4' }}>
                  ✅ Currency set to {selectedCurrency} ({symbol}). All amounts converted from INR using live rates.
                  {inrPerUnit(selectedCurrency) && ` · 1 ${selectedCurrency} = ₹${inrPerUnit(selectedCurrency)}`}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Budget Settings */}
          <motion.div id="settings-budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Budget Settings</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Monthly Budget (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#FF7733', fontWeight: 700 }}>₹</span>
                <input className="input-field" type="number" style={{ paddingLeft: 26 }}
                  value={monthlyBudget} onChange={e => setMonthlyBudget(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 12, display: 'block' }}>Category Budget Alerts</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CATEGORIES.slice(0, 5).map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span>{cat.icon}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{cat.label}</span>
                    <input type="number" placeholder="Budget ₹" style={{ width: 100, background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px',
                      color: '#f1f0f5', fontSize: 12, outline: 'none' }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div id="settings-notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Notifications</h3>
            {['Budget alerts', 'Subscription reminders', 'Weekly spending summary', 'Goal milestone reached'].map((item, i) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 13 }}>{item}</span>
                <ToggleSwitch defaultOn={i < 2} />
              </div>
            ))}
          </motion.div>

          {/* Security */}
          <motion.div id="settings-security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Shield size={17} color="#22C55E" />
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16 }}>Security</h3>
            </div>

            {/* Change Password */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: '#c4b5d4', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={14} color="#22C55E" /> Change Password
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Current Password', 'New Password', 'Confirm New Password'].map((lbl, i) => (
                  <div key={lbl}>
                    <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>{lbl}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="input-field"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={lbl}
                        style={{ paddingRight: i === 0 ? 40 : 12 }}
                      />
                      {i === 0 && (
                        <button onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: '#9b8cb0' }}>
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '10px 20px', borderRadius: 10, cursor: 'pointer', marginTop: 4,
                    background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                    color: '#22C55E', fontWeight: 600, fontSize: 13, alignSelf: 'flex-start' }}>
                  Update Password
                </motion.button>
              </div>
            </div>

            {/* 2FA */}
            <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#c4b5d4', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Smartphone size={14} color="#3B82F6" /> Two-Factor Authentication
                  </h4>
                  <p style={{ fontSize: 12, color: '#9b8cb0' }}>Add an extra layer of security to your account.</p>
                </div>
                <ToggleSwitch defaultOn={false} />
              </div>
            </div>

            {/* Active sessions */}
            <div style={{ paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: '#c4b5d4', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} color="#FF7733" /> Active Sessions
              </h4>
              {[
                { device: 'Chrome on Windows', location: 'India · Current session', time: 'Active now', current: true },
                { device: 'Mobile App · Android', location: 'India', time: '2 days ago', current: false },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: s.current ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={16} color={s.current ? '#22C55E' : '#9b8cb0'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{s.device}</p>
                    <p style={{ fontSize: 11, color: '#9b8cb0' }}>{s.location} · {s.time}</p>
                  </div>
                  {!s.current && (
                    <motion.button whileHover={{ scale: 1.05 }}
                      style={{ fontSize: 11, color: '#FF5D73', background: 'rgba(255,93,115,0.1)', border: '1px solid rgba(255,93,115,0.2)',
                        borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
                      Revoke
                    </motion.button>
                  )}
                  {s.current && <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600 }}>✓ Current</span>}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Save */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave} className="btn-primary"
            style={{ height: 48, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saved ? '✅ Saved!' : 'Save Changes'}
          </motion.button>
        </div>
      </div>

      {/* Custom Currency Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCustomModal(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#1c0a36', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18 }}>Add Custom Currency</h3>
                <button onClick={() => setShowCustomModal(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#9b8cb0' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Currency Code (e.g. CHF)', value: customCode, set: setCustomCode, placeholder: 'CHF' },
                  { label: 'Symbol (e.g. Fr.)', value: customSymbol, set: setCustomSymbol, placeholder: 'Fr.' },
                  { label: 'Name (optional)', value: customName, set: setCustomName, placeholder: 'Swiss Franc' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <input className="input-field" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} />
                  </div>
                ))}
                <p style={{ fontSize: 11, color: '#9b8cb0', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 8, padding: '8px 12px' }}>
                  ℹ️ Exchange rates for custom currencies will use live data if the code is valid (e.g. CHF, THB, MXN).
                </p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAddCustom}
                  disabled={!customCode.trim() || !customSymbol.trim()}
                  style={{ padding: '12px 0', borderRadius: 12, cursor: customCode && customSymbol ? 'pointer' : 'not-allowed',
                    background: customCode && customSymbol ? 'linear-gradient(135deg,#A855F7,#7C3AED)' : 'rgba(255,255,255,0.1)',
                    border: 'none', color: customCode && customSymbol ? 'white' : '#9b8cb0',
                    fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Check size={16} /> Add Currency
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <motion.button onClick={() => setOn(!on)}
      style={{ width: 44, height: 24, borderRadius: 99, background: on ? 'linear-gradient(135deg,#FF7733,#FF5D73)' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center',
        justifyContent: on ? 'flex-end' : 'flex-start', transition: 'background 0.2s', flexShrink: 0 }}>
      <motion.div animate={{ x: 0 }} style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
    </motion.button>
  );
}
