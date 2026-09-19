import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/testimonials - Fetch approved testimonials for storefront
export async function GET() {
  try {
    let { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('id, user_id, name, message, rating, image_path, status, created_at, admin_reply, order_code')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Supabase error fetching testimonials:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const orderCodes = (data || []).map((t) => t.order_code).filter(Boolean);
    const orderMap: Record<string, number> = {};
    if (orderCodes.length > 0) {
      const { data: ordersData } = await supabaseAdmin
        .from('orders')
        .select('order_code, robux')
        .in('order_code', orderCodes);
      if (ordersData) {
        for (const o of ordersData) {
          orderMap[o.order_code] = o.robux;
        }
      }
    }

    const enhancedData = (data || []).map((t) => {
      const robuxAmount = t.order_code && orderMap[t.order_code] ? orderMap[t.order_code] : null;
      return {
        ...t,
        order_code: undefined, // Hide private order code from public response
        robux: robuxAmount,
        package_name: robuxAmount ? `${Number(robuxAmount).toLocaleString('id-ID')} Robux` : 'Paket Robux',
      };
    });

    // Cache at Cloudflare Edge for 5 minutes (s-maxage=300)
    return NextResponse.json(
      { success: true, data: enhancedData },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err: any) {
    console.error('Error in GET /api/testimonials:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials - Submit a review by verified buyer with token/order_code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      message,
      rating = 5,
      order_code,
      user_id = null,
      image_path = null,
    } = body;

    if (!name || !message || !order_code) {
      return NextResponse.json(
        { success: false, error: 'Nama, pesan ulasan, dan kode order wajib disertakan.' },
        { status: 400 }
      );
    }

    const cleanCode = String(order_code).trim().replace(/^#/, '');

    // 1. Verify order code in orders table
    const { data: matchedOrder, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_code', cleanCode)
      .maybeSingle();

    if (orderErr || !matchedOrder) {
      return NextResponse.json(
        { success: false, error: `Kode pesanan #${cleanCode} tidak valid atau tidak ditemukan.` },
        { status: 400 }
      );
    }

    // 2. Enforce 1-time use: Check if this order_code already has a testimonial
    const { data: existingReview } = await supabaseAdmin
      .from('testimonials')
      .select('id')
      .eq('order_code', cleanCode)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: `Pesanan #${cleanCode} sudah pernah digunakan untuk memberikan ulasan. Token hanya dapat digunakan satu kali.`,
        },
        { status: 400 }
      );
    }

    // 2. Insert testimonial (auto approved for verified order buyers)
    const { data: newTestimonial, error: insertErr } = await supabaseAdmin
      .from('testimonials')
      .insert({
        user_id: user_id || matchedOrder.user_id || null,
        name: name.trim().replace(/^@/, ''),
        message: message.trim(),
        rating: Math.min(5, Math.max(1, Number(rating))),
        image_path: image_path || null,
        status: 'approved',
        order_code: cleanCode,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Supabase error inserting testimonial:', insertErr);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Ulasan berhasil diterbitkan!',
        data: newTestimonial,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error in POST /api/testimonials:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
