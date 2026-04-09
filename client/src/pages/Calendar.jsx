import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getCategoryInfo, formatAmount } from '../utils/constants';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getIntensityColor(amount, max) {
  if (!amount) return 'rgba(255,255,255,0.03)';
  const ratio = Math.min(amount / max, 1);
  if (ratio < 0.25) return 'rgba(34,197,94,0.25)';
  if (ratio < 0.5)  return 'rgba(255,183,77,0.3)';
  if (ratio < 0.75) return 'rgba(255,119,51,0.4)';
  return 'rgba(255,93,115,0.5)';
}

function getIntensityBorder(amount, max) {
  if (!amount) return 'rgba(255,255,255,0.06)';
  const ratio = Math.min(amount / max, 1);
  if (ratio < 0.25) return 'rgba(34,197,94,0.4)';
  if (ratio < 0.5)  return 'rgba(255,183,77,0.5)';
  if (ratio < 0.75) return 'rgba(255,119,51,0.6)';
  return 'rgba(255,93,115,0.7)';
}

export default function Calendar() {
  const expenses = useSelector(s => s.expenses.list);
  const { selected: currencyCode, symbol, rates } = useSelector(s => s.currency);
  const fmt = (v) => formatAmount(v, currencyCode, rates, symbol);

  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Build map of day -> { total, expenses[] }
  const dayMap = useMemo(() => {
    const map = {};
    expenses.forEach(exp => {
      if (exp.type !== 'expense') return;
      const d = new Date(exp.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const key = d.getDate();
      if (!map[key]) map[key] = { total: 0, list: [] };
      map[key].total += exp.amount;
      map[key].list.push(exp);
    });
    return map;
  }, [expenses, year, month]);

  const maxDay = Math.max(...Object.values(dayMap).map(d => d.total), 1);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const totalMonthSpend = Object.values(dayMap).reduce((s, d) => s + d.total, 0);
  const busiestDay = Object.entries(dayMap).sort((a, b) => b[1].total - a[1].total)[0];

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectedData = selectedDay ? dayMap[selectedDay] : null;
  const panelOpen = !!selectedDay;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Expense Calendar</h1>
        <p style={{ color: '#9b8cb0', fontSize: 14 }}>Click a date to see its expenses</p>
      </motion.div>

      {/* Summary chips */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Month Total', value: fmt(totalMonthSpend), color: '#FF5D73' },
          { label: 'Busiest Day', value: busiestDay ? `${busiestDay[0]} ${MONTHS[month].slice(0,3)}` : '—', color: '#FF7733' },
          { label: 'Avg Per Day', value: fmt(totalMonthSpend / daysInMonth), color: '#A855F7' },
          { label: 'Days with Spend', value: `${Object.keys(dayMap).length} days`, color: '#22C55E' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '12px 18px', flex: 1, minWidth: 140 }}>
            <p style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Main layout: calendar + side panel */}
      <motion.div
        animate={{ gap: panelOpen ? 20 : 0 }}
        style={{
          display: 'grid',
          gridTemplateColumns: panelOpen ? '1fr 340px' : '1fr',
          gap: panelOpen ? 20 : 0,
          alignItems: 'start',
          transition: 'grid-template-columns 0.3s ease',
        }}>

        {/* Calendar card */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, layout: { duration: 0.3 } }}
          className="glass-card"
          style={{ padding: panelOpen ? 16 : 24 }}>

          {/* Header: nav + month name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={prevMonth}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#f1f0f5' }}>
              <ChevronLeft size={18} />
            </motion.button>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: panelOpen ? 16 : 20 }}>
              {MONTHS[month]} {year}
            </h2>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={nextMonth}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: '#f1f0f5' }}>
              <ChevronRight size={18} />
            </motion.button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: panelOpen ? 3 : 6, marginBottom: panelOpen ? 3 : 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: panelOpen ? 9 : 11, fontWeight: 600, color: '#9b8cb0', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: panelOpen ? 3 : 6 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const data = dayMap[day];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = selectedDay === day;
              return (
                <motion.div key={day}
                  whileHover={{ scale: 1.06, zIndex: 10 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  style={{
                    borderRadius: panelOpen ? 8 : 12,
                    padding: panelOpen ? '6px 3px' : '10px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: panelOpen ? 48 : 72,
                    background: isSelected ? 'rgba(255,119,51,0.2)' : getIntensityColor(data?.total, maxDay),
                    border: `1.5px solid ${isSelected ? '#FF7733' : isToday ? 'rgba(168,85,247,0.6)' : getIntensityBorder(data?.total, maxDay)}`,
                    boxShadow: isSelected ? '0 0 14px rgba(255,119,51,0.3)' : 'none',
                    transition: 'border-color 0.2s',
                    position: 'relative',
                  }}>
                  <span style={{ fontSize: panelOpen ? 11 : 13, fontWeight: isToday ? 800 : 500, color: isToday ? '#A855F7' : '#f1f0f5' }}>{day}</span>
                  {isToday && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#A855F7', margin: '2px auto 0' }} />}
                  {data && !panelOpen && (
                    <p style={{ fontSize: 9, marginTop: 4, color: '#FF7733', fontWeight: 700 }}>
                      {fmt(data.total)}
                    </p>
                  )}
                  {data && !panelOpen && (
                    <p style={{ fontSize: 9, color: '#9b8cb0' }}>{data.list.length} txn</p>
                  )}
                  {data && panelOpen && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF7733', margin: '3px auto 0' }} />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          {!panelOpen && (
            <div style={{ display: 'flex', gap: 16, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: '#9b8cb0' }}>Intensity:</span>
              {[
                { color: 'rgba(34,197,94,0.4)', label: 'Low' },
                { color: 'rgba(255,183,77,0.5)', label: 'Medium' },
                { color: 'rgba(255,119,51,0.6)', label: 'High' },
                { color: 'rgba(255,93,115,0.7)', label: 'Very High' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 4, background: l.color, border: `1px solid ${l.color}` }} />
                  <span style={{ fontSize: 11, color: '#9b8cb0' }}>{l.label}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Day detail side panel */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              key="detail-panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
              className="glass-card"
              style={{ padding: 20, position: 'sticky', top: 20 }}>

              {/* Panel header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16 }}>
                    📅 {selectedDay} {MONTHS[month]}
                  </h3>
                  {selectedData ? (
                    <p style={{ fontSize: 12, color: '#FF7733', fontWeight: 700, marginTop: 2 }}>
                      {fmt(selectedData.total)} · {selectedData.list.length} transactions
                    </p>
                  ) : (
                    <p style={{ fontSize: 12, color: '#9b8cb0', marginTop: 2 }}>No expenses</p>
                  )}
                </div>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSelectedDay(null)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#9b8cb0', flexShrink: 0 }}>
                  <X size={16} />
                </motion.button>
              </div>

              {selectedData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 480, overflowY: 'auto' }}>
                  {selectedData.list.map((exp, i) => {
                    const cat = getCategoryInfo(exp.category);
                    return (
                      <motion.div key={exp._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
                          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${cat.color}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                          {cat.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {exp.description || exp.category}
                          </p>
                          <p style={{ fontSize: 10, color: '#9b8cb0' }}>{cat.label} · {exp.paymentMethod}</p>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: exp.type === 'income' ? '#22C55E' : '#FF5D73', flexShrink: 0 }}>
                          {exp.type === 'income' ? '+' : '-'}{fmt(exp.amount)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9b8cb0' }}>
                  <p style={{ fontSize: 32, marginBottom: 8 }}>🌿</p>
                  <p style={{ fontSize: 13 }}>No expenses on this day</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {Object.keys(dayMap).length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#9b8cb0', marginTop: 16 }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>📅</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No expenses this month</p>
          <p style={{ fontSize: 13 }}>Add expenses to see them on the calendar</p>
        </motion.div>
      )}
    </div>
  );
}
