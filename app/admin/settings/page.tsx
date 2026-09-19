'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Store,
  Flame,
  QrCode,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Calendar,
  Upload,
  Check,
  Save,
} from 'lucide-react';
import {
  getStoredSettings,
  fetchGlobalSettings,
  saveGlobalSettings,
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
} from '../data/adminSettings';
import { mapDbProductToUI, UIProduct } from '../../../lib/productsHelper';
import { compressImageToWebP } from '../../../lib/imageCompressor';
import PromoDatePickerModal from '../components/PromoDatePickerModal';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [availableProducts, setAvailableProducts] = useState<UIProduct[]>([]);

  // Promo Date Picker Modal state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Accordion open/close states
  const [openIdentity, setOpenIdentity] = useState(true);
  const [openPromo, setOpenPromo] = useState(true);
  const [openQris, setOpenQris] = useState(true);

  // Toast / Save feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // File input refs for uploading
  const bannerFileRef = useRef<HTMLInputElement | null>(null);
  const qrisFileRef = useRef<HTMLInputElement | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Initial quick load from local cache
    setSettings(getStoredSettings());

    // Live sync from server API
    fetchGlobalSettings().then((liveSettings) => {
      if (liveSettings) {
        setSettings(liveSettings);
      }
    });

    // Fetch live products for promo package dropdown
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((p: any) => mapDbProductToUI(p));
          setAvailableProducts(mapped);
        }
      })
      .catch((err) => console.error('Failed to load products for settings:', err));
  }, []);

  const areAllOpen = openIdentity && openPromo && openQris;

  const handleToggleAll = () => {
    if (areAllOpen) {
      setOpenIdentity(false);
      setOpenPromo(false);
      setOpenQris(false);
    } else {
      setOpenIdentity(true);
      setOpenPromo(true);
      setOpenQris(true);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await saveGlobalSettings(settings);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePackageChange = (productId: string) => {
    const found = availableProducts.find((p) => String(p.id) === String(productId));
    if (found) {
      setSettings((prev) => ({
        ...prev,
        promo: {
          ...prev.promo,
          packageId: String(found.id),
          packageLabel: `${found.label} Robux`,
          packagePrice: found.price,
        },
      }));
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const webp = await compressImageToWebP(file, 1600, 900, 0.82);
        setSettings((prev) => ({
          ...prev,
          promo: {
            ...prev.promo,
            bannerImage: webp,
          },
        }));
      } catch (err) {
        console.error('Error compressing banner:', err);
      }
    }
  };

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const webp = await compressImageToWebP(file, 800, 800, 0.9);
        setSettings((prev) => ({
          ...prev,
          qris: {
            ...prev.qris,
            qrisImage: webp,
          },
        }));
      } catch (err) {
        console.error('Error compressing QRIS:', err);
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const webp = await compressImageToWebP(file, 600, 600, 0.9);
        setSettings((prev) => ({
          ...prev,
          logo: {
            ...prev.logo,
            logoPath: webp,
          },
        }));
      } catch (err) {
        console.error('Error compressing logo:', err);
      }
    }
  };

  const formatRupiah = (val: number) => 'Rp ' + (val || 0).toLocaleString('id-ID');

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Toast notification */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Check className="w-5 h-5" />
          <span>Semua pengaturan toko berhasil disimpan!</span>
        </div>
      )}

      {/* 1. Header with 'Tutup Semua Section' Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Pengaturan Toko & Banner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Konfigurasi identitas toko, nomor WhatsApp CS, barcode QRIS, dan banner promo pelanggan
          </p>
        </div>

        <button
          onClick={handleToggleAll}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-slate-800 hover:border-cyan-400 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer shrink-0"
        >
          {areAllOpen ? (
            <>
              <Lock className="w-3.5 h-3.5 text-cyan-500" />
              <span>Tutup Semua Section</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-cyan-500" />
              <span>Buka Semua Section</span>
            </>
          )}
        </button>
      </div>

      {/* Hidden File Inputs for uploads */}
      <input
        type="file"
        ref={bannerFileRef}
        onChange={handleBannerUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={qrisFileRef}
        onChange={handleQrisUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={logoFileRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 2. Section 1: IDENTITAS TOKO & KONTAK */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setOpenIdentity(!openIdentity)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-cyan-50/20 dark:hover:bg-cyan-950/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                IDENTITAS TOKO & KONTAK
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Nama toko di navbar pelanggan dan nomor WhatsApp CS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-bold text-slate-400 dark:text-slate-500">
              {settings.storeName} – WA: {settings.whatsappCS}
            </span>
            {openIdentity ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        {/* Accordion Body */}
        {openIdentity && (
          <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Toko */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Nama Toko (Storefront)
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, storeName: e.target.value }))
                  }
                  placeholder="ArunikaStore"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors"
                />
              </div>

              {/* Nomor WhatsApp CS */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp CS (Format: 628xx)
                </label>
                <input
                  type="text"
                  value={settings.whatsappCS}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, whatsappCS: e.target.value }))
                  }
                  placeholder="6281234567890"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Section 2: PENGATURAN PROMO BANNER WEB PELANGGAN */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs overflow-hidden transition-all">
        {/* Accordion Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between hover:bg-cyan-50/20 dark:hover:bg-cyan-950/10 transition-colors">
          <button
            type="button"
            onClick={() => setOpenPromo(!openPromo)}
            className="flex items-center gap-3.5 flex-1 text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                PENGATURAN PROMO BANNER WEB PELANGGAN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Atur paket promo yang muncul pada banner hero bagian atas website toko
              </p>
            </div>
          </button>

          {/* Right Summary & Toggle Switch */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-xs font-bold text-slate-500 dark:text-slate-400">
              {settings.promo.isActive
                ? `Promo Aktif • ${settings.promo.packageLabel} (${formatRupiah(
                    settings.promo.packagePrice
                  )})`
                : 'Promo Nonaktif'}
            </span>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.promo.isActive}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    promo: { ...prev.promo, isActive: e.target.checked },
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600" />
            </label>

            <button
              onClick={() => setOpenPromo(!openPromo)}
              className="p-1 text-slate-400 cursor-pointer"
            >
              {openPromo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Accordion Body */}
        {openPromo && (
          <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
            {/* Paket Promo Highlight */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                Paket Promo Highlight
              </label>
              <select
                value={settings.promo.packageId || ''}
                onChange={(e) => handlePackageChange(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-400 cursor-pointer"
              >
                <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">
                  -- {availableProducts.length === 0 ? 'Memuat daftar paket...' : 'Pilih Paket Promo Highlight'} --
                </option>
                {availableProducts.map((prod) => (
                  <option
                    key={prod.id}
                    value={String(prod.id)}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium py-1"
                  >
                    {prod.label} Robux ({formatRupiah(prod.price)}) {prod.badge ? `[${prod.badge}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Teks Headline Banner */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                Teks Headline Banner
              </label>
              <input
                type="text"
                value={settings.promo.headline}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    promo: { ...prev.promo, headline: e.target.value },
                  }))
                }
                placeholder="⚡ PROMO FLASH SALE ROBUX HARI INI!"
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors"
              />
            </div>

            {/* Teks Deskripsi Promo */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                Teks Deskripsi Promo
              </label>
              <textarea
                rows={2}
                value={settings.promo.description}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    promo: { ...prev.promo, description: e.target.value },
                  }))
                }
                placeholder="Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!"
                className="w-full p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors resize-none"
              />
            </div>

            {/* Waktu Berakhir Promo (Countdown Timer) */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                Waktu Berakhir Promo (Countdown Timer)
              </label>
              <div
                onClick={() => setIsDatePickerOpen(true)}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-pink-300 dark:hover:border-pink-500/50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-slate-900 dark:text-white">
                      {settings.promo.countdownDate || 'Pilih Waktu Berakhir Promo'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Klik untuk mengatur kalender, tanggal & jam hitung mundur
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDatePickerOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black transition-colors cursor-pointer shadow-md shadow-pink-500/20"
                >
                  ATUR
                </button>
              </div>
            </div>

            {/* Foto / Background Banner Promo */}
            <div className="space-y-2 pt-1">
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Foto / Background Banner Promo (Hero Web Pelanggan)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Upload foto ilustrasi atau background banner promo yang akan muncul pada card promo di header website pelanggan
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Card */}
                <div
                  onClick={() => bannerFileRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-cyan-300/80 dark:border-cyan-800/80 hover:border-cyan-400 bg-cyan-50/30 dark:bg-cyan-950/20 text-center space-y-2 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 mx-auto rounded-2xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                    Upload Foto Banner Promo
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Tarik banner ke sini atau klik browse (PNG / JPG / WEBP)
                  </p>
                </div>

                {/* Preview Card */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden">
                  {settings.promo.bannerImage ? (
                    <div className="relative w-full h-24 rounded-xl overflow-hidden">
                      <img
                        src={settings.promo.bannerImage}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Belum ada foto banner
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Tampilan default background gradient cyan-blue
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Section 3: BARCODE QRIS & LOGO TOKO */}
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs overflow-hidden transition-all">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setOpenQris(!openQris)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-cyan-50/20 dark:hover:bg-cyan-950/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                BARCODE QRIS & LOGO TOKO
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Barcode pembayaran QRIS otomatis dan logo storefront toko
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-bold text-slate-400 dark:text-slate-500">
              QRIS Terpasang • Logo Terpasang
            </span>
            {openQris ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        {/* Accordion Body */}
        {openQris && (
          <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Status Barcode QRIS */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      Status Barcode QRIS
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400">
                      NMID: {settings.qris.nmid}
                    </p>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Terpasang
                  </span>
                </div>

                {/* QRIS Matrix / Preview Box */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-cyan-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-inner">
                  {settings.qris.qrisImage ? (
                    <img
                      src={settings.qris.qrisImage}
                      alt="QRIS Barcode"
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-slate-950 p-2 rounded-xl flex flex-col justify-between items-center text-white text-[9px] font-mono shadow-xs">
                      <div className="w-full flex justify-between">
                        <div className="w-7 h-7 bg-white rounded-xs p-1">
                          <div className="w-full h-full bg-black" />
                        </div>
                        <div className="w-7 h-7 bg-white rounded-xs p-1">
                          <div className="w-full h-full bg-black" />
                        </div>
                      </div>
                      <span className="text-[8px] font-bold tracking-wider text-cyan-300">
                        QRIS ARUNIKA
                      </span>
                      <div className="w-full flex justify-between items-end">
                        <div className="w-7 h-7 bg-white rounded-xs p-1">
                          <div className="w-full h-full bg-black" />
                        </div>
                        <div className="w-5 h-5 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-md flex items-center justify-center text-white text-[8px] font-black">
                          A²
                        </div>
                      </div>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium mt-2">
                    Klik gambar untuk memperbesar QRIS
                  </span>
                </div>

                {/* Ganti Barcode QRIS Button */}
                <button
                  type="button"
                  onClick={() => qrisFileRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-cyan-600 border border-slate-200 dark:border-slate-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Ganti Barcode QRIS</span>
                </button>
              </div>

              {/* Card 2: Status Logo Storefront */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      Status Logo Storefront
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400">
                      /public/logo.png
                    </p>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Terpasang
                  </span>
                </div>

                {/* Logo Preview Box */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-cyan-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-inner">
                  <div className="w-28 h-28 relative rounded-2xl bg-slate-950 p-2 flex items-center justify-center shadow-md">
                    <Image
                      src={settings.logo.logoPath}
                      alt="Logo Storefront"
                      width={80}
                      height={80}
                      className="object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-2">
                    Klik gambar untuk memperbesar Logo
                  </span>
                </div>

                {/* Ganti Logo Storefront Button */}
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-cyan-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-cyan-600 border border-slate-200 dark:border-slate-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Ganti Logo Storefront</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Bottom Save All Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
        </button>
      </div>

      {/* Promo Date & Time Picker Modal */}
      <PromoDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        currentValue={settings.promo.countdownDate}
        onSave={(newDate) =>
          setSettings((prev) => ({
            ...prev,
            promo: { ...prev.promo, countdownDate: newDate },
          }))
        }
      />
    </div>
  );
}

