import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

export function ToastContainer() {
  const { toasts, removeToast } = usePharmacy();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-500/30',
      bg: 'bg-white',
      iconColor: 'text-emerald-600',
      bar: 'bg-emerald-500'
    },
    error: {
      icon: AlertCircle,
      border: 'border-rose-500/30',
      bg: 'bg-white',
      iconColor: 'text-rose-600',
      bar: 'bg-rose-500'
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500/30',
      bg: 'bg-white',
      iconColor: 'text-amber-600',
      bar: 'bg-amber-500'
    },
    info: {
      icon: Info,
      border: 'border-blue-500/30',
      bg: 'bg-white',
      iconColor: 'text-blue-600',
      bar: 'bg-blue-500'
    }
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${config.border} ${config.bg} p-4 shadow-xl transition-all duration-300 transform translate-y-0 animate-fade-in`}
      role="alert"
    >
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${config.bar}`} />
      
      <div className="flex items-start gap-3 pl-2">
        <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 pr-2">
          {toast.title && <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>}
          {toast.message && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>}
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
