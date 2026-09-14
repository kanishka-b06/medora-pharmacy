import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { StockStatusBadge } from '../../components/common/Badge';
import {
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Printer,
  Search,
  User,
  Sparkles
} from 'lucide-react';

export function RecordSalePage({ setCurrentRoute }) {
  const { medicines, recordSale, settings, currentUser } = usePharmacy();
  const [selectedMedId, setSelectedMedId] = useState('med-002');
  const [quantitySold, setQuantitySold] = useState(1);
  const [customerType, setCustomerType] = useState('Walk-in Customer');
  const [notes, setNotes] = useState('');
  const [completedSale, setCompletedSale] = useState(null);

  const currentMedicine = medicines.find((m) => m.id === selectedMedId);
  const currentStock = currentMedicine ? currentMedicine.quantity : 0;
  const qty = parseInt(quantitySold, 10);
  const remainingStock = Math.max(0, currentStock - (isNaN(qty) ? 0 : qty));
  const unitPrice = currentMedicine ? currentMedicine.price : 0;
  const totalAmount = unitPrice * (isNaN(qty) || qty <= 0 ? 0 : qty);

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (quantitySold === '' || isNaN(qty)) {
      setValidationError('Please enter a valid numeric quantity.');
    } else if (qty <= 0) {
      setValidationError('Quantity to dispense must be at least 1.');
    } else if (qty > currentStock) {
      setValidationError(`Insufficient stock. Only ${currentStock} units are available.`);
    } else {
      setValidationError('');
    }
  }, [quantitySold, qty, currentStock]);

  const isInvalidQty = isNaN(qty) || qty <= 0 || qty > currentStock;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isInvalidQty || !currentMedicine) {
      if (qty > currentStock) {
        setValidationError(`Insufficient stock. Only ${currentStock} units are available.`);
      } else {
        setValidationError('Please enter a valid quantity.');
      }
      return;
    }

    const result = recordSale({
      medicineId: currentMedicine.id,
      quantitySold: qty,
      customerType,
      notes
    });

    if (result.success) {
      setCompletedSale(result.sale);
    }
  };

  const handleResetForNewSale = () => {
    setCompletedSale(null);
    setQuantitySold(1);
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Counter Sales & Medicine Issue</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record customer dispensations with real-time stock deduction and receipt logging.
        </p>
      </div>

      {completedSale ? (
        /* Post Sale Confirmation & Print Receipt */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-fade-in">
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-emerald-950">Sale Successfully Completed</h3>
            <p className="text-xs text-emerald-800">
              Stock for <strong>{completedSale.medicineName}</strong> updated from <strong>{completedSale.previousStock}</strong> → <strong>{completedSale.remainingStock} units</strong>.
            </p>
          </div>

          {/* Printable Receipt Card */}
          <div id="printable-receipt" className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 font-mono">
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <h4 className="font-extrabold text-sm text-slate-900">{settings.pharmacyName}</h4>
              <p className="text-[11px] text-slate-500">{settings.address}</p>
              <p className="text-[11px] text-slate-500">Lic: {settings.licenseNumber}</p>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>ITEM: {completedSale.medicineName}</span>
                <span>{settings.currencySymbol}{completedSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Quantity:</span>
                <span>{completedSale.quantitySold} units @ {settings.currencySymbol}{completedSale.unitPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Customer Type:</span>
                <span>{completedSale.customerType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Dispensed By:</span>
                <span>{completedSale.recordedBy}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px] pt-2 border-t border-slate-200">
                <span>Transaction Ref:</span>
                <span>{completedSale.id}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice Receipt</span>
            </button>

            <button
              onClick={handleResetForNewSale}
              className="flex-1 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              Start Next Sale
            </button>
          </div>
        </div>
      ) : (
        /* Active Sale Form */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Medicine Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Medicine to Dispense *
                </label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} — {med.quantity === 0 ? '🔴 OUT OF STOCK' : `🟢 ${med.quantity} available (Rack ${med.rack})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity to Sell */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-teal-950">
                    Quantity to Dispense *
                  </label>
                  <span className="text-xs font-bold text-teal-700">
                    Unit Price: {settings.currencySymbol}{unitPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={currentStock || 1}
                    value={quantitySold}
                    onChange={(e) => setQuantitySold(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    disabled={currentStock <= 0}
                    placeholder="Qty"
                    className="w-28 px-4 py-2 text-base font-extrabold text-center rounded-xl border border-teal-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />

                  <div className="flex gap-1.5">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuantitySold(num)}
                        disabled={currentStock < num}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-teal-200 text-teal-800 hover:bg-teal-100 disabled:opacity-40"
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 font-semibold animate-fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Live Stock Calculation Box (Prompt #16) */}
                <div className="p-3 rounded-xl bg-white border border-teal-200 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Live Stock Equation
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold">{currentStock}</span>
                    <span className="text-slate-400">−</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 font-bold text-amber-900">{isNaN(qty) ? 0 : qty}</span>
                    <span className="text-slate-400">=</span>
                    <span className={`px-2.5 py-0.5 rounded-lg font-black ${
                      remainingStock === 0 ? 'bg-rose-100 text-rose-900' :
                      remainingStock <= (currentMedicine?.lowStockThreshold || 10) ? 'bg-amber-100 text-amber-900' :
                      'bg-emerald-100 text-emerald-900'
                    }`}>
                      {remainingStock} units remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Type & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Type</label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Walk-in Customer">Walk-in Customer</option>
                    <option value="Prescription Issue">Prescription Dispense</option>
                    <option value="Regular Patient">Regular Patient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Bill</label>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-black text-teal-800">
                    {settings.currencySymbol}{totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispensing Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Verified doctor prescription"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isInvalidQty}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Confirm & Issue Medicine</span>
              </button>
            </form>
          </div>

          {/* Right Col: Selected Medicine Snapshot & Storage Location */}
          <div className="space-y-4">
            {currentMedicine ? (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{currentMedicine.name}</h3>
                    <p className="text-xs text-slate-500">{currentMedicine.activeIngredient}</p>
                  </div>
                  <StockStatusBadge quantity={currentMedicine.quantity} threshold={currentMedicine.lowStockThreshold} size="sm" />
                </div>

                {/* Storage Location */}
                <RackShelfBadge rack={currentMedicine.rack} shelf={currentMedicine.shelf} prominent={true} />

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Batch Number:</span>
                    <span className="font-mono font-bold text-teal-800">{currentMedicine.batchNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expiry Date:</span>
                    <span className="font-semibold text-slate-900">{currentMedicine.expiryDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dosage Form:</span>
                    <span className="font-semibold text-slate-900">{currentMedicine.dosageForm}</span>
                  </div>
                </div>

                {/* If Out of Stock Shortcut */}
                {currentStock === 0 && (
                  <button
                    onClick={() => setCurrentRoute('worker-alternatives')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Find In-Store Alternatives</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
