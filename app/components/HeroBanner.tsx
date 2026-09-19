'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Clock,
  ArrowRight,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ArunikaSparkle } from './ArunikaIcons';
import { StoreSettings } from '../admin/data/adminSettings';
import { Product } from '../data/products';

interface HeroBannerProps {
  onSelectPromo: () => void;
  settings?: StoreSettings | null;
  promoProduct?: Product | null;
}

export default function HeroBanner({ onSelectPromo, settings, promoProduct }: HeroBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 11,
    hours: 18,
    minutes: 34,
    seconds: 57,
  });

  const promoConfig = settings?.promo;
  const isPromoActive = promoConfig?.isActive !== false;
  const customBanner = promoConfig?.bannerImage || null;
  const headline = promoConfig?.headline || 'DAPATKAN DISKON & PROMO SPESIAL ROBUX';
  const description =
    promoConfig?.description ||
    'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Otomatis Masuk ke Akun Roblox!';
  const packageLabel =
    promoConfig?.packageLabel || (promoProduct ? `${promoProduct.label} Robux` : '2.400 Robux');
  const packagePrice = promoConfig?.packagePrice || promoProduct?.price || 45000;
  const normalPrice = Math.round(packagePrice * 1.25);

  const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');

  const MONTH_MAP: Record<string, number> = {
    januari: 0,
    februari: 1,
    maret: 2,
    april: 3,
    mei: 4,
    juni: 5,
    juli: 6,
    agustus: 7,
    september: 8,
    oktober: 9,
    november: 10,
    desember: 11,
  };

  useEffect(() => {
    let targetDate: Date | null = null;
    if (promoConfig?.countdownDate) {
      const match = promoConfig.countdownDate.match(
        /(\d+)\s+([A-Za-z]+)\s+(\d{4})\s*•?\s*(\d{1,2})?:?(\d{1,2})?/
      );
      if (match) {
        const day = parseInt(match[1], 10);
        const mKey = match[2].toLowerCase();
        const year = parseInt(match[3], 10);
        const hour = match[4] ? parseInt(match[4], 10) : 23;
        const min = match[5] ? parseInt(match[5], 10) : 59;
        if (MONTH_MAP[mKey] !== undefined) {
          targetDate = new Date(year, MONTH_MAP[mKey], day, hour, min, 0);
        }
      }
    }

    const calculateTime = () => {
      if (targetDate) {
        const diff = targetDate.getTime() - Date.now();
        if (diff > 0) {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          });
          return;
        }
      }

      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [promoConfig?.countdownDate]);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="relative w-full rounded-3xl sm:rounded-[36px] overflow-hidden border-2 border-cyan-400/40 dark:border-cyan-500/30 shadow-2xl shadow-cyan-950/40 bg-slate-950 text-white">
      {/* Background Banner Image (If Admin uploaded one) */}
      {customBanner ? (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={customBanner}
            alt="Hero Banner Background"
            fill
            className="object-cover object-center opacity-60"
            priority
            unoptimized
          />
          {/* Multi-layer Dark Gradient for high readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/75 backdrop-blur-[1.5px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
        </div>
      ) : (
        /* Fallback Cyber Background */
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-[#071329] to-slate-950">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#00e5ff12_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        </div>
      )}

      {/* Decorative Sparkles */}
      <div className="absolute top-6 right-1/3 animate-twinkle pointer-events-none opacity-60">
        <ArunikaSparkle className="w-7 h-7" color="cyan" />
      </div>
      <div className="absolute bottom-10 left-1/4 animate-twinkle [animation-delay:1.5s] pointer-events-none opacity-60">
        <ArunikaSparkle className="w-8 h-8" color="cyan" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Side: Headline, Description, Price & CTA */}
          <div className="lg:col-span-7 space-y-5 text-center sm:text-left">
            {/* Promo Badge Pill */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-red-500/25 animate-pulse uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SCROLL LIHAT STOCK LAINNYA!</span>
              </span>
              {isPromoActive && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-cyan-950/80 text-cyan-300 border border-cyan-400/40">
                  <ArunikaSparkle className="w-3 h-3" color="cyan" />
                  <span>PROMO TERBATAS</span>
                </span>
              )}
            </div>

            {/* Headline Title */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase leading-tight drop-shadow-md">
                {headline}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium max-w-xl leading-relaxed">
                {description}
              </p>
            </div>

            {/* Promo Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-cyan-400/30 backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0 rounded-2xl bg-slate-950 p-1 flex items-center justify-center border border-cyan-400/50 shadow-inner">
                  <Image
                    src="/robux.webp"
                    alt="Robux Icon"
                    width={38}
                    height={38}
                    className="object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                  />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {packageLabel}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    {formatRupiah(normalPrice)} (Harga Normal)
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">
                  HARGA PROMO
                </span>
                <span className="text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
                  {formatRupiah(packagePrice)}
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3.5">
              <button
                onClick={onSelectPromo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span>Beli Robux Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#testimoni"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-extrabold text-sm sm:text-base border border-slate-700 hover:border-cyan-400 shadow-md transition-all active:scale-98"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Lihat Testimoni</span>
              </a>
            </div>
          </div>

          {/* Right Side: Countdown Card & Guarantee Box */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-cyan-400/40 shadow-xl shadow-cyan-950/50 space-y-5">
              {/* Header with Clock */}
              <div className="flex items-center justify-center gap-2 text-xs font-black tracking-wider text-slate-200 uppercase">
                <Clock className="w-4 h-4 text-rose-400 animate-spin-slow" />
                <span className="text-rose-400">PROMO BERAKHIR DALAM</span>
              </div>

              {/* 4 Countdown Blocks */}
              <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                {[
                  { label: 'HARI', val: formatNumber(timeLeft.days) },
                  { label: 'JAM', val: formatNumber(timeLeft.hours) },
                  { label: 'MENIT', val: formatNumber(timeLeft.minutes) },
                  { label: 'DETIK', val: formatNumber(timeLeft.seconds), pulse: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner"
                  >
                    <span
                      className={`text-xl sm:text-2xl font-black font-mono text-white ${
                        item.pulse ? 'animate-pulse text-cyan-300' : ''
                      }`}
                    >
                      {item.val}
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Guarantee Box */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 shadow-md">
                <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xs">
                  <Image
                    src={settings?.logo?.logoPath || '/logo.png'}
                    alt="Logo Toko"
                    width={36}
                    height={36}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    Garansi Proses Kilat
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium truncate">
                    Langsung otomatis masuk ke akun Roblox kamu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

