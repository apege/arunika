import Image from 'next/image';
import { ShieldCheck, MessageCircle } from 'lucide-react';
import { ArunikaSparkle } from './ArunikaIcons';
import { StoreSettings } from '../admin/data/adminSettings';

interface FooterProps {
  settings?: StoreSettings | null;
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const rawStoreName = settings?.storeName || 'ArunikaStore';
  const logoSrc = settings?.logo?.logoPath || '/logo.png';
  const cleanPhone = (settings?.whatsappCS || '6281234567890').replace(/[^0-9]/g, '');

  return (
    <footer className="w-full bg-white dark:bg-[#060911] border-t-2 border-cyan-100/90 dark:border-cyan-500/20 pt-12 pb-28 sm:pb-12 text-slate-600 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-fuchsia-500 shadow-md shadow-cyan-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center p-1 relative">
                  <Image
                    src={logoSrc}
                    alt={`${rawStoreName} Logo`}
                    width={42}
                    height={42}
                    className="object-contain drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                    {rawStoreName}
                  </span>
                  <ArunikaSparkle className="w-3.5 h-3.5" color="cyan" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Top Up Robux Resmi & Legal
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md font-medium">
              Arunika Store adalah platform penyedia layanan top up Robux legal, instan dan
              terpercaya di Indonesia. Proses kilat otomatis hanya 5-10 menit dengan jaminan
              garansi 100% uang kembali.
            </p>

            <div className="flex items-center gap-2 text-xs font-black text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>100% Legal, Aman & Tanpa Password</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <ArunikaSparkle className="w-3 h-3" color="cyan" />
              <span>Navigasi Cepat</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-bold">
              <li>
                <a
                  href="#pricelist"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Pricelist Robux
                </a>
              </li>
              <li>
                <a
                  href="#testimoni"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Testimoni Pembeli
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp CS 24/7</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods Info */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <ArunikaSparkle className="w-3 h-3" color="cyan" />
              <span>Metode Pembayaran</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Mendukung QRIS, Bank Transfer (BCA, Mandiri, BRI, BNI), dan E-Wallet (DANA, OVO,
              GoPay, ShopeePay).
            </p>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left font-medium">
          <p>© {currentYear} Arunika Store (Anggie Arunika). All rights reserved.</p>
          <div className="flex items-center gap-1.5 font-bold">
            <span>Powered by</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Arunika Cyber Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
