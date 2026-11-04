'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserModal from '@/components/users/UserModal';
import { useToast } from '@/context/ToastContext';
import {
  getUsers,
  saveUser,
  toggleUserStatus,
  deleteUser,
} from '@/lib/storage';
import { ROLES, ROLE_LABELS, ROLE_SHORT_LABELS } from '@/lib/constants';
import { formatBDPhone } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Shield,
  GitBranch,
} from 'lucide-react';

export default function UsersManagementPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    try {
      const saved = saveUser(userData);
      toast.success(
        userData.id
          ? `User "${saved.name}" updated successfully.`
          : `New user "${saved.name}" created with assigned hierarchy parent.`
      );
      loadUsers();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = toggleUserStatus(user.id);
    if (newStatus) {
      toast.info(`Account status for ${user.name} is now ${newStatus}.`);
      loadUsers();
    }
  };

  const handleDeleteUser = (user) => {
    if (user.role === ROLES.ADMIN) {
      toast.error('System Admin account cannot be deleted.');
      return;
    }

    // Check if other users report to this user
    const hasSubordinates = users.some((u) => u.parentId === user.id);
    if (hasSubordinates) {
      toast.error(
        `Cannot delete ${user.name} because other employees directly report to this manager. Reassign subordinates first.`
      );
      return;
    }

    if (confirm(`Are you sure you want to delete ${user.name} (${user.role})?`)) {
      deleteUser(user.id);
      toast.success(`User ${user.name} deleted.`);
      loadUsers();
    }
  };

  // Find parent manager name
  const getParentName = (parentId) => {
    if (!parentId) return 'None (Root)';
    const parent = users.find((u) => u.id === parentId);
    if (!parent) return 'Unknown';
    return `${parent.name} (${ROLE_SHORT_LABELS[parent.role]})`;
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);

    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  const repCount = users.filter((u) => u.role === ROLES.SALES_EXECUTIVE).length;

  return (
    <DashboardLayout allowedRoles={[ROLES.ADMIN]}>
      <div className="space-y-6">
        {/* Page Header (Light Theme) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Users className="w-7 h-7 text-blue-600" />
              User & Strict Hierarchy Management
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Admin Console: Create, edit, and enforce non-skipping parent manager assignments.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Stats Strip (Light Theme) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold">Total Employees</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{users.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-blue-700 font-semibold">Field Executives (SE)</span>
            <div className="text-xl font-extrabold text-blue-700 mt-1">{repCount}</div>
          </div>
        </div>

        {/* Filters & Search (Light Theme) */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.NATIONAL_SALES_MANAGER}>National Sales Manager (NSM)</option>
              <option value={ROLES.REGIONAL_SALES_MANAGER}>Regional Sales Manager (RSM)</option>
              <option value={ROLES.AREA_SALES_MANAGER}>Area Sales Manager (ASM)</option>
              <option value={ROLES.TERRITORY_SALES_MANAGER}>Territory Sales Manager (TSM)</option>
              <option value={ROLES.SENIOR_SALES_EXECUTIVE}>Senior Sales Executive (SSE)</option>
              <option value={ROLES.SALES_EXECUTIVE}>Sales Executive (SE)</option>
            </select>
          </div>
        </div>

        {/* Users Table (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Employee / Contact</th>
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-4">Immediate Parent Manager</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                      No employees match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSe = u.role === ROLES.SALES_EXECUTIVE;
                    const isAdminUser = u.role === ROLES.ADMIN;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                            <span>{formatBDPhone(u.phone)}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">PIN: {u.pin}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              isAdminUser
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : isSe
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : u.role === ROLES.SENIOR_SALES_EXECUTIVE
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {ROLE_SHORT_LABELS[u.role]} — {ROLE_LABELS[u.role]}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                            <span>{getParentName(u.parentId)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit User"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!isAdminUser && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                title="Delete User"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Modal */}
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
          editingUser={editingUser}
          allUsers={users}
        />
      </div>
    </DashboardLayout>
  );
}
