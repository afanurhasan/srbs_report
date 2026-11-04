'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { useAuth } from '@/context/AuthContext';
import { getReports, getUsers } from '@/lib/storage';
import { getSubordinateUsers } from '@/lib/hierarchy';
import { ROLES } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReports(getReports());
    setUsers(getUsers());
    setLoading(false);
  }, []);

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xs font-semibold">Loading dashboard insights...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Find immediate supervisor for Field Executives
  const supervisor = user.parentId
    ? users.find((u) => u.id === user.parentId)
    : null;

  // Find subordinate users for Managers
  const subordinateUsers = getSubordinateUsers(user.id, users);

  return (
    <DashboardLayout>
      {user.role === ROLES.SALES_EXECUTIVE ? (
        <ExecutiveDashboard
          user={user}
          reports={reports}
          supervisor={supervisor}
        />
      ) : user.role === ROLES.ADMIN ? (
        <AdminDashboard
          user={user}
          reports={reports}
          allUsers={users}
        />
      ) : (
        <ManagerDashboard
          user={user}
          reports={reports}
          subordinateUsers={subordinateUsers}
        />
      )}
    </DashboardLayout>
  );
}

