'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReportForm from '@/components/reports/ReportForm';
import { ROLES } from '@/lib/constants';

export default function NewReportPage() {
  // Only Sales Executives can submit daily reports
  return (
    <DashboardLayout allowedRoles={[ROLES.SALES_EXECUTIVE, ROLES.ADMIN]}>
      <ReportForm isEdit={false} />
    </DashboardLayout>
  );
}

