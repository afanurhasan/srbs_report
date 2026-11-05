'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getReports, getUsers } from '@/lib/storage';
import { canViewReport, canEditReport } from '@/lib/hierarchy';
import { ROLES, ROLE_LABELS, ROLE_SHORT_LABELS } from '@/lib/constants';
import { formatDate, formatTaka, formatNumber, formatBDPhone } from '@/lib/utils';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit2,
  Download,
  Building,
  Package,
  Truck,
  DollarSign,
  Users,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  UserCheck,
  Layers,
  Clock,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

const MONTH_NAMES = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const YEARS = ['2025', '2026', '2027'];

export default function ReportsListPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cascading Hierarchy Dropdown State
  const [selectedNsm, setSelectedNsm] = useState('');
  const [selectedRsm, setSelectedRsm] = useState('');
  const [selectedAsm, setSelectedAsm] = useState('');
  const [selectedTsm, setSelectedTsm] = useState('');
  const [selectedSe, setSelectedSe] = useState('');

  // Month & Year state (Default: November 2026)
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Active searched parameters (Applied when Search button is clicked)
  const [activeSearch, setActiveSearch] = useState(null);

  // Quick View Modal for day report
  const [modalReport, setModalReport] = useState(null);

  // Load storage data
  useEffect(() => {
    const loadedReports = getReports();
    const loadedUsers = getUsers();
    setReports(loadedReports);
    setUsers(loadedUsers);
    setIsLoaded(true);
  }, []);

  // Determine user role capabilities
  const isAdmin = user?.role === ROLES.ADMIN;
  const isExecutive = user?.role === ROLES.SALES_EXECUTIVE;
  const isManager = !isAdmin && !isExecutive;

  // Auto-initialize cascading selectors based on logged-in user's role and hierarchy
  useEffect(() => {
    if (!isLoaded || !user || users.length === 0) return;

    // Helper to find ancestor ID of a given role
    const getAncestorId = (userId, targetRole) => {
      let curr = users.find((u) => u.id === userId);
      while (curr && curr.parentId) {
        const parent = users.find((u) => u.id === curr.parentId);
        if (!parent) break;
        if (parent.role === targetRole) return parent.id;
        curr = parent;
      }
      return '';
    };

    let initNsm = '';
    let initRsm = '';
    let initAsm = '';
    let initTsm = '';
    let initSe = '';

    if (isAdmin) {
      const firstNsm = users.find((u) => u.role === ROLES.NATIONAL_SALES_MANAGER);
      initNsm = firstNsm ? firstNsm.id : '';

      const firstRsm = users.find(
        (u) => u.role === ROLES.REGIONAL_SALES_MANAGER && u.parentId === initNsm
      );
      initRsm = firstRsm ? firstRsm.id : '';

      const firstAsm = users.find(
        (u) => u.role === ROLES.AREA_SALES_MANAGER && u.parentId === initRsm
      );
      initAsm = firstAsm ? firstAsm.id : '';

      const firstTsm = users.find(
        (u) => u.role === ROLES.TERRITORY_SALES_MANAGER && u.parentId === initAsm
      );
      initTsm = firstTsm ? firstTsm.id : '';

      const firstSe = users.find(
        (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === initTsm
      );
      initSe = firstSe ? firstSe.id : '';
    } else if (user.role === ROLES.NATIONAL_SALES_MANAGER) {
      initNsm = user.id;
      const firstRsm = users.find(
        (u) => u.role === ROLES.REGIONAL_SALES_MANAGER && u.parentId === initNsm
      );
      initRsm = firstRsm ? firstRsm.id : '';
      const firstAsm = users.find(
        (u) => u.role === ROLES.AREA_SALES_MANAGER && u.parentId === initRsm
      );
      initAsm = firstAsm ? firstAsm.id : '';
      const firstTsm = users.find(
        (u) => u.role === ROLES.TERRITORY_SALES_MANAGER && u.parentId === initAsm
      );
      initTsm = firstTsm ? firstTsm.id : '';
      const firstSe = users.find(
        (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === initTsm
      );
      initSe = firstSe ? firstSe.id : '';
    } else if (user.role === ROLES.REGIONAL_SALES_MANAGER) {
      initNsm = user.parentId || getAncestorId(user.id, ROLES.NATIONAL_SALES_MANAGER);
      initRsm = user.id;
      const firstAsm = users.find(
        (u) => u.role === ROLES.AREA_SALES_MANAGER && u.parentId === initRsm
      );
      initAsm = firstAsm ? firstAsm.id : '';
      const firstTsm = users.find(
        (u) => u.role === ROLES.TERRITORY_SALES_MANAGER && u.parentId === initAsm
      );
      initTsm = firstTsm ? firstTsm.id : '';
      const firstSe = users.find(
        (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === initTsm
      );
      initSe = firstSe ? firstSe.id : '';
    } else if (user.role === ROLES.AREA_SALES_MANAGER) {
      initRsm = user.parentId;
      initNsm = getAncestorId(user.id, ROLES.NATIONAL_SALES_MANAGER);
      initAsm = user.id;
      const firstTsm = users.find(
        (u) => u.role === ROLES.TERRITORY_SALES_MANAGER && u.parentId === initAsm
      );
      initTsm = firstTsm ? firstTsm.id : '';
      const firstSe = users.find(
        (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === initTsm
      );
      initSe = firstSe ? firstSe.id : '';
    } else if (user.role === ROLES.TERRITORY_SALES_MANAGER) {
      initTsm = user.id;
      initAsm = user.parentId;
      initRsm = getAncestorId(user.id, ROLES.REGIONAL_SALES_MANAGER);
      initNsm = getAncestorId(user.id, ROLES.NATIONAL_SALES_MANAGER);
      const firstSe = users.find(
        (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === initTsm
      );
      initSe = firstSe ? firstSe.id : '';
    } else if (user.role === ROLES.SALES_EXECUTIVE) {
      initSe = user.id;
      initTsm = user.parentId;
      initAsm = getAncestorId(user.id, ROLES.AREA_SALES_MANAGER);
      initRsm = getAncestorId(user.id, ROLES.REGIONAL_SALES_MANAGER);
      initNsm = getAncestorId(user.id, ROLES.NATIONAL_SALES_MANAGER);
    }

    setSelectedNsm(initNsm);
    setSelectedRsm(initRsm);
    setSelectedAsm(initAsm);
    setSelectedTsm(initTsm);
    setSelectedSe(initSe);

    // Automatically execute the initial search for this default chain
    setActiveSearch({
      seId: initSe,
      month: '11',
      year: '2026',
    });
  }, [isLoaded, user, users, isAdmin]);

  // Dynamic Options for Cascading Dropdowns
  const nsmOptions = useMemo(
    () => users.filter((u) => u.role === ROLES.NATIONAL_SALES_MANAGER),
    [users]
  );

  const rsmOptions = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === ROLES.REGIONAL_SALES_MANAGER &&
          (!selectedNsm || u.parentId === selectedNsm)
      ),
    [users, selectedNsm]
  );

  const asmOptions = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === ROLES.AREA_SALES_MANAGER &&
          (!selectedRsm || u.parentId === selectedRsm)
      ),
    [users, selectedRsm]
  );

  const tsmOptions = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === ROLES.TERRITORY_SALES_MANAGER &&
          (!selectedAsm || u.parentId === selectedAsm)
      ),
    [users, selectedAsm]
  );

  const seOptions = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === ROLES.SALES_EXECUTIVE &&
          (!selectedTsm || u.parentId === selectedTsm)
      ),
    [users, selectedTsm]
  );

  // Cascading Change Handlers: when a parent changes, auto-pick its first subordinate
  const handleNsmChange = (newNsmId) => {
    setSelectedNsm(newNsmId);
    const subRsms = users.filter(
      (u) => u.role === ROLES.REGIONAL_SALES_MANAGER && u.parentId === newNsmId
    );
    const nextRsm = subRsms[0]?.id || '';
    setSelectedRsm(nextRsm);

    const subAsms = users.filter(
      (u) => u.role === ROLES.AREA_SALES_MANAGER && u.parentId === nextRsm
    );
    const nextAsm = subAsms[0]?.id || '';
    setSelectedAsm(nextAsm);

    const subTsms = users.filter(
      (u) => u.role === ROLES.TERRITORY_SALES_MANAGER && u.parentId === nextAsm
    );
    const nextTsm = subTsms[0]?.id || '';
    setSelectedTsm(nextTsm);

    const subSes = users.filter(
      (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === nextTsm
    );
    const nextSe = subSes[0]?.id || '';
    setSelectedSe(nextSe);
  };

  const handleRsmChange = (newRsmId) => {
    setSelectedRsm(newRsmId);
    const subAsms = users.filter(
      (u) => u.role === ROLES.AREA_SALES_MANAGER && u.parentId === newRsmId
    );
    const nextAsm = subAsms[0]?.id || '';
    setSelectedAsm(nextAsm);

    const subTsms = users.filter(
      (u) => u.role === ROLES.TERRITORY_SALES_MANAGER && u.parentId === nextAsm
    );
    const nextTsm = subTsms[0]?.id || '';
    setSelectedTsm(nextTsm);

    const subSes = users.filter(
      (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === nextTsm
    );
    const nextSe = subSes[0]?.id || '';
    setSelectedSe(nextSe);
  };

  const handleAsmChange = (newAsmId) => {
    setSelectedAsm(newAsmId);
    const subTsms = users.filter(
      (u) => u.role === ROLES.TERRITORY_SALES_MANAGER && u.parentId === newAsmId
    );
    const nextTsm = subTsms[0]?.id || '';
    setSelectedTsm(nextTsm);

    const subSes = users.filter(
      (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === nextTsm
    );
    const nextSe = subSes[0]?.id || '';
    setSelectedSe(nextSe);
  };

  const handleTsmChange = (newTsmId) => {
    setSelectedTsm(newTsmId);
    const subSes = users.filter(
      (u) => u.role === ROLES.SALES_EXECUTIVE && u.parentId === newTsmId
    );
    const nextSe = subSes[0]?.id || '';
    setSelectedSe(nextSe);
  };

  // Search Button Action
  const handleSearch = () => {
    setActiveSearch({
      seId: selectedSe,
      month: selectedMonth,
      year: selectedYear,
    });
  };

  // Find the selected Sales Executive object
  const targetExecutive = useMemo(() => {
    const seId = activeSearch ? activeSearch.seId : selectedSe;
    return users.find((u) => u.id === seId) || null;
  }, [users, activeSearch, selectedSe]);

  // Filter day-to-day reports for the active search
  const monthlyReports = useMemo(() => {
    if (!activeSearch || !activeSearch.seId) return [];

    const monthPrefix = `${activeSearch.year}-${String(activeSearch.month).padStart(2, '0')}`;
    return reports
      .filter((r) => r.userId === activeSearch.seId && r.date.startsWith(monthPrefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [reports, activeSearch]);

  // Grand totals for the month (Table footer summary)
  const monthlyTotals = useMemo(() => {
    if (monthlyReports.length === 0) return null;

    const dealer = monthlyReports.reduce((sum, r) => sum + (Number(r.dealerVisit) || 0), 0);
    const retail = monthlyReports.reduce((sum, r) => sum + (Number(r.retailVisit) || 0), 0);
    const mason = monthlyReports.reduce((sum, r) => sum + (Number(r.masonVisit) || 0), 0);
    const painter = monthlyReports.reduce((sum, r) => sum + (Number(r.painterVisit) || 0), 0);
    const site = monthlyReports.reduce((sum, r) => sum + (Number(r.siteVisit) || 0), 0);
    const totalVisit = monthlyReports.reduce((sum, r) => sum + (Number(r.totalVisit) || 0), 0);

    const orderAdm = monthlyReports.reduce((sum, r) => sum + (Number(r.orderAdmixture) || 0), 0);
    const orderSlr = monthlyReports.reduce((sum, r) => sum + (Number(r.orderSealer) || 0), 0);
    const totalOrder = monthlyReports.reduce((sum, r) => sum + (Number(r.totalOrder) || 0), 0);

    const delAdm = monthlyReports.reduce((sum, r) => sum + (Number(r.deliveryAdmixture) || 0), 0);
    const delSlr = monthlyReports.reduce((sum, r) => sum + (Number(r.deliverySealer) || 0), 0);
    const totalDelivery = monthlyReports.reduce((sum, r) => sum + (Number(r.totalDelivery) || 0), 0);

    const deliveryVal = monthlyReports.reduce((sum, r) => sum + (Number(r.deliveryValue) || 0), 0);
    const collected = monthlyReports.reduce(
      (sum, r) => sum + (Number(r.collectedAmount ?? r.collectionToday) || 0),
      0
    );

    return {
      daysReported: monthlyReports.length,
      dealer,
      retail,
      mason,
      painter,
      site,
      totalVisit,
      orderAdm,
      orderSlr,
      totalOrder,
      delAdm,
      delSlr,
      totalDelivery,
      deliveryVal,
      collected,
    };
  }, [monthlyReports]);

  // Export CSV for this month
  const handleExportCSV = () => {
    if (monthlyReports.length === 0) return;

    const headers = [
      'Date',
      'Route today',
      'Dealer visit',
      'Retail visit',
      'Mason visit',
      'Painter visit',
      'Site visit',
      'Total visit',
      'Order Admixture (lit)',
      'Order Sealer (lit)',
      'Total order (lit)',
      'Delivery Admixture (lit)',
      'Delivery Sealer (lit)',
      'Total delivery (lit)',
      'Delivery value (Tk)',
      'Collection From',
      'Collected Amount (Tk)',
      'Problem / support needed',
    ];

    const rows = monthlyReports.map((r) => [
      r.date,
      `"${r.routeToday || ''}"`,
      r.dealerVisit || 0,
      r.retailVisit || 0,
      r.masonVisit || 0,
      r.painterVisit || 0,
      r.siteVisit || 0,
      r.totalVisit || 0,
      r.orderAdmixture || 0,
      r.orderSealer || 0,
      r.totalOrder || 0,
      r.deliveryAdmixture || 0,
      r.deliverySealer || 0,
      r.totalDelivery || 0,
      r.deliveryValue || 0,
      `"${r.collectionFrom || ''}"`,
      r.collectedAmount ?? r.collectionToday ?? 0,
      `"${r.problemSupport || ''}"`,
    ]);

    // Summary row
    if (monthlyTotals) {
      rows.push([
        'MONTHLY TOTAL',
        `"${monthlyTotals.daysReported} Days"`,
        monthlyTotals.dealer,
        monthlyTotals.retail,
        monthlyTotals.mason,
        monthlyTotals.painter,
        monthlyTotals.site,
        monthlyTotals.totalVisit,
        monthlyTotals.orderAdm,
        monthlyTotals.orderSlr,
        monthlyTotals.totalOrder,
        monthlyTotals.delAdm,
        monthlyTotals.delSlr,
        monthlyTotals.totalDelivery,
        monthlyTotals.deliveryVal,
        '""',
        monthlyTotals.collected,
        '""',
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const executiveName = targetExecutive ? targetExecutive.name.replace(/\s+/g, '_') : 'executive';
    link.setAttribute(
      'download',
      `srbs_monthly_report_${executiveName}_${activeSearch?.year}_${activeSearch?.month}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) return null;

  const currentMonthLabel =
    MONTH_NAMES.find((m) => m.value === (activeSearch?.month || selectedMonth))?.label ||
    'Selected Month';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-blue-600" />
              <span>Sales Reports & Day-to-Day Register</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {monthlyReports.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export Month CSV</span>
              </button>
            )}

            {isExecutive && (
              <Link
                href="/reports/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Today's Report</span>
              </Link>
            )}
          </div>
        </div>

        {/* Cascading Hierarchy Selector Panel */}
        {!isExecutive && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Select Hierarchy Chain & Month
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Step-by-step drilldown (NSM &rarr; RSM &rarr; ASM &rarr; TSM &rarr; SE)
              </span>
            </div>

            {/* 5 Cascading Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* 1. NSM */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  NSM
                </label>
                <select
                  value={selectedNsm}
                  disabled={!isAdmin}
                  onChange={(e) => handleNsmChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100"
                >
                  <option value="">-- Select NSM --</option>
                  {nsmOptions.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. RSM */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  RSM
                </label>
                <select
                  value={selectedRsm}
                  disabled={!isAdmin && user.role !== ROLES.NATIONAL_SALES_MANAGER}
                  onChange={(e) => handleRsmChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100"
                >
                  <option value="">-- Select RSM --</option>
                  {rsmOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. ASM */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  ASM
                </label>
                <select
                  value={selectedAsm}
                  disabled={
                    !isAdmin &&
                    user.role !== ROLES.NATIONAL_SALES_MANAGER &&
                    user.role !== ROLES.REGIONAL_SALES_MANAGER
                  }
                  onChange={(e) => handleAsmChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100"
                >
                  <option value="">-- Select ASM --</option>
                  {asmOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. TSM */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                    4
                  </span>
                  TSM
                </label>
                <select
                  value={selectedTsm}
                  disabled={user.role === ROLES.TERRITORY_SALES_MANAGER}
                  onChange={(e) => handleTsmChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-75 disabled:bg-slate-100"
                >
                  <option value="">-- Select TSM --</option>
                  {tsmOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. SE (Sales Executive) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    5
                  </span>
                  SE (Field Force)
                </label>
                <select
                  value={selectedSe}
                  onChange={(e) => setSelectedSe(e.target.value)}
                  className="w-full px-3 py-2 bg-blue-50/50 border border-blue-300 rounded-xl text-xs font-bold text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select SE --</option>
                  {seOptions.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month, Year & Search Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!selectedSe}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Report</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sales Executive Self-View Month Filter */}
        {isExecutive && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-sm">
                SE
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {formatBDPhone(user.phone)} &bull; Sales Executive Register
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setActiveSearch({
                    seId: user.id,
                    month: e.target.value,
                    year: selectedYear,
                  });
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setActiveSearch({
                    seId: user.id,
                    month: selectedMonth,
                    year: e.target.value,
                  });
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Monthly Performance Aggregates Strip */}
        {monthlyTotals && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Days Reported
              </span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {monthlyTotals.daysReported}{' '}
                <span className="text-xs font-medium text-slate-500">days</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" /> Total Visits
              </span>
              <div className="text-lg font-black text-emerald-700 mt-1">
                {monthlyTotals.totalVisit}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" /> Total Orders
              </span>
              <div className="text-lg font-black text-blue-700 mt-1">
                {formatNumber(monthlyTotals.totalOrder)}{' '}
                <span className="text-xs font-normal text-slate-500">L</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-indigo-600" /> Delivered Litres
              </span>
              <div className="text-lg font-black text-indigo-700 mt-1">
                {formatNumber(monthlyTotals.totalDelivery)}{' '}
                <span className="text-xs font-normal text-slate-500">L</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600" /> Delivery Value (Tk)
              </span>
              <div className="text-lg font-black text-amber-900 mt-1">
                {formatTaka(monthlyTotals.deliveryVal)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Collected (Tk)
              </span>
              <div className="text-lg font-black text-emerald-800 mt-1">
                {formatTaka(monthlyTotals.collected)}
              </div>
            </div>
          </div>
        )}

        {/* Day-to-Day Table Header Banner */}
        <div className="bg-white rounded-t-2xl border-t border-l border-r border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {currentMonthLabel.slice(0, 3)}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {targetExecutive ? targetExecutive.name : 'Sales Executive'} &mdash;{' '}
                {currentMonthLabel} {activeSearch?.year || selectedYear} Day-to-Day Reports
              </h2>
              {targetExecutive && (
                <div className="text-[11px] text-slate-500 font-medium">
                  Contact: <span className="font-mono">{formatBDPhone(targetExecutive.phone)}</span> &bull; Showing all daily submissions from the 1st of the month
                </div>
              )}
            </div>
          </div>

          <div className="text-xs font-bold text-slate-600">
            {monthlyReports.length} {monthlyReports.length === 1 ? 'Day Record' : 'Days Recorded'}
          </div>
        </div>

        {/* Full Month Day-to-Day Table */}
        <div className="bg-white border border-slate-200 rounded-b-2xl overflow-hidden shadow-sm -mt-6">
          <div className="overflow-x-auto max-h-[700px] relative">
            <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[1950px]">
              <thead className="bg-slate-100/90 backdrop-blur sticky top-0 z-20 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 shadow-2xs">
                <tr>
                  {isExecutive && (
                    <th className="py-3 px-2 text-center sticky left-0 z-30 bg-slate-100 border-r border-slate-200 shadow-xs whitespace-nowrap min-w-[68px] w-[68px]">
                      Actions
                    </th>
                  )}
                  <th
                    className={`py-3 px-3.5 sticky ${
                      isExecutive ? 'left-[68px]' : 'left-0'
                    } z-30 bg-slate-100 border-r border-slate-200 shadow-xs whitespace-nowrap min-w-[105px]`}
                  >
                    1. Date
                  </th>
                  <th className="py-3 px-3.5 border-r border-slate-200 min-w-[200px]">
                    2. Route today
                  </th>
                  <th className="py-3 px-3 text-center border-r border-slate-200 min-w-[95px]">
                    3. Dealer
                  </th>
                  <th className="py-3 px-3 text-center border-r border-slate-200 min-w-[95px]">
                    4. Retail
                  </th>
                  <th className="py-3 px-3 text-center border-r border-slate-200 min-w-[95px]">
                    5. Mason
                  </th>
                  <th className="py-3 px-3 text-center border-r border-slate-200 min-w-[95px]">
                    6. Painter
                  </th>
                  <th className="py-3 px-3 text-center border-r border-slate-200 min-w-[95px]">
                    7. Site
                  </th>
                  <th className="py-3 px-3.5 text-center bg-emerald-50/80 text-emerald-800 border-r border-slate-200 min-w-[105px]">
                    8. Total visit
                  </th>
                  <th className="py-3 px-3 text-right border-r border-slate-200 min-w-[125px]">
                    9. Order Adm (L)
                  </th>
                  <th className="py-3 px-3 text-right border-r border-slate-200 min-w-[125px]">
                    10. Order Slr (L)
                  </th>
                  <th className="py-3 px-3.5 text-right bg-blue-50/80 text-blue-900 border-r border-slate-200 min-w-[130px]">
                    11. Total order (L)
                  </th>
                  <th className="py-3 px-3 text-right border-r border-slate-200 min-w-[130px]">
                    13. Deliv Adm (L)
                  </th>
                  <th className="py-3 px-3 text-right border-r border-slate-200 min-w-[130px]">
                    14. Deliv Slr (L)
                  </th>
                  <th className="py-3 px-3.5 text-right bg-indigo-50/80 text-indigo-900 border-r border-slate-200 min-w-[135px]">
                    15. Total deliv (L)
                  </th>
                  <th className="py-3 px-3.5 text-right border-r border-slate-200 min-w-[145px]">
                    16. Delivery val (Tk)
                  </th>
                  <th className="py-3 px-3.5 border-r border-slate-200 min-w-[200px]">
                    17. Collection From
                  </th>
                  <th className="py-3 px-3.5 text-right text-emerald-800 bg-emerald-50/50 border-r border-slate-200 min-w-[145px]">
                    18. Collected Amount (Tk)
                  </th>
                  <th className="py-3 px-3.5 border-r border-slate-200 min-w-[240px]">
                    Problem / support
                  </th>
                  {!isExecutive && (
                    <th className="py-3 px-3 text-center min-w-[90px]">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {monthlyReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={19}
                      className="py-16 text-center text-slate-500 bg-white"
                    >
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-800">
                        No Daily Reports Found for this Month
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        No daily entries have been submitted by{' '}
                        <strong className="text-slate-700">
                          {targetExecutive?.name || 'this Sales Executive'}
                        </strong>{' '}
                        for {currentMonthLabel} {activeSearch?.year || selectedYear}.
                      </p>
                    </td>
                  </tr>
                ) : (
                  monthlyReports.map((r, index) => {
                    const isEditable = canEditReport(user, r);

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setModalReport(r)}
                        className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                      >
                        {/* SE View & Edit Actions: On the left side of Date */}
                        {isExecutive && (
                          <td
                            className={`py-3 px-2 text-center whitespace-nowrap sticky left-0 z-10 border-r border-slate-200 shadow-2xs ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={() => setModalReport(r)}
                                title="Quick View Details"
                                className="p-1 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {isEditable && (
                                <Link
                                  href={`/reports/${r.id}/edit`}
                                  title="Edit Report"
                                  className="p-1 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </td>
                        )}

                        {/* 1. Date (Sticky Column) */}
                        <td
                          className={`py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap sticky ${
                            isExecutive ? 'left-[68px]' : 'left-0'
                          } z-10 border-r border-slate-200 shadow-2xs ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          }`}
                        >
                          {formatDate(r.date)}
                        </td>

                        {/* 2. Route today */}
                        <td className="py-3 px-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {r.routeToday}
                        </td>

                        {/* 3. Dealer visit */}
                        <td className="py-3 px-3 text-center font-mono border-r border-slate-200">
                          {r.dealerVisit || 0}
                        </td>

                        {/* 4. Retail visit */}
                        <td className="py-3 px-3 text-center font-mono border-r border-slate-200">
                          {r.retailVisit || 0}
                        </td>

                        {/* 5. Mason visit */}
                        <td className="py-3 px-3 text-center font-mono border-r border-slate-200">
                          {r.masonVisit || 0}
                        </td>

                        {/* 6. Painter visit */}
                        <td className="py-3 px-3 text-center font-mono border-r border-slate-200">
                          {r.painterVisit || 0}
                        </td>

                        {/* 7. Site visit */}
                        <td className="py-3 px-3 text-center font-mono border-r border-slate-200">
                          {r.siteVisit || 0}
                        </td>

                        {/* 8. Total visit */}
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-emerald-800 bg-emerald-50/50 border-r border-slate-200">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            {r.totalVisit || 0}
                          </span>
                        </td>

                        {/* 9. Order Admixture */}
                        <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                          {formatNumber(r.orderAdmixture || 0)}
                        </td>

                        {/* 10. Order Sealer */}
                        <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                          {formatNumber(r.orderSealer || 0)}
                        </td>

                        {/* 11. Total order */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-blue-800 bg-blue-50/40 border-r border-slate-200">
                          {formatNumber(r.totalOrder || 0)} L
                        </td>

                        {/* 13. Delivery Admixture */}
                        <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                          {formatNumber(r.deliveryAdmixture || 0)}
                        </td>

                        {/* 14. Delivery Sealer */}
                        <td className="py-3 px-3 text-right font-mono border-r border-slate-200">
                          {formatNumber(r.deliverySealer || 0)}
                        </td>

                        {/* 15. Total delivery */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-indigo-800 bg-indigo-50/40 border-r border-slate-200">
                          {formatNumber(r.totalDelivery || 0)} L
                        </td>

                        {/* 16. Delivery value (Tk) */}
                        <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-900 border-r border-slate-200">
                          {formatTaka(r.deliveryValue || 0)}
                        </td>

                        {/* 17. Collection From */}
                        <td
                          className="py-3 px-3.5 text-slate-800 border-r border-slate-200 max-w-xs truncate font-medium"
                          title={r.collectionFrom}
                        >
                          {r.collectionFrom || '-'}
                        </td>

                        {/* 18. Collected Amount (Tk) */}
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-200">
                          {formatTaka(r.collectedAmount ?? r.collectionToday ?? 0)}
                        </td>

                        {/* Problem / support needed */}
                        <td
                          className="py-3 px-3.5 text-slate-600 border-r border-slate-200 max-w-xs truncate"
                          title={r.problemSupport}
                        >
                          {r.problemSupport || '-'}
                        </td>

                        {/* Actions (for Non-SE users) */}
                        {!isExecutive && (
                          <td
                            className="py-3 px-3 text-center whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setModalReport(r)}
                                title="Quick View Details"
                                className="p-1 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {isEditable && (
                                <Link
                                  href={`/reports/${r.id}/edit`}
                                  title="Edit Report"
                                  className="p-1 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Monthly Grand Total Footer Row */}
              {monthlyTotals && (
                <tfoot className="bg-slate-200/95 sticky bottom-0 z-20 text-slate-900 text-xs font-black border-t-2 border-slate-400">
                  <tr>
                    {isExecutive && (
                      <td className="py-3 px-2 text-center sticky left-0 z-30 bg-slate-200 border-r border-slate-300 font-normal">
                        &mdash;
                      </td>
                    )}
                    <td
                      className={`py-3 px-3.5 sticky ${
                        isExecutive ? 'left-[68px]' : 'left-0'
                      } z-30 bg-slate-200 border-r border-slate-300 shadow-2xs whitespace-nowrap`}
                    >
                      MONTHLY TOTAL
                    </td>
                    <td className="py-3 px-3.5 border-r border-slate-300 font-bold text-slate-700">
                      {monthlyTotals.daysReported} Days Active
                    </td>
                    <td className="py-3 px-3 text-center font-mono border-r border-slate-300">
                      {monthlyTotals.dealer}
                    </td>
                    <td className="py-3 px-3 text-center font-mono border-r border-slate-300">
                      {monthlyTotals.retail}
                    </td>
                    <td className="py-3 px-3 text-center font-mono border-r border-slate-300">
                      {monthlyTotals.mason}
                    </td>
                    <td className="py-3 px-3 text-center font-mono border-r border-slate-300">
                      {monthlyTotals.painter}
                    </td>
                    <td className="py-3 px-3 text-center font-mono border-r border-slate-300">
                      {monthlyTotals.site}
                    </td>
                    <td className="py-3 px-3.5 text-center font-mono text-emerald-900 bg-emerald-100/80 border-r border-slate-300">
                      {monthlyTotals.totalVisit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono border-r border-slate-300">
                      {formatNumber(monthlyTotals.orderAdm)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono border-r border-slate-300">
                      {formatNumber(monthlyTotals.orderSlr)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-blue-900 bg-blue-100/80 border-r border-slate-300">
                      {formatNumber(monthlyTotals.totalOrder)} L
                    </td>
                    <td className="py-3 px-3 text-right font-mono border-r border-slate-300">
                      {formatNumber(monthlyTotals.delAdm)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono border-r border-slate-300">
                      {formatNumber(monthlyTotals.delSlr)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-indigo-900 bg-indigo-100/80 border-r border-slate-300">
                      {formatNumber(monthlyTotals.totalDelivery)} L
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono border-r border-slate-300">
                      {formatTaka(monthlyTotals.deliveryVal)}
                    </td>
                    <td className="py-3 px-3.5 text-center text-slate-500 border-r border-slate-300 font-normal">
                      &mdash;
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono text-emerald-900 bg-emerald-100/80 border-r border-slate-300">
                      {formatTaka(monthlyTotals.collected)}
                    </td>
                    <td className="py-3 px-3.5 text-center text-slate-500 border-r border-slate-300 font-normal">
                      &mdash;
                    </td>
                    {!isExecutive && (
                      <td className="py-3 px-3 text-center text-slate-500 font-normal">&mdash;</td>
                    )}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Modal: Quick Day-to-Day Report Detail Inspection */}
        {modalReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                      {formatDate(modalReport.date)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Daily Report Detail</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Route: {modalReport.routeToday}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Employee: <strong className="text-slate-800">{modalReport.employeeName}</strong> &bull; {formatBDPhone(modalReport.employeePhone)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalReport(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Visited breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Visits Breakdown (Total: {modalReport.totalVisit})
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Dealer</span>
                    <span className="font-bold text-slate-900 text-sm">{modalReport.dealerVisit || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Retail</span>
                    <span className="font-bold text-slate-900 text-sm">{modalReport.retailVisit || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Mason</span>
                    <span className="font-bold text-slate-900 text-sm">{modalReport.masonVisit || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Painter</span>
                    <span className="font-bold text-slate-900 text-sm">{modalReport.painterVisit || 0}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Site</span>
                    <span className="font-bold text-slate-900 text-sm">{modalReport.siteVisit || 0}</span>
                  </div>
                </div>
              </div>

              {/* Orders & Deliveries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1.5 text-xs">
                  <span className="font-bold text-blue-900 block">Orders</span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Order Admixture:</span>
                    <span className="font-mono font-bold text-slate-900">{formatNumber(modalReport.orderAdmixture)} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Order Sealer:</span>
                    <span className="font-mono font-bold text-slate-900">{formatNumber(modalReport.orderSealer)} L</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1">
                    <span className="font-bold text-blue-900">Total Order:</span>
                    <span className="font-mono font-black text-blue-900">{formatNumber(modalReport.totalOrder)} L</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1.5 text-xs">
                  <span className="font-bold text-indigo-900 block">Deliveries & Value</span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery Admixture:</span>
                    <span className="font-mono font-bold text-slate-900">{formatNumber(modalReport.deliveryAdmixture)} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery Sealer:</span>
                    <span className="font-mono font-bold text-slate-900">{formatNumber(modalReport.deliverySealer)} L</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200 pt-1">
                    <span className="font-bold text-indigo-900">Total Delivery:</span>
                    <span className="font-mono font-black text-indigo-900">{formatNumber(modalReport.totalDelivery)} L</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="font-bold text-slate-700">Delivery Value:</span>
                    <span className="font-mono font-black text-amber-800">{formatTaka(modalReport.deliveryValue)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Collections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-semibold">17. Collection From</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{modalReport.collectionFrom || 'Not specified'}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 block text-[11px] font-semibold">18. Collected Amount</span>
                  <span className="font-mono font-black text-emerald-800 text-base mt-0.5 block">
                    {formatTaka(modalReport.collectedAmount ?? modalReport.collectionToday ?? 0)}
                  </span>
                </div>
              </div>

              {/* Comments / Problem Support */}
              <div className="pt-1">
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                    Problem / Support Needed
                  </span>
                  <p className="text-xs text-slate-800 font-medium">
                    {modalReport.problemSupport || 'None reported.'}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Link
                  href={`/reports/${modalReport.id}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Open Full Screen Report</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  {canEditReport(user, modalReport) && (
                    <Link
                      href={`/reports/${modalReport.id}/edit`}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Edit Report
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalReport(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
