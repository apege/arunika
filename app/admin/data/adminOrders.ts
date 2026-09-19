export type OrderStatus = 'masuk' | 'diproses' | 'selesai' | 'dibatalkan';
export type PaymentChannel = 'WEBSITE' | 'WHATSAPP' | 'QRIS' | 'BCA' | 'MANDIRI';

export interface AdminOrder {
  id: string; // e.g. "ARK85658025"
  status: OrderStatus;
  statusLabel: string;
  createdAt: string; // e.g. "18 September 2026 pukul 12.37 WIB"
  createdAtShort: string; // e.g. "18 Sep, 12.37"
  customer: {
    username: string; // e.g. "MFMftRyan"
    robloxUserId: string; // e.g. "4077412257"
    whatsapp: string; // e.g. "+62895614809897"
    notes?: string;
  };
  product: {
    id: string;
    nominal: number; // e.g. 3700
    label: string; // e.g. "3.700"
    price: number; // e.g. 70000
    category: string;
  };
  payment: {
    method: PaymentChannel;
    methodLabel: string;
    totalAmount: number;
    proofImage?: string | null;
  };
  adminNotes?: string;
}

export const INITIAL_ADMIN_ORDERS: AdminOrder[] = [];

export function getStoredOrders(): AdminOrder[] {
  return [];
}

export function saveOrders(_orders: AdminOrder[]): void {}

export function updateOrderStatus(_orderId: string, _newStatus: OrderStatus): AdminOrder[] {
  return [];
}

export function updateOrderAdminNotes(_orderId: string, _notes: string): AdminOrder[] {
  return [];
}
