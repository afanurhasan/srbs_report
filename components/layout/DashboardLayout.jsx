'use client';

import React, { useState } from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({ children, allowedRoles = null }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
        {/* Global Header */}
        <AppHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Main Body Shell */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Content Area (offset on desktop for 64px/w-64 sidebar) */}
          <main className="flex-1 lg:pl-64 flex flex-col min-w-0 bg-slate-100">
            <div className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </div>
            
            {/* Clean Light Footer */}
            <footer className="border-t border-slate-200 px-4 sm:px-6 py-3.5 text-center text-xs text-slate-500 bg-white">
              SRBS Admixture and Paint Company &bull; Sales & Reporting System
            </footer>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
