export interface Customer {
  id: string;
  username: string;
  robloxUserId?: string;
  whatsapp: string;
  lastOrderDate: string;
  orderCount: number;
  totalSpent: number;
  status: 'aktif' | 'blacklisted';
}

export interface BlacklistedUser {
  id: string;
  username: string;
  whatsapp?: string;
  addedDate: string;
  reason: string;
  orderCount: number;
  totalSpent: number;
}

export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_BLACKLIST: BlacklistedUser[] = [];

export function getStoredCustomers(): Customer[] {
  return [];
}

export function saveCustomers(_customers: Customer[]): void {}

export function getStoredBlacklist(): BlacklistedUser[] {
  return [];
}

export function saveBlacklist(_blacklist: BlacklistedUser[]): void {}

export function addCustomerToBlacklist(_customer: Customer, _reason = 'Indikasi Penipuan / Bukti Palsu'): void {}

export function addManualBlacklist(_username: string, _whatsapp: string, _reason: string): BlacklistedUser {
  return {
    id: '0',
    username: _username,
    whatsapp: _whatsapp,
    addedDate: new Date().toISOString(),
    reason: _reason,
    orderCount: 0,
    totalSpent: 0,
  };
}

export function removeBlacklistUser(_blacklistId: string): void {}

