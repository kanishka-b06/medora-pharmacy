import React from 'react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'teal',
  onClick,
  badgeText,
  badgeVariant = 'default',
  trend
}) {
  const colorStyles = {
    teal: {
      bg: 'bg-teal-50/90 border border-teal-200/60',
      text: 'text-teal-600',
      border: 'hover:border-teal-400',
      glow: 'group-hover:shadow-teal-500/10'
    },
    emerald: {
      bg: 'bg-emerald-50/90 border border-emerald-200/60',
      text: 'text-emerald-600',
      border: 'hover:border-emerald-400',
      glow: 'group-hover:shadow-emerald-500/10'
    },
    amber: {
      bg: 'bg-amber-50/90 border border-amber-200/60',
      text: 'text-amber-600',
      border: 'hover:border-amber-400',
      glow: 'group-hover:shadow-amber-500/10'
    },
    rose: {
      bg: 'bg-rose-50/90 border border-rose-200/60',
      text: 'text-rose-600',
      border: 'hover:border-rose-400',
      glow: 'group-hover:shadow-rose-500/10'
    },
    blue: {
      bg: 'bg-cyan-50/90 border border-cyan-200/60',
      text: 'text-cyan-700',
      border: 'hover:border-cyan-400',
      glow: 'group-hover:shadow-cyan-500/10'
    },
    purple: {
      bg: 'bg-purple-50/90 border border-purple-200/60',
      text: 'text-purple-600',
      border: 'hover:border-purple-400',
      glow: 'group-hover:shadow-purple-500/10'
    }
  };

  const currentTheme = colorStyles[color] || colorStyles.teal;

  return (
    <div
      onClick={onClick}
      className={`group bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-teal-100/80 shadow-[0_4px_20px_-4px_rgba(13,148,136,0.06)] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${currentTheme.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
            {trend && <span className="text-xs font-medium text-slate-500">{trend}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${currentTheme.bg} ${currentTheme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {badgeText && (
            <span className={`px-2 py-0.5 rounded-full font-medium text-[11px] ${
              badgeVariant === 'rose' ? 'bg-rose-100 text-rose-700' :
              badgeVariant === 'amber' ? 'bg-amber-100 text-amber-700' :
              badgeVariant === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
