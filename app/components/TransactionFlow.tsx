'use client';

import { UserCheck, ShoppingBag, CreditCard, Sparkles } from 'lucide-react';
import { ArunikaSparkle } from './ArunikaIcons';

export default function TransactionFlow() {
  const steps = [
    {
      num: '01',
      title: 'Isi Data Akun',
      desc: 'Masukkan username Roblox tanpa password.',
      icon: UserCheck,
      iconColor: 'text-cyan-500',
      border: 'border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/50',
    },
    {
      num: '02',
      title: 'Pilih Nominal',
      desc: 'Tentukan jumlah Robux yang diinginkan.',
      icon: ShoppingBag,
      iconColor: 'text-blue-500',
      border: 'border-blue-200 dark:border-blue-500/30 hover:border-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      num: '03',
      title: 'Bayar Pesanan',
      desc: 'Pilih QRIS atau WhatsApp otomatis.',
      icon: CreditCard,
      iconColor: 'text-sky-500',
      border: 'border-sky-200 dark:border-sky-500/30 hover:border-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/50',
    },
    {
      num: '04',
      title: 'Robux Masuk',
      desc: 'Proses kilat 5-10 menit langsung beres!',
      icon: Sparkles,
      iconColor: 'text-teal-500',
      border: 'border-teal-200 dark:border-teal-500/30 hover:border-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/50',
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Pill header */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-cyan-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-cyan-300 border-2 border-cyan-200 dark:border-cyan-500/30 shadow-sm">
          <ArunikaSparkle className="w-3.5 h-3.5" color="cyan" />
          <span>ALUR TRANSAKSI MUDAH & CEPAT</span>
          <ArunikaSparkle className="w-3.5 h-3.5" color="cyan" />
        </span>
      </div>

      {/* Grid of 4 steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className={`relative p-5 rounded-3xl bg-white dark:bg-slate-900/90 border-2 ${step.border} shadow-sm flex flex-col justify-between space-y-3.5 group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${step.bg}`}
                >
                  <Icon className={`w-5 h-5 ${step.iconColor}`} />
                </div>
                <span className="text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-cyan-300 dark:group-hover:text-cyan-400 transition-colors font-mono">
                  {step.num}
                </span>
              </div>

              <div>
                <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
