import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Trash2, Plus, Pencil, X, ChevronDown, Check } from 'lucide-react';
import { removeExpense, updateExpense } from '../store/slices/expensesSlice';
import { setShowAddExpense } from '../store/slices/uiSlice';
import { getCategoryInfo, formatINR, formatAmount, CATEGORIES, PAYMENT_METHODS } from '../utils/constants';
import api from '../services/api';
import ConfirmModal from '../components/modals/ConfirmModal';

/* ── Custom styled dropdown ──────────────────────────── */
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 36, padding: '0 12px', borderRadius: 10, cursor: 'pointer',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#f1f0f5', fontSize: 13, whiteSpace: 'nowrap',
        }}
      >
        {selected.label}
        <ChevronDown size={13} color="#9b8cb0" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
              background: '#1a073a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, overflow: 'hidden', minWidth: '100%',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                  color: opt.value === value ? '#FF7733' : '#d4c8e8',
                  background: opt.value === value ? 'rgba(255,119,51,0.1)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (opt.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (opt.value !== value) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.label}
                {opt.value === value && <Check size={13} color="#FF7733" />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />}
    </div>
  );
}

/* ── Edit Expense Modal ──────────────────────────────── */
function EditExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: expense.amount,
    category: expense.category,
    description: expense.description || '',
    paymentMethod: expense.paymentMethod || 'UPI',
    type: expense.type || 'expense',
    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...expense, ...form, amount: parseFloat(form.amount) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20 }}>Edit Transaction</h2>
            <p style={{ fontSize: 13, color: '#9b8cb0', marginTop: 2 }}>Update the transaction details</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#9b8cb0' }}>
            <X size={18} />
          </button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
          {['expense', 'income'].map(t => (
            <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: t === 'income' ? 'Other' : 'Food' }))} style={{
              flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              background: form.type === t ? (t === 'expense' ? 'linear-gradient(135deg,#FF7733,#FF5D73)' : 'linear-gradient(135deg,#22C55E,#10B981)') : 'transparent',
              color: form.type === t ? 'white' : '#9b8cb0', transition: 'all 0.2s',
            }}>
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
              <input className="input-field" style={{ paddingLeft: 30, fontSize: 20, fontWeight: 700, height: 50 }}
                type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
          </div>

          {/* Category chips */}
          <div>
            <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 8, display: 'block' }}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {(form.type === 'income' ? CATEGORIES.filter(c => ['Investment', 'Other'].includes(c.id)) : CATEGORIES.slice(0, 8)).map(cat => (
                <button key={cat.id} type="button" onClick={() => set('category', cat.id)}
                  style={{
                    padding: '5px 11px', borderRadius: 20, cursor: 'pointer', fontSize: 12,
                    border: `1px solid ${form.category === cat.id ? cat.color : 'rgba(255,255,255,0.1)'}`,
                    background: form.category === cat.id ? `${cat.color}22` : 'rgba(255,255,255,0.04)',
                    color: form.category === cat.id ? cat.color : '#9b8cb0', fontWeight: form.category === cat.id ? 600 : 400,
                  }}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description + Date */}
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
            <select className="input-field" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} style={{ cursor: 'pointer', background: '#1a073a' }}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m} style={{ background: '#1a073a' }}>{m}</option>)}
            </select>
          </div>

          <motion.button type="submit" className="btn-primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ marginTop: 8, height: 48, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Save Changes
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Expenses Page ──────────────────────────────── */
const CAT_OPTIONS = [
  { value: 'All', label: 'All Categories' },
  ...CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` })),
];

const TYPE_OPTIONS = [
  { value: 'All', label: 'All Types' },
  { value: 'expense', label: '💸 Expense' },
  { value: 'income', label: '💰 Income' },
];

export default function Expenses() {
  const dispatch = useDispatch();
  const expenses = useSelector(s => s.expenses.list);
  const isAuth = useSelector(s => s.auth.isAuthenticated);
  const { selected: currencyCode, symbol, rates } = useSelector(s => s.currency);
  const fmt = (v) => formatAmount(v, currencyCode, rates, symbol);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [editTarget, setEditTarget] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || e.category === catFilter;
    const matchType = typeFilter === 'All' || e.type === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (isAuth && !String(itemToDelete).startsWith('mock-') && !String(itemToDelete).startsWith('local-')) {
        await api.delete(`/expenses/${itemToDelete}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
    dispatch(removeExpense(itemToDelete));
    setItemToDelete(null);
  };

  const handleEdit = async (updated) => {
    try {
      if (isAuth && !String(updated._id).startsWith('mock-') && !String(updated._id).startsWith('local-')) {
        const { data } = await api.put(`/expenses/${updated._id}`, updated);
        dispatch(updateExpense(data));
      } else {
        dispatch(updateExpense(updated));
      }
    } catch (err) {
      console.error('Edit error:', err);
      dispatch(updateExpense(updated));
    }
    setEditTarget(null);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Expenses</h1>
        <p style={{ color: '#9b8cb0', fontSize: 14 }}>Manage and track all your transactions</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card" style={{ padding: 16, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color="#9b8cb0" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input-field" style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
            placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CustomSelect value={catFilter} onChange={setCatFilter} options={CAT_OPTIONS} />
        <CustomSelect value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
        <motion.button whileHover={{ scale: 1.04 }} className="btn-primary"
          style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, height: 36 }}
          onClick={() => dispatch(setShowAddExpense(true))}>
          <Plus size={14} /> Add
        </motion.button>
      </motion.div>

      {/* Summary row */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Expenses', value: filtered.filter(e => e.type==='expense').reduce((s,e) => s+e.amount,0), color: '#FF5D73' },
          { label: 'Total Income', value: filtered.filter(e => e.type==='income').reduce((s,e) => s+e.amount,0), color: '#22C55E' },
          { label: 'Net Balance', value: filtered.reduce((s,e) => e.type==='income' ? s+e.amount : s-e.amount, 0), color: '#A855F7' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '14px 18px' }}>
            <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: s.color }}>{fmt(Math.abs(s.value))}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Date', 'Description', 'Category', 'Payment', 'Amount', 'Actions'].map(col => (
                  <th key={col} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11,
                    fontWeight: 600, color: '#9b8cb0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((exp, i) => {
                  const cat = getCategoryInfo(exp.category);
                  return (
                    <motion.tr key={exp._id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#9b8cb0' }}>
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{exp.description || '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                          background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                          {cat.icon} {cat.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#9b8cb0' }}>{exp.paymentMethod}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 14,
                        color: exp.type === 'income' ? '#22C55E' : '#f1f0f5' }}>
                        {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {/* Edit button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditTarget(exp)}
                            title="Edit"
                            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#A855F7', display: 'flex', alignItems: 'center' }}>
                            <Pencil size={12} />
                          </motion.button>
                          {/* Delete button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setItemToDelete(exp._id)}
                            title="Delete"
                            style={{ background: 'rgba(255,93,115,0.15)', border: '1px solid rgba(255,93,115,0.25)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#FF5D73', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={12} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#9b8cb0' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p>No transactions found</p>
            </div>
          )}
        </div>
      </motion.div>



      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <EditExpenseModal
            expense={editTarget}
            onClose={() => setEditTarget(null)}
            onSave={handleEdit}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}
