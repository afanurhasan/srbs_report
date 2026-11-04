'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  getSession,
  setSession,
  clearSession,
  getUsers,
  getUserByPhone,
  initializeStorage,
} from '@/lib/storage';
import { normalizePhone, isValidBDPhone, isValidPin } from '@/lib/utils';
import { ROLES } from '@/lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize storage and hydrate session on mount
  useEffect(() => {
    initializeStorage();
    const session = getSession();
    if (session && session.user) {
      // Refresh current user data from latest storage in case profile was edited
      const allUsers = getUsers();
      const freshUser = allUsers.find((u) => u.id === session.user.id);
      if (freshUser && freshUser.status === 'ACTIVE') {
        setUser(freshUser);
        setSession(freshUser);
      } else {
        clearSession();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Standard Login with BD phone and 6-digit numeric PIN
  const login = useCallback((phone, pin) => {
    const cleanPhone = normalizePhone(phone);

    if (!isValidBDPhone(cleanPhone)) {
      throw new Error('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01711223344).');
    }

    if (!isValidPin(pin)) {
      throw new Error('PIN must be exactly 6 numeric digits.');
    }

    const matchedUser = getUserByPhone(cleanPhone);

    if (!matchedUser) {
      throw new Error('No employee account found with this phone number. Please check or contact your Admin.');
    }

    if (matchedUser.status !== 'ACTIVE') {
      throw new Error('This account has been deactivated. Please contact your System Admin.');
    }

    if (matchedUser.pin !== pin) {
      throw new Error('Incorrect 6-digit PIN. Please try again.');
    }

    setUser(matchedUser);
    setSession(matchedUser);
    return matchedUser;
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push('/login');
  }, [router]);

  // Demo 1-Click Role Switcher for instant testing
  const switchDemoRole = useCallback((roleOrUserId) => {
    const allUsers = getUsers();
    let target = allUsers.find((u) => u.id === roleOrUserId);
    if (!target) {
      target = allUsers.find((u) => u.role === roleOrUserId && u.status === 'ACTIVE');
    }

    if (!target) {
      throw new Error(`No active demo user found for role: ${roleOrUserId}`);
    }

    setUser(target);
    setSession(target);
    return target;
  }, []);

  // Refresh current user object from storage
  const refreshUser = useCallback(() => {
    if (!user) return;
    const allUsers = getUsers();
    const fresh = allUsers.find((u) => u.id === user.id);
    if (fresh) {
      setUser(fresh);
      setSession(fresh);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        switchDemoRole,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

