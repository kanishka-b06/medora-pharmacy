import React, { useState, useEffect } from 'react';
import { usePharmacy } from './context/PharmacyContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RoleBasedLayout } from './components/layout/RoleBasedLayout';
import { ToastContainer } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { MedicineInventory } from './pages/admin/MedicineInventory';
import { StockManagement } from './pages/admin/StockManagement';
import { OrdersRestock } from './pages/admin/OrdersRestock';
import { ExpiryRiskMonitor } from './pages/admin/ExpiryRiskMonitor';
import { AIActivityHistory } from './pages/admin/AIActivityHistory';
import { ActivityHistory } from './pages/admin/ActivityHistory';
import { UserManagement } from './pages/admin/UserManagement';
import { Settings } from './pages/admin/Settings';

// Worker Pages
import { WorkerSearch } from './pages/worker/WorkerSearch';
import { RecordSalePage } from './pages/worker/RecordSalePage';
import { WorkerAlternativeFinder } from './pages/worker/WorkerAlternativeFinder';
import { WorkerActivity } from './pages/worker/WorkerActivity';
import { MedicineInfoPage } from './pages/worker/MedicineInfoPage';

export function App() {
  const { currentUser } = usePharmacy();
  const [currentRoute, setCurrentRoute] = useState('admin-dashboard');
  const [selectedAIMedicineId, setSelectedAIMedicineId] = useState('med-001');

  // Sync default route on login/logout and ensure window starts at top
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'supervisor' || currentUser.role === 'admin' || currentUser.role === 'owner') {
        setCurrentRoute('admin-dashboard');
      } else {
        setCurrentRoute('worker-search');
      }
    }
  }, [currentUser?.role, currentUser?.id]);

  // Always reset scroll position to top = 0 whenever route changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [currentRoute]);

  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(user) => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
            if (user.role === 'supervisor' || user.role === 'admin' || user.role === 'owner') {
              setCurrentRoute('admin-dashboard');
            } else {
              setCurrentRoute('worker-search');
            }
          }}
        />
        <ToastContainer />
      </>
    );
  }

  const renderCurrentPage = () => {
    switch (currentRoute) {
      // Admin Routes
      case 'admin-dashboard':
        return <AdminDashboard setCurrentRoute={setCurrentRoute} />;
      case 'admin-inventory':
        return <MedicineInventory setCurrentRoute={setCurrentRoute} />;
      case 'admin-search':
        return (
          <WorkerSearch
            setCurrentRoute={setCurrentRoute}
            onSelectMedicineForAI={(m) => setSelectedAIMedicineId(m.id)}
          />
        );
      case 'admin-stock':
        return <StockManagement setCurrentRoute={setCurrentRoute} />;
      case 'admin-orders':
        return <OrdersRestock />;
      case 'admin-expiry':
        return <ExpiryRiskMonitor />;
      case 'admin-ai-activity':
        return <AIActivityHistory />;
      case 'admin-history':
        return <ActivityHistory />;
      case 'admin-users':
        return <UserManagement />;
      case 'admin-settings':
        return <Settings />;

      // Worker Routes
      case 'worker-search':
        return (
          <WorkerSearch
            setCurrentRoute={setCurrentRoute}
            onSelectMedicineForAI={(m) => setSelectedAIMedicineId(m.id)}
          />
        );
      case 'worker-sale':
        return <RecordSalePage setCurrentRoute={setCurrentRoute} />;
      case 'worker-alternatives':
        return <WorkerAlternativeFinder initialMedicineId={selectedAIMedicineId} />;
      case 'worker-info':
        return (
          <MedicineInfoPage
            setCurrentRoute={setCurrentRoute}
            onSelectMedicineForAI={(m) => setSelectedAIMedicineId(m.id)}
          />
        );
      case 'worker-ai-activity':
        return <AIActivityHistory />;
      case 'worker-activity':
        return <WorkerActivity setCurrentRoute={setCurrentRoute} />;

      default:
        if (currentUser.role === 'supervisor' || currentUser.role === 'admin' || currentUser.role === 'owner') {
          return <AdminDashboard setCurrentRoute={setCurrentRoute} />;
        } else {
          return (
            <WorkerSearch
              setCurrentRoute={setCurrentRoute}
              onSelectMedicineForAI={(m) => setSelectedAIMedicineId(m.id)}
            />
          );
        }
    }
  };

  return (
    <>
      <RoleBasedLayout currentRoute={currentRoute} setCurrentRoute={setCurrentRoute}>
        <ErrorBoundary key={currentRoute}>
          {renderCurrentPage()}
        </ErrorBoundary>
      </RoleBasedLayout>
      <ToastContainer />
    </>
  );
}
export default App;
