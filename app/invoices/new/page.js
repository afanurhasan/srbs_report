'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import InvoiceCard from '@/components/invoices/InvoiceCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getInvoices, saveInvoice } from '@/lib/storage';
import { ROLES, INVOICE_PRODUCTS } from '@/lib/constants';
import { getTodayString } from '@/lib/utils';
import {
  FileText,
  Save,
  Printer,
  RotateCcw,
  Plus,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Package,
  Gift,
  Building,
  Eye,
} from 'lucide-react';

export default function CreateInvoicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  // Basic Info
  const [dealerCode, setDealerCode] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('65/26');
  const [date, setDate] = useState(getTodayString());
  const [copyType, setCopyType] = useState('Customer Copy');

  // Gift Info
  const [giftItem, setGiftItem] = useState('Mug');
  const [giftQty, setGiftQty] = useState('1');
  const [giftUnit, setGiftUnit] = useState('Bundle');

  // Product Entry Selection
  const [selectedProductIdx, setSelectedProductIdx] = useState('');
  const [selectedSizeIdx, setSelectedSizeIdx] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [qtyUnit, setQtyUnit] = useState(1);
  const [qtyLetter, setQtyLetter] = useState('');
  const [itemTotal, setItemTotal] = useState(0);

  // Added Items List
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'preview' (for mobile responsive switch)

  // Auto-generate invoice number based on existing count
  useEffect(() => {
    const existing = getInvoices();
    const nextSeq = 65 + existing.length;
    setInvoiceNo(`${nextSeq}/26`);
  }, []);

  // When product changes, reset size & price
  const handleProductChange = (idxStr) => {
    setSelectedProductIdx(idxStr);
    setSelectedSizeIdx('');
    setUnitPrice(0);
    setItemTotal(0);
    setQtyLetter('');
  };

  // When pack size changes, set default unit price and calculate size string
  const handleSizeChange = (sizeIdxStr) => {
    setSelectedSizeIdx(sizeIdxStr);
    if (selectedProductIdx !== '' && sizeIdxStr !== '') {
      const prod = INVOICE_PRODUCTS[Number(selectedProductIdx)];
      const sizeObj = prod.sizes[Number(sizeIdxStr)];
      const price = sizeObj.price;
      setUnitPrice(price);

      // Calculate total & qtyLetter
      const qty = parseFloat(qtyUnit) || 1;
      setItemTotal(price * qty);

      const numMatch = sizeObj.size.match(/[\d.]+/);
      const unitMatch = sizeObj.size.replace(/[\d.\s]+/, '');
      if (numMatch) {
        const totalSize = parseFloat((parseFloat(numMatch[0]) * qty).toFixed(2));
        setQtyLetter(totalSize + (unitMatch ? ' ' + unitMatch : ''));
      } else {
        setQtyLetter(`${sizeObj.size} x ${qty}`);
      }
    } else {
      setUnitPrice(0);
      setItemTotal(0);
      setQtyLetter('');
    }
  };

  // When unit price or qty unit changes manually
  const handleQtyOrPriceChange = (newQty, newPrice) => {
    const q = parseFloat(newQty) || 0;
    const p = parseFloat(newPrice) || 0;
    setQtyUnit(newQty);
    setUnitPrice(newPrice);
    setItemTotal(q * p);

    if (selectedProductIdx !== '' && selectedSizeIdx !== '') {
      const prod = INVOICE_PRODUCTS[Number(selectedProductIdx)];
      const sizeObj = prod.sizes[Number(selectedSizeIdx)];
      const numMatch = sizeObj.size.match(/[\d.]+/);
      const unitMatch = sizeObj.size.replace(/[\d.\s]+/, '');
      if (numMatch) {
        const totalSize = parseFloat((parseFloat(numMatch[0]) * q).toFixed(2));
        setQtyLetter(totalSize + (unitMatch ? ' ' + unitMatch : ''));
      } else {
        setQtyLetter(`${sizeObj.size} x ${q}`);
      }
    }
  };

  // Add Item to Invoice
  const handleAddItem = (e) => {
    e?.preventDefault();
    if (selectedProductIdx === '' || selectedSizeIdx === '') {
      toast.error('Please select both a product and a pack size.');
      return;
    }

    const prodObj = INVOICE_PRODUCTS[Number(selectedProductIdx)];
    const desc = prodObj.name;
    const category = prodObj.category;
    const pSizeStr = prodObj.sizes[Number(selectedSizeIdx)].size;
    const numPrice = parseFloat(unitPrice) || 0;
    const numQty = parseFloat(qtyUnit) || 1;

    const numMatch = pSizeStr.match(/[\d.]+/);
    const unitSizeValue = numMatch ? parseFloat(numMatch[0]) : 0;
    const unitName = pSizeStr.replace(/[\d.\s]+/, '');

    const total = numQty * numPrice;
    const calculatedSize = parseFloat((unitSizeValue * numQty).toFixed(2));
    const finalQtyLetter = calculatedSize + (unitName ? ' ' + unitName : '');

    const newItem = {
      id: Date.now(),
      desc,
      category,
      pSize: pSizeStr,
      unitPrice: numPrice,
      unitSizeValue,
      unitName,
      qtyUnit: numQty,
      qtyLetter: finalQtyLetter,
      total,
      totalLtr: calculatedSize,
    };

    setItems((prev) => [...prev, newItem]);
    toast.success(`${desc} (${pSizeStr}) added to invoice.`);

    // Reset selection inputs
    setSelectedProductIdx('');
    setSelectedSizeIdx('');
    setUnitPrice(0);
    setQtyUnit(1);
    setQtyLetter('');
    setItemTotal(0);
  };

  // Update quantity directly in the table
  const handleUpdateItemQty = (itemId, newQty) => {
    const q = parseFloat(newQty) || 0;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const total = q * item.unitPrice;
          const calculatedSize = parseFloat((item.unitSizeValue * q).toFixed(2));
          const qtyLetter =
            item.unitSizeValue > 0
              ? calculatedSize + (item.unitName ? ' ' + item.unitName : '')
              : `${item.pSize} x ${q}`;
          return {
            ...item,
            qtyUnit: q,
            total,
            totalLtr: calculatedSize,
            qtyLetter,
          };
        }
        return item;
      })
    );
  };

  // Delete item from table
  const handleDeleteItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Reset entire form
  const handleResetForm = () => {
    if (confirm('Are you sure you want to reset the form and create a new invoice?')) {
      const existing = getInvoices();
      const nextSeq = 65 + existing.length;
      setInvoiceNo(`${nextSeq}/26`);
      setDealerCode('');
      setName('');
      setMobile('');
      setAddress('');
      setDate(getTodayString());
      setCopyType('Customer Copy');
      setGiftItem('Mug');
      setGiftQty('1');
      setGiftUnit('Bundle');
      setItems([]);
      setSelectedProductIdx('');
      setSelectedSizeIdx('');
      setUnitPrice(0);
      setQtyUnit(1);
      setItemTotal(0);
      setQtyLetter('');
      toast.info('Form has been reset.');
    }
  };

  // Calculate live totals
  const { grandTotal, admixLtr, sealerLtr, zeroDampLtr } = useMemo(() => {
    let grand = 0;
    let adm = 0;
    let slr = 0;
    let zd = 0;

    items.forEach((item) => {
      grand += item.total || 0;
      if (item.category === 'admixture') adm += item.totalLtr || 0;
      else if (item.category === 'sealer') slr += item.totalLtr || 0;
      else if (item.category === 'zerodamp') zd += item.totalLtr || 0;
    });

    return {
      grandTotal: grand,
      admixLtr: adm,
      sealerLtr: slr,
      zeroDampLtr: zd,
    };
  }, [items]);

  // Live invoice object for preview
  const currentInvoiceData = {
    invoiceNo,
    date,
    dealerCode,
    customerName: name,
    name,
    mobile,
    address,
    copyType,
    giftItem,
    giftQty,
    giftUnit,
    items,
    grandTotal,
    admixLtr,
    sealerLtr,
    zeroDampLtr,
  };

  // Save invoice
  const handleSaveInvoice = () => {
    if (!name.trim()) {
      toast.error('Please enter the customer name.');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one product item to the invoice.');
      return;
    }

    setSubmitting(true);
    try {
      const saved = saveInvoice({
        invoiceNo: invoiceNo.trim() || '65/26',
        date,
        dealerCode: dealerCode.trim(),
        customerName: name.trim(),
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        copyType,
        giftItem: giftItem.trim(),
        giftQty: giftQty !== '' ? parseFloat(giftQty) : null,
        giftUnit,
        items,
        grandTotal,
        admixLtr,
        sealerLtr,
        zeroDampLtr,
      });

      toast.success(`Invoice #${saved.invoiceNo} saved successfully!`);
      router.push('/invoices');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger print
  const handlePrint = () => {
    window.print();
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
            Creating invoices is strictly restricted to System Administrators.
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
        {/* Top Header & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors"
              title="Back to Invoices"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-red-600" />
                <span>Create Sales Invoice</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                SRBS Admixture & Paint Company &bull; Official Invoicing System
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>New / Reset</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-slate-900/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSaveInvoice}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher (Form vs Live Preview) */}
        <div className="flex lg:hidden rounded-xl bg-slate-100 p-1 print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Invoice Entry Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preview' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Invoice Preview
          </button>
        </div>

        {/* Main Content Layout: Form Left/Top, Preview Right/Bottom */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form (Hidden on mobile if preview tab active) */}
          <div
            className={`xl:col-span-5 space-y-5 print:hidden ${
              activeTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* 1. Customer & Invoice Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 border-b border-slate-100 pb-2">
                <Building className="w-4 h-4" />
                <span>1. Invoice & Customer Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Dealer Code:</label>
                  <input
                    type="text"
                    value={dealerCode}
                    onChange={(e) => setDealerCode(e.target.value)}
                    placeholder="e.g. D-1042"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Invoice No:</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="65/26"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Customer Name *:</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. M/S Bismillah Hardware & Paint"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile No.:</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="01700-000000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Invoice Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Address:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop 12, Mirpur 10 Circle, Dhaka"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Copy Type:</label>
                  <select
                    value={copyType}
                    onChange={(e) => setCopyType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Customer Copy">Customer Copy</option>
                    <option value="Office Copy">Office Copy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Free Gift / Promo (Optional) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 border-b border-slate-100 pb-2">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>2. Free Gift / Promotional Item (Optional)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gift Item Name:</label>
                  <input
                    type="text"
                    value={giftItem}
                    onChange={(e) => setGiftItem(e.target.value)}
                    placeholder="e.g. Mug, T-Shirt, Cap"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantity (Qty):</label>
                  <input
                    type="number"
                    min="0"
                    value={giftQty}
                    onChange={(e) => setGiftQty(e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit:</label>
                  <select
                    value={giftUnit}
                    onChange={(e) => setGiftUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Bundle">Bundle</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Box">Box</option>
                    <option value="Set">Set</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Product Selection & Add Item */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>3. Add Product to Invoice</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Select Product:</label>
                  <select
                    value={selectedProductIdx}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Product --</option>
                    {INVOICE_PRODUCTS.map((p, idx) => (
                      <option key={p.name} value={idx}>
                        {p.name} ({p.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Pack Size (P.Size):</label>
                  <select
                    disabled={selectedProductIdx === ''}
                    value={selectedSizeIdx}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                  >
                    <option value="">-- Select Size --</option>
                    {selectedProductIdx !== '' &&
                      INVOICE_PRODUCTS[Number(selectedProductIdx)].sizes.map((s, idx) => (
                        <option key={s.size} value={idx}>
                          {s.size} &mdash; Tk {s.price}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Unit Price (Tk):</label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => handleQtyOrPriceChange(qtyUnit, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantity Units (QTY UNIT):</label>
                  <input
                    type="number"
                    min="1"
                    value={qtyUnit}
                    onChange={(e) => handleQtyOrPriceChange(e.target.value, unitPrice)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Quantity in Litres (QTY LITER):</label>
                  <input
                    type="text"
                    readOnly
                    value={qtyLetter}
                    placeholder="P.Size × QTY"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono font-semibold"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="font-bold text-blue-900">Item Total (TOTAL):</span>
                  <span className="text-base font-black font-mono text-blue-950">
                    Tk {Number(itemTotal || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to Invoice</span>
              </button>
            </div>

            {/* 4. Added Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Added Items List ({items.length})
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Grand Total: Tk {Number(grandTotal).toLocaleString()}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No items added yet. Select a product from the dropdown above to add.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="py-2 px-2 text-center">#</th>
                        <th className="py-2 px-2.5">Product</th>
                        <th className="py-2 px-2 text-center">P.Size</th>
                        <th className="py-2 px-2 text-center">Qty Unit</th>
                        <th className="py-2 px-2 text-right">Total (Tk)</th>
                        <th className="py-2 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-2.5 font-bold text-slate-900">{item.desc}</td>
                          <td className="py-2 px-2 text-center text-slate-600">{item.pSize}</td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.qtyUnit}
                              onChange={(e) => handleUpdateItemQty(item.id, e.target.value)}
                              className="w-14 px-1.5 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                            Tk {Number(item.total).toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Printable Invoice Preview */}
          <div
            className={`xl:col-span-7 space-y-4 ${
              activeTab === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center justify-between px-1 print:hidden">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Live Invoice Preview (Print Ready)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Matches official printed document
              </span>
            </div>

            {/* The Actual Invoice Card Component */}
            <div className="bg-slate-100 p-2 sm:p-5 rounded-3xl border border-slate-200 print:bg-white print:p-0 print:border-none">
              <InvoiceCard invoice={currentInvoiceData} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
