// Safe LocalStorage API for SalesTrack
import { STORAGE_KEYS } from './constants';
import { SEED_USERS, getSeedReports } from './seedData';
import { checkDuplicateReport } from './hierarchy';

// Check if window is defined (browser environment)
function isBrowser() {
  return typeof window !== 'undefined';
}

/**
 * Initializes storage with seed users and reports on first run
 */
export function initializeStorage(forceReset = false) {
  if (!isBrowser()) return;

  const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInit || forceReset) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(getSeedReports()));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

/**
 * Reset all data to factory demo data
 */
export function resetToDemoData() {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(getSeedReports()));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// ----------------------------------------------------
// USERS API
// ----------------------------------------------------

export function getUsers() {
  if (!isBrowser()) return SEED_USERS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      initializeStorage();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || SEED_USERS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to get users from localStorage', e);
    return SEED_USERS;
  }
}

export function getUserById(id) {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

export function getUserByPhone(phone) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const users = getUsers();
  return users.find((u) => u.phone.replace(/[\s-]/g, '') === cleanPhone) || null;
}

export function saveUser(userData) {
  if (!isBrowser()) return null;
  const users = getUsers();
  let updatedUsers;

  if (userData.id) {
    // Edit existing user
    updatedUsers = users.map((u) =>
      u.id === userData.id
        ? { ...u, ...userData, updatedAt: new Date().toISOString() }
        : u
    );
  } else {
    // Create new user
    const newId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newUser = {
      ...userData,
      id: newId,
      status: userData.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedUsers = [...users, newUser];
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  return userData.id ? userData : updatedUsers[updatedUsers.length - 1];
}

export function toggleUserStatus(userId) {
  if (!isBrowser()) return null;
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return null;

  const newStatus = target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const updatedUsers = users.map((u) =>
    u.id === userId
      ? { ...u, status: newStatus, updatedAt: new Date().toISOString() }
      : u
  );

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  return newStatus;
}

export function deleteUser(userId) {
  if (!isBrowser()) return false;
  const users = getUsers();
  const updated = users.filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
  return true;
}

// ----------------------------------------------------
// REPORTS API
// ----------------------------------------------------

export function getReports() {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!data) {
      initializeStorage();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS)) || [];
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to get reports from localStorage', e);
    return [];
  }
}

export function getReportById(id) {
  const reports = getReports();
  return reports.find((r) => r.id === id) || null;
}

/**
 * Saves a daily report (Create or Update).
 * Enforces duplicate prevention for the same employee and date.
 * If duplicate found, throws Error with existing report details.
 */
export function saveReport(reportData) {
  if (!isBrowser()) return null;
  const reports = getReports();

  // Validate duplicate report on same date for same user
  const existingDuplicate = checkDuplicateReport(
    reportData.userId,
    reportData.date,
    reports,
    reportData.id
  );

  if (existingDuplicate) {
    const err = new Error(`A daily report has already been submitted for date ${reportData.date}.`);
    err.code = 'DUPLICATE_REPORT';
    err.existingReportId = existingDuplicate.id;
    throw err;
  }

  let updatedReports;
  let savedRecord;

  if (reportData.id) {
    // Edit existing report
    savedRecord = {
      ...reportData,
      updatedAt: new Date().toISOString(),
    };
    updatedReports = reports.map((r) =>
      r.id === reportData.id ? savedRecord : r
    );
  } else {
    // Create new report
    const newId = `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    savedRecord = {
      ...reportData,
      id: newId,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedReports = [savedRecord, ...reports];
  }

  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updatedReports));
  return savedRecord;
}

export function deleteReport(reportId) {
  if (!isBrowser()) return false;
  const reports = getReports();
  const updated = reports.filter((r) => r.id !== reportId);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
  return true;
}

// ----------------------------------------------------
// SESSION API
// ----------------------------------------------------

export function getSession() {
  if (!isBrowser()) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setSession(user) {
  if (!isBrowser()) return;
  const sessionData = {
    user,
    token: `demo_token_${Date.now()}`,
    loggedInAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

