'use client';

import { X, BookOpen } from 'lucide-react';
import { ArunikaSparkle } from './ArunikaIcons';

interface CaraOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaraOrderModal({ isOpen, onClose }: CaraOrderModalProps) {
  if (!isOpen) return null;

  const steps = [
    {
      step: '1',
      title: 'Masukkan Username Roblox',
      desc: 'Ketik username akun Roblox kamu di langkah 1, lalu klik "Cek Akun" untuk verifikasi status avatar.',
    },
    {
      step: '2',
      title: 'Pilih Paket Nominal Robux',
      desc: 'Tentukan jumlah Robux yang kamu inginkan, dari paket hemat 1.800 Robux sampai Paket Sultan 30.500 Robux.',
    },
    {
      step: '3',
      title: 'Tentukan Metode Pembayaran',
      desc: 'Gunakan QRIS otomatis (semua Bank & E-Wallet) atau via WhatsApp dibantu Admin jika butuh bimbingan.',
    },
    {
      step: '4',
      title: 'Selesaikan Pembayaran & Konfirmasi',
      desc: 'Lakukan transfer sesuai nominal pesanan. Sistem otomatis Arunika Store akan memproses pengiriman dalam 5-10 menit.',
    },
    {
      step: '5',
      title: 'Robux Sukses Masuk ke Akun',
      desc: 'Cek saldo akun Roblox kamu. Nikmati Robux legal dan aman 100% tanpa risiko rollback!',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 border-2 border-cyan-200 dark:border-cyan-500/30 transition-colors duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Panduan Cara Order
              </h3>
              <ArunikaSparkle className="w-4 h-4" color="cyan" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Ikuti 5 langkah mudah top up Robux di Arunika Store
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3.5">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="w-7 h-7 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                {item.step}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Note */}
        <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-500/40 text-xs text-cyan-950 dark:text-cyan-300 flex items-start gap-2.5 font-medium">
          <ArunikaSparkle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" color="cyan" />
          <span>
            <strong>Keamanan 100% Terjamin:</strong> Arunika Store TIDAK PERNAH meminta password
            atau PIN akun Roblox kamu.
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl btn-arunika-primary text-white font-black text-sm cursor-pointer"
        >
          Saya Mengerti, Mulai Pesan
        </button>
      </div>
    </div>
  );
}
