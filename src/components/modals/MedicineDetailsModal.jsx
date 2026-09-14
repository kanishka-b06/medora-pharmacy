import React from 'react';
import { Modal } from '../common/Modal';
import { RackShelfBadge } from '../common/RackShelfBadge';
import { StockStatusBadge, Badge } from '../common/Badge';
import { calculateExpiryRisk } from '../../services/aiMatchingEngine';
import { usePharmacy } from '../../context/PharmacyContext';
import { 
  ShoppingCart, 
  Sparkles, 
  Edit, 
  Calendar, 
  Hash, 
  Tag, 
  Truck, 
  Building,
  Info,
  Clock,
  Zap,
  CheckCircle2,
  Users,
  AlertTriangle
} from 'lucide-react';

export function MedicineDetailsModal({ 
  isOpen, 
  onClose, 
  medicine, 
  onOpenSale, 
  onOpenAlternatives,
  onOpenEdit,
  onOpenRestock
}) {
  const { currentUser, settings } = usePharmacy();
  if (!medicine) return null;

  const isAdmin = currentUser?.role === 'supervisor' || currentUser?.role === 'admin' || currentUser?.role === 'owner';
  const expiryRisk = calculateExpiryRisk(medicine.expiryDate, settings.expiryWarningDays, settings.highRiskExpiryDays);
  const isOutOfStock = medicine.quantity === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicine.name}
      subtitle={`${medicine.brandName ? `${medicine.brandName} • ` : ''}${medicine.activeIngredient} • ${medicine.strength || medicine.power}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Top Highlight: Location & Stock Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <RackShelfBadge rack={medicine.rack} shelf={medicine.shelf} prominent={true} />
          
          <div className="space-y-1 sm:text-right">
            <StockStatusBadge quantity={medicine.quantity} threshold={medicine.lowStockThreshold} size="lg" />
            <p className="text-[11px] text-slate-500 font-medium">
              Alert threshold: {medicine.lowStockThreshold} units
            </p>
          </div>
        </div>

        {/* Prominent Out of Stock Notice with AI Alternative Action */}
        {isOutOfStock && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/90 space-y-3">
            <div className="flex items-start gap-3 text-xs text-rose-900">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="font-extrabold text-rose-950 text-sm">Medicine Currently Out of Stock</h5>
                <p className="text-rose-800 mt-0.5 text-xs leading-relaxed">
                  This medicine is not on the shelf. You can scan our inventory using the AI matching engine to suggest safe generic or therapeutic substitutes.
                </p>
                {medicine.expectedRestockDate && (
                  <p className="text-rose-700 text-[11px] font-semibold mt-1">
                    Expected Restock: <strong>{new Date(medicine.expectedRestockDate).toLocaleDateString()}</strong> ({medicine.orderStatus})
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAlternatives(medicine);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition-all animate-pulse-subtle"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Find In-Stock Alternatives with AI</span>
            </button>
          </div>
        )}

        {/* CLINICAL USAGE INFORMATION SECTION */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>Clinical & Dispensing Guidance</span>
            </h4>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800">
              <Zap className="w-3 h-3 text-teal-600" />
              <span>Power: {medicine.power || medicine.strength}</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="font-extrabold text-teal-900 block mb-0.5">🎯 What It Is Used For (Indications):</span>
              <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/70">
                {medicine.usedFor || 'General therapeutic pain relief and symptom reduction.'}
              </p>
            </div>

            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">👥 Who Should Use It (Target Patient & Warnings):</span>
              <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/70">
                {medicine.whoShouldUse || 'Adults and adolescents. Verify prescription or consult pharmacist before dispensing.'}
              </p>
            </div>

            <div>
              <span className="font-extrabold text-slate-900 block mb-0.5">🕒 Dosage & Administration:</span>
              <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/70">
                {medicine.dosageInstructions || 'Take according to doctor prescription or standardized packet leaflet.'}
              </p>
            </div>
          </div>
        </div>

        {/* Core Operational Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Dosage Form</span>
            <span className="font-bold text-slate-900">{medicine.dosageForm}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Batch Number</span>
            <span className="font-bold text-teal-800 font-mono">{medicine.batchNumber}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Unit Price</span>
            <span className="font-extrabold text-slate-900 text-sm">{settings.currencySymbol}{Number(medicine.price).toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Expiry Date</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-slate-900">{medicine.expiryDate}</span>
              <Badge variant={expiryRisk.status === 'safe' ? 'available' : expiryRisk.status === 'expiring_soon' ? 'expiring_soon' : 'high_risk'} size="sm">
                {expiryRisk.label}
              </Badge>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Therapeutic Class</span>
            <span className="font-semibold text-slate-800">{medicine.therapeuticClass || 'General'}</span>
          </div>
        </div>

        {/* Distributor & Demo tag */}
        <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Supplier: <strong>{medicine.supplier || 'Authorized Pharma Distributor'}</strong></span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Demo Inventory
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
          {/* Admin Edit Shortcut */}
          {isAdmin && onOpenEdit && (
            <button
              onClick={() => {
                onClose();
                onOpenEdit(medicine);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Medicine</span>
            </button>
          )}

          {/* Restock Shortcut */}
          {isAdmin && onOpenRestock && (
            <button
              onClick={() => {
                onClose();
                onOpenRestock(medicine);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Restock</span>
            </button>
          )}

          {/* AI Alternative Finder */}
          <button
            onClick={() => {
              onClose();
              onOpenAlternatives(medicine);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/80 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Find Possible Alternatives</span>
          </button>

          {/* Record Sale Button (if in stock) */}
          <button
            onClick={() => {
              onClose();
              onOpenSale(medicine);
            }}
            disabled={isOutOfStock}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
