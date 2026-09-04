import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { StockStatusBadge, Badge } from '../../components/common/Badge';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { AddEditMedicineModal } from '../../components/modals/AddEditMedicineModal';
import { MedicineDetailsModal } from '../../components/modals/MedicineDetailsModal';
import { RestockModal } from '../../components/modals/RestockModal';
import { RecordSaleModal } from '../../components/modals/RecordSaleModal';
import { calculateExpiryRisk } from '../../services/aiMatchingEngine';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  SlidersHorizontal,
  ShoppingCart,
  Truck,
  Sparkles,
  AlertCircle,
  ArrowUpDown,
  Download
} from 'lucide-react';

export function MedicineInventory({ setCurrentRoute }) {
  const { medicines, deleteMedicine, correctStock, settings } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, low, out, expiring
  const [rackFilter, setRackFilter] = useState('all');
  const [dosageFilter, setDosageFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState(null);
  const [selectedDetailsMed, setSelectedDetailsMed] = useState(null);
  const [medicineToRestock, setMedicineToRestock] = useState(null);
  const [medicineToSell, setMedicineToSell] = useState(null);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [correctStockMed, setCorrectStockMed] = useState(null);
  const [newStockInput, setNewStockInput] = useState('');

  // Filtering & Sorting
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        // Search term
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

        // Status Filter
        if (statusFilter === 'available' && med.quantity <= (med.lowStockThreshold || 10)) return false;
        if (statusFilter === 'low' && (med.quantity > (med.lowStockThreshold || 10) || med.quantity === 0)) return false;
        if (statusFilter === 'out' && med.quantity !== 0) return false;
        if (statusFilter === 'expiring') {
          const exp = calculateExpiryRisk(med.expiryDate);
          if (exp.status === 'safe') return false;
        }

        // Rack Filter
        if (rackFilter !== 'all' && med.rack !== rackFilter) return false;

        // Dosage Form Filter
        if (dosageFilter !== 'all' && med.dosageForm !== dosageFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'quantity' || sortField === 'price') {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [medicines, searchTerm, statusFilter, rackFilter, dosageFilter, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    setMedicineToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setMedicineToEdit(med);
    setIsAddEditModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (medicineToDelete) {
      deleteMedicine(medicineToDelete.id);
      setMedicineToDelete(null);
    }
  };

  const handleStockCorrectionSubmit = (e) => {
    e.preventDefault();
    if (correctStockMed) {
      correctStock(correctStockMed.id, newStockInput, 'Manual Inventory Adjustment');
      setCorrectStockMed(null);
    }
  };

  // Export simple CSV
  const handleExportCSV = () => {
    const headers = ['Medicine Name,Active Ingredient,Strength,Dosage Form,Rack,Shelf,Quantity,Batch,Expiry,Price,Supplier'];
    const rows = filteredMedicines.map(m => 
      `"${m.name}","${m.activeIngredient}","${m.strength}","${m.dosageForm}","${m.rack}","${m.shelf}",${m.quantity},"${m.batchNumber}","${m.expiryDate}",${m.price},"${m.supplier || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medora_inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Medicine Inventory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {filteredMedicines.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete database of pharmacy medicines, physical locations, batches and quantities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medicine name, active ingredient, brand, strength or batch..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Availability Statuses</option>
              <option value="available">🟢 Available Only</option>
              <option value="low">🟠 Low Stock (≤ Threshold)</option>
              <option value="out">🔴 Out of Stock (0 Units)</option>
              <option value="expiring">🟡 Expiring Soon</option>
            </select>
          </div>

          {/* Rack Location Filter */}
          <div className="flex gap-2">
            <select
              value={rackFilter}
              onChange={(e) => setRackFilter(e.target.value)}
              className="w-1/2 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Racks</option>
              <option value="A">Rack A</option>
              <option value="B">Rack B</option>
              <option value="C">Rack C</option>
              <option value="D">Rack D</option>
            </select>

            <select
              value={dosageFilter}
              onChange={(e) => setDosageFilter(e.target.value)}
              className="w-1/2 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">All Forms</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Powder Sachet">Sachet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Medicine / Brand</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Active Ingredient</th>
                <th className="px-3 py-3.5">Strength</th>
                <th className="px-3 py-3.5">Form</th>
                <th className="px-4 py-3.5">Storage Location</th>
                <th 
                  onClick={() => handleSort('quantity')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Quantity</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-3 py-3.5">Batch</th>
                <th 
                  onClick={() => handleSort('expiryDate')}
                  className="px-3 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Expiry</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('price')}
                  className="px-3 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-12 text-center text-slate-500">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No matching medicines found</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const expiryRisk = calculateExpiryRisk(med.expiryDate);

                  return (
                    <tr 
                      key={med.id} 
                      className="hover:bg-teal-50/30 transition-colors group"
                    >
                      {/* Medicine Name & Brand */}
                      <td className="px-4 py-3">
                        <div 
                          onClick={() => setSelectedDetailsMed(med)}
                          className="cursor-pointer group/link"
                        >
                          <div className="font-bold text-slate-900 group-hover/link:text-teal-700 transition-colors">
                            {med.name}
                          </div>
                          {med.brandName && med.brandName !== med.name && (
                            <div className="text-[11px] text-slate-500">{med.brandName}</div>
                          )}
                        </div>
                      </td>

                      {/* Active Ingredient */}
                      <td className="px-4 py-3 text-slate-700 font-medium max-w-[180px] truncate" title={med.activeIngredient}>
                        {med.activeIngredient}
                      </td>

                      {/* Strength */}
                      <td className="px-3 py-3 text-slate-600 font-semibold whitespace-nowrap">
                        {med.strength}
                      </td>

                      {/* Form */}
                      <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                        {med.dosageForm}
                      </td>

                      {/* Storage Location */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <RackShelfBadge rack={med.rack} shelf={med.shelf} size="sm" />
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-extrabold text-sm ${
                            med.quantity === 0 ? 'text-rose-600' :
                            med.quantity <= med.lowStockThreshold ? 'text-amber-600' :
                            'text-slate-900'
                          }`}>
                            {med.quantity}
                          </span>
                          <button
                            onClick={() => {
                              setCorrectStockMed(med);
                              setNewStockInput(med.quantity.toString());
                            }}
                            className="text-[10px] text-slate-400 hover:text-teal-600 px-1 py-0.5 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Quick Stock Correction"
                          >
                            Edit
                          </button>
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="px-3 py-3 font-mono text-teal-800 text-[11px] font-semibold">
                        {med.batchNumber}
                      </td>

                      {/* Expiry */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`font-medium ${
                          expiryRisk.status === 'expired' || expiryRisk.status === 'high_risk'
                            ? 'text-rose-600 font-bold'
                            : expiryRisk.status === 'expiring_soon'
                            ? 'text-amber-600 font-semibold'
                            : 'text-slate-700'
                        }`}>
                          {med.expiryDate}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap">
                        {settings.currencySymbol}{Number(med.price).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <StockStatusBadge quantity={med.quantity} threshold={med.lowStockThreshold} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Record Sale */}
                          <button
                            onClick={() => setMedicineToSell(med)}
                            disabled={med.quantity === 0}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Record Sale"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>

                          {/* Restock */}
                          <button
                            onClick={() => setMedicineToRestock(med)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Receive Restock"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Medicine Record"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setMedicineToDelete(med)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <span>Showing {filteredMedicines.length} of {medicines.length} medicines in inventory</span>
          <span className="font-semibold text-teal-800">Demo Inventory • Local Persistent Storage</span>
        </div>
      </div>

      {/* Modals */}
      <AddEditMedicineModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        medicineToEdit={medicineToEdit}
      />

      <MedicineDetailsModal
        isOpen={!!selectedDetailsMed}
        onClose={() => setSelectedDetailsMed(null)}
        medicine={selectedDetailsMed}
        onOpenSale={(m) => setMedicineToSell(m)}
        onOpenAlternatives={(m) => {
          setSelectedDetailsMed(null);
          setCurrentRoute('worker-alternatives');
        }}
        onOpenEdit={(m) => handleOpenEdit(m)}
        onOpenRestock={(m) => setMedicineToRestock(m)}
      />

      <RestockModal
        isOpen={!!medicineToRestock}
        onClose={() => setMedicineToRestock(null)}
        medicineToRestock={medicineToRestock}
      />

      <RecordSaleModal
        isOpen={!!medicineToSell}
        onClose={() => setMedicineToSell(null)}
        preselectedMedicine={medicineToSell}
      />

      {/* Quick Stock Correction Modal */}
      {correctStockMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick Stock Correction</h3>
            <p className="text-xs text-slate-500 mb-4">{correctStockMed.name}</p>

            <form onSubmit={handleStockCorrectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adjust Stock Count (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold text-center rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectStockMed(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {medicineToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Medicine Record?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Are you sure you want to permanently delete <strong>{medicineToDelete.name}</strong> (Batch: {medicineToDelete.batchNumber}) from inventory? This action is recorded in the activity audit log.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMedicineToDelete(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
