import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { usePharmacy } from '../../context/PharmacyContext';
import { Truck, CheckCircle2, ArrowRight, Layers } from 'lucide-react';

export function RestockModal({ isOpen, onClose, medicineToRestock = null, order = null }) {
  const { receiveRestock, medicines, settings } = usePharmacy();

  const [selectedMedId, setSelectedMedId] = useState(medicineToRestock?.id || order?.medicineId || '');
  const [addedQuantity, setAddedQuantity] = useState(order?.orderedQuantity || 50);
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [rack, setRack] = useState('A');
  const [shelf, setShelf] = useState('1');

  useEffect(() => {
    if (medicineToRestock) {
      setSelectedMedId(medicineToRestock.id);
      setRack(medicineToRestock.rack || 'A');
      setShelf(medicineToRestock.shelf || '1');
      setNewPrice(medicineToRestock.price || '');
    } else if (order) {
      setSelectedMedId(order.medicineId);
      setAddedQuantity(order.orderedQuantity || 50);
      const targetMed = medicines.find((m) => m.id === order.medicineId);
      if (targetMed) {
        setRack(targetMed.rack || 'A');
        setShelf(targetMed.shelf || '1');
        setNewPrice(targetMed.price || '');
      }
    }
  }, [medicineToRestock, order, isOpen, medicines]);

  const targetMed = medicines.find((m) => m.id === selectedMedId);
  const prevQuantity = targetMed ? targetMed.quantity : 0;
  const newTotal = prevQuantity + (parseInt(addedQuantity, 10) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMedId || addedQuantity <= 0) return;

    receiveRestock(selectedMedId, {
      addedQuantity: parseInt(addedQuantity, 10) || 0,
      newBatchNumber,
      newExpiryDate,
      newPrice: newPrice !== '' ? parseFloat(newPrice) : undefined,
      rack,
      shelf,
      orderId: order?.id
    });

    onClose();
  };

  const commonRacks = ['A', 'B', 'C', 'D', 'E', 'F'];
  const commonShelves = ['1', '2', '3', '4', '5'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restock Medicine / Receive Shipment"
      subtitle="Fulfill incoming orders and restore inventory availability"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Medicine Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Medicine to Restock *
          </label>
          <select
            value={selectedMedId}
            onChange={(e) => {
              setSelectedMedId(e.target.value);
              const m = medicines.find((item) => item.id === e.target.value);
              if (m) {
                setRack(m.rack);
                setShelf(m.shelf);
                setNewPrice(m.price);
              }
            }}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {medicines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — Current: {m.quantity} units ({m.quantity === 0 ? 'Out of Stock' : 'In Stock'})
              </option>
            ))}
          </select>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200">
          <div className="text-[11px] font-bold text-teal-900 uppercase tracking-wider mb-1.5">
            Stock Replenishment Preview
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
              {prevQuantity} prev
            </span>
            <span className="text-slate-400">+</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 font-extrabold text-emerald-800">
              +{addedQuantity || 0} received
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-black shadow-sm">
              {newTotal} AVAILABLE 🟢
            </span>
          </div>
        </div>

        {/* Quantity and Batch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity Received *
            </label>
            <input
              type="number"
              min="1"
              value={addedQuantity}
              onChange={(e) => setAddedQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Batch Number
            </label>
            <input
              type="text"
              placeholder={targetMed?.batchNumber ? `e.g. ${targetMed.batchNumber}-R` : 'e.g. B205'}
              value={newBatchNumber}
              onChange={(e) => setNewBatchNumber(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Expiry and Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Expiry Date
            </label>
            <input
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Updated Unit Price ({settings.currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={targetMed?.price ? `${targetMed.price}` : '25.00'}
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Shelf coordinates check */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirmed Rack</label>
            <select
              value={rack}
              onChange={(e) => setRack(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
            >
              {commonRacks.map((r) => (
                <option key={r} value={r}>Rack {r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirmed Shelf</label>
            <select
              value={shelf}
              onChange={(e) => setShelf(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
            >
              {commonShelves.map((s) => (
                <option key={s} value={s}>Shelf {s}</option>
              ))}
            </select>
          </div>
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
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Restock</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
