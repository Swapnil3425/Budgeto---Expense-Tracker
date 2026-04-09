import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            style={{ background: '#1c0a36', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, boxShadow: '0 24px 80px rgba(0,0,0,0.6)', textAlign: 'center' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,93,115,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#FF5D73' }}>
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#f1f0f5' }}>
              {title || 'Are you sure?'}
            </h2>
            <p style={{ fontSize: 13, color: '#9b8cb0', marginBottom: 28, lineHeight: 1.5 }}>
              {message || "Do you really want to delete this? This action cannot be undone."}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} 
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f0f5', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}>
                Cancel
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onConfirm(); onClose(); }} 
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg, #FF7733, #FF5D73)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,93,115,0.3)' }}>
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
