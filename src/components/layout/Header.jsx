import React, { useState } from 'react';
import { 
  Pill, 
  Menu, 
  X, 
  LogOut, 
  Workflow, 
  RotateCcw, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { ArchitectureDiagramModal } from '../common/ArchitectureDiagramModal';

export function Header({ onToggleMobileSidebar, currentRoute, setCurrentRoute }) {
  const { currentUser, logout, resetDemoData } = usePharmacy();
  const [showArchModal, setShowArchModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isSupervisor = currentUser?.role === 'supervisor' || currentUser?.role === 'admin' || currentUser?.role === 'owner';

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-white/95 backdrop-blur-md border-b border-teal-100/90 px-4 sm:px-6 shadow-[0_2px_12px_-2px_rgba(13,148,136,0.03)] flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Left: Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-teal-50 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => setCurrentRoute(isSupervisor ? 'admin-dashboard' : 'worker-search')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-[#11b3a1] flex items-center justify-center text-white shadow-md shadow-[#11b3a1]/25 group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-800 text-lg tracking-tight font-heading">
                    MEDORA
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#11b3a1]/10 text-[#0d9488] border border-[#11b3a1]/30 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-[#11b3a1]" /> AI Assistant
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 leading-none">
                  Smart Pharmacy Operations
                </p>
              </div>
            </div>
          </div>

          {/* Right: Role Badge & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isSupervisor 
                ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-sm' 
                : 'bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'
            }`}>
              {isSupervisor ? (
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{isSupervisor ? 'Owner' : 'Worker'}</span>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-teal-50/60 border border-transparent hover:border-teal-200 transition-all text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                  isSupervisor ? 'bg-gradient-to-br from-teal-600 to-teal-700' : 'bg-gradient-to-br from-emerald-600 to-teal-600'
                }`}>
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden xl:block pr-1">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">@{currentUser?.username === 'supervisor' ? 'owner' : currentUser?.username}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                      <p className="text-xs text-slate-500">{currentUser?.email}</p>
                      <span className={`mt-1.5 inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        isSupervisor ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {currentUser?.roleTitle || (isSupervisor ? 'Pharmacy Owner' : 'Staff Dispenser')}
                      </span>
                    </div>

                    <div className="py-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowArchModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors"
                      >
                        <Workflow className="w-4 h-4 text-teal-600" />
                        <span>System Architecture Diagram</span>
                      </button>

                      {isSupervisor && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setShowResetConfirm(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-4 h-4 text-rose-500" />
                          <span>Reset Demo Inventory</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Architecture Modal */}
      <ArchitectureDiagramModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />

      {/* Reset Demo Data Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-200">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset Demo Data?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              This will restore all medicines, sales, orders, and AI activity logs back to the initial prototype state (including 15 demo medicines across Racks A-D).
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
