import React, { useState } from 'react';
import { PlusCircle, FlaskConical, CheckCircle2, ChevronRight } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Suppository'];

const EMPTY_FORM = {
  medicineName: '',
  genericName: '',
  strength: '',
  dosageForm: '',
  batchNumber: '',
  expiryDate: '',
  quantity: ''
};

export function NewBatchPage({ setCurrentRoute }) {
  const { addNewBatch, addToast } = usePharmacy();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [lastBatch, setLastBatch] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.medicineName.trim()) newErrors.medicineName = 'Medicine name is required.';
    if (!form.genericName.trim()) newErrors.genericName = 'Generic / Active ingredient is required.';
    if (!form.strength.trim()) newErrors.strength = 'Strength is required.';
    if (!form.dosageForm) newErrors.dosageForm = 'Please select a dosage form.';
    if (!form.batchNumber.trim()) newErrors.batchNumber = 'Batch number is required.';
    if (!form.expiryDate) newErrors.expiryDate = 'Expiry date is required.';
    const qty = parseInt(form.quantity, 10);
    if (!form.quantity || isNaN(qty) || qty <= 0) newErrors.quantity = 'Enter a valid quantity (> 0).';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newBatch = addNewBatch({
      medicineName: form.medicineName.trim(),
      activeIngredient: form.genericName.trim(),
      strength: form.strength.trim(),
      dosageForm: form.dosageForm,
      batchNumber: form.batchNumber.trim(),
      expiryDate: form.expiryDate,
      quantity: parseInt(form.quantity, 10)
    });

    setLastBatch(newBatch);
    setSubmitted(true);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleArrangeNow = () => setCurrentRoute('stock-arrangement');
  const handleAddAnother = () => setSubmitted(false);

  if (submitted && lastBatch) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Batch Logged!</h2>
          <p className="text-sm text-slate-500 mb-6">
            <span className="font-semibold text-slate-700">{lastBatch.medicineName}</span> ({lastBatch.strength}) &mdash; Batch <span className="font-mono font-semibold text-slate-700">{lastBatch.batchNumber}</span> has been recorded as <span className="font-semibold text-amber-600">Unarranged</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleArrangeNow}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm"
            >
              Arrange This Batch →
            </button>
            <button
              onClick={handleAddAnother}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              + Add Another Batch
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Field = ({ label, children, error, required }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 flex gap-0.5">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 transition-shadow ${
      errors[field]
        ? 'border-rose-300 focus:ring-rose-200'
        : 'border-slate-200 focus:ring-teal-200 focus:border-teal-400'
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200">
          <PlusCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add New Medicine / Batch</h1>
          <p className="text-xs text-slate-500">Log a new medicine batch for arrangement.</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Medicine Identity */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-700">Medicine Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Medicine Name" error={errors.medicineName} required>
              <input
                type="text"
                placeholder="e.g. Paracetamol"
                value={form.medicineName}
                onChange={(e) => handleChange('medicineName', e.target.value)}
                className={inputClass('medicineName')}
              />
            </Field>
            <Field label="Generic / Active Ingredient" error={errors.genericName} required>
              <input
                type="text"
                placeholder="e.g. Acetaminophen"
                value={form.genericName}
                onChange={(e) => handleChange('genericName', e.target.value)}
                className={inputClass('genericName')}
              />
            </Field>
            <Field label="Strength" error={errors.strength} required>
              <input
                type="text"
                placeholder="e.g. 500mg"
                value={form.strength}
                onChange={(e) => handleChange('strength', e.target.value)}
                className={inputClass('strength')}
              />
            </Field>
            <Field label="Dosage Form" error={errors.dosageForm} required>
              <select
                value={form.dosageForm}
                onChange={(e) => handleChange('dosageForm', e.target.value)}
                className={inputClass('dosageForm')}
              >
                <option value="">Select form…</option>
                {DOSAGE_FORMS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Batch Details */}
        <div className="px-6 pt-4 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-700">Batch Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Batch Number" error={errors.batchNumber} required>
              <input
                type="text"
                placeholder="e.g. B102"
                value={form.batchNumber}
                onChange={(e) => handleChange('batchNumber', e.target.value)}
                className={inputClass('batchNumber')}
              />
            </Field>
            <Field label="Expiry Date" error={errors.expiryDate} required>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                className={inputClass('expiryDate')}
              />
            </Field>
            <Field label="Quantity (units)" error={errors.quantity} required>
              <input
                type="number"
                min="1"
                placeholder="e.g. 500"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                className={inputClass('quantity')}
              />
            </Field>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentRoute('stock-dashboard')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-200 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Log Batch
          </button>
        </div>
      </form>
    </div>
  );
}
