import React from 'react';
import { MapPin, Layers } from 'lucide-react';

export function RackShelfBadge({ rack, shelf, size = 'md', prominent = false, className = '' }) {
  if (prominent) {
    return (
      <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-500/30 rounded-xl px-3.5 py-2 shadow-sm ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Storage Location</div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="text-teal-900">Rack <span className="text-teal-600 font-extrabold text-base">{rack}</span></span>
            <span className="text-slate-400">→</span>
            <span className="text-teal-900">Shelf <span className="text-teal-600 font-extrabold text-base">{shelf}</span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80 px-2.5 py-1 text-xs ${className}`}>
      <Layers className="w-3.5 h-3.5 text-teal-600" />
      <span>Rack <strong className="text-teal-700">{rack}</strong> / Shelf <strong className="text-teal-700">{shelf}</strong></span>
    </div>
  );
}
