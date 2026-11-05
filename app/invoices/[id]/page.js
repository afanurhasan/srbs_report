'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InvoiceCard from '@/components/invoices/InvoiceCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getInvoiceById, deleteInvoice } from '@/lib/storage';
import { ROLES } from '@/lib/constants';
import {
  ArrowLeft,
  Printer,
  Trash2,
  ShieldAlert,
  Loader2,
  FileText,
  PlusCircle,
} from 'lucide-react';

export default function SingleInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = getInvoiceById(id);
      setInvoice(found);
      setLoading(false);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    if (!invoice) return;
    if (confirm(`Are you sure you want to delete Invoice #${invoice.invoiceNo}?`)) {
      const ok = deleteInvoice(invoice.id);
      if (ok) {
        toast.success(`Invoice #${invoice.invoiceNo} deleted successfully.`);
        router.push('/invoices');
      } else {
        toast.error('Failed to delete invoice.');
      }
    }
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
            Viewing invoices is strictly restricted to System Administrators.
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-3" />
          <p className="text-xs font-semibold">Loading invoice...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center max-w-md mx-auto">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invoice Not Found</h2>
          <p className="text-xs text-slate-500 mb-4 font-medium">
            The requested invoice could not be found.
          </p>
          <Link
            href="/invoices"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Back to Invoices
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices List</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/invoices/new"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Create New</span>
            </Link>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-slate-900/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="bg-slate-100 p-2 sm:p-6 rounded-3xl border border-slate-200 print:bg-white print:p-0 print:border-none print:shadow-none">
          <InvoiceCard invoice={invoice} />
        </div>
      </div>
    </DashboardLayout>
  );
}

