'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Zap,
  Crown,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { ProductRow } from '../../../types/database';
import { getStoredSettings, fetchGlobalSettings } from '../data/adminSettings';

interface AdminProductItem {
  id: string | number;
  nominal: number;
  label: string;
  price: number;
  category?: 'regular' | 'sultan';
  isActive: boolean;
  image_path?: string | null;
}

export default function AdminPricelistPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);

  // Form State (Simplified: only Nominal, Price, and Active status)
  const [formNominal, setFormNominal] = useState<string>('1.000');
  const [formPrice, setFormPrice] = useState<string>('20.000');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to format number with dots in Indonesian locale (e.g. 30000 -> 30.000)
  const formatNumberWithDots = (val: string | number) => {
    const digits = String(val).replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('id-ID');
  };

  // Store Settings & Orders for Automatic Badge Computation
  const [promoPackageLabel, setPromoPackageLabel] = useState<string>('');
  const [promoPackageId, setPromoPackageId] = useState<string>('');
  const [isPromoActive, setIsPromoActive] = useState<boolean>(false);
  const [popularPackageLabel, setPopularPackageLabel] = useState<string>('2.200');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?all=true', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: AdminProductItem[] = json.data.map((row: ProductRow) => ({
          id: row.id,
          nominal: row.robux,
          label: Number(row.robux).toLocaleString('id-ID'),
          price: row.price,
          category: row.robux >= 10000 ? 'sultan' : 'regular',
          isActive: row.is_active,
          image_path: row.image_path,
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error('Failed to load products from API:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // 1. Fetch promo configuration from Store Settings
    fetchGlobalSettings().then((settings) => {
      if (settings?.promo) {
        setIsPromoActive(settings.promo.isActive);
        setPromoPackageLabel(settings.promo.packageLabel || '');
        setPromoPackageId(settings.promo.packageId || '');
      }
    });

    // 2. Fetch popular package from stats
    fetch('/api/admin/stats', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.stats) {
          // If stats provide popular package, set it
        }
      })
      .catch(() => {});
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProducts();
  };

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  // Automatic badge evaluation function
  const getProductAutoBadge = (product: AdminProductItem) => {
    // 1. PROMO: from store settings if promo is active
    if (
      isPromoActive &&
      (String(product.id) === promoPackageId ||
        product.label === promoPackageLabel ||
        `${product.label} Robux` === promoPackageLabel)
    ) {
      return {
        type: 'promo' as const,
        label: 'PROMO',
        icon: Zap,
        bgColor: 'bg-rose-500',
      };
    }

    // 2. SULTAN: Robux >= 10.000 (di atas 10rb)
    if (product.nominal >= 10000) {
      return {
        type: 'sultan' as const,
        label: 'SULTAN',
        icon: Crown,
        bgColor: 'bg-amber-500',
      };
    }

    // 3. POPULER: the most ordered package in system (or default popular)
    if (
      product.label === popularPackageLabel ||
      product.label === '2.200' ||
      product.label === '1.700'
    ) {
      return {
        type: 'populer' as const,
        label: 'POPULER',
        icon: Sparkles,
        bgColor: 'bg-cyan-500',
      };
    }

    return null;
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingProduct(null);
    setFormNominal('1.000');
    setFormPrice('20.000');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: AdminProductItem) => {
    setModalMode('edit');
    setEditingProduct(product);
    setFormNominal(formatNumberWithDots(product.nominal));
    setFormPrice(formatNumberWithDots(product.price));
    setFormIsActive(product.isActive);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (product: AdminProductItem) => {
    const nextStatus = !product.isActive;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: nextStatus } : p))
    );

    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          is_active: nextStatus,
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      console.error(err);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (productId: string | number) => {
    if (confirm('Apakah Anda yakin ingin menghapus nominal Robux ini dari katalog?')) {
      // Optimistic
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      try {
        const res = await fetch(`/api/products?id=${productId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('Failed to delete');
        }
      } catch (err) {
        console.error(err);
        fetchProducts();
      }
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Clean numeric inputs
    const nominalNum = parseInt(formNominal.replace(/[^0-9]/g, ''), 10) || 1000;
    const priceNum = parseInt(formPrice.replace(/[^0-9]/g, ''), 10) || 20000;
    const formattedName = `${nominalNum.toLocaleString('id-ID')} Robux`;

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formattedName,
            robux: nominalNum,
            price: priceNum,
            is_active: formIsActive,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          alert(json.error || 'Gagal menambahkan produk');
          return;
        }
      } else if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: formattedName,
            robux: nominalNum,
            price: priceNum,
            is_active: formIsActive,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          alert(json.error || 'Gagal mengubah produk');
          return;
        }
      }

      await fetchProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with 'Tambah Nominal Baru' and Refresh Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Pricelist Robux
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Kelola daftar nominal Robux, harga jual, dan status ketersediaan live Supabase
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-slate-800 hover:border-cyan-400 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
          >
            <RotateCw className={`w-4 h-4 text-cyan-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Nominal Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Products Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 dark:text-slate-600 font-bold text-sm animate-pulse">
          Memuat data produk dari Supabase...
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-500">Belum ada paket Robux di database.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => {
            const isActive = product.isActive;

            return (
              <div
                key={product.id}
                className={`p-5 sm:p-6 rounded-[28px] bg-white dark:bg-slate-900/90 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs ${
                  isActive
                    ? 'border-cyan-100 dark:border-cyan-900/40 hover:border-cyan-300 dark:hover:border-cyan-700/60'
                    : 'border-slate-200/60 dark:border-slate-800 opacity-60'
                }`}
              >
                {/* Top Row: Icon + Nominal + Price + Status Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Robux Coin Icon Box */}
                    <div className="relative w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-950 border border-amber-200/80 dark:border-cyan-400/30 flex items-center justify-center p-2 shrink-0 shadow-xs">
                      <Image
                        src="/robux.webp"
                        alt="Robux"
                        width={32}
                        height={32}
                        className="object-contain drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                      />
                    </div>

                    {/* Title, Badge & Price */}
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                        {product.label} Robux
                      </h3>

                      {/* Automatic Badge Pill (Populer / Promo / Sultan) */}
                      {(() => {
                        const autoBadge = getProductAutoBadge(product);
                        if (!autoBadge) return null;
                        const IconComp = autoBadge.icon;

                        return (
                          <div className="pt-0.5">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md text-white tracking-wider ${autoBadge.bgColor}`}
                            >
                              <IconComp className="w-2.5 h-2.5 fill-white" />
                              <span>{autoBadge.label}</span>
                            </span>
                          </div>
                        );
                      })()}

                      {/* Price */}
                      <div className="font-black text-sm text-cyan-600 dark:text-cyan-400">
                        {formatRupiah(product.price)}
                      </div>
                    </div>
                  </div>

                  {/* Status Pill (Aktif / Nonaktif) */}
                  <span
                    className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Bottom Row: Toggle Status & Action Icons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  {/* Nonaktifkan / Aktifkan toggle link */}
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className="text-xs font-black text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  {/* Edit & Delete Action Icons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Edit Nominal"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Hapus Nominal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Modal Form: Tambah / Edit Nominal Robux (Simplified & Clean) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border-2 border-cyan-100 dark:border-cyan-900/50">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Tambah Nominal Robux' : 'Edit Nominal Robux'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Field 1: Nominal Robux */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300">
                  <span>Nominal Robux</span>
                  <Image
                    src="/robux.webp"
                    alt="Robux"
                    width={14}
                    height={14}
                    className="inline-block object-contain"
                  />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formNominal}
                    onChange={(e) => setFormNominal(formatNumberWithDots(e.target.value))}
                    placeholder="Contoh: 1.000"
                    className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    R$
                  </span>
                </div>
              </div>

              {/* Field 2: Harga Jual (Rp) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Harga Jual (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-cyan-600 dark:text-cyan-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formPrice}
                    onChange={(e) => setFormPrice(formatNumberWithDots(e.target.value))}
                    placeholder="20.000"
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Field 3: Checkbox Aktif */}
              <div className="pt-1">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nominal Aktif & Ditampilkan di Web
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-cyan-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Nominal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
