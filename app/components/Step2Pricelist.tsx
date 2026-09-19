'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Flame, Zap, Crown, Check, Plus } from 'lucide-react';
import { Product, PRODUCTS } from '../data/products';
import { ArunikaBadgeStep } from './ArunikaIcons';

interface Step2PricelistProps {
  products?: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function Step2Pricelist({
  products = PRODUCTS,
  selectedProduct,
  onSelectProduct,
  onAddToCart,
}: Step2PricelistProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'populer' | 'promo' | 'sultan'>('all');

  const productList = products && products.length > 0 ? products : PRODUCTS;

  const counts = {
    all: productList.length,
    populer: productList.filter((p) => p.category === 'populer').length,
    promo: productList.filter((p) => p.category === 'promo').length,
    sultan: productList.filter((p) => p.category === 'sultan').length,
  };

  const filteredProducts = productList.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div
      id="pricelist"
      className="w-full bg-white dark:bg-slate-900/90 rounded-3xl sm:rounded-[32px] border-2 border-cyan-100/90 dark:border-cyan-500/20 shadow-sm p-6 sm:p-8 space-y-7 transition-colors duration-300"
    >
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <ArunikaBadgeStep number="2" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Pilih Robux
              </h2>
              <span className="text-xs sm:text-sm font-black text-cyan-600 dark:text-cyan-400">
                (Pricelist Resmi Arunika)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Pilih paket nominal Robux yang ingin Anda beli
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900'
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('populer')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'populer'
                ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Populer ({counts.populer})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('promo')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'promo'
                ? 'btn-arunika-primary text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Promo ({counts.promo})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sultan')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sultan'
                ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-yellow-300" />
            <span>Paket Sultan ({counts.sultan})</span>
          </button>
        </div>
      </div>

      {/* Robux Products Grid (2 columns on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4.5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 px-4 rounded-3xl bg-slate-50/80 dark:bg-slate-950/80 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum ada paket Robux yang tersedia.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Data produk akan segera dimuat dari sistem.</p>
          </div>
        ) : (
          filteredProducts.map((item) => {
          // Exactly ONE product is selected when clicked
          const isSelected = selectedProduct?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectProduct(item)}
              className={`group relative rounded-2xl sm:rounded-3xl border-2 p-3 sm:p-4.5 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-50/60 via-white to-sky-50/40 dark:from-cyan-950/40 dark:via-slate-900/90 dark:to-slate-950 border-cyan-400 ring-2 ring-cyan-300/50 dark:ring-cyan-500/40 shadow-xl shadow-cyan-400/20 scale-[1.01] sm:scale-[1.02]'
                  : 'bg-white dark:bg-slate-950/80 border-slate-200/90 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:shadow-md'
              }`}
            >
              {/* Card Top Header: Badge on left, Check/Plus button on right */}
              <div className="flex items-center justify-between gap-2 min-h-[22px] mb-2">
                {item.badge ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xs ${
                      item.badge === 'PROMO'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                        : item.badge === 'POPULER'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Robux
                  </span>
                )}

                {/* Plus Button: Specifically adds item to shopping cart without changing active card selection */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddToCart) {
                      onAddToCart(item);
                    }
                  }}
                  title="Tambah ke Keranjang"
                  className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-400 dark:text-slate-400 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 hover:scale-110 active:scale-95'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                </button>
              </div>

              {/* Card Middle: Robux Icon + Nominal & Price */}
              <div className="flex items-center gap-2 sm:gap-2.5 my-1 min-w-0">
                {/* Robux Icon */}
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-xl bg-slate-950 border border-cyan-400/30 flex items-center justify-center p-1.5 shadow-inner group-hover:scale-105 transition-transform">
                  <Image
                    src="/robux.webp"
                    alt="Robux Icon"
                    width={28}
                    height={28}
                    className="object-contain drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]"
                  />
                </div>

                {/* Nominal & Price */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black text-cyan-600 dark:text-cyan-400">
                      Rbx
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-cyan-600 dark:text-cyan-300 tracking-tight whitespace-nowrap mt-0.5">
                    {formatRupiah(item.price)}
                  </span>
                </div>
              </div>

              {/* Card Bottom Bar */}
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs font-extrabold">
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                  <Zap className="w-3 h-3 fill-cyan-400 text-cyan-500" />
                  INSTAN
                </span>
                <span
                  className={`${
                    isSelected
                      ? 'text-cyan-600 dark:text-cyan-400 font-black'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                >
                  {isSelected ? 'Dipilih' : 'Pilih'}
                </span>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
