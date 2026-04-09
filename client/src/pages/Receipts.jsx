import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { Upload, FileText, CheckCircle, X, Loader, Edit, Save, Plus, Brain } from 'lucide-react';
import { formatAmount, CATEGORIES } from '../utils/constants';
import { addExpense } from '../store/slices/expensesSlice';
import api from '../services/api';

// Vendor → Category auto-mapping
const VENDOR_MAP = {
  swiggy: 'Food', zomato: 'Food', mcdonalds: 'Food', kfc: 'Food', dominos: 'Food', pizza: 'Food',
  starbucks: 'Food', cafe: 'Food', restaurant: 'Food', hotel: 'Food', dhaba: 'Food',
  bigbasket: 'Shopping', amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping', nykaa: 'Shopping',
  meesho: 'Shopping', ajio: 'Shopping', snapdeal: 'Shopping',
  ola: 'Transport', uber: 'Transport', rapido: 'Transport', metro: 'Transport', petrol: 'Transport',
  fuel: 'Transport', bpcl: 'Transport', hp: 'Transport', shell: 'Transport', irctc: 'Transport',
  netflix: 'Entertainment', amazon_prime: 'Entertainment', hotstar: 'Entertainment', spotify: 'Entertainment',
  youtube: 'Entertainment', pvr: 'Entertainment', inox: 'Entertainment', bookmyshow: 'Entertainment',
  airtel: 'Bills', jio: 'Bills', bsnl: 'Bills', electricity: 'Bills', water: 'Bills', gas: 'Bills',
  broadband: 'Bills', internet: 'Bills', insurance: 'Bills',
  pharmacy: 'Health', medical: 'Health', hospital: 'Health', clinic: 'Health', doctor: 'Health', gym: 'Health',
  apollo: 'Health', netmeds: 'Health', 'med plus': 'Health',
  school: 'Education', college: 'Education', udemy: 'Education', coursera: 'Education',
};

function detectCategory(vendor = '', text = '') {
  const combined = (vendor + ' ' + text).toLowerCase();
  for (const [keyword, cat] of Object.entries(VENDOR_MAP)) {
    if (combined.includes(keyword)) return cat;
  }
  return 'Other';
}

function extractFromText(text) {
  // Amount: look for ₹, Rs, Total, Grand Total patterns
  const amountPatterns = [
    /(?:grand\s+total|total\s+amount|amount\s+paid|net\s+total|total)[:\s]*(?:rs\.?|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /(?:rs\.?|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
    /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rs\.?|₹)/i,
  ];
  let amount = 0;
  for (const pat of amountPatterns) {
    const m = text.match(pat);
    if (m) { amount = parseFloat(m[1].replace(/,/g, '')); if (amount > 0) break; }
  }

  // Vendor: usually top 2 lines
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const vendor = lines[0] || 'Unknown';

  // Date
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,]+\d{2,4})/i,
    /(?:date|dt)[:\s]*([^\n]+)/i,
  ];
  let date = new Date().toISOString().split('T')[0];
  for (const pat of datePatterns) {
    const m = text.match(pat);
    if (m) {
      const parsed = new Date(m[1]);
      if (!isNaN(parsed.getTime())) { date = parsed.toISOString().split('T')[0]; break; }
    }
  }

  const category = detectCategory(vendor, text);
  return { vendor: vendor.slice(0, 40), amount, date, category };
}

