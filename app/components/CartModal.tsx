'use client';

import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Product } from '../data/products';
import { ArunikaSparkle } from './ArunikaIcons';

export interface CartItem extends Product {
  cartItemId: string; // unique ID in case the user adds the same package multiple times
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}: CartModalProps) {
  if (!isOpen) return null;

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);
  const totalRobux = cartItems.reduce((acc, item) => acc + item.nominal, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[32px] max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative my-8 border-2 border-cyan-200 dark:border-cyan-500/30 transition-colors duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Tutup Keranjang"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300/50 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Keranjang Belanja Arunika Store
              </h3>
              <ArunikaSparkle className="w-4 h-4 shrink-0" color="cyan" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Kelola paket Robux pilihan sebelum checkout
            </p>
          </div>
        </div>

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Keranjang Belanja Kosong
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Yuk pilih paket Robux yang kamu inginkan di pricelist dan tambahkan ke keranjang!
              </p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl btn-arunika-primary text-white text-xs font-black cursor-pointer shadow-sm"
            >
              <span>Pilih Paket Robux</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Item List */
          <div className="space-y-4">
            {/* Header: Count & Clear all */}
            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <span className="text-slate-600 dark:text-slate-400">
                Daftar Paket ({cartItems.length} item):
              </span>
              <button
                onClick={onClearCart}
                className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-extrabold cursor-pointer transition-colors"
              >
                Kosongkan Semua
              </button>
            </div>

            {/* List container */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {cartItems.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border-2 border-slate-100 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-cyan-400/30 p-1 flex items-center justify-center shrink-0">
                      <Image
                        src="/robux.webp"
                        alt="Robux"
                        width={22}
                        height={22}
                        className="object-contain drop-shadow-[0_0_4px_rgba(0,229,255,0.7)]"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {item.label} Robux
                      </span>
                      <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="inline-flex items-center gap-1 text-xs font-black text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-slate-600 dark:text-slate-400">
                  Total Pembayaran:
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  ({totalRobux.toLocaleString('id-ID')} Total Robux)
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-4 rounded-2xl btn-arunika-primary text-white font-black text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
