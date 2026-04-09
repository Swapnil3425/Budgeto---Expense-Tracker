import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Wallet, BarChart3, Target, RefreshCcw, Receipt, Brain, ArrowRight, Github } from 'lucide-react';

const FEATURES = [
  { icon: '💰', title: 'Smart Expense Tracking', desc: 'Add expenses instantly with auto-categorization. Never lose track of a rupee.' },
  { icon: '🤖', title: 'AI Spending Insights', desc: 'Our AI analyzes your habits and tells you exactly where your money is going.' },
  { icon: '🎯', title: 'Financial Goals', desc: 'Set savings targets, visualize progress, and celebrate milestones.' },
  { icon: '🧾', title: 'Receipt Scanner', desc: 'Upload a photo of your receipt — we extract amount, vendor, and date.' },
  { icon: '📈', title: 'Budget Forecast', desc: 'Predict next month\'s spending using your historical patterns.' },
  { icon: '🔄', title: 'Subscription Tracker', desc: 'Never miss a recurring charge. Track all subscriptions in one place.' },
];

const STATS = [
  { value: '₹2Cr+', label: 'Tracked Monthly' },
  { value: '50K+', label: 'Active Users' },
  { value: '98%', label: 'Accuracy' },
  { value: '4.9★', label: 'User Rating' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0118', color: '#f1f0f5' }}>
      {/* BG Elements */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '5%', left: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,119,51,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,93,115,0.05) 0%, transparent 60%)' }} />
      </div>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', gap: 32,
        background: 'rgba(10,1,24,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'linear-gradient(135deg,#FF7733,#A855F7)', borderRadius: 10, padding: 7 }}>
            <TrendingUp size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 20,
            background: 'linear-gradient(to right,#FF7733,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Budgeto
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 28 }}>
          {['Features', 'Pricing', 'About'].map(item => (
            <a key={item} href="#" style={{ fontSize: 14, color: '#9b8cb0', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#f1f0f5'} onMouseLeave={e => e.target.style.color = '#9b8cb0'}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="https://github.com" target="_blank" rel="noreferrer"
            style={{ color: '#9b8cb0', display: 'flex', alignItems: 'center' }}>
            <Github size={18} />
          </a>
          <Link to="/login" className="btn-secondary" style={{ padding: '7px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-block' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 40px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Badge */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99,
              background: 'rgba(255,119,51,0.1)', border: '1px solid rgba(255,119,51,0.25)', marginBottom: 24 }}>
            <span style={{ fontSize: 12 }}>✨ AI-powered personal finance</span>
          </motion.div>

          <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(36px,6vw,72px)',
            lineHeight: 1.1, marginBottom: 20, maxWidth: 800, margin: '0 auto 20px' }}>
            Understand Where Your<br />
            <span style={{ background: 'linear-gradient(to right,#FF7733,#FF5D73,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Money Really Goes
            </span>
          </h1>
          <p style={{ fontSize: 18, color: '#9b8cb0', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            AI-powered expense tracking with deep financial insights. Set goals, track subscriptions, and take control of your finances.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-primary"
                style={{ fontSize: 16, padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
                Start Tracking Free <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-secondary"
                style={{ fontSize: 16, padding: '14px 32px' }}
                onClick={() => {}}>
                🚀 Live Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview window */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
          style={{ marginTop: 60, maxWidth: 900, margin: '60px auto 0' }}>
          <div style={{ background: '#1c0a36', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 120px rgba(168,85,247,0.2), 0 0 0 1px rgba(255,255,255,0.05)',
            overflow: 'hidden' }}>
            {/* Window chrome */}
            <div style={{ background: '#130624', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: 7 }}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '3px 20px', fontSize: 11, color: '#9b8cb0' }}>
                  app.budgeto.in/dashboard
                </div>
              </div>
            </div>
            {/* Mini dashboard preview */}
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, background: '#0a0118' }}>
              {[
                { label: 'Total Balance', value: '₹1,23,450', color: '#FF7733', trend: '+12%', icon: '💰' },
                { label: 'Monthly Spent', value: '₹28,350', color: '#FF5D73', trend: '-5%', icon: '📉' },
                { label: 'Savings', value: '₹41,200', color: '#22C55E', trend: '+18%', icon: '💎' },
                { label: 'Budget Left', value: '₹21,650', color: '#A855F7', trend: '43%', icon: '🎯' },
              ].map(card => (
                <div key={card.label} style={{ padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 18, marginBottom: 8 }}>{card.icon}</div>
                  <p style={{ fontSize: 9, color: '#9b8cb0', marginBottom: 3 }}>{card.label}</p>
                  <p style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 16, color: card.color }}>{card.value}</p>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>{card.trend}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '0 20px 20px', background: '#0a0118', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Chart placeholder */}
              <div style={{ height: 100, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, padding: '0 16px' }}>
                  {[40, 60, 30, 80, 45, 90, 55].map((h, i) => (
                    <div key={i} style={{ width: 20, height: `${h}%`, borderRadius: '4px 4px 0 0',
                      background: `linear-gradient(to top, #FF7733, #A855F7)`, opacity: 0.8 }} />
                  ))}
                </div>
              </div>
              <div style={{ height: 100, borderRadius: 12, background: 'rgba(255,119,51,0.06)', border: '1px solid rgba(255,119,51,0.15)', padding: 16 }}>
                <p style={{ fontSize: 10, color: '#9b8cb0', marginBottom: 6 }}>🤖 AI Insight</p>
                <p style={{ fontSize: 11, color: '#f1f0f5', lineHeight: 1.4 }}>You spend <span style={{ color: '#FF7733', fontWeight: 700 }}>32%</span> of income on food — 12% above average. Reduce by 2 orders/week to save <span style={{ color: '#22C55E' }}>₹2,500</span>.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              style={{ textAlign: 'center', padding: '24px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 32,
                background: 'linear-gradient(to right,#FF7733,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, color: '#9b8cb0', marginTop: 4 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 40, marginBottom: 12 }}>
              Everything you need to{' '}
              <span style={{ background: 'linear-gradient(to right,#FF7733,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                master your money
              </span>
            </h2>
            <p style={{ color: '#9b8cb0', fontSize: 16 }}>Powerful tools designed for modern financial management</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                whileHover={{ y: -4 }}
                style={{ padding: 28, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  transition: 'box-shadow 0.3s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(168,85,247,0.15)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#9b8cb0', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', padding: '60px 40px', borderRadius: 28,
            background: 'linear-gradient(135deg, rgba(255,119,51,0.1), rgba(168,85,247,0.1))',
            border: '1px solid rgba(255,119,51,0.2)' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 40, marginBottom: 16 }}>
            Ready to take control<br />of your finances?
          </h2>
          <p style={{ color: '#9b8cb0', fontSize: 16, marginBottom: 36 }}>
            Join thousands of users who track smarter with Budgeto.
          </p>
          <Link to="/register">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-primary"
              style={{ fontSize: 17, padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Get Started Free <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'linear-gradient(135deg,#FF7733,#A855F7)', borderRadius: 7, padding: 5 }}>
            <TrendingUp size={13} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#9b8cb0' }}>Budgeto</span>
        </div>
        <p style={{ fontSize: 12, color: '#9b8cb0' }}>© 2026 Budgeto. Built with ❤️</p>
      </footer>
    </div>
  );
}
