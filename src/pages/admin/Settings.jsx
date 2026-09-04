import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import {
  Settings as SettingsIcon,
  Building2,
  Sliders,
  Sparkles,
  RotateCcw,
  Save,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function Settings() {
  const { settings, updateSettings, resetDemoData } = usePharmacy();
  const [formData, setFormData] = useState({ ...settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pharmacy System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure pharmacy credentials, stock alert thresholds, AI matching parameters and demo mode.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pharmacy Information Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-extrabold text-slate-900">Pharmacy Profile & Registration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pharmacy Name</label>
              <input
                type="text"
                name="pharmacyName"
                value={formData.pharmacyName}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Drug License / Registration #</label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Store Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lead Responsible Pharmacist</label>
              <input
                type="text"
                name="leadPharmacist"
                value={formData.leadPharmacist}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Inventory & Expiry Thresholds */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-extrabold text-slate-900">Inventory Alert Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Low-Stock Alert Qty</label>
              <input
                type="number"
                min="1"
                name="lowStockThresholdDefault"
                value={formData.lowStockThresholdDefault}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Triggers low stock badge on dashboard.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Expiry Warning Horizon (Days)</label>
              <input
                type="number"
                min="15"
                name="expiryWarningDays"
                value={formData.expiryWarningDays}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Yellow alert (e.g. 90 days / ~3 months).</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">High Risk Expiry Horizon (Days)</label>
              <input
                type="number"
                min="7"
                name="highRiskExpiryDays"
                value={formData.highRiskExpiryDays}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Red alert (e.g. 30 days critical).</p>
            </div>
          </div>
        </div>

        {/* AI Alternative Matching Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-extrabold text-slate-900">AI Alternative Matching Engine Settings</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Matching Algorithm Sensitivity</label>
              <select
                name="aiMatchingSensitivity"
                value={formData.aiMatchingSensitivity}
                onChange={handleChange}
                className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Strict">Strict (Exact ingredient & strength only)</option>
                <option value="Balanced">Balanced (Exact ingredient + related strengths & class)</option>
                <option value="Broad">Broad (Includes full therapeutic class equivalents)</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  name="requireAdminApprovalForAlternatives"
                  checked={formData.requireAdminApprovalForAlternatives}
                  onChange={handleChange}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300"
                />
                <span>Enforce Pharmacist / Admin approval before alternative is marked dispensed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Demo Mode Reset Danger Zone (Prompt #46) */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm space-y-4 mt-8">
        <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100 text-rose-700">
          <RotateCcw className="w-5 h-5" />
          <h3 className="text-base font-extrabold">Prototype Demo Data Management</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Restore all medicine records, stock counts, orders, sales and AI suggestion activity logs back to the initial pristine prototype state (15 diverse medicines across Racks A-D).
        </p>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset Demo Data?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              This will restore all inventory quantities, batches, orders, and sales to the baseline demonstration dataset.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
