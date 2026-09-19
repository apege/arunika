'use client';

import { Zap } from 'lucide-react';
import { Product } from '../data/products';
import { CartItem } from './CartModal';
import { ArunikaSparkle } from './ArunikaIcons';

interface StickyBottomBarProps {
  selectedProduct: Product | null;
  cartItems?: CartItem[];
  onCheckout: () => void;
}

export default function StickyBottomBar({
  selectedProduct,
  cartItems = [],
  onCheckout,
}: StickyBottomBarProps) {
  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const hasCart = cartItems.length > 0;

  if (!selectedProduct && !hasCart) return null;

  const totalNominal = hasCart
    ? cartItems.reduce((acc, item) => acc + item.nominal, 0)
    : selectedProduct
    ? selectedProduct.nominal
    : 0;

  const totalPrice = hasCart
    ? cartItems.reduce((acc, item) => acc + item.price, 0)
    : selectedProduct
    ? selectedProduct.price
    : 0;

  const displayLabel = hasCart
    ? `${totalNominal.toLocaleString('id-ID')} Robux (${cartItems.length} Paket)`
    : `${selectedProduct?.label || totalNominal.toLocaleString('id-ID')} Robux`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#070b15]/95 backdrop-blur-xl border-t-2 border-cyan-200 dark:border-cyan-500/30 shadow-2xl py-3.5 px-4 sm:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Order summary */}
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Total:</span>
            <span className="text-slate-900 dark:text-white font-black truncate">
              {displayLabel}
            </span>
            <ArunikaSparkle className="w-2.5 h-2.5 shrink-0 hidden sm:inline-block" color="cyan" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 whitespace-nowrap tracking-tight leading-tight mt-0.5">
            {formatRupiah(totalPrice)}
          </div>
        </div>

        {/* Right Side: Action Button */}
        <button
          onClick={onCheckout}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-9 py-3 sm:py-3.5 rounded-2xl btn-arunika-primary text-white font-black text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
        >
          <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
          <span>Bayar Sekarang</span>
        </button>
      </div>
    </div>
  );
}
