'use client';

import { CreditCard, MessageCircle, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { ArunikaBadgeStep, ArunikaSparkle } from './ArunikaIcons';

export type PaymentMethod = 'qris' | 'whatsapp';

interface Step3PaymentProps {
  paymentMethod: PaymentMethod;
  onChangePaymentMethod: (method: PaymentMethod) => void;
}

export default function Step3Payment({
  paymentMethod,
  onChangePaymentMethod,
}: Step3PaymentProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-900/90 rounded-3xl sm:rounded-[32px] border-2 border-cyan-100/90 dark:border-cyan-500/20 shadow-sm p-6 sm:p-8 space-y-6 transition-colors duration-300">
      {/* Step Header */}
      <div className="flex items-start gap-4">
        <ArunikaBadgeStep number="3" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Pilih Pembayaran
            </h2>
            <ArunikaSparkle className="w-4 h-4" color="cyan" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Pilih metode pembayaran yang paling nyaman untuk Anda
          </p>
        </div>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {/* Method 1: QRIS Website */}
        <div
          onClick={() => onChangePaymentMethod('qris')}
          className={`relative p-5.5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            paymentMethod === 'qris'
              ? 'bg-gradient-to-br from-cyan-50/50 via-white to-sky-50/40 dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-950 border-cyan-400 ring-2 ring-cyan-300/40 dark:ring-cyan-500/40 shadow-lg shadow-cyan-400/15'
              : 'bg-white dark:bg-slate-950/80 border-slate-200/90 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/40'
          }`}
        >
          <div className="space-y-3">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Pembayaran via Website
                  </h3>
                  <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
                    Scan QRIS & Upload Bukti
                  </span>
                </div>
              </div>

              {/* Selection Checkmark */}
              <div
                className={`w-7 h-7 rounded-2xl flex items-center justify-center ${
                  paymentMethod === 'qris'
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Scan barcode QRIS (BCA, Mandiri, BRI, DANA, GoPay, OVO, ShopeePay) lalu upload bukti
              transfer langsung di website.
            </p>
          </div>

          {/* Bottom Tags */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-cyan-600 dark:text-cyan-400">
              <Zap className="w-3.5 h-3.5 fill-current text-cyan-500" />
              Verifikasi Otomatis
            </span>
            <span
              className={`text-xs font-black ${
                paymentMethod === 'qris'
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {paymentMethod === 'qris' ? 'Dipilih' : 'Pilih'}
            </span>
          </div>
        </div>

        {/* Method 2: WhatsApp Admin */}
        <div
          onClick={() => onChangePaymentMethod('whatsapp')}
          className={`relative p-5.5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            paymentMethod === 'whatsapp'
              ? 'bg-gradient-to-br from-emerald-50/40 via-white to-cyan-50/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 border-emerald-400 ring-2 ring-emerald-300/40 dark:ring-emerald-500/40 shadow-lg shadow-emerald-400/15'
              : 'bg-white dark:bg-slate-950/80 border-slate-200/90 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/40'
          }`}
        >
          <div className="space-y-3">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Pembayaran via WhatsApp
                  </h3>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    Chat Langsung dengan Admin
                  </span>
                </div>
              </div>

              {/* Selection Checkmark */}
              <div
                className={`w-7 h-7 rounded-2xl flex items-center justify-center ${
                  paymentMethod === 'whatsapp'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Pesan langsung melalui WhatsApp resmi Arunika Store dengan format pesanan instan,
              dibantu langsung oleh admin sampai selesai.
            </p>
          </div>

          {/* Bottom Tags */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Fast Respon 24 Jam
            </span>
            <span
              className={`text-xs font-black ${
                paymentMethod === 'whatsapp'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {paymentMethod === 'whatsapp' ? 'Dipilih' : 'Pilih'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
