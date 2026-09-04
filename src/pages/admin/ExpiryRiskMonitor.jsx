import React, { useState, useMemo } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Badge } from '../../components/common/Badge';
import { RackShelfBadge } from '../../components/common/RackShelfBadge';
import { calculateExpiryRisk } from '../../services/aiMatchingEngine';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  ArrowUpDown,
  Filter,
  Info,
  Layers
} from 'lucide-react';

export function ExpiryRiskMonitor() {
  const { medicines, settings } = usePharmacy();
  const [riskFilter, setRiskFilter] = useState('all'); // all, high_risk, expiring_soon, safe
  const [sortField, setSortField] = useState('daysRemaining');
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  // Process medicines with expiry calculation
  const processedMedicines = useMemo(() => {
    return medicines.map((med) => {
      const risk = calculateExpiryRisk(med.expiryDate, settings.expiryWarningDays, settings.highRiskExpiryDays);
      return {
        ...med,
        risk
      };
    });
  }, [medicines, settings]);

  const filteredMedicines = useMemo(() => {
    return processedMedicines
      .filter((med) => {
        if (riskFilter === 'high_risk') return med.risk.status === 'high_risk' || med.risk.status === 'expired';
        if (riskFilter === 'expiring_soon') return med.risk.status === 'expiring_soon';
        if (riskFilter === 'safe') return med.risk.status === 'safe';
        return true;
      })
      .sort((a, b) => {
        let valA = a.risk.daysRemaining;
        let valB = b.risk.daysRemaining;

        if (sortField === 'quantity') {
          valA = a.quantity;
          valB = b.quantity;
        } else if (sortField === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [processedMedicines, riskFilter, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const highRiskCount = processedMedicines.filter((m) => m.risk.status === 'high_risk' || m.risk.status === 'expired').length;
  const expiringSoonCount = processedMedicines.filter((m) => m.risk.status === 'expiring_soon').length;
  const safeCount = processedMedicines.filter((m) => m.risk.status === 'safe').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Expiry Risk Monitor</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track batch shelf life, monitor approaching expiration horizons, and prioritize stock rotation.
          </p>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm mb-0.5">Inventory Expiry Monitoring System</strong>
          This interface monitors inventory dates for shelf-life rotation (FEFO - First Expired, First Out). It is an inventory management feature and not a medical safety prediction tool.
        </div>
      </div>

      {/* Summary Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setRiskFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            riskFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-70">All Monitored Items</span>
          <span className="text-2xl font-black mt-1 block">{processedMedicines.length}</span>
          <span className="text-xs opacity-80 mt-1 block">Complete inventory</span>
        </button>

        <button
          onClick={() => setRiskFilter('high_risk')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            riskFilter === 'high_risk'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-rose-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-rose-500">🔴 High Expiry Risk</span>
          <span className="text-2xl font-black mt-1 block text-rose-700">{highRiskCount}</span>
          <span className="text-xs text-slate-500 mt-1 block">≤ {settings.highRiskExpiryDays || 30} Days remaining</span>
        </button>

        <button
          onClick={() => setRiskFilter('expiring_soon')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            riskFilter === 'expiring_soon'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-amber-600">🟡 Expiring Soon</span>
          <span className="text-2xl font-black mt-1 block text-amber-700">{expiringSoonCount}</span>
          <span className="text-xs text-slate-500 mt-1 block">≤ {settings.expiryWarningDays || 90} Days remaining</span>
        </button>

        <button
          onClick={() => setRiskFilter('safe')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            riskFilter === 'safe'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-600">🟢 Safe Horizon</span>
          <span className="text-2xl font-black mt-1 block text-emerald-700">{safeCount}</span>
          <span className="text-xs text-slate-500 mt-1 block">&gt; {settings.expiryWarningDays || 90} Days remaining</span>
        </button>
      </div>

      {/* Expiry Risk Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Medicine Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Batch Number</th>
                <th className="px-4 py-3.5">Storage Location</th>
                <th 
                  onClick={() => handleSort('quantity')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>In-Stock Qty</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5">Expiry Date</th>
                <th 
                  onClick={() => handleSort('daysRemaining')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Days Remaining</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center">Risk Level</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMedicines.map((med) => {
                const { risk } = med;
                const isHigh = risk.status === 'high_risk' || risk.status === 'expired';
                const isWarning = risk.status === 'expiring_soon';

                return (
                  <tr 
                    key={med.id} 
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isHigh ? 'bg-rose-50/30' : isWarning ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-slate-500">{med.activeIngredient} • {med.strength}</div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-teal-800 font-bold">
                      {med.batchNumber}
                    </td>

                    <td className="px-4 py-3.5">
                      <RackShelfBadge rack={med.rack} shelf={med.shelf} size="sm" />
                    </td>

                    <td className="px-4 py-3.5 font-extrabold text-slate-900">
                      {med.quantity} units
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {med.expiryDate}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold">
                        <span className={`${
                          isHigh ? 'text-rose-600 font-black' : isWarning ? 'text-amber-600' : 'text-emerald-700'
                        }`}>
                          {risk.daysRemaining < 0 ? `Expired (${Math.abs(risk.daysRemaining)}d ago)` : `${risk.daysRemaining} days`}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ~{Math.round(risk.daysRemaining / 30)} months
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={isHigh ? 'high_risk' : isWarning ? 'expiring_soon' : 'available'}
                        size="md"
                      >
                        {risk.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
