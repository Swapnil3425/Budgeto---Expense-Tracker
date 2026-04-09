import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, X, Target, Edit } from 'lucide-react';
import { addGoal, removeGoal, updateGoal, setGoals } from '../store/slices/goalsSlice';
import { formatINR } from '../utils/constants';
import ConfirmModal from '../components/modals/ConfirmModal';

const ICONS = ['💻', '🏖️', '🛡️', '🚗', '📱', '🏠', '💍', '✈️', '🎓', '🎯'];
const COLORS = ['#FF7733', '#22C55E', '#3B82F6', '#A855F7', '#FF5D73', '#F59E0B'];

export default function Goals() {
  const dispatch = useDispatch();
  const allGoals = useSelector(s => s.goals.list);
  const [showAdd, setShowAdd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const initialForm = { title: '', targetAmount: '', currentAmount: '', deadline: '', icon: '🎯', color: '#FF7733' };
  const [form, setForm] = useState(initialForm);
  const [contributeId, setContributeId] = useState(null);
  const [contributeAmt, setContributeAmt] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAddModal = () => {
    setIsEditing(false);
    setEditId(null);
    setForm(initialForm);
    setShowAdd(true);
  };

  const openEditModal = (goal) => {
    setIsEditing(true);
    setEditId(goal._id);
    setForm({ ...goal });
    setShowAdd(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (isEditing) {
      dispatch(updateGoal({ _id: editId, ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount || 0) }));
    } else {
      dispatch(addGoal({ _id: Date.now().toString(), ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount || 0) }));
    }
    setShowAdd(false);
    setForm(initialForm);
  };

  const handleContribute = (goal) => {
    const amt = parseFloat(contributeAmt);
    if (!amt) return;
    dispatch(updateGoal({ ...goal, currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amt) }));
    setContributeId(null);
    setContributeAmt('');
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Savings Goals</h1>
          <p style={{ color: '#9b8cb0', fontSize: 14 }}>Track progress towards your financial targets</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px' }}
          onClick={openAddModal}>
          <Plus size={16} /> New Goal
        </motion.button>
      </motion.div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Goals', value: allGoals.length, color: '#FF7733', icon: '🎯' },
          { label: 'Total Target', value: formatINR(allGoals.reduce((s,g) => s + g.targetAmount, 0)), color: '#A855F7', icon: '💰' },
          { label: 'Total Saved', value: formatINR(allGoals.reduce((s,g) => s + g.currentAmount, 0)), color: '#22C55E', icon: '✅' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 11, color: '#9b8cb0' }}>{s.label}</p>
              <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {allGoals.map((goal, i) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
          return (
            <motion.div key={goal._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card" style={{ padding: 22, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEditModal(goal)} title="Edit Goal"
                  style={{ background: 'rgba(168,85,247,0.15)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#A855F7' }}>
                  <Edit size={12} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setItemToDelete(goal._id)} title="Delete Goal"
                  style={{ background: 'rgba(255,93,115,0.15)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#FF5D73' }}>
                  <X size={12} />
                </motion.button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 28, width: 48, height: 48, borderRadius: 12, background: `${goal.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{goal.icon}</div>
                <div>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16 }}>{goal.title}</h3>
                  {daysLeft !== null && (
                    <span style={{ fontSize: 11, color: daysLeft < 30 ? '#FF5D73' : '#9b8cb0' }}>
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: goal.color }}>{formatINR(goal.currentAmount)}</span>
                  <span style={{ fontSize: 12, color: '#9b8cb0' }}>of {formatINR(goal.targetAmount)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    style={{ height: '100%', borderRadius: 99, background: `linear-gradient(to right, ${goal.color}, ${goal.color}99)`,
                      boxShadow: `0 0 8px ${goal.color}66` }} />
                </div>
                <div style={{ textAlign: 'right', marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: goal.color }}>{pct}%</span>
                </div>
              </div>

              {pct < 100 && (
                contributeId === goal._id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input-field" style={{ height: 34, fontSize: 13 }} type="number"
                      placeholder="Amount ₹" value={contributeAmt} onChange={e => setContributeAmt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleContribute(goal)} autoFocus />
                    <motion.button whileHover={{ scale: 1.04 }} className="btn-primary" style={{ padding: '6px 12px', fontSize: 12, flexShrink: 0 }}
                      onClick={() => handleContribute(goal)}>Add</motion.button>
                    <button onClick={() => setContributeId(null)} style={{ background: 'none', border: 'none', color: '#9b8cb0', cursor: 'pointer' }}><X size={14} /></button>
                  </div>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => setContributeId(goal._id)}
                    style={{ width: '100%', padding: '8px 0', borderRadius: 10, background: `${goal.color}15`,
                      border: `1px solid ${goal.color}30`, color: goal.color, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    + Add Savings
                  </motion.button>
                )
              )}
              {pct >= 100 && (
                <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 13, color: '#22C55E', fontWeight: 700 }}>🎉 Goal Achieved!</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20 }}>{isEditing ? 'Edit Goal' : 'New Savings Goal'}</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b8cb0' }}><X size={18} /></button>
              </div>
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Icon row */}
                <div>
                  <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 8, display: 'block' }}>Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => set('icon', ic)}
                        style={{ fontSize: 20, width: 38, height: 38, borderRadius: 8, cursor: 'pointer',
                          background: form.icon === ic ? 'rgba(255,119,51,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${form.icon === ic ? '#FF7733' : 'rgba(255,255,255,0.1)'}` }}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Goal Title</label>
                  <input className="input-field" placeholder="e.g. Buy Laptop" value={form.title} onChange={e => set('title', e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Target ₹</label>
                    <input className="input-field" type="number" placeholder="80000" value={form.targetAmount} onChange={e => set('targetAmount', e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Saved so far ₹</label>
                    <input className="input-field" type="number" placeholder="0" value={form.currentAmount} onChange={e => set('currentAmount', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Deadline</label>
                  <input className="input-field" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 8, display: 'block' }}>Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => set('color', c)}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                          border: form.color === c ? '3px solid white' : '2px solid transparent' }} />
                    ))}
                  </div>
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.02 }} className="btn-primary" style={{ height: 46, fontWeight: 700 }}>
                  {isEditing ? 'Save Changes' : 'Create Goal'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => dispatch(removeGoal(itemToDelete))}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
      />
    </div>
  );
}
