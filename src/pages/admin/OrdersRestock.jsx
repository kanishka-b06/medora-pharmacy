import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Badge } from '../../components/common/Badge';
import { OrderMedicineModal } from '../../components/modals/OrderMedicineModal';
import { RestockModal } from '../../components/modals/RestockModal';
import {
  Truck,
  PlusCircle,
  CheckCircle2,
  Clock,
  Package,
  Calendar,
  Building,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export function OrdersRestock() {
  const { orders, updateOrderStatus, medicines, settings } = usePharmacy();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrderForRestock, setSelectedOrderForRestock] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Ordered':
        return <Badge variant="ordered">🔵 Ordered</Badge>;
      case 'In Transit':
        return <Badge variant="transit">🟣 In Transit</Badge>;
      case 'Arrived':
        return <Badge variant="arrived">🟢 Arrived & Restocked</Badge>;
      case 'Order Required':
        return <Badge variant="low_stock">🟠 Order Required</Badge>;
      case 'Cancelled':
        return <Badge variant="default">✕ Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Orders & Restock</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage distributor purchase orders, track in-transit deliveries, and confirm received stock.
          </p>
        </div>

        <button
          onClick={() => setIsOrderModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Orders Filter */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-bold">
        {['all', 'Ordered', 'In Transit', 'Arrived', 'Order Required'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'all' ? `All Orders (${orders.length})` : st}
          </button>
        ))}
      </div>

      {/* Orders Grid/Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Order ID & Date</th>
                <th className="px-4 py-3.5">Medicine Name</th>
                <th className="px-4 py-3.5">Supplier / Distributor</th>
                <th className="px-4 py-3.5">Quantity</th>
                <th className="px-4 py-3.5">Expected Arrival</th>
                <th className="px-4 py-3.5">Est. Cost</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No orders found in this category</p>
                    <p className="text-[11px] mt-0.5">Click "New Purchase Order" to create a restock request.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-teal-800 font-bold text-[11px]">{ord.id}</div>
                      <div className="text-[11px] text-slate-400">{ord.orderDate}</div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {ord.medicineName}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ord.supplier}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {ord.orderedQuantity} units
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>{ord.expectedArrivalDate || 'Pending confirmation'}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {settings.currencySymbol}{Number(ord.estimatedCost || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {getOrderStatusBadge(ord.status)}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ord.status === 'Ordered' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'In Transit')}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                          >
                            Mark In Transit
                          </button>
                        )}

                        {ord.status !== 'Arrived' && (
                          <button
                            onClick={() => setSelectedOrderForRestock(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Receive & Restock</span>
                          </button>
                        )}

                        {ord.status === 'Arrived' && (
                          <span className="text-[11px] font-semibold text-emerald-700">Restocked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OrderMedicineModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      <RestockModal
        isOpen={!!selectedOrderForRestock}
        onClose={() => setSelectedOrderForRestock(null)}
        order={selectedOrderForRestock}
      />
    </div>
  );
}
