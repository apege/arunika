'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Inbox,
  Clock,
  CheckCircle2,
  CreditCard,
  Zap,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import RobloxActivationCard from './components/RobloxActivationCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOmset: 0,
    countMasuk: 0,
    countDiproses: 0,
    countSelesai: 0,
    totalOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/orders?limit=5'),
        ]);

        const statsJson = await statsRes.json();
        const ordersJson = await ordersRes.json();

        if (statsJson.success && statsJson.data) {
          setStats(statsJson.data);
        }

        if (ordersJson.success && Array.isArray(ordersJson.data)) {
          setRecentOrders(ordersJson.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
    window.addEventListener('order_updated', loadDashboardData);
    const interval = setInterval(loadDashboardData, 20000);
    return () => {
      window.removeEventListener('order_updated', loadDashboardData);
      clearInterval(interval);
    };
  }, []);

  const countMasuk = stats.countMasuk;
  const countDiproses = stats.countDiproses;
  const countSelesai = stats.countSelesai;
  const totalOmset = stats.totalOmset;

  const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');

  return (
    <div className="space-y-7">
      {/* 1. Hero Card */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 p-6 sm:p-9 shadow-xs">
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/80">
          <div className="space-y-3.5 max-w-2xl">
            {/* Small Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Arunika Admin Control</span>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Selamat Datang di Panel Admin!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Pantau transaksi top up Robux, proses aktivasi pesanan secara instan, dan kelola
              katalog produk toko dengan mudah.
            </p>
          </div>

          {/* Action CTA Button */}
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98 shrink-0"
          >
            <span>Kelola Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Highlight Feature Mini-Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="w-11 h-11 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Transaksi Cepat
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Pantau top up Robux secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Aktivasi Instan
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Proses pesanan otomatis dan cepat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Kelola Katalog
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Atur produk dan stok dengan mudah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 Stat Metric Cards (2x2 on Mobile, 4 columns on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* TOTAL OMSET */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              TOTAL OMSET
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-2xl font-black text-slate-900 dark:text-white whitespace-nowrap">
              {formatRupiah(totalOmset)}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              <span>↑ Sukses</span>
            </div>
          </div>
        </div>

        {/* ORDER MASUK */}
        <Link
          href="/admin/orders?status=masuk"
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-amber-100 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-700/50 shadow-xs transition-all group flex flex-col justify-between space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              ORDER MASUK
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Inbox className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {countMasuk}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform truncate">
              <span>Perlu proses</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          </div>
        </Link>

        {/* SEDANG DIPROSES */}
        <Link
          href="/admin/orders?status=diproses"
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/30 hover:border-cyan-300 dark:hover:border-cyan-700/50 shadow-xs transition-all group flex flex-col justify-between space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              DIPROSES
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
              {countDiproses}
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform truncate">
              <span>Antrean GP</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
          </div>
        </Link>

        {/* ORDER SELESAI */}
        <Link
          href="/admin/orders?status=selesai"
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700/50 shadow-xs transition-all group flex flex-col justify-between space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              SELESAI
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {countSelesai}
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 truncate">
              Dari {stats.totalOrders} order
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Roblox ID Activation Section (Client Feature) */}
      <RobloxActivationCard />

      {/* 4. Pesanan Terbaru List (Matching Screenshot 2) */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Pesanan Terbaru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              5 transaksi terakhir yang masuk ke sistem
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors group"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* List of Recent Orders */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">
              Belum ada transaksi di database Supabase.
            </div>
          ) : (
            recentOrders.map((order) => {
              const code = order.order_code || order.id;
              const username = order.roblox_username || order.customer?.username || 'Player';
              const robuxAmount = order.robux || order.product?.nominal || 0;
              const priceAmount = order.price || order.payment?.totalAmount || 0;
              const method = (order.payment_method || order.payment?.method || 'WEBSITE').toUpperCase();

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${code}`}
                  className="flex items-center justify-between py-4 px-2 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 rounded-2xl transition-colors group"
                >
                  {/* Left: Coin Icon & Order ID + Username */}
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    {/* Gold Robux Coin Icon */}
                    <div className="relative w-11 h-11 rounded-2xl bg-amber-50 dark:bg-slate-950 border border-amber-200/80 dark:border-cyan-400/30 flex items-center justify-center p-2 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <Image
                        src="/robux.webp"
                        alt="Robux"
                        width={28}
                        height={28}
                        className="object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                      />
                    </div>

                    <div>
                      <div className="font-black text-sm sm:text-base text-cyan-600 dark:text-cyan-400 group-hover:underline">
                        #{code}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        @{username} • {Number(robuxAmount).toLocaleString('id-ID')} Robux
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Channel Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      {formatRupiah(priceAmount)}
                    </span>
                    {method === 'WEBSITE' ? (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 tracking-wider">
                        WEBSITE
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 tracking-wider">
                        WHATSAPP
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
