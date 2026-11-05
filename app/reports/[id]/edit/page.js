'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReportForm from '@/components/reports/ReportForm';
import { useAuth } from '@/context/AuthContext';
import { getReportById } from '@/lib/storage';
import { canEditReport } from '@/lib/hierarchy';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function EditReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getReportById(id);
      setReport(data);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xs font-semibold">Loading report data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report Not Found</h2>
          <p className="text-xs text-slate-500 mb-4 font-medium">
            The requested daily report could not be found.
          </p>
          <button
            onClick={() => router.push('/reports')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Back to Reports
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Enforce permission: Only Admin can edit submitted reports.
  const hasEditPermission = canEditReport(user, report);

  if (!hasEditPermission) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Editing Restricted</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed font-medium">
            Submitted daily sales reports cannot be edited once submitted. Only the System Administrator has permission to edit submitted reports.
          </p>
          <button
            onClick={() => router.push(`/reports/${id}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            View Report Only
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ReportForm initialData={report} isEdit={true} />
    </DashboardLayout>
  );
}
