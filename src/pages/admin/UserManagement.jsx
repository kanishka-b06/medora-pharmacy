import React, { useState } from 'react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Modal } from '../../components/common/Modal';
import {
  UserCheck,
  UserPlus,
  Shield,
  User,
  Key,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';

export function UserManagement() {
  const { users, addUser, toggleUserStatus, resetUserPassword } = usePharmacy();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'worker',
    roleTitle: 'Pharmacy Assistant / Dispenser'
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.username) return;

    addUser(newUserForm);
    setNewUserForm({
      name: '',
      username: '',
      email: '',
      role: 'worker',
      roleTitle: 'Pharmacy Assistant / Dispenser'
    });
    setIsAddUserOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff & User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmacy staff accounts, grant role permissions, and handle password credentials.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3.5">Staff Member</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Assigned Title</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((u) => {
                const isAdmin = u.role === 'supervisor' || u.role === 'admin';
                const isActive = u.status === 'active';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${u.avatarColor || 'bg-slate-600'}`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">
                      @{u.username}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        isAdmin ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {isAdmin ? <Shield className="w-3 h-3 text-teal-600" /> : <User className="w-3 h-3 text-blue-600" />}
                        <span>{isAdmin ? 'Admin / Manager' : 'Worker'}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {u.roleTitle || 'Pharmacy Staff'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{isActive ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500">
                      {u.lastActive || 'Never'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => resetUserPassword(u.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Reset demo password"
                        >
                          Reset Pass
                        </button>

                        {!isAdmin && (
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                              isActive
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {isActive ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Account Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add Pharmacy Staff Account"
        subtitle="Create credentials for pharmacy assistants or managers"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Staff Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Lee"
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Username *</label>
            <input
              type="text"
              required
              placeholder="e.g. worker3"
              value={newUserForm.username}
              onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Staff Email</label>
            <input
              type="email"
              placeholder="e.g. jordan@medora.local"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Role Type</label>
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="worker">Worker / Dispenser</option>
                <option value="admin">Admin / Manager</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Pharmacy Assistant"
                value={newUserForm.roleTitle}
                onChange={(e) => setNewUserForm({ ...newUserForm, roleTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px]">
            Default prototype password will be initialized to <strong>{newUserForm.username ? `${newUserForm.username}123` : 'worker123'}</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
