// Utility helpers for SalesTrack

// Validates Bangladeshi phone numbers: 01XXXXXXXXX (11 digits, starting with 013-019)
export function isValidBDPhone(phone) {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return /^01[3-9]\d{8}$/.test(cleanPhone);
}

// Normalizes phone by stripping spaces and dashes
export function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[\s-]/g, '');
}

// Formats phone number for display: 01711-223344
export function formatBDPhone(phone) {
  if (!phone) return '';
  const clean = normalizePhone(phone);
  if (clean.length === 11) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return clean;
}

// Validates 6-digit numeric PIN
export function isValidPin(pin) {
  return /^\d{6}$/.test(pin);
}

// Formats currency in Bangladeshi Taka (Tk / ৳)
export function formatTaka(amount) {
  const num = Number(amount) || 0;
  return '৳ ' + num.toLocaleString('en-IN');
}

// Formats numeric quantities (Litres, counts)
export function formatNumber(num) {
  const val = Number(num) || 0;
  return val.toLocaleString('en-IN');
}

// Today's date in YYYY-MM-DD format
export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date string (YYYY-MM-DD) to friendly format (e.g. 04 Mar 2026)
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Simple class names joiner
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

