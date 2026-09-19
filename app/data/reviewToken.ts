export interface ReviewTokenData {
  orderId: string;
  username: string;
  packageName: string;
  timestamp: number;
}

/**
 * Generate clean token using Order Code directly (e.g. "ARK87025771")
 */
export function generateReviewToken(
  orderId: string,
  _username?: string,
  _packageName?: string
): string {
  // Clean order code (remove # if present)
  return (orderId || '').trim().replace(/^#/, '');
}

/**
 * Parse and validate a review token by Order Code
 */
export function parseReviewToken(token: string): ReviewTokenData | null {
  if (!token || typeof token !== 'string') return null;

  const raw = token.trim();
  if (!raw) return null;

  const cleanToken = raw.replace(/^#/, '');

  // 1. If token is a valid Order Code format (e.g. starts with ARK or alphanumeric >= 4 chars)
  if (cleanToken.length >= 4) {
    return {
      orderId: cleanToken.toUpperCase(),
      username: 'Pelanggan',
      packageName: 'Robux',
      timestamp: Date.now(),
    };
  }

  // 3. Fallback check for legacy Base64 JSON token
  try {
    let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const jsonStr =
      typeof window !== 'undefined'
        ? decodeURIComponent(atob(base64))
        : Buffer.from(base64, 'base64').toString('utf-8');

    const data = JSON.parse(jsonStr);
    if (data && (data.orderId || data.o)) {
      return {
        orderId: (data.orderId || data.o).replace(/^#/, ''),
        username: data.username || data.u || 'Pelanggan',
        packageName: data.packageName || data.p || 'Robux',
        timestamp: data.timestamp || Date.now(),
      };
    }
  } catch {
    // Not a legacy base64 token
  }

  return null;
}
