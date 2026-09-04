import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { StockStatusBadge, Badge } from '../../components/common/Badge';
import { RecordSaleModal } from '../../components/modals/RecordSaleModal';
import { MedicineDetailsModal } from '../../components/modals/MedicineDetailsModal';
import { Modal } from '../../components/common/Modal';
import { calculateExpiryRisk } from '../../services/aiMatchingEngine';
import {
  Search,
  Pill,
  Sparkles,
  ShoppingCart,
  MapPin,
  Layers,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  X,
  ScanLine,
  Barcode
} from 'lucide-react';

export function WorkerSearch({ setCurrentRoute, onSelectMedicineForAI }) {
  const { medicines, settings, addToast } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRack, setSelectedRack] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, available, low, out
  const [selectedDosage, setSelectedDosage] = useState('all');

  // Modals
  const [saleModalMed, setSaleModalMed] = useState(null);
  const [detailsModalMed, setDetailsModalMed] = useState(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannedBatchInput, setScannedBatchInput] = useState('');

  // Fast filtered search
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        med.name.toLowerCase().includes(term) ||
        (med.brandName && med.brandName.toLowerCase().includes(term)) ||
        med.activeIngredient.toLowerCase().includes(term) ||
        med.strength.toLowerCase().includes(term) ||
        med.batchNumber.toLowerCase().includes(term) ||
        `rack ${med.rack}`.toLowerCase().includes(term) ||
        `shelf ${med.shelf}`.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      // Status filter
      if (selectedStatus === 'available' && med.quantity <= (med.lowStockThreshold || 10)) return false;
      if (selectedStatus === 'low' && (med.quantity > (med.lowStockThreshold || 10) || med.quantity === 0)) return false;
      if (selectedStatus === 'out' && med.quantity !== 0) return false;

      // Rack filter
      if (selectedRack !== 'all' && med.rack !== selectedRack) return false;

      // Dosage filter
      if (selectedDosage !== 'all' && med.dosageForm !== selectedDosage) return false;

      return true;
    });
  }, [medicines, searchTerm, selectedRack, selectedStatus, selectedDosage]);

  const handleSimulateScan = (batchCode) => {
    setSearchTerm(batchCode);
    setIsScannerModalOpen(false);
    addToast({
      type: 'info',
      title: 'Barcode Scanned',
      message: `Identified batch #${batchCode}. Filtering inventory.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Fast Medicine Retrieval Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Find a Medicine
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1 leading-relaxed">
              Quickly locate storage racks, check available quantities, verify batches, and find AI alternative matches if unavailable.
            </p>
          </div>

          {/* Quick Scanner Simulation Button */}
          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-xs font-bold transition-all self-start sm:self-center"
          >
            <ScanLine className="w-4 h-4 text-teal-300" />
            <span>Simulate Barcode Scan</span>
          </button>
        </div>

        {/* Large Search Bar (Prompt #12) */}
        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-teal-600">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine name, brand (e.g. Crocin, Dolo), active ingredient, strength, or batch..."
            className="w-full pl-12 sm:pl-14 pr-12 py-3.5 sm:py-4 rounded-2xl bg-white text-slate-900 text-sm sm:text-base font-semibold shadow-2xl focus:outline-none focus:ring-4 focus:ring-teal-400/40 placeholder:text-slate-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-teal-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">Quick Searches:</span>
          {['Paracetamol', 'Cetirizine', 'Omeprazole', 'Ibuprofen', 'Amoxicillin', 'Rack B'].map((q) => (
            <button
              key={q}
              onClick={() => setSearchTerm(q)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">🟢 Available</option>
            <option value="low">🟠 Low Stock</option>
            <option value="out">🔴 Out of Stock</option>
          </select>

          {/* Rack Filter */}
          <select
            value={selectedRack}
            onChange={(e) => setSelectedRack(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Racks</option>
            <option value="A">Rack A (General / OTC)</option>
            <option value="B">Rack B (Analgesics / NSAID)</option>
            <option value="C">Rack C (Antibiotics)</option>
            <option value="D">Rack D (Gastro / Chronic)</option>
          </select>

          {/* Dosage Filter */}
          <select
            value={selectedDosage}
            onChange={(e) => setSelectedDosage(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Dosage Forms</option>
            <option value="Tablet">Tablets</option>
            <option value="Capsule">Capsules</option>
            <option value="Powder Sachet">Sachets</option>
          </select>
        </div>

        <div className="font-bold text-slate-600">
          Showing <span className="text-teal-700 font-extrabold">{filteredMedicines.length}</span> results
        </div>
      </div>

      {/* Prominent Results Grid (Prompt #13: Prominent Storage Location Retrieval) */}
      {filteredMedicines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
          <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching medicines found in inventory</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            The requested medicine is not in the pharmacy database. Try another search term or consult the lead pharmacist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((med) => {
            const isOOS = med.quantity === 0;
            const isLow = med.quantity <= med.lowStockThreshold && med.quantity > 0;
            const expiryRisk = calculateExpiryRisk(med.expiryDate);

            return (
              <div
                key={med.id}
                className={`bg-white rounded-3xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                  isOOS
                    ? 'border-rose-200/90 bg-rose-50/20'
                    : isLow
                    ? 'border-amber-200/90 bg-amber-50/20'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div>
                  {/* Top Row: Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 
                        onClick={() => setDetailsModalMed(med)}
                        className="text-base font-extrabold text-slate-900 cursor-pointer hover:text-teal-700 transition-colors"
                      >
                        {med.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {med.activeIngredient} • {med.strength}
                      </p>
                    </div>

                    <StockStatusBadge quantity={med.quantity} threshold={med.lowStockThreshold} size="sm" />
                  </div>

                  {/* PROMINENT STORAGE LOCATION BOX (Prompt #13) */}
                  <div className="mt-4 mb-3">
                    <RackShelfBadge
                      rack={med.rack}
                      shelf={med.shelf}
                      prominent={true}
                      className="w-full justify-between"
                    />
                  </div>

                  {/* Key Operational Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Available Qty</span>
                      <span className={`font-black text-base ${
                        isOOS ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {med.quantity} <span className="text-xs font-normal text-slate-500">units</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Unit Price</span>
                      <span className="font-extrabold text-teal-800 text-sm">
                        {settings.currencySymbol}{Number(med.price).toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Batch #</span>
                      <span className="font-mono text-slate-700 font-semibold text-[11px]">{med.batchNumber}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Expiry</span>
                      <span className={`font-medium ${
                        expiryRisk.status === 'high_risk' || expiryRisk.status === 'expired' ? 'text-rose-600 font-bold' : 'text-slate-700'
                      }`}>
                        {med.expiryDate}
                      </span>
                    </div>
                  </div>

                  {/* Restock ETA notice for Out of Stock */}
                  {isOOS && med.expectedRestockDate && (
                    <div className="mt-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-medium">
                      Expected Restock: <strong>{new Date(med.expectedRestockDate).toLocaleDateString()}</strong> ({med.orderStatus})
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailsModalMed(med)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* If Out of stock, Highlight Alternative Finder */}
                    {isOOS ? (
                      <button
                        onClick={() => {
                          if (onSelectMedicineForAI) {
                            onSelectMedicineForAI(med);
                          }
                          setCurrentRoute('worker-alternatives');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-all animate-pulse-subtle"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Find Alternatives</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            if (onSelectMedicineForAI) {
                              onSelectMedicineForAI(med);
                            }
                            setCurrentRoute('worker-alternatives');
                          }}
                          className="p-2 text-teal-700 hover:bg-teal-50 rounded-xl transition-colors border border-transparent hover:border-teal-200"
                          title="Find alternatives in database"
                        >
                          <Sparkles className="w-4 h-4 text-teal-600" />
                        </button>

                        <button
                          onClick={() => setSaleModalMed(med)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Record Sale</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <RecordSaleModal
        isOpen={!!saleModalMed}
        onClose={() => setSaleModalMed(null)}
        preselectedMedicine={saleModalMed}
      />

      <MedicineDetailsModal
        isOpen={!!detailsModalMed}
        onClose={() => setDetailsModalMed(null)}
        medicine={detailsModalMed}
        onOpenSale={(m) => setSaleModalMed(m)}
        onOpenAlternatives={(m) => {
          setDetailsModalMed(null);
          if (onSelectMedicineForAI) onSelectMedicineForAI(m);
          setCurrentRoute('worker-alternatives');
        }}
      />

      {/* Barcode Scanner Simulator Modal */}
      <Modal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        title="Simulate Barcode / Batch Scan"
        subtitle="Test rapid optical identification of medicine packs"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/40">
              <ScanLine className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm">Hardware Scanner Emulator</p>
              <p className="text-[11px] text-slate-400">Click a sample barcode below to simulate scanning a physical box:</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sample Physical Batch Barcodes:</span>
            
            <button
              onClick={() => handleSimulateScan('B102')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-slate-500" />
                <div>
                  <span className="font-mono font-bold text-slate-900">B102</span>
                  <span className="text-slate-500 block text-[11px]">Paracetamol 500mg (Out of Stock Demo)</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">Scan</span>
            </button>

            <button
              onClick={() => handleSimulateScan('CP504')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-slate-500" />
                <div>
                  <span className="font-mono font-bold text-slate-900">CP504</span>
                  <span className="text-slate-500 block text-[11px]">Calpol 500mg (Rack C, Shelf 2)</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">Scan</span>
            </button>

            <button
              onClick={() => handleSimulateScan('DL901')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-slate-500" />
                <div>
                  <span className="font-mono font-bold text-slate-900">DL901</span>
                  <span className="text-slate-500 block text-[11px]">Dolo 650mg (Rack B, Shelf 4)</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">Scan</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
