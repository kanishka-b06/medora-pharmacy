import React, { useState, useEffect } from 'react';
import { usePharmacy } from './context/PharmacyContext';
import { LoginPage } from './pages/auth/LoginPage';
import { RoleBasedLayout } from './components/layout/RoleBasedLayout';
import { ToastContainer } from './components/common/Toast';

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

// Stock Keeper Pages
import { StockKeeperDashboard } from './pages/stockkeeper/StockKeeperDashboard';
import { NewBatchPage } from './pages/stockkeeper/NewBatchPage';
import { MedicineArrangementPage } from './pages/stockkeeper/MedicineArrangementPage';
import { LocationManagementPage } from './pages/stockkeeper/LocationManagementPage';
import { StockNotificationsPage } from './pages/stockkeeper/StockNotificationsPage';

export function App() {
  const { currentUser } = usePharmacy();
  const [currentRoute, setCurrentRoute] = useState('admin-dashboard');
  const [selectedAIMedicineId, setSelectedAIMedicineId] = useState('med-001');

  // Sync default route on login/logout
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'supervisor' || currentUser.role === 'admin' || currentUser.role === 'owner') {
        setCurrentRoute('admin-dashboard');
      } else if (currentUser.role === 'stockkeeper') {
        setCurrentRoute('stock-dashboard');
      } else {
        setCurrentRoute('worker-search');
      }
    }
  }, [currentUser?.role, currentUser?.id]);

  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(user) => {
            if (user.role === 'supervisor' || user.role === 'admin' || user.role === 'owner') {
              setCurrentRoute('admin-dashboard');
            } else if (user.role === 'stockkeeper') {
              setCurrentRoute('stock-dashboard');
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
      case 'worker-activity':
        return <WorkerActivity />;

      // Stock Keeper Routes
      case 'stock-dashboard':
        return <StockKeeperDashboard setCurrentRoute={setCurrentRoute} />;
      case 'stock-new-batch':
        return <NewBatchPage setCurrentRoute={setCurrentRoute} />;
      case 'stock-arrangement':
        return <MedicineArrangementPage setCurrentRoute={setCurrentRoute} />;
      case 'stock-locations':
        return <LocationManagementPage setCurrentRoute={setCurrentRoute} />;
      case 'stock-notifications':
        return <StockNotificationsPage setCurrentRoute={setCurrentRoute} />;

      default:
        if (currentUser.role === 'supervisor' || currentUser.role === 'admin' || currentUser.role === 'owner') {
          return <AdminDashboard setCurrentRoute={setCurrentRoute} />;
        } else if (currentUser.role === 'stockkeeper') {
          return <StockKeeperDashboard setCurrentRoute={setCurrentRoute} />;
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
        {renderCurrentPage()}
      </RoleBasedLayout>
      <ToastContainer />
    </>
  );
}
export default App;
