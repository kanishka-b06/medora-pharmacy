import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { StockStatusBadge } from '../../components/common/Badge';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { RestockModal } from '../../components/modals/RestockModal';
import { OrderMedicineModal } from '../../components/modals/OrderMedicineModal';
import { RecordSaleModal } from '../../components/modals/RecordSaleModal';
import {
  SlidersHorizontal,
  Truck,
  ShoppingCart,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Package,
  Layers,
  Edit2
} from 'lucide-react';

export function StockManagement({ setCurrentRoute }) {
  const { medicines, updateMedicine, stats, settings } = usePharmacy();
  const [activeTab, setActiveTab] = useState('all'); // all, available, low, out
  const [selectedRestockMed, setSelectedRestockMed] = useState(null);
  const [selectedOrderMed, setSelectedOrderMed] = useState(null);
  const [selectedSaleMed, setSelectedSaleMed] = useState(null);
  const [editingThresholdMed, setEditingThresholdMed] = useState(null);
  const [tempThreshold, setTempThreshold] = useState(10);

  // Filter medicines by tab: all, available, low stock, or out of stock
  const filteredMedicines = medicines.filter((medicine) => {
    const lowStockLimit = medicine.lowStockThreshold || 10;
    if (activeTab === 'available') return medicine.quantity > lowStockLimit;
    if (activeTab === 'low') return medicine.quantity <= lowStockLimit && medicine.quantity > 0;
    if (activeTab === 'out') return medicine.quantity === 0;
    return true;
  });

  const handleSaveThreshold = (e) => {
    e.preventDefault();
    if (editingThresholdMed) {
      updateMedicine(editingThresholdMed.id, {
        lowStockThreshold: Math.max(1, parseInt(tempThreshold, 10) || 10)
      });
      setEditingThresholdMed(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor inventory levels, configure reorder thresholds, and initiate restocking workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedRestockMed(medicines[0])}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Receive Restock</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>All Stock ({medicines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'available'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Available ({stats.availableCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('low')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'low'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock ({stats.lowStockCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('out')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'out'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Out of Stock ({stats.outOfStockCount})</span>
        </button>
      </div>

      {/* Stock List Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Medicine</th>
                <th className="px-4 py-3.5">Storage Location</th>
                <th className="px-4 py-3.5">Current Quantity</th>
                <th className="px-4 py-3.5">Alert Threshold</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Expected Restock</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMedicines.map((med) => {
                const isOOS = med.quantity === 0;
                const isLow = med.quantity <= med.lowStockThreshold && med.quantity > 0;

                return (
                  <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-slate-500">{med.activeIngredient} • {med.strength}</div>
                    </td>

                    <td className="px-4 py-3">
                      <RackShelfBadge rack={med.rack} shelf={med.shelf} size="sm" />
                    </td>

                    <td className="px-4 py-3">
                      <span className={`text-base font-extrabold ${
                        isOOS ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {med.quantity}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">units</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">{med.lowStockThreshold} units</span>
                        <button
                          onClick={() => {
                            setEditingThresholdMed(med);
                            setTempThreshold(med.lowStockThreshold);
                          }}
                          className="p-1 text-slate-400 hover:text-teal-600 rounded transition-colors"
                          title="Change low stock threshold"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <StockStatusBadge quantity={med.quantity} threshold={med.lowStockThreshold} size="sm" />
                    </td>

                    <td className="px-4 py-3">
                      {med.expectedRestockDate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {med.expectedRestockDate} ({med.orderStatus})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isOOS ? (
                          <button
                            onClick={() => setSelectedOrderMed(med)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Order Stock</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedSaleMed(med)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Sell</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedRestockMed(med)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RestockModal
        isOpen={!!selectedRestockMed}
        onClose={() => setSelectedRestockMed(null)}
        medicineToRestock={selectedRestockMed}
      />

      <OrderMedicineModal
        isOpen={!!selectedOrderMed}
        onClose={() => setSelectedOrderMed(null)}
        medicineToOrder={selectedOrderMed}
      />

      <RecordSaleModal
        isOpen={!!selectedSaleMed}
        onClose={() => setSelectedSaleMed(null)}
        preselectedMedicine={selectedSaleMed}
      />

      {/* Threshold Modal */}
      {editingThresholdMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Set Low Stock Threshold</h3>
            <p className="text-xs text-slate-500 mb-4">{editingThresholdMed.name}</p>

            <form onSubmit={handleSaveThreshold} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Threshold Quantity (Triggers Low Stock Alert)
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold text-center rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingThresholdMed(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                >
                  Save Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
