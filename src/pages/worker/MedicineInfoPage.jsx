import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { StockStatusBadge, Badge } from '../../components/common/Badge';
import { calculateExpiryRisk } from '../../services/aiMatchingEngine';
import {
  Layers,
  MapPin,
  Search,
  Package,
  Shield,
  Sparkles,
  Info,
  Grid,
  AlertTriangle
} from 'lucide-react';

export function MedicineInfoPage({ setCurrentRoute, onSelectMedicineForAI }) {
  const { medicines, settings } = usePharmacy();
  const [selectedRack, setSelectedRack] = useState('B');
  const [selectedShelf, setSelectedShelf] = useState('all'); // all, 1, 2, 3, 4
  const [viewMode, setViewMode] = useState('cabinet'); // 'cabinet' | 'list'

  const racks = ['A', 'B', 'C', 'D'];
  const rackDetails = {
    A: {
      category: 'General OTC, Antihistamines & Oral Electrolytes',
      zone: 'Front Counter Area (Fast Retrieval)',
      color: 'border-teal-400 bg-teal-50/50 text-teal-900',
      badgeBg: 'bg-teal-100 text-teal-800'
    },
    B: {
      category: 'Analgesics, Antipyretics & NSAID Pain Management',
      zone: 'Central Dispensing Aisle (High Velocity)',
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    C: {
      category: 'Antibiotics & Antimicrobial Formulations',
      zone: 'Prescription Secure Storage (Pharmacist Controlled)',
      color: 'border-cyan-500 bg-cyan-50/50 text-cyan-900',
      badgeBg: 'bg-cyan-100 text-cyan-800'
    },
    D: {
      category: 'Gastrointestinal, Chronic Care & Anti-diabetic',
      zone: 'Rear Storage Bay (Chronic Prescriptions)',
      color: 'border-teal-600 bg-teal-50/60 text-teal-950',
      badgeBg: 'bg-teal-100 text-teal-800'
    }
  };

  // Filter medicines present in the selected physical storage rack and shelf
  const medicinesInSelectedRack = medicines.filter((medicine) => {
    if (medicine.rack !== selectedRack) return false;
    if (selectedShelf !== 'all' && medicine.shelf.toString() !== selectedShelf.toString()) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pharmacy Physical Storage Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive 2D floorplan and cabinet layout of storage racks to accelerate in-store medicine retrieval.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setViewMode('cabinet')}
            className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'cabinet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            2D Cabinet View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Detailed List
          </button>
        </div>
      </div>

      {/* 2D Pharmacy Floorplan Visualizer */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-teal-100/80 shadow-[0_12px_40px_-15px_rgba(13,148,136,0.1)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-200 flex items-center justify-center text-teal-700">
              <Grid className="w-4 h-4 text-teal-600" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Pharmacy Storage Zones (Click a Rack)</h3>
          </div>
          <span className="text-[11px] font-semibold text-teal-700/80 bg-teal-50 border border-teal-200/60 px-2.5 py-1 rounded-full">
            4 Main Storage Racks
          </span>
        </div>

        {/* Floorplan Rack Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {racks.map((r) => {
            const count = medicines.filter((m) => m.rack === r).length;
            const isSelected = selectedRack === r;
            const details = rackDetails[r];

            return (
              <div
                key={r}
                onClick={() => setSelectedRack(r)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group ${isSelected
                  ? 'border-teal-500 bg-gradient-to-br from-[#dffbfc] via-[#e6faf8] to-[#c8f4f4] shadow-md ring-4 ring-teal-500/15'
                  : 'border-slate-200/80 bg-white/70 hover:bg-teal-50/40 hover:border-teal-300'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-sm transition-transform group-hover:scale-105 ${
                    isSelected 
                      ? 'bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-teal-600/30' 
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {r}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
                    isSelected 
                      ? 'bg-teal-700 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}>
                    {count} Medicines
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="font-extrabold text-slate-900 text-sm">Rack {r}</h4>
                  <p className="text-[11px] font-semibold text-teal-800 mt-0.5">{details.category}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{details.zone}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Rack Shelf View */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-teal-100/80 shadow-[0_12px_40px_-15px_rgba(13,148,136,0.1)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-teal-600/20">
                {selectedRack}
              </span>
              <h3 className="text-base font-extrabold text-slate-900">
                Inside Rack {selectedRack} • {rackDetails[selectedRack]?.category}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{rackDetails[selectedRack]?.zone}</p>
          </div>

          {/* Shelf filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-teal-50/80 border border-teal-200/60 text-xs font-bold">
            <button
              onClick={() => setSelectedShelf('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedShelf === 'all' 
                  ? 'bg-white text-teal-900 shadow-sm border border-teal-200/80' 
                  : 'text-teal-700 hover:text-teal-900'
              }`}
            >
              All Shelves
            </button>
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedShelf(s.toString())}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedShelf === s.toString() 
                    ? 'bg-white text-teal-900 shadow-sm border border-teal-200/80' 
                    : 'text-teal-700 hover:text-teal-900'
                }`}
              >
                Shelf {s}
              </button>
            ))}
          </div>
        </div>

        {/* 2D Shelf Cabinet Visual Grid */}
        <div className="space-y-4">
          {[1, 2, 3, 4].filter(s => selectedShelf === 'all' || selectedShelf === s.toString()).map((shelfNum) => {
            const shelfItems = medicines.filter(
              (m) => m.rack === selectedRack && m.shelf.toString() === shelfNum.toString()
            );

            return (
              <div
                key={shelfNum}
                className="p-4 rounded-2xl bg-gradient-to-r from-[#f0fdf9] to-[#e6faf8]/60 border border-teal-200/70 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between pb-2 border-b border-teal-200/50">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-600 text-white font-extrabold text-xs shadow-sm shadow-teal-600/20">
                      Rack {selectedRack} → Shelf {shelfNum}
                    </span>
                    <span className="text-xs font-bold text-slate-800">Level {shelfNum} Compartment</span>
                  </div>
                  <span className="text-xs text-teal-800 font-semibold bg-white/80 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                    {shelfItems.length} Products Stored
                  </span>
                </div>

                {shelfItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No medicines currently assigned to Shelf {shelfNum}.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shelfItems.map((med) => {
                      const isOOS = med.quantity === 0;
                      const isLow = med.quantity <= med.lowStockThreshold && med.quantity > 0;
                      const exp = calculateExpiryRisk(med.expiryDate);

                      return (
                        <div
                          key={med.id}
                          className={`p-3.5 rounded-xl border bg-white shadow-sm transition-all duration-200 hover:border-teal-400 hover:shadow-md hover:shadow-teal-500/5 ${
                            isOOS ? 'border-rose-200 bg-rose-50/20' : isLow ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <h5 className="font-extrabold text-slate-900 text-xs">{med.name}</h5>
                              <p className="text-[10px] text-slate-500">{med.activeIngredient} • {med.strength}</p>
                            </div>
                            <StockStatusBadge quantity={med.quantity} threshold={med.lowStockThreshold} size="sm" />
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Batch: <strong className="font-mono text-slate-800">{med.batchNumber}</strong></span>
                            <span className="font-extrabold text-teal-700">
                              {settings.currencySymbol}{Number(med.price).toFixed(2)}
                            </span>
                          </div>

                          {/* Quick AI alternative trigger if out of stock */}
                          {isOOS && (
                            <button
                              onClick={() => {
                                if (onSelectMedicineForAI) onSelectMedicineForAI(med);
                                setCurrentRoute('worker-alternatives');
                              }}
                              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200 transition-colors shadow-sm"
                            >
                              <Sparkles className="w-3 h-3 text-teal-600" />
                              <span>Find Alternative in Database</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
