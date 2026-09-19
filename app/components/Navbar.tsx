'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ShoppingBag, Menu, X, Layers, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { ArunikaSparkle } from './ArunikaIcons';
import { StoreSettings } from '../admin/data/adminSettings';

interface NavbarProps {
  onOpenCaraOrder: () => void;
  onOpenCart: () => void;
  cartCount: number;
  settings?: StoreSettings | null;
}

export default function Navbar({
  onOpenCaraOrder,
  onOpenCart,
  cartCount,
  settings,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cleanPhone = (settings?.whatsappCS || '6281234567890').replace(/[^0-9]/g, '');
  const rawStoreName = settings?.storeName || 'ArunikaStore';
  const logoSrc = settings?.logo?.logoPath || '/logo.png';

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Admin ${rawStoreName}, saya mau tanya seputar Top Up Robux`
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#070b15]/85 border-b border-cyan-200/50 dark:border-cyan-500/20 shadow-xs transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-pink-500 shadow-lg shadow-cyan-500/20 group-hover:scale-105 group-hover:shadow-cyan-400/40 transition-all duration-300">
            <div className="w-full h-full rounded-[14px] bg-slate-950 overflow-hidden flex items-center justify-center p-1 relative">
              <Image
                src={logoSrc}
                alt={`${rawStoreName} Logo`}
                width={44}
                height={44}
                className="object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                priority
                unoptimized
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">
                {rawStoreName}
              </span>
              <ArunikaSparkle className="w-4 h-4" color="cyan" />
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Top Up Robux Resmi & Legal
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-extrabold text-slate-600 dark:text-slate-300">
          <a
            href="#pricelist"
            className="flex items-center gap-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-1.5 group"
          >
            <ArunikaSparkle
              className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform"
              color="cyan"
            />
            <span>Pricelist Robux</span>
          </a>
          <button
            onClick={onOpenCaraOrder}
            className="flex items-center gap-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-1.5 cursor-pointer group"
          >
            <Layers className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
            <span>Cara Order</span>
          </button>
          <a
            href="#testimoni"
            className="flex items-center gap-2 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors py-1.5 group"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
            <span>Testimoni</span>
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* CS WhatsApp button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4.5 py-2.5 rounded-full border border-cyan-300 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 hover:border-cyan-400 text-slate-800 dark:text-cyan-200 text-xs sm:text-sm font-extrabold shadow-sm hover:shadow-cyan-400/20 transition-all hover:scale-102 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-cyan-500 fill-cyan-100 dark:fill-cyan-950" />
            <span>Hubungi CS</span>
          </a>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            aria-label="Keranjang Pesanan"
            className="relative p-2.5 rounded-2xl border border-cyan-200 dark:border-cyan-500/30 bg-white dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cyan-100 dark:border-cyan-500/20 bg-white/95 dark:bg-[#070b15]/95 backdrop-blur-lg px-4 py-4 space-y-3 shadow-xl">
          <a
            href="#pricelist"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 py-2.5 px-3.5 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900 hover:text-cyan-600"
          >
            <ArunikaSparkle className="w-4 h-4" color="cyan" />
            <span>Pricelist Robux</span>
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCaraOrder();
            }}
            className="w-full flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 py-2.5 px-3.5 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900 hover:text-cyan-600 text-left"
          >
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Cara Order</span>
          </button>
          <a
            href="#testimoni"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 py-2.5 px-3.5 rounded-xl hover:bg-cyan-50 dark:hover:bg-slate-900 hover:text-cyan-600"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Testimoni</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl btn-arunika-primary text-white font-extrabold text-sm shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi CS via WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
}
