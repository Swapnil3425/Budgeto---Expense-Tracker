import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, X, RefreshCcw, Trash2, Edit } from 'lucide-react';
import { addSubscription, removeSubscription, updateSubscription } from '../store/slices/budgetSlice';
import { formatINR } from '../utils/constants';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function Subscriptions() {
  const dispatch = useDispatch();
  const allSubs = useSelector(s => s.budget.subscriptions);
  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const initialForm = { name: '', amount: '', frequency: 'monthly', icon: '📱', color: '#FF7733', category: 'Entertainment', nextBilling: '' };
  const [form, setForm] = useState(initialForm);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setForm(initialForm);
    setShowAdd(true);
  };

  const openEditModal = (sub) => {
    setIsEditing(true);
    setEditId(sub._id);
    setForm({ ...sub });
    setShowAdd(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(updateSubscription({ _id: editId, ...form, amount: parseFloat(form.amount) }));
    } else {
      dispatch(addSubscription({ _id: Date.now().toString(), ...form, amount: parseFloat(form.amount) }));
    }
    setShowAdd(false);
    setForm(initialForm);
  };

  const totalMonthly = allSubs.reduce((s, sub) => {
    if (sub.frequency === 'monthly') return s + sub.amount;
    if (sub.frequency === 'yearly') return s + sub.amount / 12;
    if (sub.frequency === 'weekly') return s + sub.amount * 4;
    return s;
  }, 0);

  const ICONS_LIST = ['🎬', '🎵', '📦', '☁️', '📝', '🐱', '📱', '🎮', '📺', '🌐'];

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Subscriptions</h1>
          <p style={{ color: '#9b8cb0', fontSize: 14 }}>Track your recurring payments</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={openAddModal}>
          <Plus size={16} /> Add Subscription
        </motion.button>
      </motion.div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Monthly Total', value: formatINR(Math.round(totalMonthly)), color: '#FF7733', icon: '💸' },
          { label: 'Active Subscriptions', value: allSubs.length, color: '#A855F7', icon: '🔄' },
          { label: 'Yearly Cost', value: formatINR(Math.round(totalMonthly * 12)), color: '#FF5D73', icon: '📅' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subscriptions grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {allSubs.map((sub, i) => {
          const daysLeft = sub.nextBilling ? Math.ceil((new Date(sub.nextBilling) - new Date()) / (1000*60*60*24)) : null;
          return (
            <motion.div key={sub._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card" style={{ padding: 20, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEditModal(sub)} title="Edit Subscription"
                  style={{ background: 'rgba(168,85,247,0.15)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#A855F7' }}>
                  <Edit size={12} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setItemToDelete(sub._id)} title="Delete Subscription"
                  style={{ background: 'rgba(255,93,115,0.15)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#FF5D73' }}>
                  <Trash2 size={12} />
                </motion.button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${sub.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {sub.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 15 }}>{sub.name}</h3>
                  <span style={{ fontSize: 11, color: '#9b8cb0', textTransform: 'capitalize' }}>{sub.frequency} · {sub.category}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 20, color: sub.color }}>{formatINR(sub.amount)}</p>
                  <p style={{ fontSize: 11, color: '#9b8cb0' }}>per {sub.frequency === 'weekly' ? 'week' : sub.frequency === 'monthly' ? 'month' : 'year'}</p>
                </div>
                {daysLeft !== null && (
                  <div style={{ textAlign: 'right', padding: '4px 10px', borderRadius: 20,
                    background: daysLeft <= 5 ? 'rgba(255,93,115,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${daysLeft <= 5 ? 'rgba(255,93,115,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                    <p style={{ fontSize: 10, color: '#9b8cb0' }}>Next billing</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: daysLeft <= 5 ? '#FF5D73' : '#f1f0f5' }}>
                      {daysLeft > 0 ? `${daysLeft}d` : 'Today'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20 }}>{isEditing ? 'Edit Subscription' : 'Add Subscription'}</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b8cb0' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Service Name</label>
                  <input className="input-field" placeholder="e.g. Netflix" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Amount ₹</label>
                    <input className="input-field" type="number" placeholder="649" value={form.amount} onChange={e => set('amount', e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Frequency</label>
                    <select className="input-field" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Next Billing Date</label>
                  <input className="input-field" type="date" value={form.nextBilling} onChange={e => set('nextBilling', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 8, display: 'block' }}>Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ICONS_LIST.map(ic => (
                      <button key={ic} type="button" onClick={() => set('icon', ic)}
                        style={{ fontSize: 18, width: 34, height: 34, borderRadius: 7, cursor: 'pointer',
                          background: form.icon === ic ? 'rgba(255,119,51,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${form.icon === ic ? '#FF7733' : 'rgba(255,255,255,0.1)'}` }}>{ic}</button>
                    ))}
                  </div>
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} className="btn-primary" style={{ height: 46, fontWeight: 700, marginTop: 4 }}>
                  {isEditing ? 'Save Changes' : 'Add Subscription'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => dispatch(removeSubscription(itemToDelete))}
        title="Delete Subscription"
        message="Are you sure you want to delete this subscription? This action cannot be undone."
      />
    </div>
  );
}
