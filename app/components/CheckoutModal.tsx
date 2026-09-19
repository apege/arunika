'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Check,
  Copy,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Phone,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { Product } from '../data/products';
import { CartItem } from './CartModal';
import { PaymentMethod } from './Step3Payment';
import { ArunikaSparkle } from './ArunikaIcons';
import { compressImageToWebP } from '../../lib/imageCompressor';
import { StoreSettings } from '../admin/data/adminSettings';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  robloxUserId?: string | number | null;
  selectedProduct?: Product | null;
  cartItems?: CartItem[];
  paymentMethod: PaymentMethod;
  settings?: StoreSettings | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  username,
  robloxUserId,
  selectedProduct,
  cartItems = [],
  paymentMethod,
  settings,
}: CheckoutModalProps) {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderCode, setOrderCode] = useState('ARK' + Math.floor(10000000 + Math.random() * 90000000));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mandatory fields for checkout
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [paymentProofFileName, setPaymentProofFileName] = useState<string | null>(null);
  const [isCompressingProof, setIsCompressingProof] = useState<boolean>(false);
  const proofInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => 'Rp ' + val.toLocaleString('id-ID');

  const cleanUsername = username.trim() || 'Player';

  const itemsToCheckout: (Product | CartItem)[] =
    cartItems.length > 0
      ? cartItems
      : selectedProduct
      ? [selectedProduct]
      : [];

  const totalPrice = itemsToCheckout.reduce((acc, item) => acc + item.price, 0);
  const totalRobux = itemsToCheckout.reduce((acc, item) => acc + item.nominal, 0);

  const handleCopyTotal = () => {
    navigator.clipboard.writeText(String(totalPrice));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Ukuran file bukti pembayaran maksimal 15MB.');
      return;
    }

    try {
      setIsCompressingProof(true);
      setErrorMessage(null);
      // Compress to ultra-lightweight WebP format (max dimension 1200px, 80% quality)
      const webpBase64 = await compressImageToWebP(file, 1200, 1200, 0.8);
      const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
      setPaymentProof(webpBase64);
      setPaymentProofFileName(cleanName);
    } catch (err: any) {
      console.error('Failed to compress image:', err);
      setErrorMessage('Gagal mengompres gambar bukti transfer.');
    } finally {
      setIsCompressingProof(false);
    }
  };

  const itemsText = itemsToCheckout
    .map((i) => `- ${i.label} Robux (${formatRupiah(i.price)})`)
    .join('\n');

  const createOrderInBackend = async (method: 'Website' | 'WhatsApp') => {
    try {
      const cleanPhone = customerPhone.trim().replace(/[^0-9]/g, '');

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roblox_username: cleanUsername,
          roblox_user_id: robloxUserId ? String(robloxUserId) : null,
          customer_phone: cleanPhone || '62895614809897',
          robux: totalRobux,
          price: totalPrice,
          payment_method: method,
          payment_proof_path: paymentProof,
          customer_notes: itemsText,
          product_id: selectedProduct?.id && !isNaN(Number(selectedProduct.id)) ? Number(selectedProduct.id) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error || 'Gagal membuat pesanan');
        return null;
      }

      if (json.data?.order_code) {
        setOrderCode(json.data.order_code);
      }
      return json.data;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setErrorMessage('Terjadi kesalahan koneksi saat memproses pesanan.');
      return null;
    }
  };

  const storeName = settings?.storeName || 'ArunikaStore';
  const adminPhone = (settings?.whatsappCS || '6281234567890').replace(/[^0-9]/g, '');

  const whatsappCheckoutUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
    `*FORM ORDER ${storeName.toUpperCase()}*\n` +
      `-----------------------------------\n` +
      `No Pesanan : ${orderCode}\n` +
      `Username   : @${cleanUsername}\n` +
      `WhatsApp   : ${customerPhone || '-'}\n` +
      `Daftar Paket:\n${itemsText}\n` +
      `Total Bayar: ${formatRupiah(totalPrice)} (${totalRobux.toLocaleString('id-ID')} Robux)\n` +
      `Metode     : ${paymentMethod === 'qris' ? 'QRIS Otomatis' : 'WhatsApp Admin'}\n` +
      `-----------------------------------\n` +
      `Halo Admin ${storeName}, tolong segera diproses pesanan Robux saya ya!`
  )}`;

  const handleConfirmWebsitePayment = async () => {
    setErrorMessage(null);

    // 0. Validate Username
    if (!username.trim()) {
      setErrorMessage('Username Roblox wajib diisi sebelum melakukan pembayaran.');
      return;
    }

    // 1. Validate WhatsApp Number
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Nomor WhatsApp aktif wajib diisi (minimal 9 digit) untuk konfirmasi pesanan.');
      return;
    }

    // 2. Validate Payment Proof
    if (!paymentProof) {
      setErrorMessage('Foto bukti transfer pembayaran wajib diupload.');
      return;
    }

    setIsProcessing(true);
    const order = await createOrderInBackend('Website');
    setIsProcessing(false);
    if (order) {
      const activeOrderCode = order.order_code || orderCode;
      const directWaUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
        `*KONFIRMASI PEMBAYARAN ${storeName.toUpperCase()}*\n` +
          `-----------------------------------\n` +
          `No Pesanan : ${activeOrderCode}\n` +
          `Username   : @${cleanUsername}\n` +
          `WhatsApp   : ${customerPhone || '-'}\n` +
          `Daftar Paket:\n${itemsText}\n` +
          `Total Bayar: ${formatRupiah(totalPrice)} (${totalRobux.toLocaleString('id-ID')} Robux)\n` +
          `Metode     : QRIS (Bukti Transfer Terlampir)\n` +
          `-----------------------------------\n` +
          `Halo Admin ${storeName}, saya sudah melakukan pembayaran dan mengupload bukti transfer. Tolong segera dicek dan diproses ya!`
      )}`;

      window.open(directWaUrl, '_blank');
      setIsPaid(true);
    }
  };

  const handleWhatsAppCheckout = async () => {
    setErrorMessage(null);

    // 0. Validate Username
    if (!username.trim()) {
      setErrorMessage('Username Roblox wajib diisi.');
      return;
    }

    // 1. Validate Phone
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('Nomor WhatsApp aktif wajib diisi (minimal 9 digit).');
      return;
    }

    setIsProcessing(true);
    const order = await createOrderInBackend('WhatsApp');
    setIsProcessing(false);

    const activeOrderCode = order?.order_code || orderCode;
    const directWaUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
      `*FORM ORDER ${storeName.toUpperCase()}*\n` +
        `-----------------------------------\n` +
        `No Pesanan : ${activeOrderCode}\n` +
        `Username   : @${cleanUsername}\n` +
        `WhatsApp   : ${customerPhone || '-'}\n` +
        `Daftar Paket:\n${itemsText}\n` +
        `Total Bayar: ${formatRupiah(totalPrice)} (${totalRobux.toLocaleString('id-ID')} Robux)\n` +
        `Metode     : Chat WhatsApp Admin\n` +
        `-----------------------------------\n` +
        `Halo Admin ${storeName}, tolong segera diproses pesanan Robux saya ya!`
    )}`;

    window.open(directWaUrl, '_blank');
    setIsPaid(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs no-scrollbar">
      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 no-scrollbar">
        <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[32px] max-w-lg w-full p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-2xl relative my-auto border-2 border-cyan-200 dark:border-cyan-500/30 transition-colors duration-300">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer z-10"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {isPaid ? (
          /* Payment Success View */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-400 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-cyan-400/30">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Pesanan Berhasil Diterima!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Robux sedang dalam antrean pengiriman instan otomatis ke akun{' '}
                <strong className="text-slate-900 dark:text-white">@{cleanUsername}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 text-white border border-cyan-500/40 text-xs font-mono space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">No. Invoice:</span>
                <span className="font-bold text-cyan-300">{orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Item:</span>
                <span className="font-bold text-cyan-400">
                  {itemsToCheckout.length} Paket ({totalRobux.toLocaleString('id-ID')} Robux)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimasi Kirim:</span>
                <span className="font-bold text-emerald-400">5 - 10 Menit</span>
              </div>
            </div>

            <a
              href={whatsappCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konfirmasi via WhatsApp Admin</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          /* Checkout Details View */
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
                    Konfirmasi Pembayaran
                  </h3>
                  <ArunikaSparkle className="w-4 h-4 shrink-0" color="cyan" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  Periksa rincian pesanan Anda sebelum membayar
                </p>
              </div>
            </div>

            {/* Error / Blacklist Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50/50 via-white to-sky-50/50 dark:from-slate-950 dark:via-slate-950/90 dark:to-slate-900 border-2 border-cyan-100 dark:border-slate-800 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                <span>Username Roblox:</span>
                <strong className="text-slate-900 dark:text-white font-black">
                  @{cleanUsername}
                </strong>
              </div>

              {/* Items breakdown */}
              {itemsToCheckout.length === 1 ? (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium">
                  <span>Paket Robux:</span>
                  <strong className="text-cyan-600 dark:text-cyan-400 font-black">
                    {itemsToCheckout[0].label} Robux
                  </strong>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs">
                    Daftar Paket ({itemsToCheckout.length} item):
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 no-scrollbar">
                    {itemsToCheckout.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs bg-slate-100/70 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          • {item.label} Robux
                        </span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 font-medium pt-1">
                <span>Metode:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {paymentMethod === 'qris' ? 'QRIS (Semua E-Wallet & Bank)' : 'Chat WhatsApp'}
                </span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-base">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  Total Tagihan:
                </span>
                <span className="font-black text-cyan-600 dark:text-cyan-400 text-xl">
                  {formatRupiah(totalPrice)}
                </span>
              </div>
            </div>

            {/* Field: Input Nomor WhatsApp Pembeli (Wajib) */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Nomor WhatsApp Pembeli</span>
                  <span className="text-rose-500 font-black">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Wajib diisi untuk notifikasi</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''));
                    setErrorMessage(null);
                  }}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Hidden File Input for Proof of Payment */}
            <input
              type="file"
              ref={proofInputRef}
              onChange={handleProofUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Payment Method Details */}
            {paymentMethod === 'qris' ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-slate-950 border-2 border-cyan-400/50 shadow-inner space-y-2.5 text-white">
                  {settings?.qris?.qrisImage ? (
                    <div className="relative w-44 h-44 sm:w-48 sm:h-48 bg-white p-2 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                      <Image
                        src={settings.qris.qrisImage}
                        alt="QRIS Barcode"
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                  ) : (
                    /* QRIS SVG Matrix Representation */
                    <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white p-2 rounded-2xl flex flex-col justify-between items-center shadow-lg">
                      <div className="w-full flex justify-between">
                        <div className="w-8 h-8 bg-black rounded-sm p-1">
                          <div className="w-full h-full bg-white p-0.5">
                            <div className="w-full h-full bg-black"></div>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-sm p-1">
                          <div className="w-full h-full bg-white p-0.5">
                            <div className="w-full h-full bg-black"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-black tracking-widest text-slate-900 uppercase">
                        QRIS {storeName.toUpperCase()}
                      </div>
                      <div className="w-full flex justify-between items-end">
                        <div className="w-8 h-8 bg-black rounded-sm p-1">
                          <div className="w-full h-full bg-white p-0.5">
                            <div className="w-full h-full bg-black"></div>
                          </div>
                        </div>
                        <div className="w-6 h-6 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-[9px] font-black shadow-xs">
                          QR
                        </div>
                      </div>
                    </div>
                  )}

                  {settings?.qris?.nmid && (
                    <div className="text-[11px] font-mono font-bold text-cyan-300">
                      NMID: {settings.qris.nmid}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 font-medium text-center">
                    BCA • Mandiri • BRI • BNI • DANA • OVO • GoPay • ShopeePay
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Nominal Transfer:
                    </span>
                    <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyTotal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-xs font-black transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Tersalin' : 'Salin Nominal'}</span>
                  </button>
                </div>

                {/* Field: Upload Bukti Pembayaran (Wajib) */}
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Upload Bukti Transfer Pembayaran</span>
                      <span className="text-rose-500 font-black">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP (Maks 8MB)</span>
                  </label>

                  {isCompressingProof ? (
                    <div className="p-5 rounded-2xl border-2 border-dashed border-cyan-400 bg-cyan-50/30 dark:bg-cyan-950/30 text-center space-y-2">
                      <Loader2 className="w-6 h-6 mx-auto animate-spin text-cyan-500" />
                      <p className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                        Mengompres bukti transfer (WebP)...
                      </p>
                    </div>
                  ) : paymentProof ? (
                    <div className="p-3 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/40 border-2 border-cyan-400/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={paymentProof}
                          alt="Bukti Transfer"
                          className="w-12 h-12 object-cover rounded-xl border border-cyan-300/60 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-[220px]">
                            {paymentProofFileName || 'Bukti Transfer Terlampir'}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <Check className="w-3 h-3" /> WebP Terkompres (Ringan)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => proofInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-black text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentProof(null);
                            setPaymentProofFileName(null);
                          }}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Hapus Foto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => proofInputRef.current?.click()}
                      className="p-4 rounded-2xl border-2 border-dashed border-cyan-300/80 dark:border-cyan-800/80 hover:border-cyan-400 dark:hover:border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/20 text-center space-y-1 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <div className="w-8 h-8 mx-auto rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">
                        Klik untuk Upload Bukti Transfer
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Otomatis dikompres ke WebP agar cepat & ringan
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleConfirmWebsitePayment}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl btn-arunika-primary text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Saya Sudah Bayar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* WhatsApp Order Option */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-200 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed space-y-2 font-medium">
                  <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300 text-sm">
                    <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Layanan Otomatis WhatsApp Fast Respon</span>
                  </div>
                  <p>
                    Klik tombol di bawah untuk langsung membuka WhatsApp Admin Arunika Store dengan
                    format order otomatis siap kirim.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  disabled={isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Menyiapkan Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      <span>Kirim Pesanan ke WhatsApp Admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              <span>Garansi 100% Legal & Bergaransi Uang Kembali</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
