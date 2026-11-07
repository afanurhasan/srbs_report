'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUsers } from '@/lib/storage';
import {
  ROLES,
  ROLE_LABELS,
  ROLE_SHORT_LABELS,
  ROLE_HIERARCHY_LEVELS,
  MANAGED_ROLES,
} from '@/lib/constants';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  X,
  ChevronRight,
  Briefcase,
  Building2,
  Compass,
  MapPin,
  Award,
  Send,
  Droplets,
  ReceiptText,
} from 'lucide-react';

export default function AppSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    setUsersList(getUsers());
  }, [pathname]);

  if (!user) return null;

  const isAdmin = user.role === ROLES.ADMIN;
  const isExecutive = user.role === ROLES.SALES_EXECUTIVE;
  const isManager = !isAdmin && !isExecutive;
  const userLevel = ROLE_HIERARCHY_LEVELS[user.role] ?? 99;

  // Icons mapping for role tiers
  const roleIcons = {
    nsm: Briefcase,
    rsm: Building2,
    asm: Compass,
    tsm: MapPin,
    se: Send,
  };

  // Color badges for roles
  const roleBadgeColors = {
    nsm: 'bg-blue-100 text-blue-800 border-blue-200',
    rsm: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    asm: 'bg-teal-100 text-teal-800 border-teal-200',
    tsm: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    se: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  // Filter which role links to display:
  // Admin sees all 6 tiers
  // Managers see tiers below their current rank
  const visibleRoleLinks = MANAGED_ROLES.filter((item) => {
    if (isAdmin) return true;
    if (isManager) return item.level > userLevel;
    return false;
  });

  // Calculate live count of employees for each role
  const getRoleUserCount = (roleValue) => {
    return usersList.filter((u) => u.role === roleValue).length;
  };

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: isExecutive ? 'My Daily Reports' : isManager ? 'Subordinate Reports' : 'All Reports',
      href: '/reports',
      icon: FileText,
      show: true,
    },
    {
      label: "Submit Today's Report",
      href: '/reports/new',
      icon: PlusCircle,
      show: isExecutive,
      highlight: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`print:hidden fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Company Brand at top of Sidebar */}
        <div className="relative px-3 border-b border-slate-200 bg-white flex items-center justify-center h-16 shrink-0">
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <img
              src="/navlogo.jpeg"
              alt="SRBS Admixture and Paint Company"
              className="h-11 sm:h-12 w-auto max-w-[215px] object-contain mx-auto"
              onError={(e) => {
                if (e.target.src.endsWith('/navlogo.jpeg')) {
                  e.target.src = '/navlogo.jpg';
                } else if (e.target.src.endsWith('/navlogo.jpg')) {
                  e.target.src = '/navlogo.png';
                } else {
                  e.target.src = '/logo.jpeg';
                }
              }}
            />
          </Link>
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Scrollable Area */}
        <div className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
          {/* Main Navigation Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overview
            </div>
            {mainNavItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      item.highlight
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/30 hover:brightness-105'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && !item.highlight && (
                      <ChevronRight className="w-4 h-4 text-white/80" />
                    )}
                  </Link>
                );
              })}
          </div>

          {/* Dedicated Role Hierarchy Management Section */}
          {visibleRoleLinks.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{isAdmin ? 'Manage By Tier' : 'Subordinate Tiers'}</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {visibleRoleLinks.length} roles
                </span>
              </div>

              {/* Individual Dedicated Role Links (NSM, RSM, ASM, TSM, SE) */}
              {visibleRoleLinks.map((roleItem) => {
                const targetHref = `/users/${roleItem.slug}`;
                const isActive = pathname === targetHref;
                const RoleIcon = roleIcons[roleItem.slug] || Users;
                const count = getRoleUserCount(roleItem.role);

                return (
                  <Link
                    key={roleItem.slug}
                    href={targetHref}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`text-[10px] font-extrabold font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : roleBadgeColors[roleItem.slug] || 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {roleItem.short}
                      </span>
                      <span className="truncate">{roleItem.label}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Invoice Management Section (Admin Only) */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Invoicing</span>
                <span className="text-[9px] font-mono bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200 font-bold">
                  Admin
                </span>
              </div>

              <Link
                href="/invoices/new"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  pathname === '/invoices/new'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-600/30'
                    : 'text-slate-700 hover:text-red-700 hover:bg-red-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      pathname === '/invoices/new'
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-700 group-hover:bg-red-200'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span>Create Invoice</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    pathname === '/invoices/new'
                      ? 'text-white'
                      : 'text-slate-400 group-hover:translate-x-0.5'
                  }`}
                />
              </Link>

              <Link
                href="/invoices"
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  pathname === '/invoices'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      pathname === '/invoices'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                    }`}
                  >
                    <ReceiptText className="w-4 h-4" />
                  </div>
                  <span>Invoices</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    pathname === '/invoices'
                      ? 'text-white'
                      : 'text-slate-400 group-hover:translate-x-0.5'
                  }`}
                />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
