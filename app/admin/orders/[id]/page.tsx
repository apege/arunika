'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  CreditCard,
  User,
  Users,
  FileText,
  Save,
  Star,
  Package,
  PenLine,
} from 'lucide-react';
import { generateReviewToken } from '../../../data/reviewToken';
import { DbOrder, OrderStatus } from '../../../../types/database';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [order, setOrder] = useState<DbOrder | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
        setAdminNote(json.data.admin_notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch order detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm font-bold text-slate-400">
        Memuat detail pesanan #{orderId}...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Order Masuk</span>
        </Link>
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-300 font-bold">
            Pesanan #{orderId} tidak ditemukan di database Supabase.
          </p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.order_code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: newStatus,
          payment_status: newStatus === 'completed' ? 'paid' : order.payment_status,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
        window.dispatchEvent(new Event('order_updated'));
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${order.order_code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNote }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setOrder(json.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save admin notes:', err);
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const formatRupiah = (val: number) => 'Rp ' + Number(val || 0).toLocaleString('id-ID');

  const cleanWaNumber = (order.customer_phone || '').replace(/[^0-9]/g, '');
  const customerWaUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    `Halo kak @${order.roblox_username}, kami dari Admin Arunika Store mengenai pesanan Robux #${order.order_code}.`
  )}`;

  const reviewToken = generateReviewToken(order.order_code);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://arunikastore.com';
  const reviewUrl = `${baseUrl}/?token=${reviewToken}#testimoni`;

  const customerReviewWaUrl = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    `Halo kak @${order.roblox_username}! Pesanan Robux #${order.order_code} (${Number(
      order.robux
    ).toLocaleString('id-ID')} Robux) di Arunika Store sudah selesai ya kak ✨\n\nBoleh minta tolong luangkan waktu sebentar untuk memberikan ulasan/testimoni di toko kami? \n👉 Link Ulasan: ${reviewUrl}\n\nTerima kasih banyak atas kepercayaannya!`
  )}`;

  const robloxProfileUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(
    order.roblox_username
  )}`;

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
      }) + ' WIB'
    : 'Waktu tidak tersedia';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Link */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Order Masuk</span>
      </Link>

      {/* Page Title & Status */}
      <div className="space-y-1">
        <div className="flex items-center gap-3.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            ORDER #{order.order_code}
          </h1>

          {/* Status Badge */}
          {order.order_status === 'pending' && (
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
              Menunggu Pembayaran
            </span>
          )}
          {order.order_status === 'processing' && (
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400">
              Sedang Diproses
            </span>
          )}
          {order.order_status === 'completed' && (
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
              Selesai
            </span>
          )}
          {order.order_status === 'cancelled' && (
            <span className="text-xs font-black px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400">
              Dibatalkan
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {formattedDate}
        </p>
      </div>

      {/* Quick Action Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          UBAH STATUS CEPAT:
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Proses Pesanan Button */}
          <button
            onClick={() => handleStatusChange('processing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              order.order_status === 'processing'
                ? 'bg-cyan-500 text-white shadow-xs'
                : 'bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
            }`}
          >
            Proses Pesanan
          </button>

          {/* Selesaikan Order Button */}
          <button
            onClick={() => handleStatusChange('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              order.order_status === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            Selesaikan Order
          </button>

          {/* Batalkan Button */}
          <button
            onClick={() => handleStatusChange('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              order.order_status === 'cancelled'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            Batalkan
          </button>

          {/* Kirim Link Review Button (if completed) */}
          {order.order_status === 'completed' && (
            <a
              href={customerReviewWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all hover:scale-102 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>Kirim Link Review</span>
            </a>
          )}

          {/* WhatsApp Direct Chat Button */}
          <a
            href={customerWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all hover:scale-102 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Chat Pelanggan</span>
          </a>
        </div>
      </div>

      {/* Card 1: DETAIL PESANAN */}
      <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-center text-pink-500 shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            DETAIL PESANAN
          </h3>
        </div>

        {/* Table-like Header */}
        <div className="flex justify-between items-center text-[11px] font-black tracking-wider text-slate-400 dark:text-slate-500 uppercase px-1">
          <span>PRODUK</span>
          <span>HARGA</span>
        </div>

        {/* Product Row */}
        <div className="flex justify-between items-center py-1 px-1">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-200/80 dark:border-cyan-400/30 flex items-center justify-center p-1 shrink-0 shadow-xs">
              <Image src="/robux.webp" alt="Robux" width={20} height={20} className="object-contain" />
            </div>
            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
              {Number(order.robux).toLocaleString('id-ID')} Robux
            </span>
          </div>
          <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
            {formatRupiah(order.price)}
          </span>
        </div>

        {/* Metode Pembayaran */}
        <div className="flex justify-between items-center py-2 px-1 text-xs sm:text-sm">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Metode Pembayaran</span>
          <span className="text-[11px] font-black px-3.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 uppercase">
            {order.payment_method || 'WEBSITE'}
          </span>
        </div>

        {/* Total Pembayaran */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-1">
          <span className="text-xs sm:text-sm font-black uppercase text-pink-600 dark:text-pink-400 tracking-wider">
            TOTAL PEMBAYARAN
          </span>
          <span className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400">
            {formatRupiah(order.price)}
          </span>
        </div>

        {/* Box: Foto Bukti Transfer Pembeli */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Foto Bukti Transfer Pembeli
              </span>
            </div>
            {order.payment_proof_path ? (
              <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                Terlampir
              </span>
            ) : (
              <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                Belum Terlampir
              </span>
            )}
          </div>

          {order.payment_proof_path ? (
            <div className="space-y-2">
              <div
                onClick={() => window.open(order.payment_proof_path!, '_blank')}
                className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden bg-slate-950/90 border border-slate-800/80 p-3 sm:p-4 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group"
              >
                <img
                  src={order.payment_proof_path}
                  alt="Bukti Transfer Pembeli"
                  className="max-h-80 sm:max-h-96 w-auto object-contain rounded-xl group-hover:scale-101 transition-transform"
                />
              </div>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                Klik foto di atas untuk memperbesar bukti pembayaran
              </p>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 italic">
              Tidak ada foto bukti transfer terlampir untuk pesanan ini.
            </div>
          )}
        </div>
      </div>

      {/* Card 2: INFORMASI PELANGGAN */}
      <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-center text-pink-500 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            INFORMASI PELANGGAN
          </h3>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Username Roblox */}
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Username</span>
            <a
              href={robloxProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-black text-pink-600 dark:text-pink-400 hover:underline"
            >
              <span>@{order.roblox_username}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* User ID Roblox */}
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400 font-medium">User ID Roblox</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {order.roblox_user_id || '-'}
              </span>
              {order.roblox_user_id && (
                <button
                  onClick={() => handleCopy(order.roblox_user_id!, 'roblox_id')}
                  className="p-1 text-slate-400 hover:text-cyan-600 cursor-pointer"
                  title="Copy ID"
                >
                  {copiedField === 'roblox_id' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* No. WhatsApp */}
          <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400 font-medium">No. WhatsApp</span>
            <div className="flex items-center gap-1.5">
              <a
                href={customerWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{order.customer_phone.startsWith('+') ? order.customer_phone : `+${order.customer_phone}`}</span>
              </a>
              <button
                onClick={() => handleCopy(order.customer_phone, 'whatsapp')}
                className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                title="Copy WhatsApp"
              >
                {copiedField === 'whatsapp' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Catatan Pelanggan */}
          <div className="flex justify-between items-start pt-1">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Catatan Pelanggan</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 text-right max-w-xs whitespace-pre-line">
              {order.customer_notes || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: CATATAN ADMIN */}
      <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/50 border border-pink-200/80 dark:border-pink-800/60 flex items-center justify-center text-pink-500 shrink-0">
            <PenLine className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            CATATAN ADMIN
          </h3>
        </div>

        <div className="space-y-4">
          <textarea
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Tulis catatan untuk order ini (hanya admin)..."
            className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-pink-400 transition-colors"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={handleSaveNotes}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>

            {saveSuccess && (
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Catatan berhasil disimpan ke Supabase!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
