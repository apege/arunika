'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, CheckCircle2, AlertCircle, Search, Loader2, XCircle, ShieldCheck } from 'lucide-react';
import { ArunikaBadgeStep, ArunikaSparkle } from './ArunikaIcons';

interface RobloxProfile {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge?: boolean;
  avatarUrl?: string;
}

interface Step1AccountProps {
  username: string;
  onChangeUsername: (val: string) => void;
  onVerified: (isVerified: boolean) => void;
  isVerified: boolean;
  onUserIdChange?: (id: number | string | null) => void;
}

export default function Step1Account({
  username,
  onChangeUsername,
  onVerified,
  isVerified,
  onUserIdChange,
}: Step1AccountProps) {
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [robloxUser, setRobloxUser] = useState<RobloxProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckAccount = async () => {
    const cleanUsername = username.trim();
    if (!cleanUsername) return;

    setChecking(true);
    setErrorMessage(null);
    setRobloxUser(null);
    setHasChecked(false);

    try {
      const res = await fetch(`/api/roblox/check-username?username=${encodeURIComponent(cleanUsername)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setRobloxUser(data.data);
        setHasChecked(true);
        onVerified(true);
        onUserIdChange?.(data.data.id);
        // Sync the exact capitalized username from Roblox
        if (data.data.name && data.data.name !== cleanUsername) {
          onChangeUsername(data.data.name);
        }
      } else {
        setErrorMessage(data.message || 'Username Roblox tidak ditemukan.');
        setHasChecked(true);
        onVerified(false);
        onUserIdChange?.(null);
      }
    } catch {
      setErrorMessage('Terjadi kendala koneksi ke server Roblox. Silakan coba lagi.');
      setHasChecked(true);
      onVerified(false);
      onUserIdChange?.(null);
    } finally {
      setChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckAccount();
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/90 rounded-3xl sm:rounded-[32px] border-2 border-cyan-100/90 dark:border-cyan-500/20 shadow-sm p-6 sm:p-8 space-y-6 transition-colors duration-300">
      {/* Header Step Indicator */}
      <div className="flex items-start gap-4">
        <ArunikaBadgeStep number="1" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Masukkan Data Akun
            </h2>
            <ArunikaSparkle className="w-4 h-4" color="cyan" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Isi data username Roblox kamu untuk pengecekan avatar & pengiriman Robux otomatis
          </p>
        </div>
      </div>

      {/* Input Group */}
      <div className="space-y-3.5">
        <label className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
          <User className="w-4 h-4 text-cyan-500" />
          <span>Username Roblox</span>
        </label>

        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={username}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                onChangeUsername(e.target.value);
                setHasChecked(false);
                setRobloxUser(null);
                setErrorMessage(null);
                onVerified(false);
                onUserIdChange?.(null);
              }}
              placeholder="Contoh: ArunikaPlayer123"
              className="w-full px-4.5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-cyan-400 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-cyan-100 dark:focus:ring-cyan-950/50 text-sm sm:text-base font-bold text-slate-900 dark:text-white transition-all outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleCheckAccount}
            disabled={checking || !username.trim()}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl btn-arunika-cyan disabled:opacity-50 text-white font-black text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap"
          >
            {checking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengecek API...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Cek Akun</span>
              </>
            )}
          </button>
        </div>

        {/* Verified Account Feedback Card from Roblox API */}
        {hasChecked && isVerified && robloxUser && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-cyan-50/50 to-white dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-950 border-2 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm shadow-xs gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Avatar Headshot Thumbnail from Roblox */}
              <div className="relative w-12 h-12 rounded-2xl bg-slate-950 border-2 border-emerald-400/50 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                {robloxUser.avatarUrl ? (
                  <Image
                    src={robloxUser.avatarUrl}
                    alt={robloxUser.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-cyan-400 to-emerald-500 text-white flex items-center justify-center font-black text-base">
                    {robloxUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base truncate">
                    {robloxUser.displayName}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    (@{robloxUser.name})
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                  <span>Roblox ID: {robloxUser.id}</span>
                  <span>•</span>
                  <span>Avatar Valid & Siap Menerima Robux</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-[11px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 self-start sm:self-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Terverifikasi Roblox API</span>
            </div>
          </div>
        )}

        {/* Error Feedback if Not Found */}
        {hasChecked && !isVerified && errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-300 text-xs sm:text-sm">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-black text-rose-800 dark:text-rose-200">
                Akun Tidak Ditemukan
              </span>
              <span className="text-rose-700 dark:text-rose-300 text-xs mt-0.5">
                {errorMessage}
              </span>
            </div>
          </div>
        )}

        {/* Warning & Info Notice */}
        <div className="flex items-start gap-2.5 pt-1 text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <span>
            *Pengecekan username langsung terhubung ke server Roblox API resmi. Pastikan username sudah benar agar Robux dapat masuk 5-10 menit.
          </span>
        </div>
      </div>
    </div>
  );
}
