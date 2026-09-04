import React from 'react';
import { Modal } from './Modal';
import { 
  Database, 
  Cpu, 
  UserCheck, 
  Layers, 
  ArrowDown, 
  ShieldCheck, 
  CheckCircle, 
  Search, 
  History,
  Workflow
} from 'lucide-react';

export function ArchitectureDiagramModal({ isOpen, onClose }) {
  const steps = [
    {
      step: '1',
      title: 'Pharmacy Medicine Data',
      desc: 'Inventory records with active ingredients, strengths, forms, batch numbers, expiry dates, and shelf coordinates.',
      icon: Database,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      step: '2',
      title: 'Data Entry / Acquisition',
      desc: 'Stock addition, PO restock reception, barcode/batch updates, threshold definitions & local storage persistence.',
      icon: Layers,
      color: 'bg-teal-50 text-teal-600 border-teal-200'
    },
    {
      step: '3',
      title: 'Medicine Database',
      desc: 'Structured local repository with real-time stock counts, storage coordinates (Rack & Shelf), and expiry tracking.',
      icon: Database,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      step: '4',
      title: 'Validation / Preprocessing',
      desc: 'Normalized string comparisons, dosage unit normalization, and positive stock filtering (in-stock only).',
      icon: Search,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    {
      step: '5',
      title: 'AI Alternative Matching Engine',
      desc: 'Rule-based filtering + multi-attribute similarity calculation (active ingredient, strength ratio, form, therapeutic class).',
      icon: Cpu,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      step: '6',
      title: 'Similarity / Ranking & Explainability',
      desc: 'Generates transparent percentage match scores and plain-language "Why was this suggested?" breakdown.',
      icon: Workflow,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    },
    {
      step: '7',
      title: 'Admin / Worker UI',
      desc: 'Displays ranked suggestions with location highlights, batch, price, and expected restock timeline for out-of-stock items.',
      icon: ShieldCheck,
      color: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    {
      step: '8',
      title: 'Human Verification (Human-in-the-Loop)',
      desc: 'System strictly prohibits automated substitution. Pharmacist or authorized staff reviews clinical suitability.',
      icon: UserCheck,
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      step: '9',
      title: 'Pharmacist Final Decision',
      desc: 'Pharmacist accepts (Approve), rejects (Reject), or ignores the suggestion based on patient needs.',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      step: '10',
      title: 'Database & Audit History Feedback',
      desc: 'Audit trail records timestamp, reviewer, match score, decision, and notes for compliance and traceability.',
      icon: History,
      color: 'bg-slate-50 text-slate-600 border-slate-200'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MEDORA System & AI Architecture"
      subtitle="Complete operational data flow with strict Human-in-the-Loop governance"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200/80 text-xs text-teal-900 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-sm text-teal-950 mb-0.5">
              Strict Human-in-the-Loop Clinical Principle
            </strong>
            The AI engine searches strictly within the pharmacy's stored local database. It suggests candidates based on multi-factor similarity and provides transparent reasoning. <strong>Final dispensing authorization remains 100% with the qualified pharmacist.</strong>
          </div>
        </div>

        {/* Step Flow Diagram */}
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative group">
                {/* Bullet */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-[11px] font-bold text-teal-700 shadow-sm">
                  {item.step}
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-teal-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            Close Architecture View
          </button>
        </div>
      </div>
    </Modal>
  );
}
