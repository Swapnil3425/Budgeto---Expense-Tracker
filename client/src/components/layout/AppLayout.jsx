import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AddExpenseModal from '../modals/AddExpenseModal';
import { fetchRates } from '../../store/slices/currencySlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

export default function AppLayout() {
  const dispatch = useDispatch();
  const showAddExpense = useSelector(s => s.ui.showAddExpense);
  const sidebarCollapsed = useSelector(s => s.ui.sidebarCollapsed);

  // Fetch live INR-based rates once on app load
  useEffect(() => { dispatch(fetchRates()); }, [dispatch]);

  // On mobile, auto-collapse sidebar on first load
  useEffect(() => {
    const handleResize = () => {
      // Nothing needed — sidebar collapse toggle handles opening/closing
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileOpen = !sidebarCollapsed;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0118', position: 'relative' }}>
      {/* Mobile overlay — clicking it closes the sidebar */}
      {isMobileOpen && (
        <div
          className="overlay mobile-overlay"
          onClick={() => dispatch(toggleSidebar())}
          style={{ display: 'none' }}
        />
      )}

      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>

      {showAddExpense && <AddExpenseModal />}
    </div>
  );
}
