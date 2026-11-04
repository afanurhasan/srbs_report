'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Edit3 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DuplicateModal({ isOpen, onClose, existingReportId, date }) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-amber-200 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">Duplicate Report Detected</h3>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          You have already submitted a daily report for{' '}
          <strong className="text-amber-800 font-bold">{formatDate(date)}</strong>.
          Company policy only allows one daily report per sales executive per date.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            Change Date
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(`/reports/${existingReportId}/edit`);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/25 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Existing Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
