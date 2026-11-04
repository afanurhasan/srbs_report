'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserModal from '@/components/users/UserModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getUsers,
  saveUser,
  deleteUser,
} from '@/lib/storage';
import { getSubordinateUsers } from '@/lib/hierarchy';
import {
  ROLES,
  ROLE_LABELS,
  ROLE_SHORT_LABELS,
  MANAGED_ROLES,
  SLUG_TO_ROLE_CONFIG,
} from '@/lib/constants';
import { formatBDPhone } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Phone,
  Lock,
  AlertCircle,
} from 'lucide-react';

export default function RoleUsersManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const roleSlug = params?.roleSlug?.toLowerCase();
  const roleConfig = SLUG_TO_ROLE_CONFIG[roleSlug];

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (!roleConfig) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto my-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Role Not Found</h2>
          <p className="text-xs text-slate-500">
            The role identifier &quot;{roleSlug}&quot; is not recognized in the hierarchy.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isAdmin = user?.role === ROLES.ADMIN;

  // Filter users matching this specific role (Admins see all; managers see their subordinate tree)
  const accessibleUsers = isAdmin
    ? users
    : getSubordinateUsers(user?.id, users);

  const roleUsers = accessibleUsers.filter((u) => u.role === roleConfig.role);

  // Apply search filter
  const filteredUsers = roleUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (targetUser) => {
    setEditingUser(targetUser);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    try {
      const saved = saveUser(userData);
      toast.success(
        userData.id
          ? `${roleConfig.short} "${saved.name}" updated successfully.`
          : `New ${roleConfig.short} "${saved.name}" created.`
      );
      loadUsers();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDeleteUser = (targetUser) => {
    // Check if other users report to this user
    const hasSubordinates = users.some((u) => u.parentId === targetUser.id);
    if (hasSubordinates) {
      toast.error(
        `Cannot delete ${targetUser.name} because other subordinates directly report to this manager. Please reassign those employees first.`
      );
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${roleConfig.short} ${targetUser.name}?`
      )
    ) {
      deleteUser(targetUser.id);
      toast.success(`${roleConfig.short} ${targetUser.name} deleted.`);
      loadUsers();
    }
  };

  // Count subordinates reporting to a given user
  const countDirectSubordinates = (userId) => {
    return users.filter((u) => u.parentId === userId).length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Top Header Card (Clean - No Breadcrumb, No Long Description) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
                {roleConfig.short} Tier
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {roleUsers.length} registered
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {roleConfig.pluralLabel} ({roleConfig.short})
            </h1>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/25 transition-all shrink-0 self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New {roleConfig.short}</span>
            </button>
          )}
        </div>

        {/* Search & Counter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${roleConfig.short} by name or phone...`}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          <div className="text-xs font-bold text-slate-600">
            Total: <span className="text-slate-900 font-mono font-extrabold">{roleUsers.length}</span>
          </div>
        </div>

        {/* Users Table (Only: Employee, Mobile & PIN, Direct Downline, Actions) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No {roleConfig.pluralLabel} Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm
                  ? 'No employees matched your search.'
                  : `No ${roleConfig.pluralLabel} have been created yet.`}
              </p>
              {isAdmin && !searchTerm && (
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/25 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create First {roleConfig.short}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Mobile & PIN</th>
                    <th className="py-3 px-4 text-center">Direct Downline</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const subCount = countDirectSubordinates(u.id);

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Employee Name & ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                ID: {u.id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Mobile & PIN */}
                        <td className="py-3 px-4 font-mono">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatBDPhone(u.phone)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>PIN: {u.pin || '123456'}</span>
                          </div>
                        </td>

                        {/* Direct Downline count */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                              subCount > 0
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {subCount} {roleConfig.childRole ? ROLE_SHORT_LABELS[roleConfig.childRole] : 'subs'}
                          </span>
                        </td>

                        {/* Admin Action Buttons (Edit & Delete) */}
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition-colors"
                                title={`Edit ${roleConfig.short}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors"
                                title={`Delete ${roleConfig.short}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin User Add/Edit Modal */}
      {isAdmin && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
          editingUser={editingUser}
          allUsers={users}
          defaultRole={roleConfig.role}
        />
      )}
    </DashboardLayout>
  );
}
