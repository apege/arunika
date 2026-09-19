'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Menu, UserCheck } from 'lucide-react';
import Image from 'next/image';

interface AdminTopnavProps {
  onToggleMobileMenu?: () => void;
}

export default function AdminTopnav({ onToggleMobileMenu }: AdminTopnavProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/orders?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/admin/orders');
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
      router.push('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-[#070b15]/95 backdrop-blur-md border-b border-cyan-100 dark:border-cyan-900/30 px-4 sm:px-8 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Search input */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-2xl border border-cyan-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-slate-800"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Search bar matching screenshot */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 group"
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari order, username, ID..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200/80 dark:border-slate-800 focus:border-cyan-400 dark:focus:border-cyan-500 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden transition-all shadow-2xs"
            />
          </form>
        </div>

        {/* Right: Admin Profile & Logout Button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 py-1 px-1.5 sm:px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-slate-950 overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Admin Arunika"
                  width={30}
                  height={30}
                  className="object-contain"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Admin Arunika
                </span>
                <UserCheck className="w-3 h-3 text-cyan-500" />
              </div>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                Super Admin
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl border border-rose-200 dark:border-rose-900/50 hover:border-rose-300 bg-rose-50/70 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
