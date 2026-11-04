'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getReports, saveReport } from '@/lib/storage';
import { checkDuplicateReport } from '@/lib/hierarchy';
import { getTodayString, formatNumber } from '@/lib/utils';
import DuplicateModal from './DuplicateModal';
import {
  Calendar,
  Save,
  AlertCircle,
  FileText,
  Calculator,
  Building,
  Truck,
  DollarSign,
  Package,
  Compass,
} from 'lucide-react';

export default function ReportForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  // Report Date (Defaults to Today)
  const [date, setDate] = useState(initialData?.date || getTodayString());

  // 1. Route Today
  const [routeToday, setRouteToday] = useState(initialData?.routeToday || '');

  // 2. Visits
  const [dealerVisit, setDealerVisit] = useState(initialData?.dealerVisit ?? '');
  const [retailVisit, setRetailVisit] = useState(initialData?.retailVisit ?? '');
  const [masonVisit, setMasonVisit] = useState(initialData?.masonVisit ?? '');
  const [painterVisit, setPainterVisit] = useState(initialData?.painterVisit ?? '');
  const [siteVisit, setSiteVisit] = useState(initialData?.siteVisit ?? '');

  // 3. Orders
  const [orderAdmixture, setOrderAdmixture] = useState(initialData?.orderAdmixture ?? '');
  const [orderSealer, setOrderSealer] = useState(initialData?.orderSealer ?? '');
  const [memoNo, setMemoNo] = useState(initialData?.memoNo ?? '');

  // 4. Deliveries
  const [deliveryAdmixture, setDeliveryAdmixture] = useState(initialData?.deliveryAdmixture ?? '');
  const [deliverySealer, setDeliverySealer] = useState(initialData?.deliverySealer ?? '');
  const [deliveryValue, setDeliveryValue] = useState(initialData?.deliveryValue ?? '');

  // 5. Financials
  const [collectionToday, setCollectionToday] = useState(initialData?.collectionToday ?? '');
  const [totalDue, setTotalDue] = useState(initialData?.totalDue ?? '');

  // 6. Stock Today
  const [stockAdmixture, setStockAdmixture] = useState(initialData?.stockAdmixture ?? '');
  const [stockSealer, setStockSealer] = useState(initialData?.stockSealer ?? '');

  // 7. Planning & Remarks
  const [tomorrowRoute, setTomorrowRoute] = useState(initialData?.tomorrowRoute || '');
  const [problemSupport, setProblemSupport] = useState(initialData?.problemSupport || '');

  // State for validation and duplicate checking
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateReportId, setDuplicateReportId] = useState(null);

  // Auto-calculated fields
  const num = (v) => {
    const parsed = parseFloat(v);
    return isNaN(parsed) ? 0 : parsed;
  };

  const totalVisit =
    num(dealerVisit) + num(retailVisit) + num(masonVisit) + num(painterVisit) + num(siteVisit);

  const totalOrder = num(orderAdmixture) + num(orderSealer);

  const totalDelivery = num(deliveryAdmixture) + num(deliverySealer);

  // Check duplicate date on date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (!isEdit && user) {
      const allReports = getReports();
      const duplicate = checkDuplicateReport(user.id, newDate, allReports);
      if (duplicate) {
        setDuplicateReportId(duplicate.id);
        setDuplicateModalOpen(true);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!routeToday.trim()) {
      setError('Please provide "Route today".');
      return;
    }

    if (!user) {
      setError('Session expired. Please log in again.');
      return;
    }

    setSubmitting(true);

    const reportPayload = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      userId: initialData?.userId || user.id,
      employeeName: initialData?.employeeName || user.name,
      employeePhone: initialData?.employeePhone || user.phone,
      employeeRole: initialData?.employeeRole || user.role,
      date,

      // 22 client fields preserved exactly:
      routeToday: routeToday.trim(),
      dealerVisit: num(dealerVisit),
      retailVisit: num(retailVisit),
      masonVisit: num(masonVisit),
      painterVisit: num(painterVisit),
      siteVisit: num(siteVisit),
      totalVisit, // auto-calculated

      orderAdmixture: num(orderAdmixture),
      orderSealer: num(orderSealer),
      totalOrder, // auto-calculated
      memoNo: num(memoNo),

      deliveryAdmixture: num(deliveryAdmixture),
      deliverySealer: num(deliverySealer),
      totalDelivery, // auto-calculated
      deliveryValue: num(deliveryValue),

      collectionToday: num(collectionToday),
      totalDue: num(totalDue),

      stockAdmixture: num(stockAdmixture),
      stockSealer: num(stockSealer),

      tomorrowRoute: tomorrowRoute.trim(),
      problemSupport: problemSupport.trim(),
    };

    try {
      const saved = saveReport(reportPayload);
      toast.success(
        isEdit
          ? `Daily report for ${date} updated successfully.`
          : `Daily report for ${date} submitted successfully.`
      );
      router.push(`/reports/${saved.id}`);
    } catch (err) {
      if (err.code === 'DUPLICATE_REPORT') {
        setDuplicateReportId(err.existingReportId);
        setDuplicateModalOpen(true);
      } else {
        setError(err.message || 'Failed to save daily report.');
        toast.error(err.message || 'Failed to save daily report.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info (Light Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            {isEdit ? 'Edit Daily Sales Report' : 'Submit Daily Sales Report'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            SRBS Admixture and Paint Company &bull; Daily Field Report (22 Client Metrics)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Reporting Executive:</span>
          <span className="text-xs font-bold text-slate-900">
            {initialData?.employeeName || user?.name}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Date & Route (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-blue-700 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>1. Report Date & Daily Route</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Report Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Only one report allowed per employee per date.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Route today *
              </label>
              <input
                type="text"
                required
                value={routeToday}
                onChange={(e) => setRouteToday(e.target.value)}
                placeholder="e.g. Mirpur 10, 11, Kazipara & Pallabi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Visits (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 uppercase tracking-wider">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>2. Field Visits Breakdown</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-lg text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>Total visit (Auto): {totalVisit}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Dealer visit</label>
              <input
                type="number"
                min="0"
                value={dealerVisit}
                onChange={(e) => setDealerVisit(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Retail visit</label>
              <input
                type="number"
                min="0"
                value={retailVisit}
                onChange={(e) => setRetailVisit(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mason visit</label>
              <input
                type="number"
                min="0"
                value={masonVisit}
                onChange={(e) => setMasonVisit(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Painter visit</label>
              <input
                type="number"
                min="0"
                value={painterVisit}
                onChange={(e) => setPainterVisit(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Site visit</label>
              <input
                type="number"
                min="0"
                value={siteVisit}
                onChange={(e) => setSiteVisit(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Orders (Litres) (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800 uppercase tracking-wider">
              <Package className="w-4 h-4 text-blue-600" />
              <span>3. Product Orders (Litres)</span>
            </div>
            <div className="bg-blue-50 border border-blue-300 px-3 py-1 rounded-lg text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-700" />
              <span>Total order (lit) (Auto): {formatNumber(totalOrder)} L</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Order Admixture (lit)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={orderAdmixture}
                onChange={(e) => setOrderAdmixture(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Order Sealer (lit)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={orderSealer}
                onChange={(e) => setOrderSealer(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Memo (no.)
              </label>
              <input
                type="number"
                min="0"
                value={memoNo}
                onChange={(e) => setMemoNo(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Deliveries (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-800 uppercase tracking-wider">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>4. Deliveries & Delivered Value</span>
            </div>
            <div className="bg-amber-50 border border-amber-300 px-3 py-1 rounded-lg text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-amber-700" />
              <span>Total delivery (lit) (Auto): {formatNumber(totalDelivery)} L</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Delivery Admixture (lit)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={deliveryAdmixture}
                onChange={(e) => setDeliveryAdmixture(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Delivery Sealer (lit)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={deliverySealer}
                onChange={(e) => setDeliverySealer(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Delivery value (Tk)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={deliveryValue}
                onChange={(e) => setDeliveryValue(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Financials & Stock Status (Light Theme) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Collection & Due */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-800 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span>5. Financial Collections & Dues</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Collection today (Tk)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={collectionToday}
                  onChange={(e) => setCollectionToday(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Total due (Tk) as of today
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={totalDue}
                  onChange={(e) => setTotalDue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Warehouse / Distributor Stock */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-teal-800 uppercase tracking-wider">
              <Package className="w-4 h-4 text-teal-600" />
              <span>6. Closing Stock Status (Litres)</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Stock Admixture (lit) today
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={stockAdmixture}
                  onChange={(e) => setStockAdmixture(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Stock Sealer (lit) today
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={stockSealer}
                  onChange={(e) => setStockSealer(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Planning & Problems (Light Theme) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-purple-800 uppercase tracking-wider">
            <Compass className="w-4 h-4 text-purple-600" />
            <span>7. Tomorrow's Plan & Problem / Support Needed</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tomorrow route / plan
              </label>
              <textarea
                rows={2}
                value={tomorrowRoute}
                onChange={(e) => setTomorrowRoute(e.target.value)}
                placeholder="e.g. Pallabi, Mirpur 12 and Section 6 dealer visits"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Problem / support needed
              </label>
              <textarea
                rows={3}
                value={problemSupport}
                onChange={(e) => setProblemSupport(e.target.value)}
                placeholder="Describe any supply shortages, credit approval requirements, competitor activities, or technical support required..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 transition-colors text-center"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto justify-center px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : isEdit ? 'Update Daily Report' : 'Submit Daily Report'}</span>
          </button>
        </div>
      </form>

      {/* Duplicate warning modal */}
      <DuplicateModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        existingReportId={duplicateReportId}
        date={date}
      />
    </div>
  );
}
