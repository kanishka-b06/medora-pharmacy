import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { usePharmacy } from '../../context/PharmacyContext';
import { PlusCircle, Save, Layers, AlertCircle } from 'lucide-react';

export function AddEditMedicineModal({ isOpen, onClose, medicineToEdit = null }) {
  const { addMedicine, updateMedicine, settings } = usePharmacy();
  const isEditing = !!medicineToEdit;

  const initialFormState = {
    name: '',
    brandName: '',
    activeIngredient: '',
    strength: '',
    dosageForm: 'Tablet',
    therapeuticClass: 'General Medicine',
    rack: 'A',
    shelf: '1',
    quantity: 50,
    batchNumber: '',
    expiryDate: '',
    price: 25,
    lowStockThreshold: settings.lowStockThresholdDefault || 10,
    supplier: 'Apex Pharma Distributors',
    expectedRestockDate: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (medicineToEdit) {
      setFormData({
        name: medicineToEdit.name || '',
        brandName: medicineToEdit.brandName || '',
        activeIngredient: medicineToEdit.activeIngredient || '',
        strength: medicineToEdit.strength || '',
        dosageForm: medicineToEdit.dosageForm || 'Tablet',
        therapeuticClass: medicineToEdit.therapeuticClass || 'General Medicine',
        rack: medicineToEdit.rack || 'A',
        shelf: medicineToEdit.shelf || '1',
        quantity: medicineToEdit.quantity ?? 50,
        batchNumber: medicineToEdit.batchNumber || '',
        expiryDate: medicineToEdit.expiryDate || '',
        price: medicineToEdit.price ?? 25,
        lowStockThreshold: medicineToEdit.lowStockThreshold ?? (settings.lowStockThresholdDefault || 10),
        supplier: medicineToEdit.supplier || 'Apex Pharma Distributors',
        expectedRestockDate: medicineToEdit.expectedRestockDate || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [medicineToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.activeIngredient.trim()) newErrors.activeIngredient = 'Active ingredient is required';
    if (!formData.strength.trim()) newErrors.strength = 'Strength is required (e.g. 500 mg)';
    if (!formData.rack.trim()) newErrors.rack = 'Rack letter is required';
    if (!formData.shelf.toString().trim()) newErrors.shelf = 'Shelf number is required';
    if (formData.quantity === '' || isNaN(formData.quantity) || parseInt(formData.quantity, 10) < 0) {
      newErrors.quantity = 'Valid positive quantity required';
    }
    if (!formData.batchNumber.trim()) newErrors.batchNumber = 'Batch number required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date required';
    if (formData.price === '' || isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing) {
      updateMedicine(medicineToEdit.id, formData);
    } else {
      addMedicine(formData);
    }
    onClose();
  };

  const dosageForms = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Powder Sachet', 'Drops', 'Inhaler'];
  const commonRacks = ['A', 'B', 'C', 'D', 'E', 'F'];
  const commonShelves = ['1', '2', '3', '4', '5'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Medicine Record' : 'Add New Medicine to Inventory'}
      subtitle={isEditing ? `Update specifications for ${medicineToEdit?.name}` : 'Enter verified pharmacy medicine details and storage rack/shelf'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Name & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Medicine / Generic Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Paracetamol 500 mg"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brand / Commercial Name
            </label>
            <input
              type="text"
              name="brandName"
              placeholder="e.g. Crocin / Calpol / Dolo"
              value={formData.brandName}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Active Ingredient & Strength */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Active Ingredient (Salt Name) *
            </label>
            <input
              type="text"
              name="activeIngredient"
              placeholder="e.g. Paracetamol / Cetirizine"
              value={formData.activeIngredient}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                errors.activeIngredient ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
            />
            {errors.activeIngredient && <p className="text-[11px] text-rose-500 mt-1">{errors.activeIngredient}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Strength *
            </label>
            <input
              type="text"
              name="strength"
              placeholder="e.g. 500 mg / 10 mg"
              value={formData.strength}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                errors.strength ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
            />
            {errors.strength && <p className="text-[11px] text-rose-500 mt-1">{errors.strength}</p>}
          </div>
        </div>

        {/* Dosage Form & Therapeutic Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dosage Form *
            </label>
            <select
              name="dosageForm"
              value={formData.dosageForm}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {dosageForms.map((df) => (
                <option key={df} value={df}>{df}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Therapeutic Class
            </label>
            <input
              type="text"
              name="therapeuticClass"
              placeholder="e.g. Analgesic / Antipyretic / Antibiotic"
              value={formData.therapeuticClass}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Physical Storage Coordinates: Rack & Shelf */}
        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-bold text-teal-900">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Physical Pharmacy Storage Coordinates</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rack *</label>
              <select
                name="rack"
                value={formData.rack}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {commonRacks.map((r) => (
                  <option key={r} value={r}>Rack {r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Shelf *</label>
              <select
                name="shelf"
                value={formData.shelf}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {commonShelves.map((s) => (
                  <option key={s} value={s}>Shelf {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Initial Quantity *</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 text-xs rounded-lg border ${
                  errors.quantity ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Low-Stock Alert Qty</label>
              <input
                type="number"
                name="lowStockThreshold"
                min="1"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        </div>

        {/* Batch, Expiry, Price */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Batch Number *
            </label>
            <input
              type="text"
              name="batchNumber"
              placeholder="e.g. B102 / DL901"
              value={formData.batchNumber}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                errors.batchNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              } uppercase focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
            />
            {errors.batchNumber && <p className="text-[11px] text-rose-500 mt-1">{errors.batchNumber}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                errors.expiryDate ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
            />
            {errors.expiryDate && <p className="text-[11px] text-rose-500 mt-1">{errors.expiryDate}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Price ({settings.currencySymbol}) *
            </label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              placeholder="e.g. 25.00"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                errors.price ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500`}
            />
            {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
          </div>
        </div>

        {/* Supplier & Expected Restock if applicable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supplier / Distributor
            </label>
            <input
              type="text"
              name="supplier"
              placeholder="e.g. Apex Pharma Distributors"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expected Restock Date (Optional)
            </label>
            <input
              type="date"
              name="expectedRestockDate"
              value={formData.expectedRestockDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            <span>{isEditing ? 'Save Changes' : 'Add Medicine'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
