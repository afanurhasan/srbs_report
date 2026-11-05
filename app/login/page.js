'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SEED_USERS } from '@/lib/seedData';
import { ROLE_LABELS, ROLE_SHORT_LABELS, ROLES } from '@/lib/constants';
import {
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Droplets,
  Layers,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDemoList, setShowDemoList] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedUser = login(phone, pin);
      toast.success(`Welcome back, ${loggedUser.name}!`);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (user) => {
    try {
      switchDemoRole(user.id);
      toast.success(`Logged in as ${user.name} (${ROLE_SHORT_LABELS[user.role]})`);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/30 flex flex-col justify-between text-slate-800">
      {/* Centered Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
        <div className="max-w-md w-full space-y-6">
          
          {/* Company Logo Section (Centered) */}
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Logo Badge (Expanded & Unclipped) */}
            <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-md">
              <img
                src="/logo.jpeg"
                alt="SRBS Admixture and Paint Company Logo"
                className="h-28 sm:h-36 w-auto max-w-[220px] object-contain"
                onError={(e) => {
                  if (e.target.src.endsWith('/logo.jpeg')) {
                    e.target.src = '/logo.jpg';
                  } else if (e.target.src.endsWith('/logo.jpg')) {
                    e.target.src = '/logo.png';
                  } else {
                    e.target.style.display = 'none';
                    const fallback = document.getElementById('logo-emblem-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
              <div
                id="logo-emblem-fallback"
                style={{ display: 'none' }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex-col items-center justify-center text-white shadow-xl shadow-blue-500/25 ring-4 ring-white"
              >
                <div className="flex items-center justify-center mb-0.5">
                  <Droplets className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-extrabold tracking-widest uppercase">
                  SRBS
                </span>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                SRBS Admixture and Paint Company
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                Sales & Reporting System
              </p>
            </div>
          </div>

          {/* Login Card (Light Theme) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-slate-900">Sign In to Workspace</h2>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
                  />
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  6-Digit Security PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono tracking-widest transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'Verifying...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Role Switcher for Testing (Light Styled) */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Quick Demo Sign-In (1-Click)
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemoList(!showDemoList)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showDemoList ? 'Hide' : 'Show Roles'}
                </button>
              </div>

              {showDemoList && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Admin */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(SEED_USERS[0])}
                      className="p-2 rounded-xl bg-purple-50/70 border border-purple-200 hover:bg-purple-100 text-left transition-all group"
                    >
                      <div className="text-[10px] font-bold text-purple-700 uppercase">1. Admin</div>
                      <div className="text-xs text-slate-800 font-semibold truncate">Rafiqul Islam</div>
                    </button>

                    {/* NSM */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(SEED_USERS[1])}
                      className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 hover:bg-blue-100 text-left transition-all"
                    >
                      <div className="text-[10px] font-bold text-blue-700 uppercase">2. NSM</div>
                      <div className="text-xs text-slate-800 font-semibold truncate">M. Rahman</div>
                    </button>

                    {/* RSM Dhaka */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(SEED_USERS[2])}
                      className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 hover:bg-blue-100 text-left transition-all"
                    >
                      <div className="text-[10px] font-bold text-blue-700 uppercase">3. RSM</div>
                      <div className="text-xs text-slate-800 font-semibold truncate">Farhana Y.</div>
                    </button>

                    {/* ASM */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(SEED_USERS[3])}
                      className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 hover:bg-blue-100 text-left transition-all"
                    >
                      <div className="text-[10px] font-bold text-blue-700 uppercase">4. ASM</div>
                      <div className="text-xs text-slate-800 font-semibold truncate">Kamal H.</div>
                    </button>

                    {/* TSM */}
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(SEED_USERS[4])}
                      className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 hover:bg-blue-100 text-left transition-all"
                    >
                      <div className="text-[10px] font-bold text-blue-700 uppercase">5. TSM</div>
                      <div className="text-xs text-slate-800 font-semibold truncate">Nusrat J.</div>
                    </button>
                  </div>

                  {/* SE (Sales Executive - Submits Reports) */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(SEED_USERS[5])}
                    className="w-full p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 hover:bg-emerald-100/90 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                        <span>6. Sales Executive (SE)</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[9px] font-bold">
                          Submits Reports
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-semibold mt-0.5">
                        Tanvir Ahmed • Mirpur 10 Route
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 bg-white/50 backdrop-blur-sm">
        <strong className="text-slate-700 font-semibold">SRBS Admixture and Paint Company</strong> &copy; 2026 &bull; Sales & Reporting System
      </footer>
    </div>
  );
}
