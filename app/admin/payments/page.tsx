'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  RotateCw,
  Search,
  Banknote,
  Globe,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { OrderRow } from '../../../types/database';

interface PaymentItem {
  id: string;
  orderCode: string;
  username: string;
  robloxUserId?: string | null;
  customerPhone?: string | null;
  amount: number;
  robuxNominal: string;
  method: 'WEBSITE' | 'WHATSAPP';
  paymentStatus: string;
  orderStatus: string;
  paymentProofPath?: string | null;
  isPaid: boolean;
  isPending: boolean;
  isCancelled: boolean;
  date: string;
  rawDate: string;
}

export default function AdminPaymentsPage() {
  const [mutations, setMutations] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'semua' | 'lunas' | 'pending' | 'cancelled'>('semua');
  const [methodFilter, setMethodFilter] = useState<'semua' | 'WEBSITE' | 'WHATSAPP'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: PaymentItem[] = json.data.map((o: OrderRow) => {
          const isWa =
            (o.payment_method || '').toLowerCase().includes('wa') ||
            (o.payment_method || '').toLowerCase().includes('whatsapp');

          const pStatus = (o.payment_status || '').toLowerCase();
          const oStatus = (o.order_status || '').toLowerCase();

          const isPaid =
            pStatus === 'paid' ||
            oStatus === 'completed' ||
            pStatus === 'settlement' ||
            pStatus === 'success';

          const isCancelled = oStatus === 'cancelled' || pStatus === 'failed' || pStatus === 'expire';
          const isPending = !isPaid && !isCancelled;

          const dateObj = new Date(o.created_at);
          const dateStr = !isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '-';

          return {
            id: String(o.id),
            orderCode: o.order_code || `ARK${o.id}`,
            username: o.roblox_username || 'Unknown',
            robloxUserId: o.roblox_user_id || null,
            customerPhone: o.customer_phone || null,
            amount: Number(o.price) || 0,
            robuxNominal: `${Number(o.robux || 0).toLocaleString('id-ID')} R$`,
            method: isWa ? 'WHATSAPP' : 'WEBSITE',
            paymentStatus: o.payment_status || 'pending',
            orderStatus: o.order_status || 'pending',
            paymentProofPath: o.payment_proof_path || null,
            isPaid,
            isPending,
            isCancelled,
            date: dateStr,
            rawDate: o.created_at,
          };
        });

        // Sort descending by date
        mapped.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

        setMutations(mapped);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPayments();
  };

  const formatRupiah = (val: number) => 'Rp ' + Math.round(val).toLocaleString('id-ID');

  // Stats calculation based on verified paid orders
  const paidMutations = mutations.filter((m) => m.isPaid);
  const pendingMutations = mutations.filter((m) => m.isPending);

  const totalDanaMasuk = paidMutations.reduce((acc, m) => acc + m.amount, 0);
  const totalRobuxNum = paidMutations.reduce((acc, m) => {
    const r = parseInt(m.robuxNominal.replace(/[^0-9]/g, ''), 10) || 0;
    return acc + r;
  }, 0);
  const totalRobuxTerjual = totalRobuxNum.toLocaleString('id-ID');
  const totalPaidCount = paidMutations.length;
  const aov = totalPaidCount > 0 ? Math.round(totalDanaMasuk / totalPaidCount) : 0;

  const websitePaid = paidMutations.filter((m) => m.method === 'WEBSITE');
  const websiteOmset = websitePaid.reduce((acc, m) => acc + m.amount, 0);
  const websiteCount = websitePaid.length;
  const websitePercent = totalDanaMasuk > 0 ? `${((websiteOmset / totalDanaMasuk) * 100).toFixed(1)}%` : '0%';

  const whatsappPaid = paidMutations.filter((m) => m.method === 'WHATSAPP');
  const whatsappOmset = whatsappPaid.reduce((acc, m) => acc + m.amount, 0);
  const whatsappCount = whatsappPaid.length;
  const whatsappPercent = totalDanaMasuk > 0 ? `${((whatsappOmset / totalDanaMasuk) * 100).toFixed(1)}%` : '0%';

  // Filtered list
  const filteredMutations = mutations.filter((item) => {
    // Status Filter
    if (statusFilter === 'lunas' && !item.isPaid) return false;
    if (statusFilter === 'pending' && !item.isPending) return false;
    if (statusFilter === 'cancelled' && !item.isCancelled) return false;

    // Method Filter
    if (methodFilter !== 'semua' && item.method !== methodFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.orderCode.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
      const matchUser = item.username.toLowerCase().includes(q);
      const matchRobux = item.robuxNominal.toLowerCase().includes(q);
      const matchPhone = (item.customerPhone || '').toLowerCase().includes(q);
      const matchRobloxId = (item.robloxUserId || '').toLowerCase().includes(q);
      return matchId || matchUser || matchRobux || matchPhone || matchRobloxId;
    }
    return true;
  });

  return (
    <div className="space-y-7">
      {/* 1. Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Riwayat Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Log mutasi kas masuk dan ringkasan pembayaran pesanan Robux live dari Supabase
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

      {/* 2. 3 Stat Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TOTAL DANA MASUK */}
        <div className="p-6 rounded-[28px] sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              TOTAL DANA MASUK (LUNAS)
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatRupiah(totalDanaMasuk)}
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Dari {totalPaidCount} transaksi lunas {pendingMutations.length > 0 && `(${pendingMutations.length} menunggu verifikasi)`}
            </p>
          </div>
        </div>

        {/* TOTAL ROBUX TERJUAL */}
        <div className="p-6 rounded-[28px] sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              TOTAL ROBUX TERJUAL
            </span>
            <div className="relative w-8 h-8 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-200/80 dark:border-cyan-400/30 flex items-center justify-center p-1.5 shadow-xs">
              <Image
                src="/robux.webp"
                alt="Robux"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{totalRobuxTerjual}</span>
              <span className="text-amber-500 text-lg sm:text-xl font-bold">R$</span>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Robux terkirim ke akun pelanggan
            </p>
          </div>
        </div>

        {/* RATA-RATA ORDER */}
        <div className="p-6 rounded-[28px] sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              RATA–RATA ORDER
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 uppercase">
              AOV
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatRupiah(aov)}
            </div>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              Average Order Value per transaksi
            </p>
          </div>
        </div>
      </div>

      {/* 3. OMSET PER METODE PEMBAYARAN Card */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            OMSET PER METODE PEMBAYARAN
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ringkasan total pemasukan lunas berdasarkan metode pembayaran
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card WEBSITE */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>WEBSITE</span>
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                {websitePercent}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Total Omset
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {formatRupiah(websiteOmset)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Transaksi Lunas
                </span>
                <div className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">
                  {websiteCount} transaksi
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: websitePercent }} />
            </div>
          </div>

          {/* Card WHATSAPP */}
          <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WHATSAPP</span>
              </div>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {whatsappPercent}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Total Omset
                </span>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {formatRupiah(whatsappOmset)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Transaksi Lunas
                </span>
                <div className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">
                  {whatsappCount} transaksi
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: whatsappPercent }} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Log Mutasi Pembayaran Masuk Container */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Header with Title & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Log Mutasi Pembayaran Masuk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Riwayat transaksi dan mutasi pembayaran pesanan dari website dan WhatsApp
            </p>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'semua', label: 'Semua Status', count: mutations.length },
              { key: 'lunas', label: 'Lunas', count: paidMutations.length },
              { key: 'pending', label: 'Menunggu', count: pendingMutations.length },
              { key: 'cancelled', label: 'Batal', count: mutations.filter((m) => m.isCancelled).length },
            ].map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] opacity-80">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Methods & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Method Filter */}
          <div className="flex items-center gap-2">
            {[
              { key: 'semua', label: 'Semua Metode' },
              { key: 'WEBSITE', label: 'Website' },
              { key: 'WHATSAPP', label: 'WhatsApp' },
            ].map((tab) => {
              const isActive = methodFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setMethodFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode, user, ID, robux..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Mutation Items List */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 font-bold text-sm animate-pulse">
            Memuat mutasi pembayaran...
          </div>
        ) : filteredMutations.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm font-bold text-slate-500">Tidak ada data pembayaran yang cocok.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredMutations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-4 px-3 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20 rounded-2xl transition-colors gap-3"
              >
                {/* Left: Code + Username + Status Badge + Method + Date */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                      #{item.orderCode}
                    </span>
                    <Link
                      href={`/admin/orders/${item.orderCode || item.id}`}
                      className="inline-flex items-center gap-1 font-black text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <span>@{item.username}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>

                    {item.robloxUserId && (
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        (ID: {item.robloxUserId})
                      </span>
                    )}

                    {/* Status Badge */}
                    {item.isPaid ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        LUNAS
                      </span>
                    ) : item.isCancelled ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                        <XCircle className="w-2.5 h-2.5" />
                        BATAL
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        MENUNGGU
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                    {item.method === 'WEBSITE' ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300">
                        WEBSITE
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                        WHATSAPP
                      </span>
                    )}
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Right: +Rp Amount and Robux coin + nominal & Link to Detail */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                  <span
                    className={`font-black text-sm sm:text-base ${
                      item.isPaid
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.isCancelled
                        ? 'text-rose-500 dark:text-rose-400 line-through opacity-70'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {item.isPaid ? '+' : ''}
                    {formatRupiah(item.amount)}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
                    <Image
                      src="/robux.webp"
                      alt="Robux"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                    <span>{item.robuxNominal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

