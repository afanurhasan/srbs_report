'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getUsers, saveUser } from '@/lib/storage';
import { getReportingChain, getSubordinateUsers } from '@/lib/hierarchy';
import { ROLE_LABELS, ROLE_SHORT_LABELS, ROLES } from '@/lib/constants';
import { formatBDPhone, isValidPin } from '@/lib/utils';
import {
  User,
  Shield,
  Phone,
  Key,
  MapPin,
  GitBranch,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  if (!user) return null;

  const allUsers = getUsers();
  const reportingChain = getReportingChain(user.id, allUsers);
  const subordinates = getSubordinateUsers(user.id, allUsers);
  const directSubordinates = allUsers.filter((u) => u.parentId === user.id);

  const immediateSupervisor = reportingChain[0] || null;

  const handleUpdatePin = (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (currentPin !== user.pin) {
      setPinError('Current PIN does not match.');
      return;
    }

    if (!isValidPin(newPin)) {
      setPinError('New PIN must be exactly 6 numeric digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and Confirm PIN do not match.');
      return;
    }

    try {
      saveUser({ ...user, pin: newPin });
      refreshUser();
      setPinSuccess('Security PIN updated successfully.');
      toast.success('Your security PIN has been updated.');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setPinError(err.message || 'Failed to update PIN.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <User className="w-7 h-7 text-blue-600" />
            My Profile & Reporting Line
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Personal credentials, strict hierarchy assignment, and security settings.
          </p>
        </div>

        {/* Profile Card (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-md shadow-blue-500/20">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
                <p className="text-xs text-blue-700 font-bold">{ROLE_LABELS[user.role]}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{user.designation}</p>
              </div>
            </div>
          </div>

          {/* Details Grid (Light Theme) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" /> Registered Phone
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {formatBDPhone(user.phone)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-600" /> Role Tier
              </span>
              <p className="text-sm font-bold text-slate-900">
                {ROLE_SHORT_LABELS[user.role]} ({ROLE_LABELS[user.role]})
              </p>
            </div>
          </div>
        </div>

        {/* Reporting Line (Hierarchy) (Light Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supervisor Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800 uppercase tracking-wider">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <span>Immediate Supervisor</span>
            </div>

            {immediateSupervisor ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{immediateSupervisor.name}</h4>
                    <p className="text-xs text-blue-700 font-bold">
                      {ROLE_LABELS[immediateSupervisor.role]}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">{immediateSupervisor.designation}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    {ROLE_SHORT_LABELS[immediateSupervisor.role]}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 font-mono">
                  <span>Phone: {formatBDPhone(immediateSupervisor.phone)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
                You hold the root administrative rank (<span className="text-purple-700 font-bold">Admin</span>) and report directly to executive leadership.
              </div>
            )}

            {/* Upward reporting chain breadcrumbs */}
            {reportingChain.length > 1 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Complete Upward Chain:
                </span>
                <div className="space-y-1 text-xs">
                  {reportingChain.map((mgr, idx) => (
                    <div key={mgr.id} className="text-slate-700 flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                      <span className="font-bold text-slate-900">{mgr.name}</span>
                      <span className="text-slate-500">({ROLE_SHORT_LABELS[mgr.role]})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subordinates Overview (If Manager/Admin) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Subordinates in Hierarchy</span>
            </div>

            {subordinates.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  You supervise <strong className="text-emerald-950 font-bold">{directSubordinates.length} direct employees</strong> and{' '}
                  <strong className="text-emerald-950 font-bold">{subordinates.length} total team members</strong> across your downline.
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {directSubordinates.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{sub.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{formatBDPhone(sub.phone)}</div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
                        {ROLE_SHORT_LABELS[sub.role]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
                You are a <span className="text-emerald-700 font-bold">Sales Executive (SE)</span>. Your core responsibility is field route coverage and submitting daily sales reports.
              </div>
            )}
          </div>
        </div>

        {/* Change Security PIN (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-800 uppercase tracking-wider">
            <Key className="w-4 h-4 text-amber-600" />
            <span>Update 6-Digit Numeric PIN</span>
          </div>

          <form onSubmit={handleUpdatePin} className="max-w-md space-y-4">
            {pinError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{pinError}</span>
              </div>
            )}

            {pinSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{pinSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current PIN *
              </label>
              <input
                type="password"
                required
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono tracking-widest focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New 6-Digit PIN *
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono tracking-widest focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New PIN *
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono tracking-widest focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-amber-600/25 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Update PIN</span>
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
