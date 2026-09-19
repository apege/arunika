import { DbTestimonial } from '../types/database';

export interface UITestimonial {
  id: string;
  username: string;
  initial: string;
  avatarBg: string;
  isVerified: boolean;
  timeAgo: string;
  rating: number;
  comment: string;
  packageName: string;
  adminReply?: {
    adminName: string;
    message: string;
  };
}

const AVATAR_GRADIENTS = [
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-500',
  'from-purple-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

export function mapDbTestimonialToUI(db: DbTestimonial): UITestimonial {
  const initial = (db.name?.charAt(0) || 'U').toUpperCase();
  const avatarIndex = (db.id || 0) % AVATAR_GRADIENTS.length;
  const avatarBg = AVATAR_GRADIENTS[avatarIndex] || AVATAR_GRADIENTS[0];

  let adminReply: { adminName: string; message: string } | undefined = undefined;
  if (db.admin_reply && typeof db.admin_reply === 'object') {
    const replyObj = db.admin_reply as any;
    if (replyObj.message) {
      adminReply = {
        adminName: replyObj.adminName || 'Admin Arunika Store',
        message: replyObj.message,
      };
    }
  }

  // Calculate friendly time ago
  let timeAgo = 'Baru saja';
  if (db.created_at) {
    const diff = Date.now() - new Date(db.created_at).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 5) timeAgo = 'Baru saja';
    else if (minutes < 60) timeAgo = `${minutes} menit lalu`;
    else if (hours < 24) timeAgo = `${hours} jam lalu`;
    else timeAgo = `${days} hari lalu`;
  }

  const packageName =
    db.package_name ||
    (db.robux
      ? `${Number(db.robux).toLocaleString('id-ID')} Robux`
      : 'Paket Robux');

  return {
    id: String(db.id),
    username: (db.name || 'Member').replace(/^@/, ''),
    initial,
    avatarBg,
    isVerified: true,
    timeAgo,
    rating: Number(db.rating) || 5,
    comment: db.message,
    packageName,
    adminReply,
  };
}

export const DEFAULT_TESTIMONIALS: UITestimonial[] = [];
