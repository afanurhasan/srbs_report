'use client';

import React from 'react';
import Link from 'next/link';
import { getTodayString, formatDate, formatTaka, formatNumber, formatBDPhone } from '@/lib/utils';
import {
  FileText,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Building,
  Package,
  DollarSign,
  ArrowRight,
  Clock,
  MapPin,
  Eye,
  Edit2,
} from 'lucide-react';

export default function ExecutiveDashboard({ user, reports, supervisor }) {
  const today = getTodayString();
  const myReports = reports.filter((r) => r.userId === user.id);
  const todayReport = myReports.find((r) => r.date === today);

  // Month-to-date aggregates
  const totalVisits = myReports.reduce((acc, r) => acc + (r.totalVisit || 0), 0);
  const totalAdmixture = myReports.reduce((acc, r) => acc + (r.orderAdmixture || 0), 0);
  const totalSealer = myReports.reduce((acc, r) => acc + (r.orderSealer || 0), 0);
  const totalCollections = myReports.reduce((acc, r) => acc + (r.collectionToday || 0), 0);
  const totalDeliveriesVal = myReports.reduce((acc, r) => acc + (r.deliveryValue || 0), 0);

  // Recent 5 reports
  const recentReports = [...myReports]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Today's Submission Status Banner (Light Theme) */}
      {todayReport ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                Today&apos;s Daily Report Submitted!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Submitted for <span className="font-bold text-slate-900">{formatDate(today)}</span>{' '}
                • Route: <span className="font-bold text-slate-900">{todayReport.routeToday}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href={`/reports/${todayReport.id}`}
              className="flex-1 sm:flex-initial text-center px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              View Report
            </Link>
            <Link
              href={`/reports/${todayReport.id}/edit`}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Report</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Today&apos;s Daily Report Not Submitted Yet
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Date: <strong className="text-slate-900 font-mono font-bold">{formatDate(today)}</strong>. Please record your field visits and sales orders before end of day.
              </p>
            </div>
          </div>

          <Link
            href="/reports/new"
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-xs font-bold text-white flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Report Now</span>
          </Link>
        </div>
      )}

      {/* Overview Cards (Light Theme) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Total Visits</span>
            <Building className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalVisits}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all dealers & sites</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Admixture Orders</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono">
            {formatNumber(totalAdmixture)} <span className="text-xs text-slate-500">L</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Construction chemical orders</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Sealer Orders</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-700 font-mono">
            {formatNumber(totalSealer)} <span className="text-xs text-slate-500">L</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Sealer liquids</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Total Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {formatTaka(totalCollections)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Payment collections</p>
        </div>
      </div>

      {/* Quick Info & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Supervisor Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Reporting Supervisor
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500 font-semibold">Immediate Supervisor (SSE)</span>
              <p className="text-sm font-bold text-slate-900">
                {supervisor ? supervisor.name : 'Senior Sales Executive'}
              </p>
              {supervisor && (
                <p className="text-xs text-slate-600 font-mono font-medium">
                  {formatBDPhone(supervisor.phone)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Recent Reports List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recent Daily Reports ({myReports.length} total)
            </h3>
            <Link
              href="/reports"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs font-medium">
              No daily reports submitted yet. Click &quot;Submit Report Now&quot; to begin.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentReports.map((r) => (
                <div
                  key={r.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-900">
                        {formatDate(r.date)}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {r.totalVisit} visits
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">{r.routeToday}</p>
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
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/reports/${r.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
