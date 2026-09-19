import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/admin/orders - Fetch orders with filters (status, search query)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100;
    const withProof = searchParams.get('withProof') === 'true';

    const selectColumns = withProof
      ? 'id, order_code, product_id, user_id, roblox_username, customer_phone, robux, price, payment_method, payment_status, payment_proof_path, order_status, created_at, updated_at, roblox_user_id, customer_notes, admin_notes'
      : 'id, order_code, product_id, user_id, roblox_username, customer_phone, robux, price, payment_method, payment_status, order_status, created_at, updated_at, roblox_user_id, customer_notes, admin_notes';

    let query = supabaseAdmin
      .from('orders')
      .select(selectColumns)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'semua') {
      query = query.eq('order_status', status);
    }

    if (q) {
      const cleanQ = q.trim().replace(/^@/, '').replace(/^#/, '');
      query = query.or(
        `order_code.ilike.%${cleanQ}%,roblox_username.ilike.%${cleanQ}%,customer_phone.ilike.%${cleanQ}%`
      );
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Supabase error fetching admin orders:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: orders || [] });
  } catch (err: any) {
    console.error('Error in GET /api/admin/orders:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
