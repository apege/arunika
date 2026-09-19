'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';

interface ActivationData {
  username: string;
  orderCode: string;
  robuxNominal: string;
  activationFee: number;
  isActivated: boolean;
  activatedAt?: string;
}

const DEFAULT_ACTIVATION: ActivationData = {
  username: 'erewfrwfw',
  orderCode: 'ARK43311327',
  robuxNominal: '1.700 Robux',
  activationFee: 97000,
  isActivated: false,
};

const STORAGE_KEY = 'arunika_roblox_activation_v1';

export default function RobloxActivationCard() {
  const [data, setData] = useState<ActivationData>(DEFAULT_ACTIVATION);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch {
      setData(DEFAULT_ACTIVATION);
    }
  }, []);

  const saveActivation = (updated: ActivationData) => {
    setData(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save activation state:', err);
    }
  };

  const handleClickAction = () => {
    if (!data.username.trim()) {
      setSuccessToast('Silakan masukkan username Roblox terlebih dahulu.');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    // If currently not activated, open the Confirmation Modal first!
    if (!data.isActivated) {
      setIsConfirmModalOpen(true);
    } else {
      // Direct deactivation toggle
      handleConfirmActivation();
    }
  };

  const handleConfirmActivation = () => {
    setIsConfirmModalOpen(false);
    setIsProcessing(true);
    setTimeout(() => {
      const nextState = !data.isActivated;
      const updated: ActivationData = {
        ...data,
        isActivated: nextState,
        activatedAt: nextState ? new Date().toLocaleTimeString('id-ID') : undefined,
      };
      saveActivation(updated);
      setIsProcessing(false);
      setSuccessToast(
        nextState
          ? `ID @${data.username} BERHASIL DIAKTIFKAN!`
          : `ID @${data.username} telah dinonaktifkan.`
      );
      setTimeout(() => setSuccessToast(null), 3000);
    }, 300);
  };

  const handleUsernameChange = (val: string) => {
    const cleanUser = val.replace(/^@/, '');
    const updated: ActivationData = {
      ...data,
      username: cleanUser,
      isActivated: false,
    };
    saveActivation(updated);
  };

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  return (
    <div className="relative">
      {/* Toast Notification */}
      {successToast && (
        <div className="mb-3 p-3.5 rounded-2xl bg-cyan-500 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-cyan-500/25 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{successToast}</span>
          </div>
        </div>
      )}

      {/* Main Activation Card Container */}
      <div
        className={`relative overflow-hidden rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 transition-all duration-300 border-2 ${
          data.isActivated
            ? 'bg-gradient-to-br from-[#061224] via-[#081b33] to-[#040a14] border-cyan-400/50 shadow-2xl shadow-cyan-500/15'
            : 'bg-gradient-to-br from-[#080d1a] via-[#0d1629] to-[#050811] border-amber-500/40 dark:border-cyan-500/30 shadow-2xl shadow-cyan-950/30'
        }`}
      >
        {/* Ambient Neon Background Glow */}
        <div
          className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            data.isActivated ? 'bg-cyan-500/15' : 'bg-amber-500/10'
          }`}
        />
        <div
          className={`absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
            data.isActivated ? 'bg-blue-600/15' : 'bg-cyan-500/5'
          }`}
        />

        <div className="relative z-10 space-y-5">
          {/* 1. Centered Header */}
          <div className="text-center space-y-1.5">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black tracking-widest uppercase border ${
                data.isActivated
                  ? 'bg-cyan-950/70 border-cyan-400/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
              }`}
            >
              {data.isActivated ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>STATUS TERAKTIVASI</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>PERINGATAN SISTEM</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                </>
              )}
            </div>

            <h2
              className={`text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wider font-mono ${
                data.isActivated
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-sky-400 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-100 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              }`}
            >
              {data.isActivated ? 'ID ROBLOX SUDAH AKTIF' : 'ID ROBLOX BELUM AKTIF'}
            </h2>
          </div>

          {/* 2. Perfectly Centered & Aligned Username Input Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-inner flex items-center justify-center">
            <div className="flex items-center justify-center gap-3 w-full max-w-md">
              <label
                htmlFor="roblox-username-input"
                className="text-xs sm:text-sm font-mono font-black text-slate-400 uppercase tracking-wider shrink-0 select-none"
              >
                USERNAME :
              </label>

              {/* Direct Username Input Field */}
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-cyan-400 select-none pointer-events-none">
                  @
                </span>
                <input
                  id="roblox-username-input"
                  type="text"
                  value={data.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Ketik username Roblox..."
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-cyan-500/40 focus:border-cyan-400 rounded-xl text-xs sm:text-sm text-white font-bold placeholder-slate-500 focus:outline-hidden transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* 3. Middle 2 Cards (Aktivasi Diperlukan + Biaya) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card 1: AKTIVASI DIPERLUKAN */}
            <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    data.isActivated
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50'
                      : 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {data.isActivated ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  {data.isActivated ? 'ID BERHASIL TERAKTIVASI' : 'AKTIVASI DIPERLUKAN'}
                </h4>
              </div>

              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                {data.isActivated ? (
                  <>
                    ID Roblox pada order akun{' '}
                    <strong className="text-cyan-300 font-bold">@{data.username}</strong> telah aktif dan
                    terverifikasi legal. Transaksi pengiriman Robux dapat segera dilanjutkan.
                  </>
                ) : (
                  <>
                    ID Roblox pada order akun{' '}
                    <strong className="text-amber-400 font-bold">@{data.username || '...'}</strong> belum aktif di server.
                    Silakan aktifkan ID terlebih dahulu untuk melanjutkan proses pengiriman Robux.
                  </>
                )}
              </p>
            </div>

            {/* Card 2: BIAYA PENGAKTIFAN ID */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-center items-center text-center space-y-1">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                BIAYA PENGAKTIFAN ID
              </span>
              <div
                className={`text-xl sm:text-2xl font-black ${
                  data.isActivated
                    ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                }`}
              >
                {formatRupiah(data.activationFee)}
              </div>
            </div>
          </div>

          {/* 4. Catatan Admin Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/70 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              <strong className="text-white font-bold">Catatan Admin:</strong> Setelah ID @
              {data.username || 'user'} diaktifkan, order dapat langsung diproses seperti biasa.
            </p>
          </div>

          {/* 5. Main Action Button */}
          <button
            type="button"
            onClick={handleClickAction}
            disabled={isProcessing}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
              data.isActivated
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-emerald-600/25 border border-emerald-400/40'
                : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white shadow-cyan-500/30 border border-cyan-400/40 hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <span>Memproses Status...</span>
            ) : data.isActivated ? (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>
                  ID @{data.username ? data.username.toUpperCase() : 'USER'} SUDAH AKTIF (KLIK UNTUK
                  NONAKTIFKAN)
                </span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>
                  AKTIFKAN ID @{data.username ? data.username.toUpperCase() : 'USER'} SEKARANG
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal (Matching the uploaded reference) */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0b1329] text-slate-900 dark:text-slate-100 rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-cyan-100 dark:border-cyan-500/30 text-center animate-in zoom-in-95 duration-200">
            {/* Center Glowing Icon */}
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-500/30 text-cyan-500 dark:text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/15">
              <Zap className="w-8 h-8 fill-current stroke-[1.5]" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Konfirmasi Pengaktifan ID
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Lakukan pengaktifan ID Roblox untuk akun{' '}
                <strong className="text-cyan-600 dark:text-cyan-300 font-extrabold">
                  @{data.username}
                </strong>{' '}
                dengan biaya{' '}
                <strong className="text-slate-900 dark:text-white font-black">
                  {formatRupiah(data.activationFee)}
                </strong>
                ?
              </p>
            </div>

            {/* Modal Action Buttons: Kembali & Ya, Aktifkan */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmActivation}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                Ya, Aktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
