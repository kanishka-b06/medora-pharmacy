import React, { useState, useEffect, useMemo } from 'react';
import { Drawer } from '../common/Drawer';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Truck, CheckCircle2, ArrowRight, ChevronDown, ChevronUp,
  Search, Package, AlertTriangle, MapPin
} from 'lucide-react';

export function RestockModal({ isOpen, onClose, medicineToRestock = null, order = null }) {
  const { receiveRestock, medicines, settings } = usePharmacy();

  const [selectedMedId, setSelectedMedId] = useState(medicineToRestock?.id || order?.medicineId || '');
  const [addedQuantity, setAddedQuantity] = useState(order?.orderedQuantity || 50);
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [rack, setRack] = useState('A');
  const [shelf, setShelf] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
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
    setSearchQuery('');
    setShowAdvanced(false);
  }, [medicineToRestock, order, isOpen, medicines]);

  const targetMed = medicines.find((m) => m.id === selectedMedId);
  const prevQuantity = targetMed ? targetMed.quantity : 0;
  const newTotal = prevQuantity + (parseInt(addedQuantity, 10) || 0);

  const filteredMedicines = useMemo(() => {
    if (!searchQuery.trim()) return medicines;
    const q = searchQuery.toLowerCase();
    return medicines.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.category || '').toLowerCase().includes(q)
    );
  }, [medicines, searchQuery]);

  const handleSelectMed = (m) => {
    setSelectedMedId(m.id);
    setRack(m.rack || 'A');
    setShelf(m.shelf || '1');
    setNewPrice(m.price || '');
    setSearchQuery('');
  };

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

  const stockStatus = targetMed?.quantity === 0
    ? { label: 'Out of Stock', color: 'bg-red-100 text-red-700' }
    : targetMed?.quantity < 20
      ? { label: 'Low Stock', color: 'bg-amber-100 text-amber-700' }
      : { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700' };

  const footer = (
    <div className="px-6 py-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        Cancel
      </button>
      <button
        form="restock-form"
        type="submit"
        disabled={!selectedMedId}
        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Confirm Restock
      </button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Shipment"
      subtitle="Restock inventory from incoming delivery"
      icon={Truck}
      footer={footer}
    >
      <form id="restock-form" onSubmit={handleSubmit}>
        <div className="px-6 py-5 space-y-6">

          {/* ── Medicine Picker ── */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Select Medicine *
            </label>

            {/* Search box */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition"
              />
            </div>

            {/* Selected medicine pill */}
            {targetMed && !searchQuery && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-teal-500 bg-teal-50/60 mb-2">
                <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{targetMed.name}</p>
                  <p className="text-xs text-slate-500">{targetMed.category} · Rack {targetMed.rack}{targetMed.shelf}</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              </div>
            )}

            {/* Dropdown list (shown when searching) */}
            {searchQuery && (
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                {filteredMedicines.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500 text-center">No medicines found</p>
                ) : (
                  filteredMedicines.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMed(m)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-teal-50 transition-colors border-b border-slate-100 last:border-0
                        ${m.id === selectedMedId ? 'bg-teal-50' : 'bg-white'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.category} · {m.quantity} units</p>
                      </div>
                      {m.quantity === 0 && (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Stock Preview ── */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-white">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Replenishment Preview
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <p className="text-2xl font-black tabular-nums">{prevQuantity}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Current</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400">+{addedQuantity || 0}</span>
              </div>
              <div className="flex-1 text-center">
                <p className="text-2xl font-black tabular-nums text-emerald-400">{newTotal}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">After Restock</p>
              </div>
            </div>
          </div>

          {/* ── Quantity ── */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
              Quantity Received *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddedQuantity(Math.max(1, (parseInt(addedQuantity, 10) || 1) - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xl flex items-center justify-center transition shrink-0"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={addedQuantity}
                onChange={(e) => setAddedQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="flex-1 text-center px-3 py-2.5 text-lg font-black rounded-xl border-2 border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setAddedQuantity((parseInt(addedQuantity, 10) || 0) + 1)}
                className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl flex items-center justify-center transition shrink-0"
              >
                +
              </button>
            </div>
            {/* Quick-pick presets */}
            <div className="flex gap-2 mt-2">
              {[10, 25, 50, 100].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setAddedQuantity(qty)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition
                    ${addedQuantity === qty
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'}`}
                >
                  +{qty}
                </button>
              ))}
            </div>
          </div>

          {/* ── Storage Location ── */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Storage Location</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Rack</label>
                <div className="flex gap-1.5 flex-wrap">
                  {commonRacks.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRack(r)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold border transition
                        ${rack === r
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Shelf</label>
                <div className="flex gap-1.5 flex-wrap">
                  {commonShelves.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShelf(s)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold border transition
                        ${shelf === s
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Advanced Details (collapsible) ── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Advanced Details
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Batch · Expiry · Price</span>
                {showAdvanced
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showAdvanced && (
              <div className="px-4 pb-4 pt-3 space-y-3 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Batch Number</label>
                    <input
                      type="text"
                      placeholder={targetMed?.batchNumber ? `${targetMed.batchNumber}-R` : 'e.g. B205'}
                      value={newBatchNumber}
                      onChange={(e) => setNewBatchNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Unit Price ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={targetMed?.price ? `${targetMed.price}` : '25.00'}
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">New Expiry Date</label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </Drawer>
  );
}
