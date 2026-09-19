import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../login/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('arunika_admin_session')?.value;

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (err) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
