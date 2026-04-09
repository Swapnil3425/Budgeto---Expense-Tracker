import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Plus, Trash2, ChevronDown, ChevronUp, X, Check, DollarSign } from 'lucide-react';
import { addGroup, removeGroup, addGroupExpense, settleBalance } from '../store/slices/groupsSlice';
import { formatAmount, CATEGORIES } from '../utils/constants';
import api from '../services/api';

function computeBalances(group, currentUserName) {
  // Per-member net balance: positive = owed to them, negative = they owe
  const balances = {};
  group.members.forEach(m => { balances[m.name] = 0; });
  balances[currentUserName] = balances[currentUserName] || 0;

  group.expenses.filter(e => !e.settled).forEach(exp => {
    const splitCount = exp.splitAmong?.length || group.members.length + 1;
    const share = exp.amount / splitCount;
    // Payer is owed by everyone else
    const payerName = exp.paidBy;
    if (balances[payerName] === undefined) balances[payerName] = 0;
    balances[payerName] += exp.amount - share; // payer gets back all except their own share
    // Others owe their share
    exp.splitAmong?.forEach(p => {
      if (p.name !== payerName) {
        if (balances[p.name] === undefined) balances[p.name] = 0;
        balances[p.name] -= share;
      }
    });
  });
  return balances;
}

