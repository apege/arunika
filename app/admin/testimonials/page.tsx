'use client';

import { useState, useEffect } from 'react';
import {
  RotateCw,
  Search,
  Plus,
  Star,
  Eye,
  EyeOff,
  Pencil,
  Reply,
  Trash2,
  X,
  Sparkles,
  MessageSquareQuote,
  ShieldCheck,
} from 'lucide-react';
import { TestimonialRow } from '../../../types/database';

interface AdminTestimonialItem {
  id: number;
  username: string;
  initial: string;
  avatarBg: string;
  rating: number;
  comment: string;
  packageName: string;
  isVisible: boolean;
  dateFormatted: string;
  adminReply?: {
    adminName: string;
    message: string;
  } | null;
  status: string;
  orderCode?: string | null;
}

const AVATAR_COLORS = [
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-yellow-600',
];

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<AdminTestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'semua' | 'aktif' | 'disembunyikan' | 'perlu_balasan'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State: Create / Edit Testimonial
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<AdminTestimonialItem | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formPackage, setFormPackage] = useState('4.200 Robux');
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State: Reply
  const [replyTarget, setReplyTarget] = useState<AdminTestimonialItem | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/admin/testimonials', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: AdminTestimonialItem[] = json.data.map((row: TestimonialRow, idx: number) => {
          const uName = row.name || 'Anonymous';
          const init = uName.trim()[0]?.toUpperCase() || 'U';
          const bg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const isVisible = row.status !== 'rejected';
          const dateStr = new Date(row.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return {
            id: row.id,
            username: uName,
            initial: init,
            avatarBg: bg,
            rating: row.rating || 5,
            comment: row.message || '',
            packageName: row.order_code ? `Order #${row.order_code}` : 'Robux Package',
            isVisible: isVisible,
            dateFormatted: dateStr,
            adminReply: row.admin_reply as any,
            status: row.status,
            orderCode: row.order_code,
          };
        });
        setTestimonials(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTestimonials();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item: AdminTestimonialItem) => {
    const nextStatus = item.isVisible ? 'rejected' : 'approved';
    const nextVisible = !item.isVisible;

    // Optimistic update
    setTestimonials((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, isVisible: nextVisible, status: nextStatus } : t))
    );

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: nextStatus,
        }),
      });
      if (!res.ok) throw new Error('Gagal update status ulasan');
      showToast('Status publikasi testimoni berhasil diperbarui.');
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah visibilitas');
      fetchTestimonials();
    }
  };

  // Delete Testimonial
  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
      // Optimistic update
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      try {
        const res = await fetch(`/api/admin/testimonials?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Gagal menghapus');
        showToast('Testimoni berhasil dihapus.');
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus ulasan');
        fetchTestimonials();
      }
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingItem(null);
    setFormUsername('');
    setFormRating(5);
    setFormComment('');
    setFormPackage('4.200 Robux');
    setFormIsVisible(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: AdminTestimonialItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormUsername(item.username);
    setFormRating(item.rating);
    setFormComment(item.comment);
    setFormPackage(item.packageName);
    setFormIsVisible(item.isVisible);
    setIsModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formComment.trim()) return;

    setIsSubmitting(true);
    try {
      const status = formIsVisible ? 'approved' : 'rejected';
      const cleanUsername = formUsername.replace(/^@/, '').trim();

      if (modalMode === 'create') {
        const res = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanUsername,
            message: formComment.trim(),
            rating: formRating,
            status: status,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          alert(json.error || 'Gagal menambah testimoni');
          return;
        }
        showToast('Testimoni baru berhasil ditambahkan.');
      } else if (editingItem) {
        const res = await fetch('/api/admin/testimonials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            name: cleanUsername,
            message: formComment.trim(),
            rating: formRating,
            status: status,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          alert(json.error || 'Gagal mengubah testimoni');
          return;
        }
        showToast('Perubahan ulasan berhasil disimpan.');
      }

      await fetchTestimonials();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Reply Modal
  const handleOpenReplyModal = (item: AdminTestimonialItem) => {
    setReplyTarget(item);
    setReplyMessage(item.adminReply?.message || '');
  };

  // Save Reply
  const handleSaveReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget) return;

    setIsReplying(true);
    try {
      const adminReplyPayload = replyMessage.trim()
        ? {
            adminName: 'Admin Arunika Store Official',
            message: replyMessage.trim(),
          }
        : null;

      const res = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: replyTarget.id,
          admin_reply: adminReplyPayload,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || 'Gagal menyimpan balasan');
        return;
      }

      await fetchTestimonials();
      setReplyTarget(null);
      showToast('Balasan admin berhasil disimpan.');
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setIsReplying(false);
    }
  };

  // Calculations for stats
  const totalReviews = testimonials.length;
  const activeCount = testimonials.filter((t) => t.isVisible).length;
  const hiddenCount = testimonials.filter((t) => !t.isVisible).length;
  const needReplyCount = testimonials.filter((t) => !t.adminReply).length;
  const averageRating =
    totalReviews > 0
      ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  // Filter list
  const filteredTestimonials = testimonials.filter((item) => {
    if (activeTab === 'aktif' && !item.isVisible) return false;
    if (activeTab === 'disembunyikan' && item.isVisible) return false;
    if (activeTab === 'perlu_balasan' && item.adminReply) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = item.username.toLowerCase().includes(q);
      const matchComment = item.comment.toLowerCase().includes(q);
      const matchPkg = item.packageName.toLowerCase().includes(q);
      return matchUser || matchComment || matchPkg;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header with 'Tambah Testimoni' and 'Refresh' Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Kelola Testimoni & Ulasan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Moderasi ulasan pembeli, tambah ulasan manual, balas testimoni live database Supabase
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Testimoni</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-slate-800 hover:border-cyan-400 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 text-cyan-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Stat Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            TOTAL ULASAN
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalReviews}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            RATING RATA-RATA
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center gap-1">
            <span>{averageRating}</span>
            <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            AKTIF (TAMPIL)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 shadow-xs space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            PERLU BALASAN
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-500 dark:text-rose-400">
            {needReplyCount}
          </div>
        </div>
      </div>

      {/* 3. Main Testimonials Container with Tabs & Search */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-white dark:bg-slate-900/90 border border-cyan-100 dark:border-cyan-900/40 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { key: 'semua', label: 'Semua', count: totalReviews },
              { key: 'aktif', label: 'Aktif', count: activeCount },
              { key: 'disembunyikan', label: 'Disembunyikan', count: hiddenCount },
              { key: 'perlu_balasan', label: 'Perlu Balasan', count: needReplyCount },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] opacity-80">({tab.count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari username atau ulasan..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Testimonials List */}
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 font-bold text-sm animate-pulse">
            Memuat testimoni dari database...
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-50 dark:bg-slate-950 text-slate-400 flex items-center justify-center">
              <MessageSquareQuote className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-500">Tidak ada testimoni yang sesuai filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTestimonials.map((item) => {
              const isVisible = item.isVisible;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all space-y-3.5 ${
                    !isVisible
                      ? 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                      : 'bg-slate-50/70 dark:bg-slate-950/60 hover:bg-white dark:hover:bg-slate-950 border-slate-100 dark:border-slate-800/90 hover:border-cyan-200 dark:hover:border-cyan-800/60 shadow-2xs'
                  }`}
                >
                  {/* Top Bar: Customer Profile & Action Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Customer Profile & Badges */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Avatar initial */}
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0`}
                      >
                        {item.initial}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            @{item.username}
                          </span>

                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Terverifikasi</span>
                          </span>

                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 shrink-0">
                            {item.packageName || 'Robux'}
                          </span>
                        </div>

                        {/* Stars & Time */}
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <div className="flex items-center text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < item.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span className="text-[11px] sm:text-xs">{item.dateFormatted}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800/80 justify-start sm:justify-end shrink-0">
                      {/* Tampil / Sembunyikan toggle */}
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                          isVisible
                            ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tampil</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Sembunyi</span>
                          </>
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-cyan-600 border border-slate-200 dark:border-slate-700 text-xs font-black transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Balas Button */}
                      <button
                        onClick={() => handleOpenReplyModal(item)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-black transition-colors cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>{item.adminReply ? 'Edit Balasan' : 'Balas'}</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer ml-auto sm:ml-0"
                        title="Hapus Testimoni"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic bg-white/70 dark:bg-slate-900/60 p-3 sm:p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    &ldquo;{item.comment}&rdquo;
                  </p>

                  {/* Admin Reply Box if present */}
                  {item.adminReply && (
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-cyan-700 dark:text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{item.adminReply.adminName}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pl-5">
                        {item.adminReply.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Modal: Tambah / Edit Testimoni Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border-2 border-cyan-100 dark:border-cyan-900/50 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Tambah Testimoni Baru' : 'Edit Testimoni'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Field 1: Username Roblox */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Username Roblox <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    @
                  </span>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Contoh: APG_Channel11"
                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Rating Kepuasan (1 - 5 Bintang) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Rating Kepuasan (1 – 5 Bintang)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                          star <= formRating
                            ? 'bg-amber-50 border-amber-300 text-amber-500'
                            : 'bg-slate-50 border-slate-200 text-slate-300 dark:bg-slate-800 dark:border-slate-700'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-black text-amber-500 ml-2">
                    {formRating} Bintang
                  </span>
                </div>
              </div>

              {/* Field 3: Isi Ulasan Testimoni */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Isi Ulasan Testimoni <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Tuliskan pengalaman / ulasan kepuasan pembeli..."
                  className="w-full p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors resize-none"
                  required
                />
              </div>

              {/* Field 4: Paket Robux / Kode Order (Opsional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Paket Robux / Kode Order (Opsional)
                </label>
                <input
                  type="text"
                  value={formPackage}
                  onChange={(e) => setFormPackage(e.target.value)}
                  placeholder="Contoh: 4.200 Robux"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors"
                />
              </div>

              {/* Field 5: Checkbox Publikasikan */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsVisible}
                    onChange={(e) => setFormIsVisible(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Publikasikan dan Tampilkan Testimoni di Website
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:via-sky-400 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-cyan-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : modalMode === 'create' ? 'Tambah Testimoni' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: Balas Testimoni */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl relative border-2 border-cyan-100 dark:border-cyan-900/50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Reply className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Balas Testimoni @{replyTarget.username}
                </h3>
              </div>
              <button
                onClick={() => setReplyTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs italic text-slate-600 dark:text-slate-300">
              &ldquo;{replyTarget.comment}&rdquo;
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                  Pesan Balasan Admin
                </label>
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Terima kasih atas kepercayaannya kak! Ditunggu orderan berikutnya yaa 🔥"
                  className="w-full p-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-cyan-400 transition-colors resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isReplying}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black shadow-md shadow-cyan-500/20 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
                >
                  {isReplying ? 'Mengirim...' : 'Kirim Balasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
