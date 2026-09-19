'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  RotateCw,
  Search,
  ArrowRight,
  Check,
  Star,
  Inbox,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { generateReviewToken } from '../../data/reviewToken';
import { DbOrder, OrderStatus } from '../../../types/database';
import StorageManagerBar from '../components/StorageManagerBar';

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'masuk';
  const initialQuery = searchParams.get('q') || '';

  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [searchFilter, setSearchFilter] = useState<string>(initialQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processedId, setProcessedId] = useState<number | string | null>(null);
  const [completedId, setCompletedId] = useState<number | string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders from API:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchParams.get('status')) {
      setActiveTab(searchParams.get('status') || 'masuk');
    }
  }, [searchParams]);

  useEffect(() => {
    if (initialQuery) {
      setSearchFilter(initialQuery);
    }
  }, [initialQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  const handleQuickProcess = async (orderId: number, code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/orders/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: 'processing' }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: 'processing' } : o))
        );
        setProcessedId(orderId);
        window.dispatchEvent(new Event('order_updated'));
        setTimeout(() => setProcessedId(null), 1500);
      }
    } catch (err) {
      console.error('Failed to process order:', err);
    }
  };

  const handleQuickComplete = async (orderId: number, code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/orders/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: 'completed', payment_status: 'paid' }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, order_status: 'completed', payment_status: 'paid' }
              : o
          )
        );
        setCompletedId(orderId);
        window.dispatchEvent(new Event('order_updated'));
        setTimeout(() => setCompletedId(null), 1500);
      }
    } catch (err) {
      console.error('Failed to complete order:', err);
    }
  };

  // Map frontend tab to database status
  const getDbStatusForTab = (tab: string) => {
    if (tab === 'masuk') return 'pending';
    if (tab === 'diproses') return 'processing';
    if (tab === 'selesai') return 'completed';
    if (tab === 'dibatalkan') return 'cancelled';
    return tab;
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const targetStatus = getDbStatusForTab(activeTab);
    if (activeTab !== 'semua' && order.order_status !== targetStatus) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().replace(/^@/, '').replace(/^#/, '');
      const matchCode = (order.order_code || '').toLowerCase().includes(q);
      const matchUser = (order.roblox_username || '').toLowerCase().includes(q);
      const matchRobux = String(order.robux || '').includes(q);
      return matchCode || matchUser || matchRobux;
    }
    return true;
  });

  const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');

  const formatShortDate = (iso: string) => {
    if (!iso) return 'Hari ini';
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}, ${String(
      d.getHours()
    ).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const getPageHeading = () => {
    switch (activeTab) {
      case 'masuk':
        return {
          title: 'Order Masuk',
          desc: 'Kelola dan proses seluruh pesanan Robux baru yang masuk ke ArunikaStore',
        };
      case 'diproses':
        return {
          title: 'Order Sedang Diproses',
          desc: 'Daftar transaksi yang sedang dalam proses pengiriman Robux gamepass',
        };
      case 'selesai':
        return {
          title: 'Order Selesai',
          desc: 'Riwayat transaksi Robux yang telah berhasil diproses',
        };
      case 'dibatalkan':
        return {
          title: 'Order Dibatalkan',
          desc: 'Daftar transaksi yang dibatalkan oleh admin atau sistem',
        };
      default:
        return {
          title: 'Semua Pesanan',
          desc: 'Kelola seluruh transaksi top up Robux pelanggan ArunikaStore',
        };
    }
  };

  const { title, desc } = getPageHeading();

  return (
    <div className="space-y-6">
      {/* 1. Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            {desc}
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

      {/* Storage Management & Auto-Cleanup 90 Days Bar */}
      <StorageManagerBar />

      {/* 2. Main Orders Table / Card Container */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 p-6 sm:p-8 shadow-xs space-y-5">
        {/* Search & Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter order atau username..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Menampilkan <span className="text-cyan-600 dark:text-cyan-400 font-black">{filteredOrders.length}</span> pesanan
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-500 flex items-center justify-center">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
              Tidak ada pesanan ditemukan
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Belum ada transaksi dengan status ini di database Supabase.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const code = order.order_code;
              const isJustProcessed = processedId === order.id;
              const isJustCompleted = completedId === order.id;
              const robuxLabel = Number(order.robux).toLocaleString('id-ID');
              const paymentMethod = (order.payment_method || 'WEBSITE').toUpperCase();

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 hover:border-cyan-200 dark:hover:border-cyan-900/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4 shadow-2xs"
                >
                  {/* Left / Top: Order ID, Status, Customer & Timestamp */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <Link
                        href={`/admin/orders/${code}`}
                        className="font-black text-base sm:text-lg text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        #{code}
                      </Link>

                      {/* Status Pill */}
                      {order.order_status === 'pending' && (
                        <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 shrink-0">
                          Menunggu Bayar
                        </span>
                      )}
                      {order.order_status === 'processing' && (
                        <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 shrink-0">
                          Sedang Diproses
                        </span>
                      )}
                      {order.order_status === 'completed' && (
                        <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shrink-0">
                          Selesai
                        </span>
                      )}
                      {order.order_status === 'cancelled' && (
                        <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 shrink-0">
                          Dibatalkan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        @{order.roblox_username}
                      </span>
                      <span>•</span>
                      <span>{formatShortDate(order.created_at)}</span>
                      <span>•</span>

                      {/* Payment Method Badge */}
                      {paymentMethod === 'WEBSITE' ? (
                        <span className="text-[10px] font-black px-2 py-0.2 rounded-md bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 shrink-0">
                          WEBSITE
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shrink-0">
                          WHATSAPP
                        </span>
                      )}

                      <span>•</span>
                      <span className="text-slate-400 italic">
                        {order.payment_proof_path ? '(Bukti terlampir)' : '(Tanpa foto)'}
                      </span>
                    </div>
                  </div>

                  {/* Right / Bottom: Robux Amount, Rupiah & Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-slate-800/80">
                    {/* Robux & Price */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                      <div className="relative w-9 h-9 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-200/80 dark:border-cyan-400/30 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                        <Image
                          src="/robux.webp"
                          alt="Robux"
                          width={22}
                          height={22}
                          className="object-contain drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                        />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                          {robuxLabel} Robux
                        </div>
                        <div className="text-xs font-black text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                          {formatRupiah(order.price)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                      {order.order_status === 'pending' && (
                        <button
                          onClick={(e) => handleQuickProcess(order.id, code, e)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800 text-xs font-black whitespace-nowrap transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          {isJustProcessed ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Check className="w-3.5 h-3.5" /> Diproses!
                            </span>
                          ) : (
                            'Proses'
                          )}
                        </button>
                      )}

                      {order.order_status === 'processing' && (
                        <button
                          onClick={(e) => handleQuickComplete(order.id, code, e)}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs font-black whitespace-nowrap transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          {isJustCompleted ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Check className="w-3.5 h-3.5" /> Selesai!
                            </span>
                          ) : (
                            'Selesai'
                          )}
                        </button>
                      )}

                      {order.order_status === 'completed' && (() => {
                        const reviewToken = generateReviewToken(code);
                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://arunikastore.com';
                        const reviewUrl = `${baseUrl}/?token=${reviewToken}#testimoni`;
                        const cleanPhone = (order.customer_phone || '').replace(/\D/g, '');
                        const waReviewText = `Halo kak @${order.roblox_username}! Pesanan Robux #${code} (${robuxLabel} Robux) di Arunika Store sudah selesai ya kak ✨\n\nBoleh minta tolong luangkan waktu sebentar untuk memberikan ulasan/testimoni di toko kami? \n👉 Link Ulasan: ${reviewUrl}\n\nTerima kasih banyak atas kepercayaannya!`;

                        return (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              waReviewText
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 text-xs font-black whitespace-nowrap transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-2xs"
                            title="Kirim link review via WhatsApp"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                            <span>Kirim Link Review</span>
                          </a>
                        );
                      })()}

                      <Link
                        href={`/admin/orders/${code}`}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-cyan-500/20 whitespace-nowrap transition-all hover:scale-102 active:scale-98 shrink-0"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-slate-400">Memuat data pesanan...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