export default function Groups() {
  const dispatch = useDispatch();
  const groups = useSelector(s => s.groups.list);
  const isAuth = useSelector(s => s.auth.isAuthenticated);
  const user = useSelector(s => s.auth.user);
  const { selected: currencyCode, symbol, rates } = useSelector(s => s.currency);
  const fmt = (v) => formatAmount(Math.abs(v), currencyCode, rates, symbol);

  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [membersRaw, setMembersRaw] = useState('');
  const [creating, setCreating] = useState(false);

  const [expandedGroup, setExpandedGroup] = useState(null);
  const [showAddExp, setShowAddExp] = useState(null); // groupId
  const [expForm, setExpForm] = useState({ description: '', amount: '', paidBy: '', category: 'Food' });

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setCreating(true);
    const memberList = membersRaw.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, email: '' }));
    // Add self as member
    const selfName = user?.name || 'You';
    const allMembers = [{ name: selfName, email: user?.email || '' }, ...memberList];
    const newGroup = {
      _id: `local-grp-${Date.now()}`,
      name: groupName.trim(),
      members: allMembers,
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    try {
      if (isAuth) {
        const { data } = await api.post('/groups', { name: newGroup.name, members: allMembers });
        dispatch(addGroup(data));
      } else {
        dispatch(addGroup(newGroup));
      }
    } catch {
      dispatch(addGroup(newGroup));
    }
    setGroupName(''); setMembersRaw(''); setShowCreate(false); setCreating(false);
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      if (isAuth && !String(groupId).startsWith('local-')) await api.delete(`/groups/${groupId}`);
    } catch {}
    dispatch(removeGroup(groupId));
  };

  const handleAddExp = async (group) => {
    if (!expForm.description || !expForm.amount) return;
    const paidBy = expForm.paidBy || (user?.name || 'You');
    const splitAmong = group.members.map(m => ({ name: m.name, share: parseFloat(expForm.amount) / group.members.length }));
    const expense = {
      _id: `local-exp-${Date.now()}`,
      description: expForm.description,
      amount: parseFloat(expForm.amount),
      paidBy,
      splitAmong,
      category: expForm.category,
      date: new Date().toISOString(),
      settled: false,
    };
    try {
      if (isAuth && !String(group._id).startsWith('local-')) {
        const { data } = await api.post(`/groups/${group._id}/expenses`, expense);
        dispatch(addGroupExpense({ groupId: group._id, expense: data.expenses.at(-1) }));
      } else {
        dispatch(addGroupExpense({ groupId: group._id, expense }));
      }
    } catch {
      dispatch(addGroupExpense({ groupId: group._id, expense }));
    }
    setExpForm({ description: '', amount: '', paidBy: '', category: 'Food' });
    setShowAddExp(null);
  };

  const selfName = user?.name || 'You';

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Split Expenses</h1>
            <p style={{ color: '#9b8cb0', fontSize: 14 }}>Create groups, split bills, and settle up easily</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary"
            onClick={() => setShowCreate(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13 }}>
            <Plus size={15} /> New Group
          </motion.button>
        </div>
      </motion.div>

      {/* Create Group Panel */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -12, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }} transition={{ duration: 0.25 }}
            className="glass-card" style={{ padding: 24, marginBottom: 20, overflow: 'hidden', border: '1px solid rgba(255,119,51,0.25)' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Create New Group</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Group Name</label>
                <input className="input-field" placeholder="e.g. Goa Trip" value={groupName} onChange={e => setGroupName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 6, display: 'block' }}>Members (comma-separated)</label>
                <input className="input-field" placeholder="e.g. Rahul, Priya, Amit" value={membersRaw} onChange={e => setMembersRaw(e.target.value)} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 14 }}>You ({selfName}) are automatically added as a member.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <motion.button whileHover={{ scale: 1.02 }} className="btn-primary"
                onClick={handleCreateGroup} disabled={creating}
                style={{ padding: '9px 22px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} /> {creating ? 'Creating...' : 'Create Group'}
              </motion.button>
              <button onClick={() => setShowCreate(false)}
                style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9b8cb0', cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups List */}
      {groups.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: 48, textAlign: 'center', color: '#9b8cb0' }}>
          <p style={{ fontSize: 44, marginBottom: 12 }}>👥</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No groups yet</p>
          <p style={{ fontSize: 13 }}>Create a group to start splitting expenses with friends</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groups.map((group, gi) => {
            const totalSpent = group.expenses.reduce((s, e) => s + e.amount, 0);
            const balances = computeBalances(group, selfName);
            const myBalance = balances[selfName] || 0;
            const isExpanded = expandedGroup === group._id;

            return (
              <motion.div key={group._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.06 }}
                className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Group header */}
                <div style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                  onClick={() => setExpandedGroup(isExpanded ? null : group._id)}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#FF7733,#A855F7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={20} color="white" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16 }}>{group.name}</p>
                    <p style={{ fontSize: 12, color: '#9b8cb0' }}>
                      {group.members.length} members · {group.expenses.length} expenses · {fmt(totalSpent)} total
                    </p>
                  </div>
                  {/* My balance badge */}
                  <div style={{ textAlign: 'right', paddingRight: 8 }}>
                    <p style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 2 }}>
                      {myBalance >= 0 ? 'You are owed' : 'You owe'}
                    </p>
                    <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 15,
                      color: myBalance >= 0 ? '#22C55E' : '#FF5D73' }}>
                      {fmt(myBalance)}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color="#9b8cb0" /> : <ChevronDown size={16} color="#9b8cb0" />}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ padding: '16px 22px 22px' }}>
                        {/* Member balances */}
                        <div style={{ marginBottom: 20 }}>
                          <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balances</p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {group.members.map(m => {
                              const bal = balances[m.name] || 0;
                              return (
                                <div key={m.name} style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${bal >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(255,93,115,0.25)'}` }}>
                                  <p style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</p>
                                  <p style={{ fontSize: 13, fontWeight: 700, color: bal >= 0 ? '#22C55E' : '#FF5D73' }}>
                                    {bal >= 0 ? '+' : '-'}{fmt(bal)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Expenses */}
                        <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Expenses
                        </p>
                        {group.expenses.length === 0 ? (
                          <p style={{ fontSize: 13, color: '#9b8cb0', marginBottom: 16 }}>No expenses added yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                            {group.expenses.map(exp => (
                              <div key={exp._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                                background: exp.settled ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${exp.settled ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: 13, fontWeight: 500, textDecoration: exp.settled ? 'line-through' : 'none',
                                    color: exp.settled ? '#9b8cb0' : '#f1f0f5' }}>{exp.description}</p>
                                  <p style={{ fontSize: 11, color: '#9b8cb0' }}>
                                    Paid by {exp.paidBy} · {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                  </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontWeight: 700, fontSize: 14, color: '#FF7733' }}>{fmt(exp.amount)}</p>
                                  <p style={{ fontSize: 10, color: '#9b8cb0' }}>
                                    {fmt(exp.amount / group.members.length)} each
                                  </p>
                                </div>
                                {exp.settled ? (
                                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>Settled</span>
                                ) : (
                                  <motion.button whileHover={{ scale: 1.05 }}
                                    onClick={() => dispatch(settleBalance({ groupId: group._id, expenseId: exp._id }))}
                                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8,
                                      padding: '4px 10px', cursor: 'pointer', color: '#22C55E', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Check size={11} /> Settle
                                  </motion.button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add expense form */}
                        <AnimatePresence>
                          {showAddExp === group._id ? (
                            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              style={{ padding: 16, borderRadius: 12, background: 'rgba(255,119,51,0.06)', border: '1px solid rgba(255,119,51,0.2)', marginBottom: 12 }}>
                              <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Add Split Expense</p>
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                                <div>
                                  <label style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 4, display: 'block' }}>Description</label>
                                  <input className="input-field" style={{ padding: '8px 12px' }} placeholder="e.g. Dinner"
                                    value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 4, display: 'block' }}>Amount (₹)</label>
                                  <input className="input-field" style={{ padding: '8px 12px' }} type="number" placeholder="0"
                                    value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 4, display: 'block' }}>Paid By</label>
                                  <select className="input-field" style={{ padding: '8px 12px', cursor: 'pointer', background: '#1a073a' }}
                                    value={expForm.paidBy} onChange={e => setExpForm(f => ({ ...f, paidBy: e.target.value }))}>
                                    <option value="">Select...</option>
                                    {group.members.map(m => <option key={m.name} value={m.name} style={{ background: '#1a073a' }}>{m.name}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <motion.button whileHover={{ scale: 1.02 }} className="btn-primary"
                                  onClick={() => handleAddExp(group)} style={{ padding: '8px 18px', fontSize: 12 }}>
                                  ➕ Add
                                </motion.button>
                                <button onClick={() => setShowAddExp(null)}
                                  style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9b8cb0', cursor: 'pointer', fontSize: 12 }}>
                                  Cancel
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowAddExp(group._id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px dashed rgba(255,119,51,0.35)', background: 'transparent', color: '#FF7733', cursor: 'pointer', fontSize: 12, marginBottom: 12 }}>
                              <Plus size={13} /> Add Expense
                            </motion.button>
                          )}
                        </AnimatePresence>

                        {/* Delete group */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleDeleteGroup(group._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8,
                              background: 'rgba(255,93,115,0.1)', border: '1px solid rgba(255,93,115,0.2)', color: '#FF5D73', cursor: 'pointer', fontSize: 12 }}>
                            <Trash2 size={12} /> Delete Group
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
