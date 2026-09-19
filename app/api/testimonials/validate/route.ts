import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/testimonials/validate?token=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token tidak boleh kosong' },
        { status: 400 }
      );
    }

    const cleanCode = token.trim().replace(/^#/, '');

    // 1. Check if order exists
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('order_code, roblox_username, robux, price, order_status')
      .eq('order_code', cleanCode)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: `Kode pesanan #${cleanCode} tidak ditemukan.` },
        { status: 404 }
      );
    }

    // 2. Check if already reviewed
    const { data: existingReview } = await supabaseAdmin
      .from('testimonials')
      .select('id')
      .eq('order_code', cleanCode)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json({
        success: false,
        alreadyReviewed: true,
        error: `Token untuk pesanan #${cleanCode} sudah pernah digunakan untuk memberikan ulasan.`,
        data: {
          order_code: order.order_code,
          roblox_username: order.roblox_username,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        order_code: order.order_code,
        roblox_username: order.roblox_username,
        robux: order.robux,
        price: order.price,
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/testimonials/validate:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
