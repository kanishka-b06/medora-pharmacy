import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { History, Search, Filter, Calendar, User, Package, Download } from 'lucide-react';

export function ActivityHistory() {
  const { activities } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Filter activities matching search text and action filter
  const filteredActivities = activities.filter((activity) => {
    const searchText = searchTerm.toLowerCase().trim();
    const action = (activity?.action || '').toLowerCase();
    const medicine = (activity?.medicine || activity?.target || '').toLowerCase();
    const user = (activity?.user || activity?.performedBy || '').toLowerCase();
    const details = (activity?.details || '').toLowerCase();

    const matchesSearch =
      !searchText ||
      action.includes(searchText) ||
      medicine.includes(searchText) ||
      user.includes(searchText) ||
      details.includes(searchText);

    if (!matchesSearch) return false;
    if (actionFilter !== 'all' && !action.includes(actionFilter.toLowerCase())) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp,User,Role,Action,Medicine,Details'];
    const rows = filteredActivities.map(a => 
      `"${a?.timestamp || ''}","${(a?.user || a?.performedBy || 'System')}","${a?.role || 'staff'}","${a?.action || ''}","${(a?.medicine || a?.target || '—')}","${(a?.details || '').replace(/"/g, '""')}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medora_activity_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Reports & Activity History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit logging of every sales transaction, inventory edit, restock reception and order creation.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Activity Log</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, user, medicine, or detail string..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Action Types</option>
            <option value="Dispense">Dispensed Medicines</option>
            <option value="Sale">Sales Recorded</option>
            <option value="Restock">Restock Completed</option>
            <option value="Order">Orders Placed</option>
            <option value="Medicine">Medicine Inventory Edits</option>
            <option value="AI">AI Alternative Suggestions</option>
            <option value="Stock Corrected">Stock Corrections</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Medicine Involved</th>
                <th className="px-4 py-3.5">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No activity events found</p>
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {new Date(act.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      {act.user || act.performedBy || 'System'}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                        {act.action}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-teal-800">
                      {act.medicine || act.target || '—'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 leading-relaxed text-xs">
                      {act.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
