import React, { useState, useEffect, useMemo } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { findPossibleAlternatives } from '../../services/aiMatchingEngine';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { StockStatusBadge, Badge } from '../../components/common/Badge';
import { RecordSaleModal } from '../../components/modals/RecordSaleModal';
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ShieldCheck,
  ShoppingCart,
  Clock,
  HelpCircle,
  Layers,
  ArrowRight,
  Info,
  Check,
  X,
  Send
} from 'lucide-react';

export function WorkerAlternativeFinder({ initialMedicineId = null }) {
  const { medicines, currentUser, logAISuggestionDecision, settings } = usePharmacy();
  const [selectedMedId, setSelectedMedId] = useState(initialMedicineId || 'med-001');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleTargetMed, setSaleTargetMed] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [activeDecision, setActiveDecision] = useState({}); // { [candidateId]: 'Approved' | 'Rejected' | 'Ignored' | 'Submitted' }

  const isSupervisor = currentUser?.role === 'supervisor' || currentUser?.role === 'admin';

  // Set initial selection
  useEffect(() => {
    if (initialMedicineId) {
      setSelectedMedId(initialMedicineId);
    }
  }, [initialMedicineId]);

  // Find requested medicine from current inventory
  const requestedMedicine = medicines.find((medicine) => medicine.id === selectedMedId);
  const isAvailable = requestedMedicine && requestedMedicine.quantity > 0;
  const isOutOfStock = requestedMedicine && requestedMedicine.quantity === 0;

  // Run AI matching engine against stored pharmacy database
  const alternatives = useMemo(() => {
    if (!requestedMedicine) return [];
    return findPossibleAlternatives(requestedMedicine, medicines, {
      onlyAvailable: true,
      minScoreThreshold: 40
    });
  }, [requestedMedicine, medicines]);

  const handleDecision = (matchObj, decision) => {
    logAISuggestionDecision(
      {
        requestedMedicine,
        candidate: matchObj.candidate,
        score: matchObj.score,
        reasons: matchObj.reasons
      },
      decision,
      decisionNotes
    );

    setActiveDecision((prev) => ({
      ...prev,
      [matchObj.candidate.id]: decision
    }));
  };

  const handleSellAlternative = (candidateMed) => {
    setSaleTargetMed(candidateMed);
    setIsSaleModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/10">
        <div className="flex items-center gap-2 mb-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>In-Store Medicine Matching Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          AI Alternative Medicine Finder
        </h1>
        <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-2xl leading-relaxed">
          Find possible matches from medicines already stored in the pharmacy database.
        </p>
      </div>

      {/* Human Verification Required Mandate */}
      <div className="p-4 sm:p-5 rounded-3xl bg-teal-50 border-2 border-teal-500/30 text-xs text-teal-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-sm mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-teal-950">
              Human Verification Required
            </h4>
            <p className="text-teal-900/90 mt-0.5 leading-relaxed">
              AI suggestions are possible database matches. An authorized human must verify the information and make the final decision. The system does not prescribe or automatically substitute medicines.
            </p>
          </div>
        </div>
      </div>

      {/* Select Requested Medicine Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-sm font-extrabold text-slate-900">
            Select or Search Requested Customer Medicine
          </label>
          <span className="text-xs text-slate-500">
            Choose what the patient or customer asked for
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {medicines.map((medicine) => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.name} ({medicine.activeIngredient} {medicine.strength}) — {medicine.quantity === 0 ? '🔴 [OUT OF STOCK]' : `🟢 [${medicine.quantity} in stock at Rack ${medicine.rack}]`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMedId('med-001')}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors text-center"
            >
              Try Out of Stock: Paracetamol 500mg
            </button>
          </div>
        </div>
      </div>

      {/* Case 1: Requested Medicine is Available (Prompt #24) */}
      {isAvailable && requestedMedicine && (
        <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-base font-extrabold">🟢 Medicine Available</h3>
                <p className="text-xs text-emerald-700">Requested item is in stock. No alternative medicine required.</p>
              </div>
            </div>

            <StockStatusBadge quantity={requestedMedicine.quantity} threshold={requestedMedicine.lowStockThreshold} size="lg" />
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h4 className="text-lg font-black text-slate-900">{requestedMedicine.name}</h4>
              <p className="text-xs text-slate-600 font-medium">
                {requestedMedicine.activeIngredient} • {requestedMedicine.strength} • {requestedMedicine.dosageForm}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <RackShelfBadge rack={requestedMedicine.rack} shelf={requestedMedicine.shelf} prominent={true} />
              </div>
            </div>

            <div className="space-y-2 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <div className="text-xs text-slate-500">
                Current Quantity: <strong className="text-emerald-700 text-base font-black">{requestedMedicine.quantity} units</strong>
              </div>
              <div className="text-xs text-slate-500">
                Batch: <strong className="font-mono text-slate-900">{requestedMedicine.batchNumber}</strong> | Expiry: <strong className="text-slate-900">{requestedMedicine.expiryDate}</strong>
              </div>
              <div className="text-sm font-extrabold text-teal-800">
                Price: {settings.currencySymbol}{Number(requestedMedicine.price).toFixed(2)}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSaleTargetMed(requestedMedicine);
                    setIsSaleModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Record Sale</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Requested Medicine is Out of Stock */}
      {!isAvailable && requestedMedicine && (
        <div className="space-y-6 animate-fade-in">
          {/* Out of stock Banner */}
          <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-sm mt-0.5">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-rose-950">
                    Requested Medicine: OUT OF STOCK
                  </h3>
                </div>
                <p className="text-xs text-rose-800 mt-0.5 font-medium">
                  {requestedMedicine.name} ({requestedMedicine.activeIngredient} • {requestedMedicine.strength})
                </p>
                {requestedMedicine.expectedRestockDate && (
                  <p className="text-xs font-semibold text-rose-900 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Expected Restock Date: <strong>{new Date(requestedMedicine.expectedRestockDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
                  </p>
                )}
              </div>
            </div>

            <div className="self-end sm:self-center">
              <Badge variant="out_of_stock" size="lg">0 Available</Badge>
            </div>
          </div>

          {/* AI Database Scan Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h3 className="text-base font-extrabold text-slate-900">
                    Find Possible Alternatives ({alternatives.length} Matches Found)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Searched from available medicines in the stored pharmacy inventory
                </p>
              </div>

              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Rule-Based + Similarity Ranking
              </span>
            </div>

            {/* Case 2A: No Suitable Alternative */}
            {alternatives.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">No suitable alternative found in current inventory.</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  The local pharmacy inventory does not currently hold an available generic equivalent with matching active ingredients or pharmacological properties.
                </p>
                
                {/* Original medicine restock info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-slate-700 text-left space-y-1">
                  <div className="font-bold text-slate-900">Original Medicine Restock Status:</div>
                  <div>Supplier: {requestedMedicine.supplier || 'Primary Distributor'}</div>
                  <div>Expected Restock Date: {requestedMedicine.expectedRestockDate || 'Pending order placement'}</div>
                  <div className="text-teal-800 font-semibold pt-1">
                    Next step: Arrange/restock the original medicine and handle customer decision appropriately.
                  </div>
                </div>
              </div>
            ) : (
              /* Case 2B: Ranked Alternatives List */
              <div className="space-y-4">
                {alternatives.map((match, index) => {
                  const { candidate, score, reasons, matchType, matchFactors } = match;
                  const currentDecision = activeDecision[candidate.id];

                  return (
                    <div
                      key={candidate.id}
                      className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-sm space-y-4 ${
                        currentDecision === 'Approved'
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : currentDecision === 'Rejected'
                          ? 'border-rose-300 opacity-60'
                          : index === 0
                          ? 'border-teal-500/60 shadow-teal-500/5'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Top Bar: Match Score */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-teal-600 text-white text-xs font-black shadow-sm">
                            Database Match Score: {score}%
                          </span>
                          <span className={`text-xs font-bold ${match.isStrongestMatch ? 'text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300' : matchFactors.ingredient ? 'text-slate-700' : 'text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300'}`}>
                            {match.isStrongestMatch ? '★ Strongest Match' : matchType}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 italic">
                          Calculated from active ingredient, strength, form & inventory factors
                        </span>
                      </div>

                      {/* Medicine Info & Storage Coordinates */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {match.isStrongestMatch ? 'Top Available Match' : 'Available Inventory Match'}
                            </span>
                            <h4 className="text-lg font-extrabold text-slate-900">{candidate.name}</h4>
                            <div className="flex flex-wrap gap-2 text-xs font-medium mt-1">
                              {matchFactors.ingredient ? (
                                <span className="text-teal-800 font-bold">✓ Same active ingredient ({candidate.activeIngredient})</span>
                              ) : (
                                <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                  ⚠ Different active ingredient ({candidate.activeIngredient})
                                </span>
                              )}
                              <span>•</span>
                              <span className={matchFactors.strength ? 'text-teal-800 font-bold' : 'text-slate-600'}>
                                {matchFactors.strength ? '✓ Same strength' : `Alternative strength (${candidate.strength})`}
                              </span>
                              <span>•</span>
                              <span className={matchFactors.dosageForm ? 'text-teal-800 font-bold' : 'text-slate-600'}>
                                {matchFactors.dosageForm ? '✓ Same dosage form' : `Form: ${candidate.dosageForm}`}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">✓ Available in current inventory</span>
                            </div>
                          </div>

                          {/* Storage Coordinates Highlight */}
                          <RackShelfBadge rack={candidate.rack} shelf={candidate.shelf} prominent={true} />
                        </div>

                        {/* Inventory Specs */}
                        <div className="grid grid-cols-2 gap-3 text-xs sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                            <span className="text-base font-black text-emerald-700">{candidate.quantity} units</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Price</span>
                            <span className="text-sm font-extrabold text-slate-900">{settings.currencySymbol}{Number(candidate.price).toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Batch</span>
                            <span className="font-mono font-semibold text-slate-700">{candidate.batchNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Expiry</span>
                            <span className="font-medium text-slate-800">{candidate.expiryDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Explicit Pharmacist Verification Callout when active ingredient differs */}
                      {!matchFactors.ingredient && (
                        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold text-amber-950 text-xs uppercase tracking-wide">Pharmacist verification required</strong>
                            <p className="mt-0.5 text-[11px] text-amber-800 leading-relaxed">
                              This medicine has a different active ingredient ({candidate.activeIngredient}) from requested item ({requestedMedicine.activeIngredient}). It is NOT automatically equivalent or recommended as a replacement. The human pharmacist must review and make the final decision.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Why was this suggested? */}
                      <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-teal-950">
                          <Info className="w-4 h-4 text-teal-700" />
                          <span>Matching Factors & Inventory Rationale:</span>
                        </div>

                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-teal-900">
                          {reasons.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              {r.includes('⚠') || r.includes('Different active ingredient') || r.includes('Pharmacist verification') ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                              )}
                              <span className={r.includes('⚠') || r.includes('Pharmacist verification') ? 'font-semibold text-amber-900' : ''}>
                                {r}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Human Verification Actions */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          {currentDecision ? (
                            <span className="font-bold text-slate-800">
                              Decision: <strong className={currentDecision === 'Approved' ? 'text-emerald-600' : 'text-rose-600'}>{currentDecision}</strong> by {currentUser?.name}
                            </span>
                          ) : (
                            <span>Human pharmacist authorization required before dispensing</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecision(match, 'Rejected')}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 border border-slate-200 transition-colors"
                          >
                            <X className="w-3.5 h-3.5 text-rose-500" />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision(match, 'Ignored')}
                            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            Ignore
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision(match, 'Approved')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isSupervisor ? 'Approve' : 'Verify & Approve'}</span>
                          </button>

                          {/* Record Sale Shortcut if Approved */}
                          {currentDecision === 'Approved' && (
                            <button
                              type="button"
                              onClick={() => handleSellAlternative(candidate)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-colors animate-pulse-subtle"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Dispense Alternative Now</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sale Modal */}
      <RecordSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setSaleTargetMed(null);
        }}
        preselectedMedicine={saleTargetMed}
      />
    </div>
  );
}
