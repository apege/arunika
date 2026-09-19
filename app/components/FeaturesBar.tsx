'use client';

import { Zap, ShieldCheck, UserCheck, Headphones, Award } from 'lucide-react';

export default function FeaturesBar() {
  const features = [
    {
      icon: Zap,
      title: 'Proses Cepat',
      desc: '5 - 10 Menit Beres',
      iconColor: 'text-cyan-500',
      borderGlow: 'border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-400',
      bg: 'bg-cyan-50/70 dark:bg-cyan-950/50',
    },
    {
      icon: ShieldCheck,
      title: 'Pembayaran Aman',
      desc: 'Legal & Terpercaya',
      iconColor: 'text-blue-500',
      borderGlow: 'border-blue-200 dark:border-blue-500/30 hover:border-blue-400',
      bg: 'bg-blue-50/70 dark:bg-blue-950/50',
    },
    {
      icon: UserCheck,
      title: 'Hanya Username',
      desc: 'Tanpa Password Akun',
      iconColor: 'text-sky-500',
      borderGlow: 'border-sky-200 dark:border-sky-500/30 hover:border-sky-400',
      bg: 'bg-sky-50/70 dark:bg-sky-950/50',
    },
    {
      icon: Headphones,
      title: 'Fast Respon 24/7',
      desc: 'Admin Ramah & Sigap',
      iconColor: 'text-teal-500',
      borderGlow: 'border-teal-200 dark:border-teal-500/30 hover:border-teal-400',
      bg: 'bg-teal-50/70 dark:bg-teal-950/50',
    },
    {
      icon: Award,
      title: 'Garansi 100%',
      desc: 'Uang Kembali Jika Gagal',
      iconColor: 'text-emerald-500',
      borderGlow: 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/50',
    },
  ];

  // Duplicate for seamless infinite loop on mobile
  const marqueeFeatures = [...features, ...features];

  return (
    <div className="w-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border-2 border-cyan-100 dark:border-cyan-500/20 shadow-sm overflow-hidden p-3.5 sm:p-5 transition-colors duration-300">
      
      {/* Mobile View: Smooth Auto-Scrolling Marquee Slider */}
      <div className="block sm:hidden relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex items-center gap-3 py-1">
          {marqueeFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-950/90 border-2 ${item.borderGlow} shadow-2xs`}
              >
                <div
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${item.bg}`}
                >
                  <Icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop / Tablet View: Grid Layout */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border-2 ${item.borderGlow} transition-all duration-200 shadow-2xs`}
            >
              <div
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border ${item.bg}`}
              >
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {item.title}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {item.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
