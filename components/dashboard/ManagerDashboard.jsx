'use client';

import React from 'react';
import Link from 'next/link';
import { ROLE_LABELS, ROLE_SHORT_LABELS, ROLES } from '@/lib/constants';
import { getTodayString, formatDate, formatTaka, formatNumber, formatBDPhone } from '@/lib/utils';
import {
  FileText,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Package,
  DollarSign,
  ArrowRight,
  Shield,
  Eye,
} from 'lucide-react';

export default function ManagerDashboard({ user, reports, subordinateUsers }) {
  const today = getTodayString();

  // All sales executives under this manager's hierarchy tree
  const executiveSubordinates = subordinateUsers.filter(
    (u) => u.role === ROLES.SALES_EXECUTIVE
  );

  // Subordinate reports
  const subUserIds = subordinateUsers.map((u) => u.id);
  const subordinateReports = reports.filter((r) => subUserIds.includes(r.userId));

  // Today's reports from subordinates
  const todaySubReports = subordinateReports.filter((r) => r.date === today);
  const todaySubmittedUserIds = todaySubReports.map((r) => r.userId);

  // Subordinates who submitted today vs pending
  const submittedExecutives = executiveSubordinates.filter((u) =>
    todaySubmittedUserIds.includes(u.id)
  );
  const pendingExecutives = executiveSubordinates.filter(
    (u) => !todaySubmittedUserIds.includes(u.id)
  );

  const compliancePercentage =
    executiveSubordinates.length > 0
      ? Math.round((submittedExecutives.length / executiveSubordinates.length) * 100)
      : 0;

  // Aggregate stats across subordinate reports
  const totalVisits = subordinateReports.reduce((acc, r) => acc + (r.totalVisit || 0), 0);
  const totalAdmixture = subordinateReports.reduce((acc, r) => acc + (r.orderAdmixture || 0), 0);
  const totalSealer = subordinateReports.reduce((acc, r) => acc + (r.orderSealer || 0), 0);
  const totalCollections = subordinateReports.reduce(
    (acc, r) => acc + (r.collectedAmount ?? r.collectionToday ?? 0),
    0
  );

  // Recent 5 reports
  const recentReports = [...subordinateReports]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Manager Scope Banner (Light Theme) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-50/50 border border-blue-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
              {ROLE_SHORT_LABELS[user.role]} Console
            </span>
            <span className="text-xs text-slate-500 font-medium">• Read-Only Monitoring</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {ROLE_LABELS[user.role]} Overview
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Supervising <strong className="text-blue-700 font-bold">{executiveSubordinates.length} Field Sales Executives</strong> in your reporting tree.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/25 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Browse All Team Reports</span>
          </Link>
        </div>
      </div>

      {/* Today's Reporting Compliance Tracker (Light Theme) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Today&apos;s Reporting Compliance ({formatDate(today)})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Tracking daily report submissions from your subordinate Sales Executives.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-700">
              {submittedExecutives.length} / {executiveSubordinates.length}
            </span>
            <span className="text-xs text-slate-600 ml-1.5 font-bold">Submitted ({compliancePercentage}%)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${compliancePercentage}%` }}
          ></div>
        </div>

        {/* Breakdown: Submitted vs Pending Reps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Submitted */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Submitted Today ({submittedExecutives.length})
              </span>
            </div>
            {submittedExecutives.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reports submitted today yet.</p>
            ) : (
              <div className="space-y-1.5">
                {submittedExecutives.map((exec) => {
                  const rep = todaySubReports.find((r) => r.userId === exec.id);
                  return (
                    <div
                      key={exec.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-emerald-200 text-xs shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{exec.name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          Route: {rep?.routeToday || 'Field Route'}
                        </div>
                      </div>
                      {rep && (
                        <Link
                          href={`/reports/${rep.id}`}
                          className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pending Today ({pendingExecutives.length})
              </span>
            </div>
            {pendingExecutives.length === 0 ? (
              <p className="text-xs text-emerald-700 font-bold">✓ All subordinates have submitted today!</p>
            ) : (
              <div className="space-y-1.5">
                {pendingExecutives.map((exec) => (
                  <div
                    key={exec.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-200 text-xs shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{exec.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {formatBDPhone(exec.phone)}
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-800 font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-200">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aggregate Performance Cards (Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Downline Visits</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalVisits}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total visits across all reps</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Admixture Ordered</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono">
            {formatNumber(totalAdmixture)} <span className="text-xs text-slate-500">L</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Team sales volume</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Sealer Ordered</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 font-mono">
            {formatNumber(totalSealer)} <span className="text-xs text-slate-500">L</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Team sealer volume</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Team Collections</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {formatTaka(totalCollections)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total recovered cash</p>
        </div>
      </div>

      {/* Recent Subordinate Reports Feed (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Recent Reports from Subordinates ({subordinateReports.length} total)
          </h3>
          <Link
            href="/reports"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">
            No reports received from your subordinate hierarchy yet.
          </div>
        ) : (
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

                  <Link
                    href={`/reports/${r.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
