import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Badge } from '../../components/common/Badge';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  Search,
  Filter,
  Info
} from 'lucide-react';

export function AIActivityHistory() {
  const { aiSuggestions } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('all'); // all, Approved, Rejected, Ignored

  const filteredSuggestions = aiSuggestions.filter((sug) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      sug.requestedMedicineName.toLowerCase().includes(term) ||
      sug.suggestedMedicineName.toLowerCase().includes(term) ||
      sug.reviewedBy.toLowerCase().includes(term) ||
      sug.matchReason.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (decisionFilter !== 'all' && sug.decision !== decisionFilter) return false;
    return true;
  });

  const approvedCount = aiSuggestions.filter((s) => s.decision === 'Approved').length;
  const rejectedCount = aiSuggestions.filter((s) => s.decision === 'Rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Suggestion Activity & Audit Log</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {aiSuggestions.length} Total Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete audit trail of AI alternative matches generated, match scores, criteria rationale, and pharmacist decisions.
          </p>
        </div>
      </div>

      {/* Human In The Loop Principle Banner */}
      <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-sm mb-0.5">Human-in-the-Loop Verification Protocol</strong>
          AI suggestions search existing pharmacy database inventory only. The percentage score reflects <strong>database attribute similarity</strong> (ingredient, strength, form). A qualified pharmacist or authorized staff member must verify and authorize every alternative before dispensing.
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Scans Performed</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{aiSuggestions.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Pharmacist Approved</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">{approvedCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Pharmacist Rejected</span>
          <span className="text-2xl font-black text-rose-700 block mt-1">{rejectedCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by requested medicine, suggested match, reason, or reviewer..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'Approved', 'Rejected', 'Ignored'].map((st) => (
            <button
              key={st}
              onClick={() => setDecisionFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                decisionFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Decisions' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Requested Medicine</th>
                <th className="px-4 py-3.5">Possible Database Match</th>
                <th className="px-4 py-3.5">Match Similarity Score</th>
                <th className="px-4 py-3.5">Reasoning Breakdown</th>
                <th className="px-4 py-3.5 text-center">Decision</th>
                <th className="px-4 py-3.5">Reviewed By</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSuggestions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-500">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No AI suggestion activity records found</p>
                  </td>
                </tr>
              ) : (
                filteredSuggestions.map((item) => {
                  const isApproved = item.decision === 'Approved';
                  const isRejected = item.decision === 'Rejected';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{item.requestedMedicineName}</div>
                        <span className="text-[10px] text-rose-600 font-semibold">{item.requestedStatus || 'Out of Stock'}</span>
                      </td>

                      <td className="px-4 py-3.5 font-extrabold text-teal-800">
                        {item.suggestedMedicineName}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-black text-xs border border-teal-200">
                            {item.matchScore}%
                          </span>
                          <span className="text-[10px] text-slate-400">database similarity</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs text-slate-600 leading-relaxed text-[11px]">
                        {item.matchReason}
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
                          isApproved ? 'bg-emerald-100 text-emerald-800' : isRejected ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {isRejected && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          <span>{item.decision}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{item.reviewedBy}</div>
                        {item.notes && <div className="text-[10px] text-slate-400 italic">"{item.notes}"</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
