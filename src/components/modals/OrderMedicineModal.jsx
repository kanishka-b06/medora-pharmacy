import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { usePharmacy } from '../../context/PharmacyContext';
import { Truck, PlusCircle, Calendar } from 'lucide-react';

export function OrderMedicineModal({ isOpen, onClose, medicineToOrder = null }) {
  const { medicines, createOrder, settings } = usePharmacy();

  const [selectedMedId, setSelectedMedId] = useState(medicineToOrder?.id || '');
  const [supplier, setSupplier] = useState(medicineToOrder?.supplier || 'Apex Pharma Distributors');
  const [orderedQuantity, setOrderedQuantity] = useState(100);
  const [expectedArrivalDate, setExpectedArrivalDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (medicineToOrder) {
      setSelectedMedId(medicineToOrder.id);
      setSupplier(medicineToOrder.supplier || 'Apex Pharma Distributors');
      const estPrice = (medicineToOrder.price || 25) * 0.7 * 100; // rough procurement cost estimate
      setEstimatedCost(estPrice.toFixed(0));
    }
  }, [medicineToOrder, isOpen]);

  const targetMed = medicines.find((m) => m.id === selectedMedId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetMed || orderedQuantity <= 0) return;

    createOrder({
      medicineId: targetMed.id,
      medicineName: targetMed.name,
      supplier,
      orderedQuantity: parseInt(orderedQuantity, 10) || 50,
      expectedArrivalDate,
      estimatedCost: parseFloat(estimatedCost) || 0,
      notes
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Restock Purchase Order"
      subtitle="Issue replenishment request to authorized pharmaceutical distributor"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medicine Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Medicine to Order *
          </label>
          <select
            value={selectedMedId}
            onChange={(e) => {
              setSelectedMedId(e.target.value);
              const m = medicines.find((item) => item.id === e.target.value);
              if (m?.supplier) setSupplier(m.supplier);
            }}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — Current: {m.quantity} units ({m.quantity === 0 ? '🔴 OUT OF STOCK' : 'In Stock'})
              </option>
            ))}
          </select>
        </div>

        {/* Supplier & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Distributor / Supplier *
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Dr. Reddy Labs / Apex Pharma"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ordered Quantity (Units) *
            </label>
            <input
              type="number"
              min="10"
              step="5"
              value={orderedQuantity}
              onChange={(e) => setOrderedQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Expected Arrival & Est Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expected Arrival Date *
            </label>
            <input
              type="date"
              value={expectedArrivalDate}
              onChange={(e) => setExpectedArrivalDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estimated Total Cost ({settings.currencySymbol})
            </label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Order Notes</label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Urgent prescription replenishment for out of stock counter items."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Submit Purchase Order</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
