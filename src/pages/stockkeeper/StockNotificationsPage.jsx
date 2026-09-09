import React from 'react';
import { Bell, CheckCheck, Package, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';

function notifIcon(type) {
  if (type === 'stock_zero') return <AlertTriangle className="w-4 h-4 text-rose-500" />;
  if (type === 'new_batch_available') return <Package className="w-4 h-4 text-teal-600" />;
  if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  return <Info className="w-4 h-4 text-slate-400" />;
}

function notifBg(type, read) {
  if (read) return 'bg-white';
  if (type === 'stock_zero') return 'bg-rose-50';
  if (type === 'new_batch_available') return 'bg-teal-50';
  return 'bg-slate-50';
}

export function StockNotificationsPage({ setCurrentRoute }) {
  const { notifications, markNotificationAsRead, clearNotifications, currentUser } = usePharmacy();

  const myNotifs = notifications.filter((n) => n.recipientRole === currentUser?.role);
  const unreadCount = myNotifs.filter((n) => !n.read).length;

  const sorted = [...myNotifs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-200">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All caught up!'}
          </p>
        </div>
        {myNotifs.length > 0 && (
          <button
            onClick={() => clearNotifications(currentUser?.role)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No notifications yet.</p>
          <p className="text-xs text-slate-400 mt-1">Stock-related alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl border transition-all ${notifBg(notif.type, notif.read)} ${
                notif.read ? 'border-slate-100' : 'border-teal-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4 px-5 py-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  notif.type === 'stock_zero' ? 'bg-rose-100'
                  : notif.type === 'new_batch_available' ? 'bg-teal-100'
                  : 'bg-slate-100'
                }`}>
                  {notifIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-bold ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">{formatTime(notif.createdAt)}</p>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
                    title="Mark as read"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
