'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getInvoices, deleteInvoice } from '@/lib/storage';
import { ROLES } from '@/lib/constants';
import { formatTaka, formatNumber, formatDate } from '@/lib/utils';
import {
  FileText,
  PlusCircle,
  Search,
  Printer,
  Trash2,
  Eye,
  ShieldAlert,
  Calendar,
  Building,
  DollarSign,
  Package,
  Receipt,
  Download,
} from 'lucide-react';

export default function InvoicesListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copyFilter, setCopyFilter] = useState('ALL');

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Copy type filter
      if (copyFilter !== 'ALL' && inv.copyType !== copyFilter) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const numMatch = (inv.invoiceNo || '').toLowerCase().includes(q);
      const nameMatch = (inv.customerName || inv.name || '').toLowerCase().includes(q);
      const codeMatch = (inv.dealerCode || '').toLowerCase().includes(q);
      const phoneMatch = (inv.mobile || '').toLowerCase().includes(q);
      const addressMatch = (inv.address || '').toLowerCase().includes(q);

      return numMatch || nameMatch || codeMatch || phoneMatch || addressMatch;
    });
  }, [invoices, searchQuery, copyFilter]);

  // Aggregate KPIs
  const kpis = useMemo(() => {
    const totalCount = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
    const totalAdmix = invoices.reduce((sum, inv) => sum + (Number(inv.admixLtr) || 0), 0);
    const totalSealer = invoices.reduce((sum, inv) => sum + (Number(inv.sealerLtr) || 0), 0);
    const totalZeroDamp = invoices.reduce((sum, inv) => sum + (Number(inv.zeroDampLtr) || 0), 0);

    return {
      totalCount,
      totalRevenue,
      totalAdmix,
      totalSealer,
      totalZeroDamp,
    };
  }, [invoices]);

  // Delete invoice handler
  const handleDeleteInvoice = (id, invoiceNo) => {
    if (confirm(`Are you sure you want to delete Invoice #${invoiceNo}?`)) {
      const ok = deleteInvoice(id);
      if (ok) {
        setInvoices(getInvoices());
        toast.success(`Invoice #${invoiceNo} deleted successfully.`);
      } else {
        toast.error('Failed to delete invoice.');
      }
    }
  };

  // Export Invoices CSV
  const handleExportCSV = () => {
    if (invoices.length === 0) return;

    const headers = [
      'Invoice No',
      'Date',
      'Dealer Code',
      'Customer Name',
      'Mobile',
      'Address',
      'Copy Type',
      'Items Count',
      'Admixture Ltr',
      'Sealer Ltr',
      'Zero Damp Ltr',
      'Grand Total (Tk)',
    ];

    const rows = filteredInvoices.map((inv) => [
      `"${inv.invoiceNo || ''}"`,
      inv.date || '',
      `"${inv.dealerCode || ''}"`,
      `"${(inv.customerName || inv.name || '').replace(/"/g, '""')}"`,
      `"${inv.mobile || ''}"`,
      `"${(inv.address || '').replace(/"/g, '""')}"`,
      `"${inv.copyType || ''}"`,
      (inv.items || []).length,
      inv.admixLtr || 0,
      inv.sealerLtr || 0,
      inv.zeroDampLtr || 0,
      inv.grandTotal || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `srbs_invoices_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Admin access protection
  if (user && user.role !== ROLES.ADMIN) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Only</h2>
          <p className="text-xs text-slate-600 mb-6 font-medium">
            Viewing the invoices register is strictly restricted to System Administrators.
          </p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Title & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Receipt className="w-7 h-7 text-red-600" />
              <span>Sales Invoices Register</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              SRBS Admixture & Paint Company &bull; Official Billed Invoices & Print Archive
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {invoices.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
            )}

            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Invoice</span>
            </Link>
          </div>
        </div>

        {/* Global KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Total Invoices</span>
              <FileText className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {kpis.totalCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Issued billing records</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Total Invoiced (Tk)</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
              {formatTaka(kpis.totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Grand total billed value</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Admixture Volume</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono">
              {formatNumber(kpis.totalAdmix)}{' '}
              <span className="text-xs font-normal text-slate-500">L</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Chemical volume billed</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Sealer & Zero Damp</span>
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-700 font-mono">
              {formatNumber(kpis.totalSealer + kpis.totalZeroDamp)}{' '}
              <span className="text-xs font-normal text-slate-500">L</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sealer liquids billed</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice No, Customer, Mobile or Dealer..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-600">Copy Type:</span>
            <select
              value={copyFilter}
              onChange={(e) => setCopyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ALL">All Invoices ({invoices.length})</option>
              <option value="Customer Copy">Customer Copy</option>
              <option value="Office Copy">Office Copy</option>
            </select>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Invoice No & Date</th>
                  <th className="py-3 px-4">Customer / Dealer</th>
                  <th className="py-3 px-4">Address & Contact</th>
                  <th className="py-3 px-4 text-center">Items & Volume</th>
                  <th className="py-3 px-4 text-right">Grand Total (Tk)</th>
                  <th className="py-3 px-4 text-center">Copy Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600">No invoices found</p>
                        <p className="text-[11px] text-slate-400">
                          {searchQuery
                            ? 'No invoices match your search query.'
                            : 'No invoices have been created yet. Click the button above to create a new invoice.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice No & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                          #{inv.invoiceNo}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatDate(inv.date)}</span>
                        </div>
                      </td>

                      {/* Customer / Dealer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {inv.customerName || inv.name || 'Unnamed Client'}
                        </div>
                        {inv.dealerCode && (
                          <div className="text-[11px] text-blue-700 font-mono font-semibold mt-0.5">
                            Code: {inv.dealerCode}
                          </div>
                        )}
                      </td>

                      {/* Address & Contact */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-800 font-mono text-[11px] font-semibold">
                          {inv.mobile || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5" title={inv.address}>
                          {inv.address || '—'}
                        </div>
                      </td>

                      {/* Items & Volume */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {(inv.items || []).length} items
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Adm: {inv.admixLtr || 0}L &bull; Slr: {inv.sealerLtr || 0}L
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="text-sm font-black font-mono text-emerald-700">
                          {formatTaka(inv.grandTotal)}
                        </span>
                      </td>

                      {/* Copy Type */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            inv.copyType === 'Office Copy'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {inv.copyType || 'Customer Copy'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="View & Print Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

