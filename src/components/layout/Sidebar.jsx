import React from 'react';
import {
  LayoutDashboard,
  Package,
  Search,
  SlidersHorizontal,
  Truck,
  AlertTriangle,
  Sparkles,
  History,
  Settings,
  LogOut,
  ShoppingCart,
  Layers,
  UserCheck,
  X,
  Pill,
  ShieldCheck
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

export function Sidebar({ currentRoute, setCurrentRoute, isMobileOpen, onCloseMobile }) {
  const { currentUser, logout, stats } = usePharmacy();
  const isSupervisor = currentUser?.role === 'supervisor' || currentUser?.role === 'admin' || currentUser?.role === 'owner';

  const supervisorNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-inventory', label: 'Medicine Inventory', icon: Package, badge: stats.totalMedicines },
    { id: 'admin-search', label: 'Medicine Search', icon: Search },
    { 
      id: 'admin-stock', 
      label: 'Stock Management', 
      icon: SlidersHorizontal, 
      badge: stats.lowStockCount + stats.outOfStockCount > 0 ? `${stats.lowStockCount + stats.outOfStockCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    { 
      id: 'admin-orders', 
      label: 'Orders & Restock', 
      icon: Truck, 
      badge: stats.pendingOrdersCount > 0 ? `${stats.pendingOrdersCount}` : null,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    { 
      id: 'admin-expiry', 
      label: 'Expiry Risk', 
      icon: AlertTriangle, 
      badge: stats.totalExpiringRisk > 0 ? `${stats.totalExpiringRisk}` : null,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    { id: 'admin-ai-activity', label: 'AI Alternative Activity', icon: Sparkles },
    { id: 'admin-history', label: 'Reports / History', icon: History },
    { id: 'admin-users', label: 'Staff Management', icon: UserCheck },
    { id: 'admin-settings', label: 'Settings', icon: Settings }
  ];

  const staffNavItems = [
    { id: 'worker-search', label: 'Medicine Search', icon: Search },
    { id: 'worker-sale', label: 'Record Sale', icon: ShoppingCart },
    { 
      id: 'worker-alternatives', 
      label: 'Alternative Finder', 
      icon: Sparkles,
      badge: 'AI Assisted',
      badgeColor: 'bg-teal-100 text-teal-800'
    },
    { id: 'worker-info', label: 'Medicine Information', icon: Layers },
    { id: 'worker-activity', label: 'My Activity', icon: History }
  ];

  const navItems = isSupervisor ? supervisorNavItems : staffNavItems;

  const handleNavClick = (id) => {
    setCurrentRoute(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-20 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - Sits below the unified top Header */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white/95 backdrop-blur-xl border-r border-teal-100/90 shadow-[4px_0_24px_-4px_rgba(13,148,136,0.06)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close bar */}
        <div className="lg:hidden p-2 flex justify-end border-b border-teal-100/60">
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-teal-50"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 pt-4 pb-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#11b3a1] text-white font-bold shadow-md shadow-[#11b3a1]/25 border border-[#11b3a1]'
                    : 'text-slate-600 hover:bg-teal-50/60 hover:text-teal-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : item.badgeColor || 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-teal-100/80">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
