'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { resetToDemoData } from '@/lib/storage';
import { SEED_USERS } from '@/lib/seedData';
import { ROLE_LABELS, ROLE_SHORT_LABELS, ROLES } from '@/lib/constants';
import {
  Sparkles,
  Users,
  ChevronDown,
  RotateCcw,
  Check,
  Info,
  X,
} from 'lucide-react';

export default function DemoRoleSwitcher({ isCompact = false }) {
  const { user, switchDemoRole } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectRole = (userId) => {
    try {
      const switched = switchDemoRole(userId);
      toast.success(`Switched role to ${ROLE_LABELS[switched.role]} (${switched.name})`);
      setIsOpen(false);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset all users and reports back to clean demo data? Custom entries will be reset.')) {
      resetToDemoData();
      toast.info('All data has been reset to factory demo state.');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <>
      {/* Demo Notification Banner (Light Theme) */}
      <div className="bg-blue-50 border-b border-blue-200/80 text-xs py-2 px-4 text-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
              Frontend-Only Demo
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-600 font-medium">
              Mock Auth & LocalStorage (No server required)
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Switch Demo Account</span>
              <ChevronDown className="w-3 h-3 text-blue-100" />
            </button>

            <button
              onClick={handleResetData}
              title="Reset data to original demo state"
              className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Demo Switcher Modal (Light Theme) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Select Demo Role to Test</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Instantly switch between any of the 7 hierarchy roles or branches to test permissions.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Role cards */}
            <div className="overflow-y-auto py-4 space-y-4 pr-1">
              {/* Branch A: Dhaka Region */}
              <div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Branch A: Dhaka Central & North Hierarchy
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SEED_USERS.slice(0, 7).map((u) => {
                    const isCurrent = user?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectRole(u.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white text-blue-700 border border-slate-200 shadow-2xs">
                                {ROLE_SHORT_LABELS[u.role]}
                              </span>
                              <span className="font-bold text-sm text-slate-900">{u.name}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{ROLE_LABELS[u.role]}</p>
                          </div>
                          {isCurrent ? (
                            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">PIN: 123456</span>
                          )}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                          <span className="font-mono font-medium">{u.phone}</span>
                          {u.role === ROLES.SALES_EXECUTIVE ? (
                            <span className="text-emerald-700 font-bold">Submits Reports</span>
                          ) : u.role === ROLES.ADMIN ? (
                            <span className="text-purple-700 font-bold">Full Control</span>
                          ) : (
                            <span className="text-blue-700 font-medium">View Subordinates</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Branch B: Chittagong Region */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Branch B: Chittagong Division (Isolation Test)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SEED_USERS.slice(7).map((u) => {
                    const isCurrent = user?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectRole(u.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-white text-emerald-700 border border-slate-200 shadow-2xs">
                                {ROLE_SHORT_LABELS[u.role]}
                              </span>
                              <span className="font-bold text-sm text-slate-900">{u.name}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{ROLE_LABELS[u.role]}</p>
                          </div>
                          {isCurrent && (
                            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                          <span className="font-mono font-medium">{u.phone}</span>
                          {u.role === ROLES.SALES_EXECUTIVE ? (
                            <span className="text-emerald-700 font-bold">Submits Reports</span>
                          ) : (
                            <span className="text-blue-700 font-medium">View Subordinates</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" /> All accounts use PIN: <strong className="text-slate-900 font-mono font-bold">123456</strong>
              </span>
              <button
                onClick={handleResetData}
                className="text-slate-600 hover:text-amber-700 transition-colors flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset factory data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
