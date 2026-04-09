import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { X, Wallet, Calendar, FileText, CreditCard } from 'lucide-react';
import { setShowAddExpense } from '../../store/slices/uiSlice';
import { addExpense } from '../../store/slices/expensesSlice';
import { CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import api from '../../services/api';

export default function AddExpenseModal() {
  const dispatch = useDispatch();
  const isAuth = useSelector(s => s.auth.isAuthenticated);
  const [form, setForm] = useState({
    amount: '', category: 'Food', description: '', paymentMethod: 'UPI',
    type: 'expense', date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(form.amount)) return;
    setLoading(true);
    try {
      if (isAuth) {
        const { data } = await api.post('/expenses', { ...form, amount: parseFloat(form.amount) });
        dispatch(addExpense(data));
      } else {
        dispatch(addExpense({
          _id: `local-${Date.now()}`, ...form, amount: parseFloat(form.amount),
          date: new Date(form.date).toISOString(), createdAt: new Date().toISOString()
        }));
      }
      dispatch(setShowAddExpense(false));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="overlay"
        onClick={() => dispatch(setShowAddExpense(false))}
        style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }} transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
            padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20 }}>Add Transaction</h2>
              <p style={{ fontSize: 13, color: '#9b8cb0', marginTop: 2 }}>Record a new expense or income</p>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} onClick={() => dispatch(setShowAddExpense(false))}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#9b8cb0' }}>
              <X size={18} />
            </motion.button>
          </div>

          {/* Type Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? 'Other' : 'Food' }))}
                style={{ flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: form.type === t ? (t === 'expense' ? 'linear-gradient(135deg,#FF7733,#FF5D73)' : 'linear-gradient(135deg,#22C55E,#10B981)') : 'transparent',
                  color: form.type === t ? 'white' : '#9b8cb0', transition: 'all 0.2s' }}>
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Amount */}
            <div>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Amount (₹)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#FF7733', fontWeight: 700, fontSize: 16 }}>₹</span>
                <input className="input-field" style={{ paddingLeft: 30, fontSize: 22, fontWeight: 700, height: 52 }}
                  type="number" placeholder="0" value={form.amount} onChange={e => set('amount', e.target.value)} required />
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 8, display: 'block' }}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(form.type === 'income' ? CATEGORIES.filter(c => ['Investment', 'Other'].includes(c.id)) : CATEGORIES.slice(0, 8)).map(cat => (
                  <motion.button key={cat.id} type="button" whileHover={{ scale: 1.05 }} onClick={() => set('category', cat.id)}
                    style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${form.category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
                      background: form.category === cat.id ? `${cat.color}22` : 'rgba(255,255,255,0.04)',
                      color: form.category === cat.id ? cat.color : '#9b8cb0', fontSize: 12, cursor: 'pointer', fontWeight: form.category === cat.id ? 600 : 400 }}>
                    {cat.icon} {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Description & Date row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Description</label>
                <input className="input-field" placeholder="e.g. Swiggy order" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Date</label>
                <input className="input-field" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Payment Method</label>
              <select className="input-field" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
                style={{ cursor: 'pointer' }}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m} style={{ background: '#1c0a36' }}>{m}</option>)}
              </select>
            </div>

            {/* Submit */}
            <motion.button type="submit" className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ marginTop: 8, height: 48, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              disabled={loading}>
              {loading ? '...' : `Add ${form.type === 'expense' ? 'Expense' : 'Income'}`}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
