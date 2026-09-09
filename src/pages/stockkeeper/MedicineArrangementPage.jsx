import React, { useState } from 'react';
import { ClipboardList, MapPin, CheckCircle2, Package, X } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

const RACKS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SHELVES = [1, 2, 3, 4, 5, 6];

function ArrangeBatchModal({ batch, onClose, onArrange }) {
  const [rack, setRack] = useState('');
  const [shelf, setShelf] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!rack) e.rack = 'Please select a rack.';
    if (!shelf) e.shelf = 'Please select a shelf.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onArrange(batch.id, rack, shelf);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-800">Assign Physical Location</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Batch Info */}
        <div className="px-6 py-4 bg-teal-50 border-b border-teal-100">
          <p className="text-sm font-bold text-slate-800">{batch.medicineName} <span className="text-slate-500 font-normal">{batch.strength}</span></p>
          <p className="text-xs text-slate-500 mt-0.5">
            Batch <span className="font-mono font-semibold text-slate-700">{batch.batchNumber}</span>
            &ensp;·&ensp;{batch.quantity} units
            &ensp;·&ensp;Exp: {batch.expiryDate}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Rack */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Select Rack <span className="text-rose-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {RACKS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => { setRack(r); setErrors((p) => ({ ...p, rack: null })); }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                    rack === r
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            {errors.rack && <p className="text-[11px] text-rose-600 font-medium">{errors.rack}</p>}
          </div>

          {/* Shelf */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Select Shelf <span className="text-rose-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {SHELVES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => { setShelf(String(s)); setErrors((p) => ({ ...p, shelf: null })); }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold border-2 transition-all ${
                    shelf === String(s)
                      ? 'bg-teal-600 border-teal-600 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.shelf && <p className="text-[11px] text-rose-600 font-medium">{errors.shelf}</p>}
          </div>

          {/* Preview */}
          {rack && shelf && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-xs font-semibold text-teal-800">
              📍 {batch.medicineName} ({batch.strength}) → Batch {batch.batchNumber} → Rack {rack} → Shelf {shelf}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Arrangement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MedicineArrangementPage({ setCurrentRoute }) {
  const { batches, arrangeBatch } = usePharmacy();
  const [modalBatch, setModalBatch] = useState(null);
  const [filter, setFilter] = useState('unarranged');

  const filteredBatches = batches.filter((b) => {
    if (filter === 'unarranged') return b.status === 'Unarranged';
    if (filter === 'arranged') return b.status === 'Arranged';
    return true;
  });

  const handleArrange = (batchId, rack, shelf) => {
    arrangeBatch(batchId, { rack, shelf });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Batch Arrangement</h1>
          <p className="text-xs text-slate-500">Assign physical rack and shelf locations to batches.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'unarranged', label: 'Unarranged', color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { key: 'arranged', label: 'Arranged', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { key: 'all', label: 'All Batches', color: 'text-slate-700 bg-slate-50 border-slate-200' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filter === tab.key ? tab.color + ' shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-black/10 text-[10px]">
              {tab.key === 'unarranged'
                ? batches.filter((b) => b.status === 'Unarranged').length
                : tab.key === 'arranged'
                ? batches.filter((b) => b.status === 'Arranged').length
                : batches.length}
            </span>
          </button>
        ))}
      </div>

      {/* New Batches to Arrange Section */}
      {filter === 'unarranged' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
          <p className="text-xs font-semibold text-amber-800">
            📦 New Batches to Arrange — {batches.filter((b) => b.status === 'Unarranged').length} batch(es) awaiting physical placement.
          </p>
        </div>
      )}

      {/* Batch List */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No batches in this category.</p>
          {filter === 'unarranged' && (
            <button
              onClick={() => setCurrentRoute('stock-new-batch')}
              className="mt-4 px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
            >
              + Add New Batch
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filteredBatches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    batch.status === 'Arranged' ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    {batch.status === 'Arranged'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      : <Package className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{batch.medicineName} <span className="text-slate-500 font-normal text-xs">{batch.strength}</span></p>
                    <p className="text-xs text-slate-500">
                      Batch <span className="font-mono font-semibold">{batch.batchNumber}</span>
                      &ensp;·&ensp;{batch.quantity} units
                      &ensp;·&ensp;Exp: {batch.expiryDate}
                    </p>
                    {batch.status === 'Arranged' && batch.rack && (
                      <p className="text-xs text-teal-700 font-semibold mt-0.5">
                        📍 Rack {batch.rack}, Shelf {batch.shelf}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    batch.status === 'Arranged'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {batch.status}
                  </span>
                  {batch.status === 'Unarranged' && (
                    <button
                      onClick={() => setModalBatch(batch)}
                      className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
                    >
                      Arrange
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalBatch && (
        <ArrangeBatchModal
          batch={modalBatch}
          onClose={() => setModalBatch(null)}
          onArrange={handleArrange}
        />
      )}
    </div>
  );
}
