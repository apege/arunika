'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Tag,
  Users,
  ShieldAlert,
  MessageCircle,
  CreditCard,
  Settings,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ArunikaSparkle } from '../../components/ArunikaIcons';
import { supabase } from '../../../lib/supabase/client';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status');

  const [countMasuk, setCountMasuk] = useState(0);
  const [countDiproses, setCountDiproses] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = () => {
      fetch('/api/admin/stats', { cache: 'no-store' })
        .then((r) => r.json())
        .then((data) => {
          if (!isMounted) return;
          if (data.success && (data.data || data.stats)) {
            const statsObj = data.data || data.stats;
            setCountMasuk(Number(statsObj.countMasuk) || 0);
            setCountDiproses(Number(statsObj.countDiproses) || 0);
          }
        })
        .catch(() => {});
    };

    fetchStats();

    // 1. Instant event from admin actions
    const handleOrderEvent = () => fetchStats();
    window.addEventListener('order_updated', handleOrderEvent);

    // 2. Real-time Supabase subscription
    const channel = supabase
      .channel('sidebar_orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    // 3. Fallback poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      isMounted = false;
      window.removeEventListener('order_updated', handleOrderEvent);
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const isDashboardActive = pathname === '/admin';
  const isPricelistActive = pathname === '/admin/pricelist';

  const isOrderActive = (statusKey: string) => {
    if (pathname.startsWith('/admin/orders')) {
      if (statusKey === 'masuk') {
        return !currentStatus || currentStatus === 'masuk';
      }
      return currentStatus === statusKey;
    }
    return false;
  };

  const navItemsOrder = [
    {
      label: 'Order Masuk',
      href: '/admin/orders?status=masuk',
      active: isOrderActive('masuk'),
      icon: Inbox,
      badge: countMasuk,
      badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-bold',
    },
    {
      label: 'Order Diproses',
      href: '/admin/orders?status=diproses',
      active: isOrderActive('diproses'),
      icon: Clock,
      badge: countDiproses,
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold',
    },
    {
      label: 'Order Selesai',
      href: '/admin/orders?status=selesai',
      active: isOrderActive('selesai'),
      icon: CheckCircle2,
    },
    {
      label: 'Order Dibatalkan',
      href: '/admin/orders?status=dibatalkan',
      active: isOrderActive('dibatalkan'),
      icon: XCircle,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#070b15] border-r border-cyan-100 dark:border-cyan-900/30 w-72 p-5 text-slate-700 dark:text-slate-300 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 border-b border-cyan-100/60 dark:border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-[14px] bg-slate-950 overflow-hidden flex items-center justify-center p-1">
              <Image
                src="/logo.png"
                alt="Arunika Store"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                Arunika<span className="text-cyan-500">Store</span>
              </span>
              <ArunikaSparkle className="w-3.5 h-3.5" color="cyan" />
            </div>
            <div className="text-[10px] font-extrabold tracking-wider uppercase text-cyan-600 dark:text-cyan-400">
              TOP UP ROBUX ADMIN
            </div>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-6 space-y-7 no-scrollbar">
        {/* Main Menu */}
        <div>
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
              isDashboardActive
                ? 'bg-gradient-to-r from-cyan-50 to-blue-50/60 dark:from-cyan-950/40 dark:to-blue-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard
              className={`w-4 h-4 ${
                isDashboardActive ? 'text-cyan-500' : 'text-slate-400'
              }`}
            />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Order Management Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ORDER MANAGEMENT
          </div>
          <div className="space-y-1">
            {navItemsOrder.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                    item.active
                      ? 'bg-gradient-to-r from-cyan-50 to-blue-50/60 dark:from-cyan-950/40 dark:to-blue-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        item.active ? 'text-cyan-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pricelist Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            PRICELIST
          </div>
          <div>
            <Link
              href="/admin/pricelist"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                isPricelistActive
                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50/60 dark:from-cyan-950/40 dark:to-blue-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tag
                className={`w-4 h-4 ${
                  isPricelistActive ? 'text-cyan-500' : 'text-slate-400'
                }`}
              />
              <span>Pricelist Robux</span>
            </Link>
          </div>
        </div>

        {/* Pelanggan Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            PELANGGAN
          </div>
          <div className="space-y-1">
            <Link
              href="/admin/customers"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                pathname === '/admin/customers'
                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50/60 dark:from-cyan-950/40 dark:to-blue-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users
                className={`w-4 h-4 ${
                  pathname === '/admin/customers' ? 'text-cyan-500' : 'text-slate-400'
                }`}
              />
              <span>Daftar Pelanggan</span>
            </Link>

            <Link
              href="/admin/blacklist"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                pathname === '/admin/blacklist'
                  ? 'bg-gradient-to-r from-rose-50 to-rose-100/60 dark:from-rose-950/40 dark:to-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert
                className={`w-4 h-4 ${
                  pathname === '/admin/blacklist' ? 'text-rose-500' : 'text-slate-400'
                }`}
              />
              <span>Blacklist</span>
            </Link>
          </div>
        </div>

        {/* Konten & Ulasan Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            KONTEN & ULASAN
          </div>
          <div className="space-y-1">
            <Link
              href="/admin/testimonials"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                pathname === '/admin/testimonials'
                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50/60 dark:from-cyan-950/40 dark:to-blue-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle
                className={`w-4 h-4 ${
                  pathname === '/admin/testimonials' ? 'text-cyan-500' : 'text-slate-400'
                }`}
              />
              <span>Kelola Testimoni</span>
            </Link>
          </div>
        </div>

        {/* Keuangan Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            KEUANGAN
          </div>
          <div className="space-y-1">
            <Link
              href="/admin/payments"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                pathname === '/admin/payments'
                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50/60 dark:from-cyan-950/40 dark:to-blue-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CreditCard
                className={`w-4 h-4 ${
                  pathname === '/admin/payments' ? 'text-cyan-500' : 'text-slate-400'
                }`}
              />
              <span>Riwayat Pembayaran</span>
            </Link>
          </div>
        </div>

        {/* Pengaturan Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            PENGATURAN
          </div>
          <div>
            <Link
              href="/admin/settings"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
                pathname === '/admin/settings'
                  ? 'bg-gradient-to-r from-cyan-50 to-blue-50/60 dark:from-cyan-950/40 dark:to-blue-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-500/30 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings
                className={`w-4 h-4 ${
                  pathname === '/admin/settings' ? 'text-cyan-500' : 'text-slate-400'
                }`}
              />
              <span>Pengaturan Toko</span>
            </Link>
          </div>
        </div>

        {/* Customer Help Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-cyan-50/90 via-sky-50/40 to-blue-50/80 dark:from-cyan-950/30 dark:via-slate-900 dark:to-blue-950/30 border border-cyan-200/80 dark:border-cyan-800/40 space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-cyan-700 dark:text-cyan-300">
              Butuh Bantuan?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Tim ArunikaStore siap membantu kamu!
            </p>
          </div>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Arunika%20Store%2C%20saya%20butuh%20bantuan%20sistem%20admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-extrabold shadow-xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>Chat Admin</span>
          </a>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-cyan-100/60 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-1"
        >
          <span>Lihat Toko</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 hover:text-rose-600 dark:hover:text-rose-400 transition-colors py-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
