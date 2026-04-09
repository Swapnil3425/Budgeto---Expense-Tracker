import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { CATEGORIES, formatINR, getCategoryInfo } from '../utils/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color || '#FF7733' }}>
            {p.name}: {formatINR(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const expenses = useSelector(s => s.expenses.list);

  // Monthly trend (last 6 months)
  const monthlyTrend = (() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      const exp = expenses.filter(e => {
        const ed = new Date(e.date);
        return e.type === 'expense' && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).reduce((s, e) => s + e.amount, 0);
      const inc = expenses.filter(e => {
        const ed = new Date(e.date);
        return e.type === 'income' && ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).reduce((s, e) => s + e.amount, 0);
      return { month: label, expenses: exp, income: inc };
    });
  })();

  // Category breakdown
  const catData = CATEGORIES.map(cat => ({
    name: cat.label,
    value: expenses.filter(e => e.category === cat.id && e.type === 'expense').reduce((s, e) => s + e.amount, 0),
    color: cat.color,
    icon: cat.icon,
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  const totalExp = catData.reduce((s, c) => s + c.value, 0);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: '#9b8cb0', fontSize: 14 }}>Deep dive into your spending patterns</p>
      </motion.div>

      {/* Income vs Expenses Area Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Income vs Expenses (6 months)</h3>
        <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 20 }}>Monthly comparison of your cash flow</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF7733" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF7733" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: '#9b8cb0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9b8cb0', fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" name="Income" stroke="#22C55E" fill="url(#incomeGrad)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#FF7733" fill="url(#expenseGrad)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Category Breakdown bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fill: '#9b8cb0', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9b8cb0', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Amount" radius={[0, 6, 6, 0]}>
                {catData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Category Share</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {catData.slice(0, 6).map(c => {
              const pct = totalExp > 0 ? Math.round((c.value / totalExp) * 100) : 0;
              return (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{c.icon} {c.name}</span>
                    <span style={{ fontSize: 12, color: '#9b8cb0' }}>{pct}% · {formatINR(c.value)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      style={{ height: '100%', borderRadius: 99, background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Monthly trend line */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Spending Trend</h3>
        <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 20 }}>How your expenses have changed monthly</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyTrend}>
            <XAxis dataKey="month" tick={{ fill: '#9b8cb0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9b8cb0', fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#FF7733" strokeWidth={2.5}
              dot={{ fill: '#FF7733', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
