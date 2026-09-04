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
  Clock
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

  const isAdmin = currentUser?.role === 'supervisor' || currentUser?.role === 'admin';
  const expiryRisk = calculateExpiryRisk(medicine.expiryDate, settings.expiryWarningDays, settings.highRiskExpiryDays);
  const isOutOfStock = medicine.quantity === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicine.name}
      subtitle={`${medicine.activeIngredient} • ${medicine.strength}`}
      maxWidth="max-w-xl"
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

        {/* Out of Stock Notice & Restock timeline */}
        {isOutOfStock && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-rose-950">Medicine Currently Unavailable in Store</h5>
              {medicine.expectedRestockDate ? (
                <p className="text-rose-800 mt-0.5">
                  Expected Restock Arrival: <strong>{new Date(medicine.expectedRestockDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> ({medicine.orderStatus})
                </p>
              ) : (
                <p className="text-rose-800 mt-0.5">
                  No pending restock order recorded yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Core Attributes Grid */}
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