export default function Receipts() {
  const dispatch = useDispatch();
  const isAuth = useSelector(s => s.auth.isAuthenticated);
  const { selected: currencyCode, symbol, rates } = useSelector(s => s.currency);
  const fmt = (v) => formatAmount(v, currencyCode, rates, symbol);

  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(null);
  const [progress, setProgress] = useState({});
  const [results, setResults] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [added, setAdded] = useState({});
  const workerRef = useRef(null);

  const runOCR = useCallback(async (fileObj) => {
    setAnalyzing(fileObj.id);
    setProgress(p => ({ ...p, [fileObj.id]: 0 }));
    try {
      // Dynamic import so bundle doesn't bloat unless used
      const Tesseract = await import('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(
        fileObj.file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(p => ({ ...p, [fileObj.id]: Math.round(m.progress * 100) }));
            }
          },
        }
      );
      const extracted = extractFromText(text);
      setResults(prev => ({ ...prev, [fileObj.id]: { ...extracted, rawText: text } }));
    } catch (err) {
      setResults(prev => ({ ...prev, [fileObj.id]: { error: 'OCR failed. Try a clearer image.' } }));
    }
    setAnalyzing(null);
  }, []);

  const onDrop = useCallback((accepted) => {
    const validFiles = accepted.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (validFiles.length === 0) { alert('Please upload image files (JPG, PNG, WebP). PDFs have limited OCR support.'); return; }
    const newFiles = validFiles.map(f => ({
      file: f, id: Date.now() + Math.random(),
      name: f.name,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(nf => runOCR(nf));
  }, [runOCR]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setResults(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleAddToExpenses = async (fileId) => {
    const r = results[fileId];
    if (!r || r.error) return;
    const expense = {
      amount: r.amount || 0,
      category: r.category || 'Other',
      description: r.vendor || 'Receipt Scan',
      paymentMethod: 'Cash',
      type: 'expense',
      date: r.date || new Date().toISOString().split('T')[0],
    };
    try {
      if (isAuth) {
        const { data } = await api.post('/expenses', expense);
        dispatch(addExpense(data));
      } else {
        dispatch(addExpense({ _id: `local-${Date.now()}`, ...expense, date: new Date(expense.date).toISOString() }));
      }
      setAdded(a => ({ ...a, [fileId]: true }));
    } catch {
      dispatch(addExpense({ _id: `local-${Date.now()}`, ...expense, date: new Date(expense.date).toISOString() }));
      setAdded(a => ({ ...a, [fileId]: true }));
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Receipt Scanner</h1>
            <p style={{ color: '#9b8cb0', fontSize: 14 }}>Upload receipts — AI extracts amount, vendor, and category automatically</p>
          </div>
          <div style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Brain size={13} color="#A855F7" />
            <span style={{ fontSize: 11, color: '#A855F7', fontWeight: 600 }}>Powered by Tesseract OCR</span>
          </div>
        </div>
      </motion.div>

      {/* Dropzone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        {...getRootProps()}
        style={{ padding: '60px 40px', borderRadius: 20, textAlign: 'center', cursor: 'pointer',
          background: isDragActive ? 'rgba(255,119,51,0.1)' : 'rgba(255,255,255,0.03)',
          border: `2px dashed ${isDragActive ? '#FF7733' : 'rgba(255,255,255,0.15)'}`,
          transition: 'all 0.2s', marginBottom: 24 }}>
        <input {...getInputProps()} />
        <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,119,51,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Upload size={32} color="#FF7733" />
          </div>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
            {isDragActive ? 'Drop your receipt here!' : 'Upload Receipts'}
          </h3>
          <p style={{ color: '#9b8cb0', fontSize: 14, marginBottom: 4 }}>Drag & drop or click to browse</p>
          <p style={{ color: '#9b8cb0', fontSize: 12 }}>Supports JPG, PNG, WebP · OCR runs in your browser</p>
        </motion.div>
      </motion.div>

      {/* Files */}
      <AnimatePresence>
        {files.map((f, i) => {
          const result = results[f.id];
          const pct = progress[f.id] || 0;
          const isAnalyzing = analyzing === f.id;
          return (
            <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16 }}>
                {/* Preview */}
                <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {f.preview ? (
                    <img src={f.preview} alt="receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : <FileText size={28} color="#9b8cb0" />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{f.name}</p>
                      <p style={{ fontSize: 12, color: '#9b8cb0' }}>{(f.file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {isAnalyzing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <Loader size={16} color="#FF7733" />
                          </motion.div>
                          <span style={{ fontSize: 11, color: '#FF7733' }}>{pct}%</span>
                        </div>
                      ) : result && !result.error ? (
                        <CheckCircle size={16} color="#22C55E" />
                      ) : null}
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => removeFile(f.id)}
                        style={{ background: 'rgba(255,93,115,0.15)', border: 'none', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: '#FF5D73' }}>
                        <X size={13} />
                      </motion.button>
                    </div>
                  </div>

                  {/* OCR Progress bar */}
                  {isAnalyzing && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }}
                          style={{ height: '100%', background: 'linear-gradient(to right, #FF7733, #A855F7)', borderRadius: 4 }} />
                      </div>
                      <p style={{ fontSize: 11, color: '#9b8cb0', marginTop: 4 }}>🔍 Extracting text from receipt...</p>
                    </div>
                  )}

                  {/* Error */}
                  {result?.error && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,93,115,0.08)', border: '1px solid rgba(255,93,115,0.2)' }}>
                      <p style={{ fontSize: 12, color: '#FF5D73' }}>❌ {result.error}</p>
                    </div>
                  )}

                  {/* Edit mode */}
                  {result && !result.error && editingId === f.id && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr) auto', gap: 10, alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 3, display: 'block' }}>Vendor</label>
                        <input className="input-field" value={editForm.vendor || ''} onChange={e => setEditForm({ ...editForm, vendor: e.target.value })} style={{ padding: '8px 12px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 3, display: 'block' }}>Amount (₹)</label>
                        <input className="input-field" type="number" value={editForm.amount || ''} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} style={{ padding: '8px 12px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: '#9b8cb0', marginBottom: 3, display: 'block' }}>Date</label>
                        <input className="input-field" type="date" value={editForm.date || ''} onChange={e => setEditForm({ ...editForm, date: e.target.value })} style={{ padding: '8px 12px' }} />
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setResults(prev => ({ ...prev, [f.id]: { ...editForm, amount: parseFloat(editForm.amount) || 0 } })); setEditingId(null); }}
                        style={{ height: 38, background: 'rgba(34,197,94,0.15)', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', color: '#22C55E', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Save size={14} /> Save
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Result view */}
                  {result && !result.error && editingId !== f.id && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Vendor', value: result.vendor, icon: '🏪' },
                        { label: 'Amount', value: fmt(result.amount), icon: '💰', color: '#FF7733' },
                        { label: 'Date', value: result.date ? new Date(result.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—', icon: '📅' },
                        { label: 'Category', value: result.category || 'Other', icon: CATEGORIES.find(c => c.id === result.category)?.icon || '📦', color: CATEGORIES.find(c => c.id === result.category)?.color },
                      ].map(item => (
                        <div key={item.label} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', flex: 1, minWidth: 90 }}>
                          <p style={{ fontSize: 10, color: '#9b8cb0', marginBottom: 2 }}>{item.icon} {item.label}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: item.color || '#f1f0f5' }}>{item.value}</p>
                        </div>
                      ))}
                      {/* Buttons */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditingId(f.id); setEditForm(result); }}
                          style={{ height: 36, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 8, padding: '0 10px', cursor: 'pointer', color: '#A855F7', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                          <Edit size={12} /> Edit
                        </motion.button>
                        {added[f.id] ? (
                          <div style={{ height: 36, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '0 12px', color: '#22C55E', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                            <CheckCircle size={12} /> Added!
                          </div>
                        ) : (
                          <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAddToExpenses(f.id)}
                            style={{ height: 36, background: 'linear-gradient(135deg,#FF7733,#FF5D73)', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}>
                            <Plus size={12} /> Add to Expenses
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {files.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#9b8cb0' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>🧾</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No receipts uploaded yet</p>
          <p style={{ fontSize: 13 }}>Upload receipt images above — OCR extracts data automatically</p>
        </motion.div>
      )}
    </div>
  );
}
