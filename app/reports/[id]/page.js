'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getReportById, getUsers, deleteReport } from '@/lib/storage';
import { canViewReport, canEditReport, canDeleteReport } from '@/lib/hierarchy';
import { formatDate, formatTaka, formatNumber, formatBDPhone } from '@/lib/utils';
import {
  FileText,
  MapPin,
  Building,
  Package,
  Truck,
  Compass,
  Edit,
  Trash2,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const repData = getReportById(id);
      const allUsers = getUsers();
      setReport(repData);
      setUsers(allUsers);
      setLoading(false);
    }
  }, [id]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this daily report? (Admin action)')) {
      deleteReport(id);
      toast.success('Report deleted successfully.');
      router.push('/reports');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xs font-semibold">Loading report details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">The requested daily report does not exist.</p>
          <button
            onClick={() => router.push('/reports')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
          >
            Back to Reports
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Permission check: Hierarchy branch scoping
  const hasViewPermission = canViewReport(user, report, users);

  if (!hasViewPermission) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied (Hierarchy Boundary)</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            This report belongs to <strong className="text-slate-900">{report.employeeName}</strong>, who is not in your subordinate reporting chain.
            Managers can only view reports submitted by their own direct and downline subordinates.
          </p>
          <button
            onClick={() => router.push('/reports')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Return to Accessible Reports
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isEditable = canEditReport(user, report);
  const isDeletable = canDeleteReport(user);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:p-0">
        {/* Navigation & Action Bar (Light Theme) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <button
            onClick={() => router.push('/reports')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Reports List</span>
          </button>

          <div className="flex items-center gap-2">
            {isEditable && (
              <Link
                href={`/reports/${report.id}/edit`}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-600/25 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Report</span>
              </Link>
            )}

            {isDeletable && (
              <button
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Official Report Card (Light Theme & Print Friendly) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Daily Sales Report</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {report.employeeName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Sales Executive • Mobile: {formatBDPhone(report.employeePhone)}
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-bold uppercase">
                Report Date
              </div>
              <div className="text-base font-bold text-slate-900 font-mono">
                {formatDate(report.date)}
              </div>
            </div>
          </div>

          {/* 1. Route Today */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-blue-800 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Route today
            </span>
            <p className="text-sm font-bold text-slate-900">
              {report.routeToday}
            </p>
          </div>

          {/* 2. Field Visits Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                Field Visits Summary
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                Total visit: {report.totalVisit}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">Dealer visit</div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {report.dealerVisit}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">Retail visit</div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {report.retailVisit}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">Mason visit</div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {report.masonVisit}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">Painter visit</div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {report.painterVisit}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-slate-500 text-[11px] font-medium">Site visit</div>
                <div className="text-base font-extrabold text-slate-900 mt-1">
                  {report.siteVisit}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Product Orders & Deliveries Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Orders */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  Product Orders (Litres)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600 font-medium">Order Admixture (lit):</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {formatNumber(report.orderAdmixture)} L
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600 font-medium">Order Sealer (lit):</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {formatNumber(report.orderSealer)} L
                  </span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-blue-900 bg-blue-100/70 px-2 rounded">
                  <span>Total order (lit):</span>
                  <span className="font-mono">{formatNumber(report.totalOrder)} L</span>
                </div>
              </div>
            </div>

            {/* Deliveries */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  Product Deliveries (Litres)
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {formatTaka(report.deliveryValue)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600 font-medium">Delivery Admixture (lit):</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {formatNumber(report.deliveryAdmixture)} L
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600 font-medium">Delivery Sealer (lit):</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {formatNumber(report.deliverySealer)} L
                  </span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-amber-900 bg-amber-100/70 px-2 rounded">
                  <span>Total delivery (lit):</span>
                  <span className="font-mono">{formatNumber(report.totalDelivery)} L</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Financial Collections */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold">16. Delivery value (Tk)</span>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
                {formatTaka(report.deliveryValue)}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-700 font-semibold">17. Collection From</span>
              <div className="text-sm font-extrabold text-slate-900 mt-1 truncate" title={report.collectionFrom}>
                {report.collectionFrom || 'Not specified'}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] text-emerald-700 font-semibold">18. Collected Amount (Tk)</span>
              <div className="text-base font-extrabold text-emerald-700 font-mono mt-1">
                {formatTaka(report.collectedAmount ?? report.collectionToday ?? 0)}
              </div>
            </div>
          </div>

          {/* 5. Problem Support */}
          <div className="space-y-3 pt-2">
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800 flex items-center gap-1.5 mb-1">
                Problem / support needed
              </span>
              <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                {report.problemSupport || 'No operational problems reported'}
              </p>
            </div>
          </div>

          {/* Signature Block (Print) */}
          <div className="hidden print:grid grid-cols-2 pt-12 text-xs border-t border-slate-300 text-slate-700">
            <div>
              <div className="border-t border-slate-400 w-48 mb-1"></div>
              <span>Sales Executive Signature</span>
            </div>
            <div className="text-right">
              <div className="border-t border-slate-400 w-48 ml-auto mb-1"></div>
              <span>Supervising Manager Signature</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
