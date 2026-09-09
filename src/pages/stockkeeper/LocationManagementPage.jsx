import React, { useMemo } from 'react';
import { MapPin, Package, CheckCircle2, Layers } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

const RACKS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SHELVES = [1, 2, 3, 4, 5, 6];

export function LocationManagementPage({ setCurrentRoute }) {
  const { batches } = usePharmacy();

  // Build a grid: rack → shelf → list of batches
  const grid = useMemo(() => {
    const map = {};
    for (const rack of RACKS) {
      map[rack] = {};
      for (const shelf of SHELVES) {
        map[rack][shelf] = [];
      }
    }
    for (const batch of batches) {
      if (batch.rack && batch.shelf && batch.status === 'Arranged') {
        const r = batch.rack.toUpperCase();
        const s = parseInt(batch.shelf, 10);
        if (map[r] && map[r][s]) {
          map[r][s].push(batch);
        }
      }
    }
    return map;
  }, [batches]);

  const arrangedCount = batches.filter((b) => b.status === 'Arranged').length;
  const unarrangedCount = batches.filter((b) => b.status === 'Unarranged').length;

  // Count occupied cells
  let occupiedCells = 0;
  for (const rack of RACKS) {
    for (const shelf of SHELVES) {
      if (grid[rack][shelf].length > 0) occupiedCells++;
    }
  }
  const totalCells = RACKS.length * SHELVES.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Location Map</h1>
          <p className="text-xs text-slate-500">Visual overview of all rack and shelf assignments.</p>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          <p className="text-xl font-black text-teal-700">{occupiedCells}<span className="text-slate-300 font-normal text-sm">/{totalCells}</span></p>
          <p className="text-xs text-slate-500 font-medium">Occupied Slots</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          <p className="text-xl font-black text-emerald-700">{arrangedCount}</p>
          <p className="text-xs text-slate-500 font-medium">Arranged Batches</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-1">
          <p className="text-xl font-black text-amber-700">{unarrangedCount}</p>
          <p className="text-xs text-slate-500 font-medium">Unarranged</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-teal-100 border border-teal-300" />
          <span>Has Medicines</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-slate-50 border border-slate-200" />
          <span>Empty</span>
        </div>
      </div>

      {/* Grid - one rack per row */}
      <div className="space-y-4">
        {RACKS.map((rack) => (
          <div key={rack} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Rack Header */}
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/60 border-b border-slate-100">
              <Layers className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-700">Rack {rack}</h2>
              <span className="ml-auto text-xs text-slate-400">
                {SHELVES.filter((s) => grid[rack][s].length > 0).length} / {SHELVES.length} shelves occupied
              </span>
            </div>

            {/* Shelf Cells */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-slate-100">
              {SHELVES.map((shelf) => {
                const batchesHere = grid[rack][shelf];
                const hasItems = batchesHere.length > 0;
                return (
                  <div
                    key={shelf}
                    className={`p-3 min-h-[90px] flex flex-col gap-1 transition-colors ${
                      hasItems ? 'bg-teal-50' : 'bg-white'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wide ${hasItems ? 'text-teal-600' : 'text-slate-400'}`}>
                      Shelf {shelf}
                    </p>
                    {hasItems ? (
                      <div className="space-y-1 mt-0.5">
                        {batchesHere.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white border border-teal-200 rounded-lg px-2 py-1.5 shadow-sm"
                          >
                            <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">{b.medicineName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{b.batchNumber}</p>
                            <p className="text-[10px] text-slate-500">{b.quantity} units</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-[10px] text-slate-300 font-medium">Empty</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Unarranged reminder */}
      {unarrangedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-800 font-semibold">
              {unarrangedCount} batch(es) still need to be arranged.
            </p>
          </div>
          <button
            onClick={() => setCurrentRoute('stock-arrangement')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            Arrange Now →
          </button>
        </div>
      )}

      {arrangedCount === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center shadow-sm">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500 mb-1">No batches assigned to locations yet.</p>
          <p className="text-xs text-slate-400">Add and arrange batches to see them here.</p>
          <button
            onClick={() => setCurrentRoute('stock-new-batch')}
            className="mt-5 px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
          >
            + Add New Batch
          </button>
        </div>
      )}
    </div>
  );
}
