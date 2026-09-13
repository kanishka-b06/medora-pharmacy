import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePharmacy } from '../../context/PharmacyContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function RoleBasedLayout({ currentRoute, setCurrentRoute, children }) {
  const { currentUser } = usePharmacy();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Security guard: strict role-based access control
  const isSupervisorRoute = currentRoute.startsWith('admin-');
  const isWorkerRoute = currentRoute.startsWith('worker-');

  const isOwner = currentUser?.role === 'supervisor' || currentUser?.role === 'admin' || currentUser?.role === 'owner';
  const isWorker = currentUser?.role === 'staff' || currentUser?.role === 'worker';

  // Strict isolation: each portal only accessible by its own registered user role
  const isUnauthorized =
    (isSupervisorRoute && !isOwner) ||
    (isWorkerRoute && !isWorker);

  const unauthorizedRedirectRoute = isOwner
    ? 'admin-dashboard'
    : 'worker-search';

  const returnLabel = isOwner
    ? 'Return to Owner Dashboard'
    : 'Return to Worker Portal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6faf8] via-[#f0fdf9] to-[#dcfce7]/40 flex flex-col font-sans text-slate-800 relative selection:bg-teal-100 selection:text-teal-900">
      {/* Ambient background mint glow similar to login page */}
      <div 
        className="fixed top-[-100px] left-1/4 w-[550px] h-[550px] rounded-full pointer-events-none -z-10 opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(153,246,223,0.5) 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-[-100px] right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none -z-10 opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.4) 0%, transparent 70%)' }}
      />

      {/* One Continuous Full-Width Top Header */}
      <Header
        onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
      />

      <div className="flex flex-1 relative">
        {/* Role Sidebar below the Header */}
        <Sidebar
          currentRoute={currentRoute}
          setCurrentRoute={setCurrentRoute}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {isUnauthorized ? (
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-rose-200 shadow-sm max-w-xl mx-auto my-8">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2">Access Restricted</h2>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                You do not have permission to access this section. This portal is restricted exclusively to authorized {
                  isSupervisorRoute ? 'Owner' : 'Worker'
                } accounts.
              </p>
              <button
                onClick={() => setCurrentRoute(unauthorizedRedirectRoute)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{returnLabel}</span>
              </button>
            </div>
          ) : (
            children
          )}
          </main>
        </div>
      </div>
    </div>
  );
}
