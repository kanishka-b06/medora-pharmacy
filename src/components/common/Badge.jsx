import React from 'react';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold'
  };

  const variantClasses = {
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 ring-1 ring-emerald-500/10',
    low_stock: 'bg-amber-50 text-amber-700 border border-amber-200/80 ring-1 ring-amber-500/10',
    out_of_stock: 'bg-rose-50 text-rose-700 border border-rose-200/80 ring-1 ring-rose-500/10',
    expiring_soon: 'bg-yellow-50 text-yellow-800 border border-yellow-200 ring-1 ring-yellow-500/10',
    high_risk: 'bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-500/20 font-bold',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 ring-1 ring-blue-500/10',
    ordered: 'bg-indigo-50 text-indigo-700 border border-indigo-200 ring-1 ring-indigo-500/10',
    transit: 'bg-purple-50 text-purple-700 border border-purple-200 ring-1 ring-purple-500/10',
    arrived: 'bg-teal-50 text-teal-700 border border-teal-200 ring-1 ring-teal-500/10',
    default: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.default
      } ${className}`}
    >
      {variant === 'available' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      {variant === 'low_stock' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
      {variant === 'out_of_stock' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
      {children}
    </span>
  );
}

export function StockStatusBadge({ quantity, threshold = 10, size = 'md' }) {
  const qty = Number(quantity) || 0;
  const thresh = Number(threshold) || 10;

  if (qty <= 0) {
    return (
      <Badge variant="out_of_stock" size={size}>
        🔴 Out of Stock (0)
      </Badge>
    );
  }

  if (qty <= thresh) {
    return (
      <Badge variant="low_stock" size={size}>
        🟠 Low Stock ({qty})
      </Badge>
    );
  }

  return (
    <Badge variant="available" size={size}>
      🟢 Available ({qty})
    </Badge>
  );
}
