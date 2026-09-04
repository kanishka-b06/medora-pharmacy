import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge, StockStatusBadge } from '../../components/common/Badge';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { AddEditMedicineModal } from '../../components/modals/AddEditMedicineModal';
import { RestockModal } from '../../components/modals/RestockModal';
import { RecordSaleModal } from '../../components/modals/RecordSaleModal';
import { OrderMedicineModal } from '../../components/modals/OrderMedicineModal';
import { MedicineDetailsModal } from '../../components/modals/MedicineDetailsModal';
import { DashboardAIChatbox } from '../../components/dashboard/DashboardAIChatbox';
import { PharmacyCalendar } from '../../components/dashboard/PharmacyCalendar';
import {
  Package,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  PlusCircle,
  Truck,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function AdminDashboard({ setCurrentRoute }) {
  const { currentUser, stats, medicines, activities, orders, settings } = usePharmacy();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [activeAlertFilter, setActiveAlertFilter] = useState('all'); // all, oos, low, expiry

  // Filtered alerts
  const filteredAlerts = stats.criticalAlerts.filter((a) => {
    if (activeAlertFilter === 'oos') return a.type === 'out_of_stock';
    if (activeAlertFilter === 'low') return a.type === 'low_stock';
    if (activeAlertFilter === 'expiry') return a.type === 'expiry_high';
    return true;
  });

  // Recent 6 activities
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-[#f0fdf9] to-[#dffbfc]/40 p-6 sm:p-7 rounded-3xl border border-teal-200/80 shadow-[0_10px_30px_-10px_rgba(13,148,136,0.08)]">
        {/* Soft aqua decorative shapes */}
        <div
          className="absolute -right-16 -top-16 w-52 h-52 rounded-full pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(153,246,223,0.45) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full pointer-events-none opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.35) 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold uppercase tracking-wider border border-teal-200/80">
            <span className="w-2 h-2 rounded-full bg-[#11b3a1] animate-pulse" />
            <span>Pharmacy Operations Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900">
            Welcome 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl font-medium">
            Manage inventory, expiry, orders and pharmacy operations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSaleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#11b3a1] hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-[#11b3a1]/25"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Record Sale</span>
          </button>

          <button
            onClick={() => setIsRestockModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 transition-all shadow-sm"
          >
            <Truck className="w-4 h-4 text-teal-600" />
            <span>Receive Restock</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-extrabold border border-teal-300/80 transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-teal-600" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Upper Grid: Top-Left Calendar Widget + Top-Right 6 Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Top-Left: Pharmacy Calendar Widget with Operations Schedule */}
        <div className="lg:col-span-5 h-full">
          <PharmacyCalendar />
        </div>

        {/* Top-Right: 6 Stat Overview Metric Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 content-between">
          <StatCard
            title="Total Medicines"
            value={stats.totalMedicines}
            subtitle="Unique SKUs"
            icon={Package}
            color="teal"
            onClick={() => setCurrentRoute('admin-inventory')}
          />
          <StatCard
            title="Total Stock"
            value={stats.totalStock}
            subtitle="Units across racks"
            icon={Boxes}
            color="blue"
            onClick={() => setCurrentRoute('admin-stock')}
          />
          <StatCard
            title="Available"
            value={stats.availableCount}
            subtitle="Healthy stock level"
            icon={CheckCircle2}
            color="emerald"
            onClick={() => setCurrentRoute('admin-stock')}
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockCount}
            subtitle="≤ Threshold limit"
            icon={AlertTriangle}
            color="amber"
            badgeText={stats.lowStockCount > 0 ? 'Action Needed' : 'Normal'}
            badgeVariant={stats.lowStockCount > 0 ? 'amber' : 'emerald'}
            onClick={() => setCurrentRoute('admin-stock')}
          />
          <StatCard
            title="Out of Stock"
            value={stats.outOfStockCount}
            subtitle="0 Units left"
            icon={AlertOctagon}
            color="rose"
            badgeText={stats.outOfStockCount > 0 ? 'Critical' : 'None'}
            badgeVariant={stats.outOfStockCount > 0 ? 'rose' : 'emerald'}
            onClick={() => setCurrentRoute('admin-stock')}
          />
          <StatCard
            title="Expiring Soon"
            value={stats.totalExpiringRisk}
            subtitle={`Within ${settings.expiryWarningDays} days`}
            icon={Clock}
            color="purple"
            badgeText={stats.highExpiryRiskCount > 0 ? `${stats.highExpiryRiskCount} High Risk` : 'Monitored'}
            badgeVariant={stats.highExpiryRiskCount > 0 ? 'rose' : 'emerald'}
            onClick={() => setCurrentRoute('admin-expiry')}
          />
        </div>
      </div>

      {/* Main Grid: Critical Alerts & Stock Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Critical Alerts & Stock Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Alerts Panel */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-teal-100/80 shadow-[0_4px_20px_-4px_rgba(13,148,136,0.06)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">Critical Inventory Alerts</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    {stats.criticalAlerts.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Items requiring immediate replenishment, ordering, or expiry review
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-teal-50/80 border border-teal-200/60 text-xs font-semibold">
                <button
                  onClick={() => setActiveAlertFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeAlertFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold border border-teal-200/80' : 'text-slate-600 hover:text-teal-900'
                  }`}
                >
                  All ({stats.criticalAlerts.length})
                </button>
                <button
                  onClick={() => setActiveAlertFilter('oos')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeAlertFilter === 'oos' ? 'bg-white text-rose-800 shadow-sm font-bold border border-rose-200/80' : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Out ({stats.outOfStockCount})
                </button>
                <button
                  onClick={() => setActiveAlertFilter('low')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activeAlertFilter === 'low' ? 'bg-white text-amber-800 shadow-sm font-bold border border-amber-200/80' : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  Low ({stats.lowStockCount})
                </button>
              </div>
            </div>

            {/* Alerts List */}
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">All inventory levels are healthy</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No critical stockouts or urgent expiry risks in this filter.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAlerts.map((alert) => {
                  const isOOS = alert.type === 'out_of_stock';
                  const isLow = alert.type === 'low_stock';
                  const isExp = alert.type === 'expiry_high';

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isOOS
                          ? 'bg-rose-50/50 border-rose-200/90'
                          : isLow
                          ? 'bg-amber-50/50 border-amber-200/90'
                          : 'bg-red-50/60 border-red-200/90'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl text-xs font-bold mt-0.5 ${
                          isOOS ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isOOS ? '🔴 OUT' : isLow ? '🟠 LOW' : '⚠️ EXP'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-slate-900">{alert.medicine?.name}</h4>
                            <RackShelfBadge rack={alert.medicine?.rack} shelf={alert.medicine?.shelf} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{alert.message}</p>
                          {alert.expectedRestock && (
                            <p className="text-[10px] text-teal-800 font-semibold mt-0.5">
                              Expected Restock: {new Date(alert.expectedRestock).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Action Button */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setSelectedMedicine(alert.medicine);
                          }}
                          className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white border border-teal-200/80 text-slate-700 hover:bg-teal-50/60 transition-colors shadow-sm"
                        >
                          Details
                        </button>
                        {isOOS && (
                          <button
                            onClick={() => {
                              setSelectedMedicine(alert.medicine);
                              setIsOrderModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                          >
                            Order Stock
                          </button>
                        )}
                        {isLow && (
                          <button
                            onClick={() => {
                              setSelectedMedicine(alert.medicine);
                              setIsRestockModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm"
                          >
                            Restock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stock Distribution Overview Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-teal-100/80 shadow-[0_4px_20px_-4px_rgba(13,148,136,0.06)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-teal-100/50">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Stock Availability Ratio</h3>
                <p className="text-xs text-slate-500 mt-0.5">Overall health breakdown of stored items</p>
              </div>
              <button
                onClick={() => setCurrentRoute('admin-stock')}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>Manage Stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-teal-50/80 border border-teal-100/80 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${(stats.availableCount / (stats.totalMedicines || 1)) * 100}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`Available: ${stats.availableCount}`}
                />
                <div
                  style={{ width: `${(stats.lowStockCount / (stats.totalMedicines || 1)) * 100}%` }}
                  className="bg-amber-400 transition-all duration-500"
                  title={`Low Stock: ${stats.lowStockCount}`}
                />
                <div
                  style={{ width: `${(stats.outOfStockCount / (stats.totalMedicines || 1)) * 100}%` }}
                  className="bg-rose-500 transition-all duration-500"
                  title={`Out of Stock: ${stats.outOfStockCount}`}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs pt-1 text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Available ({stats.availableCount} items • {Math.round((stats.availableCount / (stats.totalMedicines || 1)) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>Low Stock ({stats.lowStockCount} items • {Math.round((stats.lowStockCount / (stats.totalMedicines || 1)) * 100)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span>Out of Stock ({stats.outOfStockCount} items • {Math.round((stats.outOfStockCount / (stats.totalMedicines || 1)) * 100)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Copilot Chatbox & Quick Shortcuts */}
        <div className="space-y-6">
          {/* MEDORA AI Assistant Chatbox */}
          <DashboardAIChatbox setCurrentRoute={setCurrentRoute} />

          {/* Quick Management Shortcuts */}
          <div className="bg-gradient-to-br from-white via-[#f0fdf9] to-[#dffbfc]/40 text-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm border border-teal-200/80 space-y-3">
            <h4 className="text-sm font-extrabold flex items-center gap-2 text-teal-800">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI Alternative Assistant</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              When medicines are out of stock, staff can scan the local pharmacy inventory for verified generic and therapeutic equivalents.
            </p>
            <button
              onClick={() => setCurrentRoute('admin-ai-activity')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm shadow-teal-600/20"
            >
              <span>Review AI Suggestion Activity</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Modals */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setSelectedMedicine(null);
        }}
        medicineToRestock={selectedMedicine}
      />

      <RecordSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setSelectedMedicine(null);
        }}
        preselectedMedicine={selectedMedicine}
      />

      <OrderMedicineModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedMedicine(null);
        }}
        medicineToOrder={selectedMedicine}
      />

      <MedicineDetailsModal
        isOpen={!!selectedMedicine && !isRestockModalOpen && !isOrderModalOpen && !isSaleModalOpen}
        onClose={() => setSelectedMedicine(null)}
        medicine={selectedMedicine}
        onOpenSale={(m) => {
          setSelectedMedicine(m);
          setIsSaleModalOpen(true);
        }}
        onOpenAlternatives={(m) => {
          setSelectedMedicine(m);
          setCurrentRoute('worker-alternatives');
        }}
      />
    </div>
  );
}
