import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { History, ShoppingCart, Sparkles, CheckCircle2, Clock, Calendar } from 'lucide-react';

export function WorkerActivity() {
  const { sales, activities, currentUser } = usePharmacy();
  const [activeTab, setActiveTab] = useState('sales'); // sales | all

  // Filter sales recorded by this user
  const userSales = sales.filter((s) => {
    if (!currentUser) return true;
    return s.recordedBy.toLowerCase().includes(currentUser.username.toLowerCase()) ||
           s.recordedBy.toLowerCase().includes(currentUser.name.toLowerCase());
  });

  const userActivities = activities.filter((a) => {
    if (!currentUser) return true;
    return a.user.toLowerCase().includes(currentUser.username.toLowerCase()) ||
           a.user.toLowerCase().includes(currentUser.name.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Daily Activity Log</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          History of sales issues, medicine lookups, and alternative suggestions handled during your shift.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-sm">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sales'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Sales Issued ({userSales.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Activity ({userActivities.length})
        </button>
      </div>

      {activeTab === 'sales' ? (
        /* Sales List */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Medicine</th>
                  <th className="px-4 py-3.5">Qty Issued</th>
                  <th className="px-4 py-3.5">Stock Shift</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Customer Type</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {userSales.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-slate-500">
                      <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">No sales recorded during this session yet</p>
                    </td>
                  </tr>
                ) : (
                  userSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                        {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {sale.medicineName}
                      </td>

                      <td className="px-4 py-3.5 font-black text-teal-800">
                        {sale.quantitySold} units
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-slate-400">{sale.previousStock}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-bold text-slate-900">{sale.remainingStock}</span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        ₹{Number(sale.totalAmount).toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {sale.customerType}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* All Activity Timeline */
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          {userActivities.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No recorded activities.</p>
          ) : (
            <div className="space-y-4">
              {userActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600 font-bold mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{act.action}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold text-teal-700 mt-0.5">{act.medicine}</p>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{act.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
