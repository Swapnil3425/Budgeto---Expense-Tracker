import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend
} from 'recharts';
import { Wallet, TrendingDown, TrendingUp, Target, Flame, Star, Zap } from 'lucide-react';
import { setExpenses } from '../store/slices/expensesSlice';
import { formatINR, formatAmount, generateMockExpenses, CATEGORIES, getCategoryInfo } from '../utils/constants';
import { setShowAddExpense } from '../store/slices/uiSlice';

const STREAK_DAYS_MOCK = 12;

const KPICard = ({ icon: Icon, label, value, trend, trendUp, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card"
    style={{ padding: 20, position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80,
      borderRadius: '50%', background: `${color}15`, filter: 'blur(20px)' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} />
      </div>
      {trend && (
        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
          background: trendUp ? 'rgba(34,197,94,0.15)' : 'rgba(255,93,115,0.15)',
          color: trendUp ? '#22C55E' : '#FF5D73' }}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
    <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 4 }}>{label}</p>
    <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22 }}>{value}</p>
  </motion.div>
);

const COLORS = CATEGORIES.map(c => c.color);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ fontSize: 12, color: '#9b8cb0', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.fill || p.color || '#FF7733' }}>
            {p.name}: {formatINR(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const expenses = useSelector(s => s.expenses.list);
  const { user, isDemo } = useSelector(s => s.auth);
  const { selected: currencyCode, symbol, rates } = useSelector(s => s.currency);
  const fmt = (v) => formatAmount(v, currencyCode, rates, symbol);
  const [aiInsights, setAiInsights] = useState(null);
  const [healthScore, setHealthScore] = useState(100);

  useEffect(() => {
    if (isDemo && expenses.length === 0) {
      dispatch(setExpenses(generateMockExpenses()));
    }
  }, [isDemo, expenses.length, dispatch]);

  const monthlyBudget = user?.monthlyBudget || 50000;
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return e.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalExpenses = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExpenses;
  const budgetRemaining = monthlyBudget - totalExpenses;

  // Category data for pie
  const catData = CATEGORIES.map(cat => ({
    name: cat.label, value: thisMonthExpenses.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0), color: cat.color,
  })).filter(c => c.value > 0);

  // Weekly data
  const weeklyData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    return days.map((day, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const dayExp = expenses.filter(e => {
        const exp = new Date(e.date);
        return e.type === 'expense' && exp.toDateString() === d.toDateString();
      });
      return { day, amount: dayExp.reduce((s, e) => s + e.amount, 0) };
    });
  })();

  useEffect(() => {
    const topCat = catData[0]?.name || 'Food';
    const budgetPercent = Math.round((totalExpenses / monthlyBudget) * 100);
    const score = Math.max(0, Math.min(100, 100 - budgetPercent + 30));
    setHealthScore(Math.round(score));
    setAiInsights([
      { icon: '📊', color: '#FF7733', text: `You've used ${budgetPercent}% of your ₹${monthlyBudget.toLocaleString('en-IN')} monthly budget.` },
      { icon: '🍔', color: '#A855F7', text: `${topCat} is your top spending category this month.` },
      { icon: '💡', color: '#3B82F6', text: `Cutting discretionary spending by 15% could save ${formatINR(totalExpenses * 0.15)} this month.` },
      { icon: '🎯', color: '#22C55E', text: `Projected monthly spend: ${formatINR(totalExpenses * 1.08)} at current rate.` },
    ]);
  }, [expenses]);

  const healthColor = healthScore >= 80 ? '#22C55E' : healthScore >= 60 ? '#FF7733' : '#FF5D73';
  const circumference = 2 * Math.PI * 40;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ color: '#9b8cb0', fontSize: 14 }}>Here's your financial overview for {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KPICard icon={Wallet} label="Total Balance" value={fmt(totalIncome - totalExpenses)} trend="12%" trendUp={true} color="#FF7733" delay={0} />
        <KPICard icon={TrendingDown} label="Monthly Spending" value={fmt(totalExpenses)} trend="8%" trendUp={false} color="#FF5D73" delay={0.05} />
        <KPICard icon={TrendingUp} label="Total Income" value={fmt(totalIncome)} trend="5%" trendUp={true} color="#22C55E" delay={0.1} />
        <KPICard icon={Target} label="Budget Remaining" value={fmt(Math.max(0, budgetRemaining))} color="#A855F7" delay={0.15} />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Weekly Spending</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barSize={22}>
              <XAxis dataKey="day" tick={{ fill: '#9b8cb0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9b8cb0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name="Spent" radius={[6, 6, 0, 0]}
                fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF7733" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Spending by Category</h3>
          {catData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                    dataKey="value" paddingAngle={3}>
                    {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {catData.slice(0, 5).map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#9b8cb0', flex: 1 }}>{c.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#9b8cb0', textAlign: 'center', marginTop: 40 }}>No expenses yet</p>
          )}
        </motion.div>
      </div>

      {/* Bottom Grid: AI Insights + Health Score + Streak */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20 }}>
        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color="#A855F7" />
            </div>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15 }}>AI Insights</h3>
          </div>
          {aiInsights && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiInsights.map((ins, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                  style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: `${ins.color}0d`, border: `1px solid ${ins.color}25` }}>
                  <span style={{ fontSize: 16 }}>{ins.icon}</span>
                  <p style={{ fontSize: 12, color: '#d4c8e8', lineHeight: 1.5 }}>{ins.text}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Health Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card"
          style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Star size={16} color="#FF7733" />
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: '#9b8cb0' }}>Health Score</h3>
          <div style={{ position: 'relative', width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke={healthColor} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (healthScore / 100) * circumference }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ filter: `drop-shadow(0 0 6px ${healthColor})` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 22, color: healthColor }}>{healthScore}</span>
            </div>
          </div>
          <span style={{ fontSize: 12, color: healthColor, fontWeight: 600 }}>
            {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Fair'}
          </span>
        </motion.div>

        {/* Expense Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card"
          style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Flame size={16} color="#FF7733" />
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: '#9b8cb0' }}>Budget Streak</h3>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: 48 }}>🔥</motion.div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 28, color: '#FF7733' }}>{isDemo ? STREAK_DAYS_MOCK : 0}</p>
            <p style={{ fontSize: 11, color: '#9b8cb0' }}>days within budget</p>
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: 3,
                background: i < 5 ? 'linear-gradient(135deg,#FF7733,#FF5D73)' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="glass-card" style={{ padding: 20, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15 }}>Recent Transactions</h3>
          <button onClick={() => dispatch(setShowAddExpense(true))} className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>+ Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {expenses.slice(0, 6).map(exp => {
            const cat = getCategoryInfo(exp.category);
            return (
              <div key={exp._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{exp.description || exp.category}</p>
                  <p style={{ fontSize: 11, color: '#9b8cb0' }}>{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {exp.paymentMethod}</p>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, color: exp.type === 'income' ? '#22C55E' : '#f1f0f5' }}>
                  {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
