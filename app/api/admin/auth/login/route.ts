import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = process.env.ADMIN_SESSION_SECRET || 'arunika-super-secret-admin-key-2026';

export function signToken(username: string): string {
  const payload = JSON.stringify({
    u: username,
    t: Date.now(),
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): boolean {
  try {
    if (!token || !token.includes('.')) return false;
    const [encodedPayload, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    if (signature !== expectedSignature) return false;

    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    // 7 days expiration
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.t > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (
      username?.trim().toLowerCase() !== validUsername.toLowerCase() ||
      password !== validPassword
    ) {
      return NextResponse.json(
        { success: false, error: 'Username atau password admin salah!' },
        { status: 401 }
      );
    }

    const token = signToken(validUsername);

    const response = NextResponse.json({
      success: true,
      message: 'Login admin berhasil',
    });

    response.cookies.set('arunika_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal memproses login' },
      { status: 500 }
    );
  }
}
