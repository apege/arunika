'use client';

import { useState, useEffect } from 'react';
import { HardDrive, CheckCircle2, Download, Loader2, AlertTriangle } from 'lucide-react';

export default function StorageManagerBar() {
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [expiringCount, setExpiringCount] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/storage')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (typeof data.activeProofsCount === 'number') {
            setActiveCount(data.activeProofsCount);
          }
          if (typeof data.expiringSoonCount === 'number') {
            setExpiringCount(data.expiringSoonCount);
          }
        }
      })
      .catch((err) => console.error('Failed to load storage info:', err));
  }, []);

  const handleDownloadZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch('/api/admin/storage/download');
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        alert(errJson.error || 'Gagal mengunduh cadangan bukti transfer.');
        setIsDownloading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.download = `backup_bukti_transfer_arunika_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Download error:', err);
      alert('Terjadi kesalahan saat mengunduh file cadangan.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-pink-100 dark:border-pink-950/50 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
      {/* Left: Info & Badges */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-pink-600 dark:text-pink-400 shrink-0" />
          <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
            Manajemen Storage Database:
          </span>
        </div>

        {/* Badge 1: Active Proof Count */}
        <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/60 shadow-2xs">
          {activeCount !== null ? `${activeCount} Bukti Aktif Tersimpan` : 'Memuat data...'}
        </span>

        {/* Badge 2: Auto Cleanup 90 Days */}
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Auto-Cleanup 90 Hari Aktif</span>
        </span>

        {/* Badge 3: Expiring Soon Alert */}
        {expiringCount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs inline-flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{expiringCount} bukti segera dihapus (&lt; 10 hari)</span>
          </span>
        )}
      </div>

      {/* Right: Download ZIP Action Button */}
      <button
        type="button"
        onClick={handleDownloadZip}
        disabled={isDownloading || activeCount === 0}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-pink-600 dark:text-pink-400 border-2 border-pink-200 dark:border-pink-900/60 hover:border-pink-400 text-xs sm:text-sm font-black shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
            <span>Membuat File ZIP...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-pink-500" />
            <span>Cadangkan Bukti Transfer (ZIP)</span>
          </>
        )}
      </button>
    </div>
  );
}
