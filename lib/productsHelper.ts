import { DbProduct } from '../types/database';

export interface UIProduct {
  id: string;
  nominal: number;
  label: string;
  price: number;
  category: 'promo' | 'populer' | 'sultan' | 'regular';
  badge?: string;
  isPromo?: boolean;
  isActive: boolean;
  image_path?: string | null;
}

export function mapDbProductToUI(
  db: DbProduct,
  promoId?: number | null,
  popularRobux?: number | null
): UIProduct {
  const nominal = db.robux;
  const label = nominal.toLocaleString('id-ID');

  let category: 'promo' | 'populer' | 'sultan' | 'regular' = 'regular';
  let badge: string | undefined = undefined;
  let isPromo = false;

  // 1. Promo rule
  if (promoId && db.id === promoId) {
    category = 'promo';
    badge = 'PROMO';
    isPromo = true;
  }
  // 2. Sultan rule (nominal >= 10.000)
  else if (nominal >= 10000) {
    category = 'sultan';
    badge = 'SULTAN';
  }
  // 3. Populer rule
  else if (popularRobux && nominal === popularRobux) {
    category = 'populer';
    badge = 'POPULER';
  } else if (nominal === 2200) {
    category = 'populer';
    badge = 'POPULER';
  }

  return {
    id: String(db.id),
    nominal,
    label,
    price: Number(db.price),
    category,
    badge,
    isPromo,
    isActive: db.is_active !== false,
    image_path: db.image_path,
  };
}

export const DEFAULT_PRODUCTS: UIProduct[] = [];
