import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/orders/[id] - Fetch single order details
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cleanId = id.trim().replace(/^#/, '');

    // Search by numeric id or order_code
    let query = supabaseAdmin.from('orders').select('*');
    if (!isNaN(Number(cleanId))) {
      query = query.or(`id.eq.${Number(cleanId)},order_code.eq.${cleanId}`);
    } else {
      query = query.eq('order_code', cleanId);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    console.error('Error in GET /api/admin/orders/[id]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[id] - Update status, payment status, or admin notes
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cleanId = id.trim().replace(/^#/, '');
    const body = await request.json();
    const { order_status, payment_status, admin_notes, customer_notes } = body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (order_status !== undefined) {
      updatePayload.order_status = order_status;
      if (order_status === 'completed') {
        updatePayload.payment_status = 'paid';
      }
    }
    if (payment_status !== undefined) updatePayload.payment_status = payment_status;
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;
    if (customer_notes !== undefined) updatePayload.customer_notes = customer_notes;

    let query = supabaseAdmin.from('orders').update(updatePayload);
    if (!isNaN(Number(cleanId))) {
      query = query.or(`id.eq.${Number(cleanId)},order_code.eq.${cleanId}`);
    } else {
      query = query.eq('order_code', cleanId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('Supabase error updating order:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH /api/admin/orders/[id]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
