'use client';

import React from 'react';
import Link from 'next/link';
import { ROLE_LABELS, ROLE_SHORT_LABELS, ROLES } from '@/lib/constants';
import { formatDate, formatTaka, formatNumber, formatBDPhone } from '@/lib/utils';
import {
  Users,
  FileText,
  Building,
  Package,
  DollarSign,
  Shield,
  ArrowRight,
  GitBranch,
  Eye,
  Edit2,
} from 'lucide-react';

export default function AdminDashboard({ user, reports, allUsers }) {
  const salesExecutives = allUsers.filter((u) => u.role === ROLES.SALES_EXECUTIVE);

  // Total sales metrics
  const totalVisits = reports.reduce((acc, r) => acc + (r.totalVisit || 0), 0);
  const totalAdmixture = reports.reduce((acc, r) => acc + (r.orderAdmixture || 0), 0);
  const totalSealer = reports.reduce((acc, r) => acc + (r.orderSealer || 0), 0);
  const totalDeliveriesVal = reports.reduce((acc, r) => acc + (r.deliveryValue || 0), 0);
  const totalCollections = reports.reduce((acc, r) => acc + (r.collectionToday || 0), 0);
  const totalDues = reports.reduce((acc, r) => acc + (r.totalDue || 0), 0);

  // Role counts
  const roleCounts = {
    [ROLES.ADMIN]: allUsers.filter((u) => u.role === ROLES.ADMIN).length,
    [ROLES.NATIONAL_SALES_MANAGER]: allUsers.filter((u) => u.role === ROLES.NATIONAL_SALES_MANAGER).length,
    [ROLES.REGIONAL_SALES_MANAGER]: allUsers.filter((u) => u.role === ROLES.REGIONAL_SALES_MANAGER).length,
    [ROLES.AREA_SALES_MANAGER]: allUsers.filter((u) => u.role === ROLES.AREA_SALES_MANAGER).length,
    [ROLES.TERRITORY_SALES_MANAGER]: allUsers.filter((u) => u.role === ROLES.TERRITORY_SALES_MANAGER).length,
    [ROLES.SENIOR_SALES_EXECUTIVE]: allUsers.filter((u) => u.role === ROLES.SENIOR_SALES_EXECUTIVE).length,
    [ROLES.SALES_EXECUTIVE]: allUsers.filter((u) => u.role === ROLES.SALES_EXECUTIVE).length,
  };

  const salesRolesList = [
    { slug: 'nsm', role: ROLES.NATIONAL_SALES_MANAGER },
    { slug: 'rsm', role: ROLES.REGIONAL_SALES_MANAGER },
    { slug: 'asm', role: ROLES.AREA_SALES_MANAGER },
    { slug: 'tsm', role: ROLES.TERRITORY_SALES_MANAGER },
    { slug: 'sse', role: ROLES.SENIOR_SALES_EXECUTIVE },
    { slug: 'se', role: ROLES.SALES_EXECUTIVE },
  ];

  const totalSalesPersonnel = allUsers.filter((u) => u.role !== ROLES.ADMIN).length;

  // Recent reports
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Global Financial & Volume KPIs (Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Company Deliveries</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-700 font-mono">
            {formatTaka(totalDeliveriesVal)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total value delivered</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Company Collections</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
            {formatTaka(totalCollections)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total payment recovered</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Admixture Volume</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-700 font-mono">
            {formatNumber(totalAdmixture)} <span className="text-xs text-slate-500">L</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Chemical orders</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Sealer Volume</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-700 font-mono">
            {formatNumber(totalSealer)} <span className="text-xs text-slate-500">L</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Sealer liquids</p>
        </div>
      </div>

      {/* Sales Team Members Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Sales Team Overview ({totalSalesPersonnel} Total Personnel)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Total active officers and sales personnel included in the system
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {salesRolesList.map(({ slug, role }) => {
            const count = roleCounts[role] || 0;

            return (
              <Link
                key={slug}
                href={`/users/${slug}`}
                className="p-4 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-center space-y-1.5 transition-all group block shadow-2xs"
              >
                <div className="text-2xl font-black text-slate-900 group-hover:text-blue-700 font-mono">
                  {count}
                </div>
                <div className="text-xs text-blue-700 font-bold truncate">
                  {ROLE_SHORT_LABELS[role]}
                </div>
                <div className="text-[10px] text-slate-500 truncate font-medium">
                  {ROLE_LABELS[role]}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Enterprise Reports (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Recent Enterprise Reports ({reports.length} total)
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {recentReports.map((r) => (
            <div
              key={r.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{r.employeeName}</span>
                  <span className="text-[11px] font-mono text-slate-500">{formatDate(r.date)}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {r.totalVisit} visits
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate mt-0.5 max-w-md font-medium">
                  Route: {r.routeToday}
                </p>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5 sm:hidden font-medium">
                  {formatNumber(r.totalOrder)}L &bull; <span className="text-emerald-700 font-bold">{formatTaka(r.collectionToday)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 font-mono">
                    {formatNumber(r.totalOrder)} L
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono font-bold">
                    {formatTaka(r.collectionToday)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/reports/${r.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>
                  <Link
                    href={`/reports/${r.id}/edit`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors border border-slate-200"
                    title="Admin Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
