'use client';

import React, { useState, useEffect } from 'react';
import { ROLES, ROLE_LABELS, ROLE_SHORT_LABELS, REQUIRED_PARENT_ROLE } from '@/lib/constants';
import { getEligibleParents } from '@/lib/hierarchy';
import { isValidBDPhone, isValidPin, normalizePhone } from '@/lib/utils';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  editingUser = null,
  allUsers = [],
  defaultRole = null,
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('123456');
  const [role, setRole] = useState(defaultRole || ROLES.SALES_EXECUTIVE);
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  // Eligible parent users according to strict non-skipping hierarchy
  const eligibleParents = getEligibleParents(role, allUsers);
  const requiredParentRole = REQUIRED_PARENT_ROLE[role];

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '');
      setPhone(editingUser.phone || '');
      setPin(editingUser.pin || '123456');
      setRole(editingUser.role || defaultRole || ROLES.SALES_EXECUTIVE);
      setParentId(editingUser.parentId || '');
    } else {
      setName('');
      setPhone('');
      setPin('123456');
      setRole(defaultRole || ROLES.SALES_EXECUTIVE);
    }
    setError('');
  }, [editingUser, isOpen, defaultRole]);

  // When role changes, auto-select first eligible parent if current parentId is not in list
  useEffect(() => {
    if (!editingUser) {
      if (eligibleParents.length > 0) {
        setParentId(eligibleParents[0].id);
      } else {
        setParentId('');
      }
    }
  }, [role]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = normalizePhone(phone);
    if (!isValidBDPhone(cleanPhone)) {
      setError('Please enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).');
      return;
    }

    if (!isValidPin(pin)) {
      setError('PIN must be exactly 6 numeric digits.');
      return;
    }

    // Check duplicate phone with other users
    const duplicate = allUsers.find(
      (u) => normalizePhone(u.phone) === cleanPhone && u.id !== editingUser?.id
    );
    if (duplicate) {
      setError(`Phone number already registered to ${duplicate.name} (${duplicate.role}).`);
      return;
    }

    // Validate parent assignment if required
    if (requiredParentRole && !parentId) {
      setError(`Please select an immediate supervisor (${ROLE_LABELS[requiredParentRole]}).`);
      return;
    }

    const payload = {
      ...(editingUser ? { id: editingUser.id } : {}),
      name: name.trim(),
      phone: cleanPhone,
      pin,
      role,
      parentId: role === ROLES.ADMIN ? null : parentId,
      status: 'ACTIVE',
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              {editingUser ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {editingUser ? 'Edit Employee' : 'Add New Employee'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mahfuzur Rahman"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mobile & PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (01XXXXXXXXX) *
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01711223344"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                6-Digit PIN *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hierarchy Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={Boolean(defaultRole && !editingUser)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-75"
            >
              <option value={ROLES.ADMIN}>1. Admin (System Admin)</option>
              <option value={ROLES.NATIONAL_SALES_MANAGER}>2. National Sales Manager (NSM)</option>
              <option value={ROLES.REGIONAL_SALES_MANAGER}>3. Regional Sales Manager (RSM)</option>
              <option value={ROLES.AREA_SALES_MANAGER}>4. Area Sales Manager (ASM)</option>
              <option value={ROLES.TERRITORY_SALES_MANAGER}>5. Territory Sales Manager (TSM)</option>
              <option value={ROLES.SALES_EXECUTIVE}>6. Sales Executive (SE) — Submits Reports</option>
            </select>
          </div>

          {/* Strict Parent Assignment */}
          {role !== ROLES.ADMIN && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
              <label className="block text-xs font-bold text-blue-900">
                Immediate Parent Manager ({ROLE_LABELS[requiredParentRole]}) *
              </label>

              {eligibleParents.length === 0 ? (
                <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                  No {ROLE_LABELS[requiredParentRole]} found! Please create a {ROLE_LABELS[requiredParentRole]} first.
                </div>
              ) : (
                <select
                  required
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Immediate Supervisor --</option>
                  {eligibleParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name} ({ROLE_SHORT_LABELS[parent.role] || parent.role})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
