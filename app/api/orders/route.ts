import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Helper to generate unique order code like ARK87025771
function generateOrderCode(): string {
  const random8Digits = Math.floor(10000000 + Math.random() * 90000000);
  return `ARK${random8Digits}`;
}

// POST /api/orders - Create a new order with blacklist check
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roblox_username,
      roblox_user_id = null,
      customer_phone,
      product_id = null,
      robux,
      price,
      payment_method = 'Website',
      payment_proof_path = null,
      customer_notes = null,
      user_id = null,
    } = body;

    if (!roblox_username || !customer_phone || !robux || !price) {
      return NextResponse.json(
        { success: false, error: 'Data pesanan tidak lengkap (Username Roblox, No. WhatsApp, Robux, dan Harga wajib diisi).' },
        { status: 400 }
      );
    }

    const cleanUsername = roblox_username.trim().replace(/^@/, '');
    const cleanPhone = customer_phone.trim().replace(/[^0-9]/g, '');

    // 1. Check if user or phone is blacklisted
    const { data: blacklistMatches, error: blacklistErr } = await supabaseAdmin
      .from('blacklists')
      .select('*')
      .or(`roblox_username.ilike.${cleanUsername},phone.eq.${cleanPhone}`);

    if (blacklistErr) {
      console.error('Error checking blacklist:', blacklistErr);
    }

    if (blacklistMatches && blacklistMatches.length > 0) {
      const match = blacklistMatches[0];
      return NextResponse.json(
        {
          success: false,
          isBlacklisted: true,
          error: `Akun @${cleanUsername} atau nomor WhatsApp ini tidak dapat melakukan pemesanan. Alasan: ${
            match.reason || 'Indikasi penipuan atau penyalahgunaan'
          }.`,
        },
        { status: 403 }
      );
    }

    // 2. Auto-fetch official Roblox User ID if not provided by frontend
    let finalRobloxUserId = roblox_user_id ? String(roblox_user_id) : null;
    if (!finalRobloxUserId) {
      try {
        const robloxRes = await fetch('https://users.roblox.com/v1/usernames/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernames: [cleanUsername],
            excludeBannedUsers: false,
          }),
          cache: 'no-store',
        });
        if (robloxRes.ok) {
          const robloxData = await robloxRes.json();
          if (robloxData.data && robloxData.data.length > 0) {
            finalRobloxUserId = String(robloxData.data[0].id);
          }
        }
      } catch (err) {
        console.error('Auto lookup Roblox user ID error:', err);
      }
    }

    // 3. Generate unique order code
    let orderCode = generateOrderCode();
    // Quick check uniqueness
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('order_code', orderCode)
      .single();

    if (existingOrder) {
      orderCode = generateOrderCode();
    }

    // 4. Set expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // 5. Insert order
    const { data: newOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code: orderCode,
        product_id: product_id ? Number(product_id) : null,
        user_id: user_id || null,
        roblox_username: cleanUsername,
        roblox_user_id: finalRobloxUserId,
        customer_phone: cleanPhone,
        customer_notes: customer_notes || null,
        robux: Number(robux),
        price: Number(price),
        payment_method: payment_method || 'Website',
        payment_status: 'pending',
        payment_proof_path: payment_proof_path || null,
        order_status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (orderErr) {
      console.error('Supabase error inserting order:', orderErr);
      return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Pesanan berhasil dibuat',
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error in POST /api/orders:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET /api/orders?code=ARK... - Check order status by order_code
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get('code');

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: 'Order code is required' },
        { status: 400 }
      );
    }

    const cleanCode = orderCode.trim().replace(/^#/, '');

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', cleanCode)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    console.error('Error in GET /api/orders:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
