'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCw,
  Search,
  ShieldAlert,
  UserCheck,
  ExternalLink,
  MessageCircle,
  X,
} from 'lucide-react';
import { OrderRow, BlacklistRow } from '../../../types/database';

interface AggregatedCustomer {
  id: string;
  username: string;
  robloxUserId?: string | null;
  whatsapp: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  isBlacklisted: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AggregatedCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Blacklist modal prompt state
  const [targetCustomer, setTargetCustomer] = useState<AggregatedCustomer | null>(null);
  const [blacklistReason, setBlacklistReason] = useState('Indikasi Penipuan / Bukti Palsu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    try {
      const [ordersRes, blacklistRes] = await Promise.all([
        fetch('/api/admin/orders', { cache: 'no-store' }),
        fetch('/api/admin/blacklists', { cache: 'no-store' }),
      ]);

      const ordersJson = await ordersRes.json();
      const blacklistJson = await blacklistRes.json();

      const orders: OrderRow[] = ordersJson.success && Array.isArray(ordersJson.data) ? ordersJson.data : [];
      const blacklists: BlacklistRow[] = blacklistJson.success && Array.isArray(blacklistJson.data) ? blacklistJson.data : [];
      const blacklistedUsernames = new Set(blacklists.map((b) => b.roblox_username.toLowerCase().trim()));

      // Aggregate by roblox_username
      const customerMap = new Map<string, AggregatedCustomer>();

      orders.forEach((order) => {
        const username = order.roblox_username?.trim();
        if (!username) return;

        const key = username.toLowerCase();
        const orderDateStr = new Date(order.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        const pStatus = (order.payment_status || '').toLowerCase();
        const oStatus = (order.order_status || '').toLowerCase();
        const isPaid = pStatus === 'paid' || oStatus === 'completed' || pStatus === 'settlement' || pStatus === 'success';

        if (!customerMap.has(key)) {
          customerMap.set(key, {
            id: key,
            username: username,
            robloxUserId: order.roblox_user_id || null,
            whatsapp: order.customer_phone || '-',
            orderCount: 1,
            totalSpent: isPaid ? Number(order.price) : 0,
            lastOrderDate: orderDateStr,
            isBlacklisted: blacklistedUsernames.has(key),
          });
        } else {
          const existing = customerMap.get(key)!;
          existing.orderCount += 1;
          if (isPaid) {
            existing.totalSpent += Number(order.price);
          }
          if (order.customer_phone && existing.whatsapp === '-') {
            existing.whatsapp = order.customer_phone;
          }
          if (order.roblox_user_id && !existing.robloxUserId) {
            existing.robloxUserId = order.roblox_user_id;
          }
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error('Failed to load customer data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCustomerData();
  };

  const handleOpenBlacklistModal = (cust: AggregatedCustomer) => {
    setTargetCustomer(cust);
    setBlacklistReason('Indikasi Penipuan / Bukti Palsu');
  };

  const handleConfirmBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/blacklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roblox_username: targetCustomer.username,
          phone: targetCustomer.whatsapp !== '-' ? targetCustomer.whatsapp : null,
          reason: blacklistReason,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || 'Gagal menambahkan blacklist');
        return;
      }

      await fetchCustomerData();
      setSuccessToast(`@${targetCustomer.username} telah dimasukkan ke daftar Blacklist.`);
      setTargetCustomer(null);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchUsername = cust.username.toLowerCase().includes(q);
    const matchId = cust.robloxUserId?.toLowerCase().includes(q);
    const matchWa = cust.whatsapp.toLowerCase().includes(q);
    return matchUsername || matchId || matchWa;
  });

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <span>{successToast}</span>
          <Link
            href="/admin/blacklist"
            className="underline font-black text-rose-800 dark:text-rose-200 hover:text-rose-950"
          >
            Lihat Blacklist →
          </Link>
        </div>
      )}

      {/* 1. Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Daftar Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Data pembeli yang otomatis diagregasi langsung dari transaksi real Supabase
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-slate-800 hover:border-cyan-400 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
        >
          <RotateCw className={`w-4 h-4 text-cyan-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Main Customers Table / Card Container */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari username, ID Roblox, atau WhatsApp..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Menampilkan <span className="text-cyan-600 dark:text-cyan-400 font-black">{filteredCustomers.length}</span> pelanggan
          </div>
        </div>

        {/* Customers List */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 font-bold text-sm animate-pulse">
            Memuat data pelanggan dari transaksi...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-bold text-slate-500">Belum ada data pelanggan di database.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredCustomers.map((cust) => {
              const robloxUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(
                cust.username
              )}`;
              const waClean = cust.whatsapp.replace(/[^0-9]/g, '');
              const waUrl = waClean ? `https://wa.me/${waClean}` : '#';

              return (
                <div
                  key={cust.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20 rounded-2xl transition-colors"
                >
                  {/* Left: Username + Pill + Sub-details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <a
                        href={robloxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-black text-sm sm:text-base text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>@{cust.username}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>

                      {cust.isBlacklisted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
                          <ShieldAlert className="w-3 h-3" />
                          <span>BLACKLISTED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                          <UserCheck className="w-3 h-3" />
                          <span>AKTIF</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                      <span>ID: {cust.robloxUserId || '-'}</span>
                      <span>•</span>
                      {cust.whatsapp && cust.whatsapp !== '-' ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-600 dark:hover:text-cyan-400 font-mono inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-500" />
                          <span>WA: {cust.whatsapp}</span>
                        </a>
                      ) : (
                        <span>WA: -</span>
                      )}
                      <span>•</span>
                      <span>Order terakhir: {cust.lastOrderDate}</span>
                    </div>
                  </div>

                  {/* Right: Order count, Total spent & Blacklist button */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-7">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {cust.orderCount}X ORDER
                      </span>
                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {formatRupiah(cust.totalSpent)}
                      </span>
                    </div>

                    {/* Blacklist Button */}
                    {!cust.isBlacklisted ? (
                      <button
                        onClick={() => handleOpenBlacklistModal(cust)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-black transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0 shadow-2xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Blacklist</span>
                      </button>
                    ) : (
                      <Link
                        href="/admin/blacklist"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold"
                      >
                        <span>Lihat Status</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blacklist Confirmation Modal */}
      {targetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border-2 border-rose-100 dark:border-rose-900/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Blacklist Pelanggan
                </h3>
              </div>
              <button
                onClick={() => setTargetCustomer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBlacklist} className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Apakah Anda yakin ingin memblokir akun{' '}
                <strong className="text-rose-600">@{targetCustomer.username}</strong>?
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Alasan Blokir
                </label>
                <input
                  type="text"
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  placeholder="Contoh: Indikasi Bukti Palsu / Penipuan"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-rose-400 transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetCustomer(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Ya, Blacklist Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
