'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  Search,
  ShieldAlert,
  Plus,
  Unlock,
  X,
  ExternalLink,
} from 'lucide-react';
import { BlacklistRow } from '../../../types/database';

export default function AdminBlacklistPage() {
  const [blacklist, setBlacklist] = useState<BlacklistRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formReason, setFormReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchBlacklist = async () => {
    try {
      const res = await fetch('/api/admin/blacklists', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBlacklist(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch blacklists:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBlacklist();
  };

  const handleOpenCreateModal = () => {
    setFormUsername('');
    setFormWhatsapp('');
    setFormReason('');
    setIsModalOpen(true);
  };

  const handleSaveBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/blacklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roblox_username: formUsername.trim(),
          phone: formWhatsapp.trim() || null,
          reason: formReason.trim() || 'Indikasi Bukti Palsu / Penipuan',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || 'Gagal menambahkan ke blacklist');
        return;
      }

      await fetchBlacklist();
      setIsModalOpen(false);
      setToastMessage(`@${formUsername} berhasil ditambahkan ke daftar Blacklist.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblock = async (blacklistId: number | string, username: string) => {
    if (confirm(`Apakah Anda yakin ingin membuka blokir untuk @${username}?`)) {
      try {
        const res = await fetch(`/api/admin/blacklists?id=${blacklistId}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          alert(json.error || 'Gagal membuka blokir');
          return;
        }

        setBlacklist((prev) => prev.filter((b) => b.id !== blacklistId));
        setToastMessage(`Blokir untuk @${username} telah dibuka.`);
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Terjadi kesalahan sistem');
      }
    }
  };

  const filteredBlacklist = blacklist.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchUser = item.roblox_username.toLowerCase().includes(q);
    const matchId = String(item.id).toLowerCase().includes(q);
    const matchWa = item.phone?.toLowerCase().includes(q);
    const matchReason = item.reason?.toLowerCase().includes(q);
    return matchUser || matchId || matchWa || matchReason;
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <span>{toastMessage}</span>
          <Link
            href="/admin/customers"
            className="underline font-black text-emerald-800 dark:text-emerald-200 hover:text-emerald-950"
          >
            Lihat Daftar Pelanggan →
          </Link>
        </div>
      )}

      {/* 1. Header with 'Tambah Blacklist' and 'Refresh Data' Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Daftar Blacklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Daftar akun pelanggan yang diblokir live di database Supabase
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-rose-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Blacklist</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-slate-800 hover:border-cyan-400 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 text-cyan-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 2. Main Blacklist Table / Card Container */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-rose-100 dark:border-rose-950/50 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari akun blacklist..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-rose-400 transition-colors"
            />
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Menampilkan <span className="text-rose-600 dark:text-rose-400 font-black">{filteredBlacklist.length}</span> akun blacklist
          </div>
        </div>

        {/* Blacklist List */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 font-bold text-sm animate-pulse">
            Memuat daftar blacklist dari database...
          </div>
        ) : filteredBlacklist.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-50 dark:bg-slate-950 text-slate-400 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-500">Tidak ada akun dalam daftar blacklist.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredBlacklist.map((item) => {
              const robloxUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(
                item.roblox_username
              )}`;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 rounded-2xl transition-colors"
                >
                  {/* Left: Username + BLACKLISTED Pill + Sub-details + Reason */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <a
                        href={robloxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-black text-sm sm:text-base text-rose-600 line-through hover:underline inline-flex items-center gap-1"
                      >
                        <span>@{item.roblox_username}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                        BLACKLISTED
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                      <span>ID: {item.roblox_user_id || item.id}</span>
                      <span>•</span>
                      {item.phone && item.phone !== '-' ? (
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          WA: {item.phone}
                        </span>
                      ) : (
                        <span>WA: -</span>
                      )}
                      <span>•</span>
                      <span>Ditambahkan: {formatDate(item.created_at)}</span>
                    </div>

                    {/* Reason */}
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Alasan: <span className="font-medium">{item.reason || 'Indikasi Penipuan'}</span>
                    </div>
                  </div>

                  {/* Right: Buka Blokir button */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => handleUnblock(item.id, item.roblox_username)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-black transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Buka Blokir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Tambah Akun Ke Blacklist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border-2 border-rose-100 dark:border-rose-900/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Tambah Akun Ke Blacklist
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveBlacklist} className="space-y-4">
              {/* Field 1: Username Roblox */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Username Roblox
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="Contoh: Perusuh123"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-rose-400 transition-colors"
                  required
                />
              </div>

              {/* Field 2: Nomor WhatsApp (Opsional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp (Opsional)
                </label>
                <input
                  type="text"
                  value={formWhatsapp}
                  onChange={(e) => setFormWhatsapp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-rose-400 transition-colors"
                />
              </div>

              {/* Field 3: Alasan Blokir */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Alasan Blokir
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Contoh: Indikasi Bukti Palsu / Penipuan"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-rose-400 transition-colors"
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-black shadow-md shadow-rose-500/20 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Blacklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
