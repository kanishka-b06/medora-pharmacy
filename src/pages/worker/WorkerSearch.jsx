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
  Barcode,
  Zap,
  Users,
  AlertTriangle,
  HelpCircle,
  Stethoscope
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

  // Enhanced search filtering: searches name, brand, active ingredient, strength, power, usedFor, whoShouldUse, batch, rack, shelf
  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (med.name || '').toLowerCase().includes(term) ||
        (med.brandName || '').toLowerCase().includes(term) ||
        (med.activeIngredient || '').toLowerCase().includes(term) ||
        (med.strength || '').toLowerCase().includes(term) ||
        (med.power || '').toLowerCase().includes(term) ||
        (med.usedFor || '').toLowerCase().includes(term) ||
        (med.whoShouldUse || '').toLowerCase().includes(term) ||
        (med.batchNumber || '').toLowerCase().includes(term) ||
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

  const handleLaunchAIForMedicine = (med) => {
    if (onSelectMedicineForAI) {
      onSelectMedicineForAI(med);
    }
    if (setCurrentRoute) {
      setCurrentRoute('worker-alternatives');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1.5 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Worker Dispensing & Clinical Search Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Find Medicine & Clinical Info
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1 leading-relaxed">
              Instantly view medicine power/strength, what it is used for, who should use it, and storage rack positions. If out of stock, seamlessly find verified AI alternatives.
            </p>
          </div>

          {/* Quick Scanner Simulation Button */}
          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white text-xs font-bold transition-all self-start sm:self-center"
          >
            <ScanLine className="w-4 h-4 text-teal-300" />
            <span>Scan Barcode</span>
          </button>
        </div>

        {/* Large Search Bar */}
        <div className="mt-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-teal-600">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medicine, brand (Crocin, Dolo), condition (fever, allergy, acidity), or strength..."
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
          {['Fever', 'Paracetamol', 'Allergy', 'Cetirizine', 'Acidity', 'Omeprazole', 'Antibiotic', 'Amoxicillin', 'Pain', 'Rack B'].map((q) => (
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
            <option value="A">Rack A (General / OTC / Allergy)</option>
            <option value="B">Rack B (Analgesics / NSAID)</option>
            <option value="C">Rack C (Antibiotics)</option>
            <option value="D">Rack D (Gastro / Chronic Care)</option>
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

      {/* Prominent Results Grid with Clinical Guidance & AI Assist */}
      {filteredMedicines.length === 0 ? (
        /* AI FALLBACK CARD FOR UNAVAILABLE / UNMATCHED MEDICINES */
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-dashed border-teal-200 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto ring-8 ring-teal-50/60">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              {searchTerm ? `"${searchTerm}" is not currently in stock` : 'No matching medicines found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              This medicine might be out of stock, uncataloged, or requested under a commercial brand name. You can use our AI Alternative Assistant to look for generic or therapeutic equivalents in our inventory.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                // Find an out-of-stock item (like Paracetamol 500mg) as reference for the AI finder
                const oosMed = medicines.find((m) => m.quantity === 0) || medicines[0];
                handleLaunchAIForMedicine(oosMed);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Launch AI Alternative Assistant</span>
            </button>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedRack('all');
                setSelectedDosage('all');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Clear All Filters
            </button>
          </div>

          {/* Quick recommendations */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Available In-Stock Equivalents by Category:
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 text-xs">
              <button
                onClick={() => setSearchTerm('Calpol')}
                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200"
              >
                Calpol 500mg (Paracetamol)
              </button>
              <button
                onClick={() => setSearchTerm('Dolo')}
                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200"
              >
                Dolo 650mg (Paracetamol)
              </button>
              <button
                onClick={() => setSearchTerm('Alerid')}
                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200"
              >
                Alerid 10mg (Cetirizine)
              </button>
              <button
                onClick={() => setSearchTerm('Pan-40')}
                className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200"
              >
                Pan-40 (Pantoprazole)
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => {
            const isOOS = med.quantity === 0;
            const isLow = med.quantity <= med.lowStockThreshold && med.quantity > 0;
            const expiryRisk = calculateExpiryRisk(med.expiryDate);

            return (
              <div
                key={med.id}
                className={`bg-white rounded-3xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                  isOOS
                    ? 'border-rose-300 bg-gradient-to-b from-rose-50/40 via-white to-rose-50/20 ring-1 ring-rose-200'
                    : isLow
                    ? 'border-amber-200/90 bg-amber-50/20'
                    : 'border-slate-200/90 hover:border-teal-300'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top Row: Name, Brand, Power Pill, & Status */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 
                          onClick={() => setDetailsModalMed(med)}
                          className="text-base font-extrabold text-slate-900 cursor-pointer hover:text-teal-700 transition-colors leading-snug truncate"
                          title={med.name}
                        >
                          {med.name}
                        </h3>
                        {med.brandName && (
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Brand: <span className="text-slate-700 font-bold">{med.brandName}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-teal-800 font-medium">
                          {med.activeIngredient}
                        </p>
                      </div>

                      <StockStatusBadge quantity={med.quantity} threshold={med.lowStockThreshold} size="sm" />
                    </div>

                    {/* Power / Strength Pill */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                        <Zap className="w-3 h-3 text-teal-600" />
                        <span>Power: {med.power || med.strength}</span>
                      </span>

                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {med.dosageForm}
                      </span>
                    </div>
                  </div>

                  {/* PROMINENT STORAGE LOCATION BOX */}
                  <div className="pt-1">
                    <RackShelfBadge
                      rack={med.rack}
                      shelf={med.shelf}
                      prominent={true}
                      className="w-full justify-between"
                    />
                  </div>

                  {/* CLINICAL DETAILS: WHAT IT IS USED FOR & WHO SHOULD USE */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2 text-xs">
                    {/* What it is used for */}
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-teal-900 uppercase tracking-wide">
                        <Stethoscope className="w-3 h-3 text-teal-600" />
                        <span>Used For:</span>
                      </div>
                      <p className="text-slate-700 font-medium text-[11px] leading-relaxed mt-0.5">
                        {med.usedFor || 'Fever, headache & symptom relief.'}
                      </p>
                    </div>

                    {/* Who should use it */}
                    <div className="pt-1.5 border-t border-slate-200/70">
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>Who Should Use:</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
                        {med.whoShouldUse || 'Adults & adolescents as recommended by doctor/pharmacist.'}
                      </p>
                    </div>
                  </div>

                  {/* Operational Numbers Row */}
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

                  {/* OUT OF STOCK PROMINENT BANNER & RESTOCK ETA */}
                  {isOOS && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>OUT OF STOCK ON SHELF</span>
                      </div>
                      <p className="text-[11px] text-rose-800 leading-tight">
                        Item unavailable. Use AI Assistant to suggest available therapeutic equivalents.
                      </p>
                      {med.expectedRestockDate && (
                        <p className="text-[10px] text-rose-700 font-semibold pt-0.5">
                          Restock ETA: <strong>{new Date(med.expectedRestockDate).toLocaleDateString()}</strong> ({med.orderStatus})
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                  {/* IF OUT OF STOCK: BIG PROMINENT AI ALTERNATIVE BUTTON */}
                  {isOOS ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleLaunchAIForMedicine(med)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white font-extrabold text-xs shadow-md shadow-teal-600/25 transition-all transform active:scale-98"
                      >
                        <Sparkles className="w-4 h-4 text-teal-200 animate-spin-slow" />
                        <span>Find Alternatives with AI</span>
                      </button>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setDetailsModalMed(med)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          View Full Details
                        </button>
                        <span className="text-[10px] text-rose-600 font-semibold">
                          0 Units Available
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* IF IN STOCK: STANDARD DISPENSING ACTIONS */
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setDetailsModalMed(med)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        Details
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleLaunchAIForMedicine(med)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-teal-700 hover:bg-teal-50 rounded-xl transition-colors border border-teal-200"
                          title="Find generic/therapeutic alternatives in store"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          <span className="hidden sm:inline">Alternatives</span>
                        </button>

                        <button
                          onClick={() => setSaleModalMed(med)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Record Sale</span>
                        </button>
                      </div>
                    </div>
                  )}
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
        onOpenAlternatives={(m) => handleLaunchAIForMedicine(m)}
      />

      {/* Barcode Scanner Modal Simulation */}
      <Modal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        title="Simulate Barcode / Batch Scan"
        subtitle="Test barcode scanner hardware integration"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            In production, a physical 2D barcode scanner will populate this field. Select a demo batch code below to simulate an instant scan:
          </p>

          <div className="space-y-2">
            {[
              { batch: 'B102', med: 'Paracetamol 500 mg (Out of Stock)' },
              { batch: 'CP504', med: 'Calpol 500 mg (Available)' },
              { batch: 'DL901', med: 'Dolo 650 mg (Available)' },
              { batch: 'OM209', med: 'Omeprazole 20 mg (Low Stock)' },
              { batch: 'AM552', med: 'Amoxicillin 500 mg (Out of Stock)' }
            ].map((item) => (
              <button
                key={item.batch}
                onClick={() => handleSimulateScan(item.batch)}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-mono font-bold text-teal-800">#{item.batch}</span>
                <span className="text-slate-600 font-medium">{item.med}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Or type custom batch code..."
              value={scannedBatchInput}
              onChange={(e) => setScannedBatchInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => {
                if (scannedBatchInput.trim()) {
                  handleSimulateScan(scannedBatchInput.trim());
                  setScannedBatchInput('');
                }
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            >
              Scan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
