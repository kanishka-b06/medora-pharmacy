import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { usePharmacy } from '../../context/PharmacyContext';
import { RackShelfBadge } from '../common/RackShelfBadge';
import { StockStatusBadge } from '../common/Badge';
import { ShoppingCart, CheckCircle, AlertTriangle, ArrowRight, Printer } from 'lucide-react';

export function RecordSaleModal({ isOpen, onClose, preselectedMedicine = null }) {
  const { medicines, recordSale, settings } = usePharmacy();
  const [selectedMedId, setSelectedMedId] = useState(preselectedMedicine?.id || '');
  const [quantitySold, setQuantitySold] = useState(1);
  const [customerType, setCustomerType] = useState('Walk-in Customer');
  const [notes, setNotes] = useState('');
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    if (preselectedMedicine) {
      setSelectedMedId(preselectedMedicine.id);
    } else if (medicines.length > 0 && !selectedMedId) {
      const firstAvailable = medicines.find((medicine) => medicine.quantity > 0) || medicines[0];
      setSelectedMedId(firstAvailable.id);
    }
    setQuantitySold(1);
    setCompletedSale(null);
  }, [preselectedMedicine, isOpen, medicines]);

  // Find the selected medicine from the inventory list
  const selectedMedicine = medicines.find((medicine) => medicine.id === selectedMedId);
  const currentMedicine = selectedMedicine; // Keep alias for existing JSX references
  const availableStock = selectedMedicine ? selectedMedicine.quantity : 0;
  const currentStock = availableStock; // Keep alias for existing JSX references

  // Parse entered quantity
  const quantityToDispense = parseInt(quantitySold, 10);
  const qty = quantityToDispense; // Keep alias for existing JSX references

  // Calculate remaining stock: remainingStock = availableStock - quantityToDispense
  const remainingStock = Math.max(0, availableStock - (isNaN(quantityToDispense) ? 0 : quantityToDispense));
  const unitPrice = selectedMedicine ? selectedMedicine.price : 0;
  const totalAmount = unitPrice * (isNaN(quantityToDispense) || quantityToDispense <= 0 ? 0 : quantityToDispense);

  const [validationError, setValidationError] = useState('');

  // 1. Live Validation: check entered quantity whenever the input changes
  useEffect(() => {
    if (quantitySold === '' || isNaN(quantityToDispense)) {
      setValidationError('Please enter a valid numeric quantity.');
    } else if (quantityToDispense <= 0) {
      setValidationError('Quantity to dispense must be at least 1.');
    } else if (quantityToDispense > availableStock) {
      setValidationError(`Insufficient stock. Only ${availableStock} units are available.`);
    } else {
      setValidationError('');
    }
  }, [quantitySold, quantityToDispense, availableStock]);

  const isInvalidQty = isNaN(quantityToDispense) || quantityToDispense <= 0 || quantityToDispense > availableStock;

  // 2. Submit Dispense: validate stock and deduct quantity
  const handleSubmit = (e) => {
    e.preventDefault();

    // Reject if quantity is invalid or exceeds available stock
    if (isInvalidQty || !selectedMedicine) {
      if (quantityToDispense > availableStock) {
        setValidationError(`Insufficient stock. Only ${availableStock} units are available.`);
      } else if (quantitySold === '' || isNaN(quantityToDispense)) {
        setValidationError('Please enter a valid numeric quantity.');
      } else if (quantityToDispense <= 0) {
        setValidationError('Quantity to dispense must be at least 1.');
      } else {
        setValidationError('Please enter a valid quantity.');
      }
      return;
    }

    // Record the dispensing operation
    const result = recordSale({
      medicineId: selectedMedicine.id,
      quantitySold: quantityToDispense,
      quantityToGive: quantityToDispense,
      customerType,
      notes
    });

    if (result.success) {
      setCompletedSale(result.sale);
    }
  };

  const handleClose = () => {
    setCompletedSale(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Sale / Medicine Issue"
      subtitle="Fast counter dispensing with automatic stock adjustment"
      maxWidth="max-w-lg"
    >
      {completedSale ? (
        <div className="space-y-5 animate-fade-in">
          {/* Success Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-emerald-950">Dispensed Successfully</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Stock automatically updated from <strong>{completedSale.previousStock}</strong> → <strong>{completedSale.remainingStock}</strong> units.
            </p>
          </div>

          {/* Receipt Summary */}
          <div id="printable-receipt" className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
              <span>Medicine: {completedSale.medicineName}</span>
              <span>{settings.currencySymbol}{completedSale.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Quantity given:</span>
              <span className="font-semibold text-slate-900">{completedSale.quantityGiven || completedSale.quantitySold} units</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Remaining:</span>
              <span className="font-semibold text-emerald-700">{completedSale.remainingStock} units</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Worker:</span>
              <span className="font-medium text-slate-800">{completedSale.worker || completedSale.recordedBy}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Date:</span>
              <span className="text-slate-800">{completedSale.date || new Date(completedSale.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Time:</span>
              <span className="text-slate-800">{completedSale.time || new Date(completedSale.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Transaction Type:</span>
              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {completedSale.transactionType || completedSale.type || 'Dispense'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              Done / New Sale
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Medicine *
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {medicines.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} — Rack {med.rack}, Shelf {med.shelf} ({med.quantity} available) {med.quantity === 0 ? '[OUT OF STOCK]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Medicine Context Overview */}
          {currentMedicine && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{currentMedicine.name}</h4>
                  <p className="text-[11px] text-slate-500">{currentMedicine.activeIngredient} • {currentMedicine.strength}</p>
                </div>
                <StockStatusBadge quantity={currentStock} threshold={currentMedicine.lowStockThreshold} size="sm" />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
                <RackShelfBadge rack={currentMedicine.rack} shelf={currentMedicine.shelf} />
                <span className="text-xs text-slate-500 font-medium">Batch: <strong className="text-slate-800">{currentMedicine.batchNumber}</strong></span>
                <span className="text-xs text-slate-500 font-medium">Expiry: <strong className="text-slate-800">{currentMedicine.expiryDate}</strong></span>
              </div>
            </div>
          )}

          {/* Quantity Sold & Live Calculation Box */}
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-950">
                Quantity to Sell / Issue *
              </label>
              <span className="text-xs font-semibold text-teal-700">
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
                className="w-28 px-3.5 py-2 text-sm font-bold text-center rounded-xl border border-teal-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              {/* Quick Increment Buttons */}
              <div className="flex gap-1.5">
                {[1, 2, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantitySold(num)}
                    disabled={currentStock < num}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-teal-200 text-teal-800 hover:bg-teal-100 disabled:opacity-40"
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

            {/* Live Stock Calculation Banner (Prompt #16) */}
            <div className="p-3 rounded-lg bg-white border border-teal-200 text-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Live Stock Deduction
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-900">{currentStock}</span>
                <span className="text-slate-400">−</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 font-bold text-amber-900">{isNaN(qty) ? 0 : qty}</span>
                <span className="text-slate-400">=</span>
                <span className={`px-2 py-0.5 rounded font-extrabold ${
                  remainingStock === 0 ? 'bg-rose-100 text-rose-900' :
                  remainingStock <= (currentMedicine?.lowStockThreshold || 10) ? 'bg-amber-100 text-amber-900' :
                  'bg-emerald-100 text-emerald-900'
                }`}>
                  {remainingStock} units remaining
                </span>
              </div>
            </div>

            {/* Warning if out of stock */}
            {currentStock <= 0 && (
              <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Medicine is Out of Stock. Cannot record sale.</span>
              </div>
            )}
          </div>

          {/* Customer Type & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Type</label>
              <select
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Walk-in Customer">Walk-in Customer</option>
                <option value="Prescription Issue">Prescription Issue</option>
                <option value="Regular Customer">Regular Patient</option>
                <option value="Hospital Staff">Hospital Referral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Bill Amount</label>
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-sm font-extrabold text-teal-800">
                {settings.currencySymbol}{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInvalidQty}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Confirm & Record Sale</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
