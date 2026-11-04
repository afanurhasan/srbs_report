'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS, ROLE_SHORT_LABELS, ROLES } from '@/lib/constants';
import {
  Droplets,
  LogOut,
  Shield,
  Menu,
} from 'lucide-react';

export default function AppHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case ROLES.SALES_EXECUTIVE:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case ROLES.SENIOR_SALES_EXECUTIVE:
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 border-b border-slate-200 backdrop-blur-md px-4 lg:px-8 h-16 flex items-center shadow-2xs lg:pl-[272px]">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Mobile Header elements (Hidden on Desktop because Sidebar has Brand) */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <img
              src="/navlogo.jpeg"
              alt="SRBS Logo"
              className="h-8 w-auto max-w-[150px] object-contain"
              onError={(e) => {
                e.target.src = '/logo.jpeg';
              }}
            />
          </div>
        </div>

        {/* Desktop Left placeholder for alignment */}
        <div className="hidden lg:block">
          <span className="text-xs font-semibold text-slate-400">
            SRBS Admixture and Paint Company &bull; Sales & Reporting System
          </span>
        </div>

        {/* Right: User identity & Logout */}
        {user && (
          <div className="flex items-center gap-3 ml-auto">
            {/* User Name */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{user.name}</div>
            </div>

            {/* Role Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getRoleBadgeStyle(
                user.role
              )}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{ROLE_SHORT_LABELS[user.role]}</span>
              <span className="hidden md:inline">({ROLE_LABELS[user.role]})</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
