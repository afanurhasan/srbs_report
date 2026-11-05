'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';

export default function InvoiceCard({ invoice, className = '' }) {
  if (!invoice) return null;

  const {
    invoiceNo = '65/26',
    date = new Date().toISOString(),
    dealerCode = '',
    customerName = '',
    name = customerName,
    mobile = '',
    address = '',
    copyType = 'Customer Copy',
    giftItem = '',
    giftQty = '',
    giftUnit = '',
    items = [],
    grandTotal = 0,
    admixLtr = 0,
    sealerLtr = 0,
    zeroDampLtr = 0,
  } = invoice;

  // Format date as DD/MM/YYYY or readable
  const displayDate = (() => {
    try {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return date;
    }
  })();

  // Sort items according to business rules: Admixture -> Sealer -> Zero Damp
  const categoryOrder = { admixture: 1, sealer: 2, zerodamp: 3 };
  const sortedItems = [...items].sort((a, b) => {
    if (categoryOrder[a.category] !== categoryOrder[b.category]) {
      return (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
    }
    if (a.desc !== b.desc) {
      return (a.desc || '').localeCompare(b.desc || '');
    }
    return (a.unitSizeValue || 0) - (b.unitSizeValue || 0);
  });

  // Ensure minimum 3 rows for official styling
  const minRows = Math.max(3, sortedItems.length);
  const rowsToRender = [];
  for (let i = 0; i < minRows; i++) {
    rowsToRender.push(sortedItems[i] || null);
  }

  // Row color helper
  const getRowClass = (item) => {
    if (!item) return '';
    const desc = item.desc || '';
    const cat = item.category || '';
    if (desc.includes('Duramix 111')) return 'bg-amber-100/60 border-amber-300';
    if (cat === 'admixture') return 'bg-sky-50 border-sky-200';
    if (cat === 'zerodamp') return 'bg-purple-50 border-purple-200';
    if (desc.includes('Interior Guard')) return 'bg-emerald-50 border-emerald-200';
    if (desc.includes('Weather Shade')) return 'bg-orange-50 border-orange-200';
    return 'bg-emerald-50 border-emerald-200';
  };

  const showGift = Boolean(giftItem && (giftQty !== '' && giftQty !== null && giftQty !== undefined));

  return (
    <div
      id="printable-invoice"
      className={`invoice-card-root bg-white text-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg max-w-[840px] mx-auto text-xs font-sans print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full print:rounded-none ${className}`}
      style={{
        color: '#222222',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div className="flex flex-col justify-between min-h-[780px] print:min-h-screen">
        {/* Top Header Block */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center p-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/navlogo.jpeg"
                  alt="SRBS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  SRBS Admixture & Paint Company
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5">
                  Bogura BSCIC, Bogura Sadar, Bogura-5800
                </p>
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: '#A83232' }}>
                INVOICE
              </h1>
            </div>
          </div>

          {/* Separator with tagline */}
          <div className="my-3.5 relative">
            <div className="h-[3px] w-28" style={{ backgroundColor: '#A83232' }} />
            <div className="flex items-center -mt-[2px]">
              <div className="flex-1 border-t border-slate-400" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white pl-2.5 text-slate-700 whitespace-nowrap">
                We Value Your Investment
              </span>
            </div>
          </div>

          {/* Customer Info & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 text-xs my-4">
            {/* Bill To */}
            <div className="space-y-1">
              <div className="font-extrabold text-slate-900 uppercase text-[11px] tracking-wider mb-1.5">
                Invoice to
              </div>
              <div className="grid grid-cols-[85px_12px_1fr] gap-y-1 text-slate-800 text-[11px] sm:text-xs">
                <span className="text-slate-500 font-medium">Dealer Code</span>
                <span className="font-bold">:</span>
                <span className="font-bold text-slate-900 font-mono">{dealerCode || '—'}</span>

                <span className="text-slate-500 font-medium">Name</span>
                <span className="font-bold">:</span>
                <span className="font-bold text-slate-900">{name || '—'}</span>

                <span className="text-slate-500 font-medium">Mobile No.</span>
                <span className="font-bold">:</span>
                <span className="font-semibold text-slate-800 font-mono">{mobile || '—'}</span>

                <span className="text-slate-500 font-medium">Address</span>
                <span className="font-bold">:</span>
                <span className="font-medium text-slate-700">{address || '—'}</span>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="sm:text-right space-y-1 text-[11px] sm:text-xs self-start">
              <p className="font-bold text-slate-900">
                Invoice No: <span className="font-mono text-slate-900">{invoiceNo}</span>
              </p>
              <p className="text-slate-600 font-medium">
                Date: <span className="font-mono text-slate-900 font-semibold">{displayDate}</span>
              </p>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-slate-300 bg-slate-50 text-slate-700">
                  {copyType}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="overflow-x-auto my-3 border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#A83232', color: '#ffffff' }}>
                  <th className="py-2 px-2.5 text-center font-bold text-[11px] uppercase border border-[#A83232] w-[6%]">
                    No
                  </th>
                  <th className="py-2 px-3 font-bold text-[11px] uppercase border border-[#A83232] w-[36%]">
                    DESCRIPTION
                  </th>
                  <th className="py-2 px-2.5 text-center font-bold text-[11px] uppercase border border-[#A83232] w-[14%]">
                    P.SIZE
                  </th>
                  <th className="py-2 px-2.5 text-center font-bold text-[11px] uppercase border border-[#A83232] w-[14%]">
                    QTY UNIT
                  </th>
                  <th className="py-2 px-2.5 text-center font-bold text-[11px] uppercase border border-[#A83232] w-[15%]">
                    QTY LITER
                  </th>
                  <th className="py-2 px-3 text-right font-bold text-[11px] uppercase border border-[#A83232] w-[15%]">
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowsToRender.map((item, idx) => {
                  if (item) {
                    const rowColorStyle = getRowClass(item);
                    return (
                      <tr key={item.id || idx} className={`${rowColorStyle} border-b border-slate-200 transition-colors`}>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-700 border-r border-slate-300">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-300">
                          {item.desc}
                        </td>
                        <td className="py-2 px-2.5 text-center font-semibold text-slate-700 border-r border-slate-300">
                          {item.pSize}
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-800 border-r border-slate-300">
                          {item.qtyUnit}
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono text-slate-800 border-r border-slate-300">
                          {item.qtyLetter}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {Number(item.total || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={`empty_${idx}`} className="bg-white border-b border-slate-200 h-8">
                      <td className="py-2 px-2.5 text-center font-mono text-slate-400 border-r border-slate-200">
                        {idx === 0 ? '1' : ''}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200"></td>
                      <td className="py-2 px-2.5 border-r border-slate-200"></td>
                      <td className="py-2 px-2.5 border-r border-slate-200"></td>
                      <td className="py-2 px-2.5 border-r border-slate-200"></td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">
                        {idx > 0 ? '0' : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Volume Summary & Grand Total */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mt-3">
            {/* Volume Breakdown Box */}
            <div
              className="p-2.5 sm:p-3 rounded-lg border text-xs space-y-1 font-bold min-w-[210px] w-full sm:w-auto"
              style={{
                backgroundColor: '#F9EBEB',
                borderColor: '#D98888',
              }}
            >
              <div className="text-[#1E518A] flex justify-between gap-4">
                <span>Admixture:</span>
                <span className="font-mono">{Number((admixLtr || 0).toFixed(2))} Ltr</span>
              </div>
              <div className="text-[#1e7e34] flex justify-between gap-4">
                <span>Sealer:</span>
                <span className="font-mono">{Number((sealerLtr || 0).toFixed(2))} Ltr</span>
              </div>
              <div className="text-[#7B1FA2] flex justify-between gap-4">
                <span>Zero Damp:</span>
                <span className="font-mono">{Number((zeroDampLtr || 0).toFixed(2))} Ltr</span>
              </div>
            </div>

            {/* Grand Total Box */}
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-lg text-white font-bold w-full sm:w-[320px] shadow-xs"
              style={{ backgroundColor: '#A83232' }}
            >
              <span className="text-xs uppercase tracking-wider">Grand Total :</span>
              <span className="text-base sm:text-lg font-mono font-black">
                Tk {Number(grandTotal || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Free Gift Box */}
          {showGift && (
            <div className="mt-3">
              <div
                className="inline-block px-3 py-1.5 rounded-md font-bold text-xs border border-dashed"
                style={{
                  backgroundColor: '#fff8f8',
                  borderColor: '#A83232',
                  color: '#A83232',
                }}
              >
                🎁 Free Gift: {giftItem} &mdash; {giftQty} {giftUnit}
              </div>
            </div>
          )}

          {/* Thank You Note */}
          <div className="text-xs font-bold text-slate-800 mt-4 mb-2">
            Thank you for business with us!
          </div>
        </div>

        {/* Footer & Signatures Block */}
        <div className="mt-auto pt-8">
          {/* Signatures */}
          <div className="flex justify-between items-end gap-2 px-2 text-center text-xs text-slate-800">
            <div className="w-32 sm:w-40 border-t-2 border-slate-900 pt-1 font-semibold text-[11px] sm:text-xs">
              Receiver&apos;s Signature
            </div>
            <div className="w-32 sm:w-40 border-t-2 border-slate-900 pt-1 font-semibold text-[11px] sm:text-xs">
              Checked By
            </div>
            <div className="w-32 sm:w-40 border-t-2 border-slate-900 pt-1 font-semibold text-[11px] sm:text-xs">
              Prepared By
            </div>
          </div>

          {/* Bottom Bar Container */}
          <div className="relative mt-5 pt-1">
            <div
              className="absolute top-0 left-0 h-[3px] w-28 sm:w-36"
              style={{ backgroundColor: '#A83232' }}
            />
            <div
              className="absolute top-0 right-0 h-[3px] w-28 sm:w-36"
              style={{ backgroundColor: '#A83232' }}
            />
            <div className="border-t border-slate-400 mt-[2px]" />

            <div className="flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-slate-600 font-medium pt-2 gap-2">
              <div className="flex items-center gap-1 font-mono">
                <span>🌐</span> www.srbsbd.com
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span>✉️</span> info@srbsbd.com
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span>📞</span> +8809611901356
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

