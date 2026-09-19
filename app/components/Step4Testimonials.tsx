'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  Lock,
  MessageCircle,
  CheckCircle2,
  Send,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { TESTIMONIALS, Testimonial } from '../data/testimonials';
import { mapDbTestimonialToUI } from '../../lib/testimonialsHelper';
import { ArunikaSparkle } from './ArunikaIcons';

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: 'Sangat Kecewa', color: 'text-rose-500', desc: 'Pelayanan sangat buruk' },
  2: { text: 'Kurang Puas', color: 'text-orange-500', desc: 'Perlu banyak peningkatan' },
  3: { text: 'Cukup Puas', color: 'text-amber-500', desc: 'Pelayanan standar & pesanan masuk' },
  4: { text: 'Puas Banget', color: 'text-cyan-500', desc: 'Proses cepat dan admin ramah' },
  5: { text: 'Sangat Puas & Puas Pol! ⭐', color: 'text-emerald-500', desc: 'Super cepat, terpercaya, langganan!' },
};

function TestimonialsContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [testimonialList, setTestimonialList] = useState<Testimonial[]>(TESTIMONIALS);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<{
    order_code: string;
    roblox_username: string;
    robux: number;
    price: number;
  } | null>(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load testimonials
  const loadTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapDbTestimonialToUI);
        setTestimonialList(mapped);
      }
    } catch (err) {
      console.error('Failed to load testimonials from API:', err);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  // Validate token if provided in query params
  useEffect(() => {
    if (!token) {
      setVerifiedOrder(null);
      setAlreadyReviewed(false);
      setTokenError(null);
      return;
    }

    const validateToken = async () => {
      setIsValidatingToken(true);
      setTokenError(null);
      try {
        const res = await fetch(`/api/testimonials/validate?token=${encodeURIComponent(token)}`);
        const json = await res.json();

        if (json.alreadyReviewed) {
          setAlreadyReviewed(true);
          setVerifiedOrder(json.data || null);
        } else if (json.success && json.data) {
          setVerifiedOrder(json.data);
          setAlreadyReviewed(false);
          // Smooth scroll to testimonials section
          setTimeout(() => {
            document.getElementById('testimoni')?.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        } else {
          setTokenError(json.error || 'Token ulasan tidak valid');
        }
      } catch (err) {
        console.error('Failed to validate token:', err);
        setTokenError('Gagal memvalidasi token ulasan.');
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedOrder || !comment.trim()) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: verifiedOrder.roblox_username,
          message: comment.trim(),
          rating,
          order_code: verifiedOrder.order_code,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setSubmitError(json.error || 'Gagal mengirim ulasan');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setIsSubmitting(false);
      // Reload testimonials list
      loadTestimonials();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setSubmitError('Terjadi kesalahan jaringan saat mengirim ulasan.');
      setIsSubmitting(false);
    }
  };

  const currentRatingInfo = RATING_LABELS[hoverRating || rating] || RATING_LABELS[5];

  const whatsappReviewUrl =
    'https://wa.me/6281234567890?text=Halo%20Admin%20Arunika%20Store%2C%20pesanan%20saya%20sudah%20selesai%20dan%20saya%20mau%20minta%20Link%20Token%20Review%20dong';

  return (
    <div
      id="testimoni"
      className="w-full bg-white dark:bg-slate-900/90 rounded-3xl sm:rounded-[32px] border-2 border-cyan-100/90 dark:border-cyan-500/20 shadow-sm p-4 sm:p-8 space-y-6 sm:space-y-7 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="relative w-10 h-10 shrink-0 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-fuchsia-500 shadow-md shadow-cyan-500/20">
          <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-amber-400">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Testimoni Member
            </h2>
            <ArunikaSparkle className="w-4 h-4" color="cyan" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Apa kata mereka yang sudah top up Robux di Arunika Store
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Testimonial Cards */}
        <div className="lg:col-span-7 space-y-4">
          {testimonialList.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-50/80 dark:bg-slate-950/80 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum ada testimoni pembeli.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Jadilah yang pertama memberikan ulasan setelah pesanan selesai!</p>
            </div>
          ) : (
            testimonialList.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-950/80 border-2 border-slate-100 dark:border-slate-800/90 hover:border-cyan-300 dark:hover:border-cyan-500/40 hover:bg-white dark:hover:bg-slate-950 transition-all space-y-3.5 shadow-2xs"
            >
              {/* Profile Header: Avatar + Username + Verified Badge + Time */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 shrink-0 rounded-full bg-gradient-to-tr ${item.avatarBg} text-white font-black text-base flex items-center justify-center shadow-xs`}
                >
                  {item.initial}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      @{item.username}
                    </span>
                    {item.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        Terverifikasi
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    {item.timeAgo}
                  </span>
                </div>
              </div>

              {/* Star rating pill */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/10 dark:bg-amber-400/10 border border-amber-400/30 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < item.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 dark:text-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Quote Comment */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                &ldquo;{item.comment}&rdquo;
              </p>

              {/* Package Tag */}
              <div className="flex items-center">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/30 text-xs font-black text-slate-900 dark:text-white shadow-2xs">
                  <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                    <Image
                      src="/robux.webp"
                      alt="Robux"
                      width={16}
                      height={16}
                      className="object-contain drop-shadow-[0_0_4px_rgba(0,229,255,0.7)]"
                    />
                  </div>
                  <span>{item.packageName}</span>
                </span>
              </div>

              {/* Admin Reply Box */}
              {item.adminReply && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/80 border border-cyan-300/50 dark:border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-950 border border-cyan-400/40 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      <Image
                        src="/logo.png"
                        alt="Admin Arunika"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-cyan-600 dark:text-cyan-400">
                      {item.adminReply.adminName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-8 leading-relaxed font-medium">
                    {item.adminReply.message}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
        </div>

        {/* Right Column: Form Ulasan Khusus Pembeli */}
        <div className="lg:col-span-5 self-start w-full">
          {isValidatingToken ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 border-2 border-cyan-400/40 text-center space-y-3.5 shadow-xl text-white">
              <div className="w-8 h-8 mx-auto border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-300">Memverifikasi token ulasan pesanan #{token}...</p>
            </div>
          ) : isSubmitted ? (
            /* Success State */
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/60 text-center space-y-4 shadow-xl text-white">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white">Testimoni Berhasil Terkirim! 🎉</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Terima kasih banyak <strong className="text-emerald-400">@{verifiedOrder?.roblox_username}</strong> atas kepercayaannya berbelanja di Arunika Store.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-medium text-emerald-300">
                Ulasanmu sudah otomatis diverifikasi dan tampil langsung di toko kami! ✨
              </div>
            </div>
          ) : alreadyReviewed ? (
            /* Already Reviewed State (1-Time Token Protection) */
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-400/60 text-center space-y-4 shadow-xl text-white">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                <Star className="w-7 h-7 fill-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white">Ulasan Sudah Pernah Diisi ⭐</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Token untuk pesanan <strong className="text-amber-400">#{token}</strong> sudah pernah digunakan untuk memberikan testimoni. Setiap token hanya dapat digunakan 1 kali.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
                Terima kasih telah menjadi bagian dari member setia Arunika Store!
              </div>
            </div>
          ) : verifiedOrder ? (
            /* Unlocked Active Review Form */
            <form
              onSubmit={handleSubmitReview}
              className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-400/60 text-left space-y-4 shadow-xl text-white relative overflow-hidden"
            >
              {/* Badge & Order Code */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-[10px] sm:text-[11px] font-black border border-cyan-500/40 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>TOKEN TERVERIFIKASI</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400">
                  #{verifiedOrder.order_code}
                </span>
              </div>

              {/* Title & Customer Name */}
              <div className="space-y-0.5">
                <h3 className="text-base sm:text-lg font-black text-white">Beri Ulasan Pesanan</h3>
                <p className="text-xs text-slate-300 font-medium">
                  Halo <strong className="text-cyan-300">@{verifiedOrder.roblox_username}</strong>, bagaimana pengalaman top up Robux-mu?
                </p>
              </div>

              {/* Star Rating Selector */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Rating Kepuasan:</span>
                  <span className={`text-[11px] sm:text-xs font-black ${currentRatingInfo.color}`}>
                    {currentRatingInfo.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 pt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform hover:scale-120 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Ulasan / Testimoni Kamu:
                </label>
                <textarea
                  required
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ceritakan proses transaksi, kecepatan pengiriman, atau pelayanan admin..."
                  className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:outline-hidden text-xs sm:text-sm text-white placeholder-slate-500 transition-colors resize-none"
                />
              </div>

              {submitError && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl btn-arunika-cyan text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Menerbitkan Ulasan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Testimoni Saya</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Locked State Default */
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-400/40 text-center space-y-5 shadow-xl text-white">
              {/* Lock Icon with Arunika Neon Gradient */}
              <div className="w-14 h-14 mx-auto rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-fuchsia-500 shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-cyan-300">
                  <Lock className="w-6 h-6" />
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-black border border-cyan-500/40 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>ULASAN TERVERIFIKASI PEMBELI</span>
              </div>

              {/* Heading */}
              <h3 className="text-lg font-black text-white">Form Ulasan Khusus Pembeli</h3>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto font-medium">
                Untuk menjaga ulasan <strong className="text-white">100% asli & bebas spam</strong>,
                formulir ini hanya dapat diisi melalui{' '}
                <strong className="text-cyan-300">Link Token Review</strong> yang dikirimkan Admin
                setelah pesanan Robux selesai diproses.
              </p>

              {tokenError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold">
                  {tokenError}
                </div>
              )}

              {/* CS Action Button */}
              <div className="pt-2">
                <a
                  href={whatsappReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl btn-arunika-cyan text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hubungi CS / Minta Link Review</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Step4Testimonials() {
  return (
    <Suspense fallback={<div className="min-h-[200px] w-full animate-pulse bg-slate-100 dark:bg-slate-900 rounded-3xl" />}>
      <TestimonialsContent />
    </Suspense>
  );
}

