import React from 'react';
import {
  LayoutDashboard, PlusCircle, ClipboardList, MapPin, Bell,
  Package, CheckCircle2, AlertTriangle, Boxes
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

export function StockKeeperDashboard({ setCurrentRoute }) {
  const { currentUser, batches, skStats, notifications } = usePharmacy();

  const unarrangedBatches = batches.filter((b) => b.status === 'Unarranged');
  const recentArranged = batches
    .filter((b) => b.status === 'Arranged')
    .sort((a, b) => new Date(b.arrangedAt || 0) - new Date(a.arrangedAt || 0))
    .slice(0, 5);

  const unreadNotifs = notifications.filter(
    (n) => n.recipientRole === 'stockkeeper' && !n.read
  );

  const statCards = [
    {
      label: 'Total Batches',
      value: batches.length,
      icon: Boxes,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-100'
    },
    {
      label: 'Unarranged',
      value: skStats?.unarrangedBatchesCount ?? 0,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-100'
    },
    {
      label: 'Arranged',
      value: skStats?.arrangedBatchesCount ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100'
    },
    {
      label: 'Notifications',
      value: unreadNotifs.length,
      icon: Bell,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-100'
    }
  ];

  const quickActions = [
    { label: 'Add New Batch', icon: PlusCircle, route: 'stock-new-batch', color: 'bg-teal-600 hover:bg-teal-700 text-white' },
    { label: 'Arrange Batches', icon: ClipboardList, route: 'stock-arrangement', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
    { label: 'Location Map', icon: MapPin, route: 'stock-locations', color: 'bg-slate-700 hover:bg-slate-800 text-white' },
    { label: 'Notifications', icon: Bell, route: 'stock-notifications', color: 'bg-rose-500 hover:bg-rose-600 text-white' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Keeper Dashboard</h1>
            <p className="text-xs text-slate-500">Welcome back, {currentUser?.name} · Medicine Arrangement & Batch Management</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-2xl border p-5 flex flex-col gap-3 ${card.color}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-2xl font-black">{card.value}</p>
                <p className="text-xs font-medium opacity-80">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.route}
                onClick={() => setCurrentRoute(action.route)}
                className={`flex flex-col items-center gap-2 py-5 px-3 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-sm ${action.color}`}
              >
                <Icon className="w-5 h-5" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unarranged Batches Alert */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Unarranged Batches</h2>
            </div>
            {unarrangedBatches.length > 0 && (
              <button
                onClick={() => setCurrentRoute('stock-arrangement')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
              >
                Arrange All →
              </button>
            )}
          </div>
          {unarrangedBatches.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">All batches are arranged!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {unarrangedBatches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{batch.medicineName}</p>
                    <p className="text-xs text-slate-500">Batch {batch.batchNumber} · {batch.quantity} units · Exp: {batch.expiryDate}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                    Unarranged
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Arranged */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800">Recently Arranged</h2>
          </div>
          {recentArranged.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No arranged batches yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentArranged.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{batch.medicineName}</p>
                    <p className="text-xs text-slate-500">Batch {batch.batchNumber} · {batch.quantity} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700">
                      {batch.rack ? `Rack ${batch.rack}` : '—'}{batch.shelf ? `, Shelf ${batch.shelf}` : ''}
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      Arranged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unread Notifications */}
      {unreadNotifs.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-rose-800">Unread Notifications ({unreadNotifs.length})</h2>
            </div>
            <button
              onClick={() => setCurrentRoute('stock-notifications')}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {unreadNotifs.slice(0, 3).map((notif) => (
              <div key={notif.id} className="bg-white rounded-xl border border-rose-100 px-4 py-3">
                <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
