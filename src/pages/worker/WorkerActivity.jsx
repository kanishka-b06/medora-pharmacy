import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  History,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  ArrowRight,
  User,
  Package,
  TrendingUp,
  ShieldCheck,
  FileText,
  DollarSign,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function WorkerActivity({ setCurrentRoute }) {
  const { sales = [], activities = [], currentUser, settings } = usePharmacy();
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'my-activity' | 'all'
  const [searchTerm, setSearchTerm] = useState('');

  const currency = settings?.currencySymbol || '₹';

  // Resilient helper to match activities and sales performed by the active worker
  const isMatchUser = (userField) => {
    if (!currentUser) return true;
    if (!userField || typeof userField !== 'string') return false;
    const str = userField.toLowerCase();
    const username = (currentUser.username || '').toLowerCase();
    const name = (currentUser.name || '').toLowerCase();

    if (username && str.includes(username)) return true;
    if (name && str.includes(name)) return true;

    // Check individual name parts (e.g. "Arun" in "Arun Kumar")
    const parts = name.split(/\s+/).filter((p) => p.length >= 3);
    if (parts.some((part) => str.includes(part))) return true;

    return false;
  };

  // Filter sales recorded by this user
  const userSales = useMemo(() => {
    return sales.filter((s) => isMatchUser(s?.recordedBy));
  }, [sales, currentUser]);

  // Filter activities performed by this user
  const userActivities = useMemo(() => {
    return activities.filter((a) => isMatchUser(a?.user || a?.performedBy));
  }, [activities, currentUser]);

  // Shift performance metrics
  const totalShiftRevenue = useMemo(() => {
    return userSales.reduce((sum, s) => sum + (Number(s?.totalAmount) || 0), 0);
  }, [userSales]);

  const totalShiftUnits = useMemo(() => {
    return userSales.reduce((sum, s) => sum + (Number(s?.quantitySold) || 0), 0);
  }, [userSales]);

  // Filtered sales matching search query
  const filteredSales = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return userSales;
    return userSales.filter((s) => {
      const med = (s?.medicineName || '').toLowerCase();
      const cust = (s?.customerType || '').toLowerCase();
      const rec = (s?.recordedBy || '').toLowerCase();
      const notes = (s?.notes || '').toLowerCase();
      return med.includes(term) || cust.includes(term) || rec.includes(term) || notes.includes(term);
    });
  }, [userSales, searchTerm]);

  // Active activities list (User's activities vs All activities)
  const activeActivitiesSource = activeTab === 'all' ? activities : userActivities;

  // Filtered activities matching search query
  const filteredActivities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return activeActivitiesSource;
    return activeActivitiesSource.filter((act) => {
      const action = (act?.action || '').toLowerCase();
      const target = (act?.medicine || act?.target || '').toLowerCase();
      const user = (act?.user || act?.performedBy || '').toLowerCase();
      const details = (act?.details || '').toLowerCase();
      return action.includes(term) || target.includes(term) || user.includes(term) || details.includes(term);
    });
  }, [activeActivitiesSource, searchTerm]);

  // Helper for action badges and styling
  const getActionBadge = (actionStr = '') => {
    const action = actionStr.toLowerCase();
    if (action.includes('sale')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: ShoppingCart,
        iconBg: 'bg-emerald-100 text-emerald-700'
      };
    }
    if (action.includes('ai') || action.includes('alternative')) {
      return {
        bg: 'bg-violet-50 text-violet-700 border-violet-200',
        icon: Sparkles,
        iconBg: 'bg-violet-100 text-violet-700'
      };
    }
    if (action.includes('login') || action.includes('session')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: ShieldCheck,
        iconBg: 'bg-blue-100 text-blue-700'
      };
    }
    if (action.includes('stock') || action.includes('correct')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: TrendingUp,
        iconBg: 'bg-amber-100 text-amber-700'
      };
    }
    if (action.includes('order') || action.includes('restock')) {
      return {
        bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        icon: Package,
        iconBg: 'bg-cyan-100 text-cyan-700'
      };
    }
    return {
      bg: 'bg-slate-50 text-slate-700 border-slate-200',
      icon: Clock,
      iconBg: 'bg-slate-100 text-slate-700'
    };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Daily Activity Log</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Shift Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time shift log of sales issued, stock checks, and inventory actions recorded by your account.
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {currentUser.name?.[0] || 'U'}
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900">{currentUser.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">@{currentUser.username} • {currentUser.roleTitle || 'Staff'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Shift Performance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-700 font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Shift Sales Recorded</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{userSales.length} Transactions</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales Billed</div>
            <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{currency}{totalShiftRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Units Dispensed</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{totalShiftUnits} Units</div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100/90 text-xs">
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-2 px-3.5 rounded-lg font-bold transition-all ${
              activeTab === 'sales'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Sales ({userSales.length})
          </button>

          <button
            onClick={() => setActiveTab('my-activity')}
            className={`py-2 px-3.5 rounded-lg font-bold transition-all ${
              activeTab === 'my-activity'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Shift Actions ({userActivities.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-3.5 rounded-lg font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Pharmacy Log ({activities.length})
          </button>
        </div>

        {/* Real-time Search Box */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'sales' ? 'Search sales...' : 'Search activity events...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'sales' ? (
        /* Sales Log Table */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5">Time & Date</th>
                  <th className="px-4 py-3.5">Medicine</th>
                  <th className="px-4 py-3.5">Quantity Given</th>
                  <th className="px-4 py-3.5">Remaining Stock</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Worker</th>
                  <th className="px-4 py-3.5">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500">
                      <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="font-bold text-slate-700 text-sm">No sales recorded during this shift yet</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Sales recorded at the dispensing counter will automatically log here with stock deduction records.
                      </p>
                      {setCurrentRoute && (
                        <button
                          onClick={() => setCurrentRoute('worker-sale')}
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Record Counter Sale</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id || sale.timestamp} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                        <div className="font-semibold text-slate-800">
                          {sale.time || (sale.timestamp ? new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {sale.date || (sale.timestamp ? new Date(sale.timestamp).toLocaleDateString() : '')}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{sale.medicineName}</div>
                        {sale.notes && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">{sale.notes}</div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {sale.quantityGiven || sale.quantitySold} units
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-400 font-medium">{sale.previousStock}</span>
                        <span className="mx-1.5 text-slate-300">→</span>
                        <span className={`font-bold ${sale.remainingStock === 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {sale.remainingStock} units {sale.remainingStock === 0 ? '(Out of Stock)' : ''}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
                          {sale.transactionType || sale.type || 'Dispense'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700 font-medium whitespace-nowrap">
                        {sale.worker || sale.recordedBy || 'Staff'}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                        {currency}{Number(sale.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline Activities View */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              {activeTab === 'all' ? 'All Pharmacy System Activity' : 'My Personal Action Log'}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredActivities.length} {filteredActivities.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">No activity events found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Actions like sales dispensing, stock checks, and session logins will appear in this timeline.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredActivities.map((act) => {
                const badge = getActionBadge(act.action);
                const ActionIcon = badge.icon;
                const isCurrentUserActor = isMatchUser(act.user || act.performedBy);

                return (
                  <div
                    key={act.id || `${act.action}-${act.timestamp}`}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 transition-colors"
                  >
                    <div className={`p-2.5 rounded-xl ${badge.iconBg} font-bold mt-0.5 flex-shrink-0`}>
                      <ActionIcon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                            {act.action || 'Activity'}
                          </span>
                          {(act.medicine || act.target) && (
                            <span className="font-extrabold text-slate-900 text-xs truncate">
                              {act.medicine || act.target}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {act.timestamp
                              ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                              : 'Recent'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                        {act.details}
                      </p>

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100/80 text-[11px]">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-500 font-medium">
                          Performed by:{' '}
                          <strong className="text-slate-800">
                            {act.user || act.performedBy || 'Staff'}
                          </strong>
                        </span>
                        {isCurrentUserActor && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold text-[10px]">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
