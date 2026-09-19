export interface StoreSettings {
  storeName: string;
  whatsappCS: string;
  promo: {
    isActive: boolean;
    packageId: string;
    packageLabel: string;
    packagePrice: number;
    headline: string;
    description: string;
    countdownDate: string; // e.g. "30 September 2026 • 23:59 WIB"
    bannerImage?: string | null;
  };
  qris: {
    nmid: string;
    isInstalled: boolean;
    qrisImage?: string | null;
  };
  logo: {
    logoPath: string;
    isInstalled: boolean;
  };
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'ArunikaStore',
  whatsappCS: '6281234567890',
  promo: {
    isActive: true,
    packageId: 'rbx-2400',
    packageLabel: '2.400 Robux',
    packagePrice: 45000,
    headline: '⚡ PROMO FLASH SALE ROBUX HARI INI!',
    description: 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!',
    countdownDate: '30 September 2026 • 23:59 WIB',
    bannerImage: null,
  },
  qris: {
    nmid: 'ID1029384756102',
    isInstalled: true,
    qrisImage: null,
  },
  logo: {
    logoPath: '/logo.png',
    isInstalled: true,
  },
};

const SETTINGS_KEY = 'arunika_admin_store_settings_v1';

export function getStoredSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return DEFAULT_STORE_SETTINGS;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveSettings(settings: StoreSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings locally:', err);
  }
}

export async function fetchGlobalSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch('/api/settings', { cache: 'no-store' });
    const json = await res.json();
    if (json.success && json.data) {
      saveSettings(json.data);
      return json.data;
    }
  } catch (err) {
    console.error('Failed to fetch settings from API, using fallback:', err);
  }
  return getStoredSettings();
}

export async function saveGlobalSettings(settings: StoreSettings): Promise<boolean> {
  saveSettings(settings);
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    return json.success;
  } catch (err) {
    console.error('Failed to save settings to server API:', err);
    return false;
  }
}

