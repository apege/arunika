import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/admin/testimonials - Fetch all testimonials with optional status filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'semua') {
      query = query.eq('status', status);
    }

    const { data: testimonials, error } = await query;

    if (error) {
      console.error('Supabase error fetching admin testimonials:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: testimonials || [] });
  } catch (err: any) {
    console.error('Error in GET /api/admin/testimonials:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/testimonials - Add new testimonial manually (Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message, rating = 5, status = 'approved', order_code = null } = body;

    if (!name || !message) {
      return NextResponse.json(
        { success: false, error: 'Username dan isi ulasan wajib diisi' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .insert({
        name: name.trim().replace(/^@/, ''),
        message: message.trim(),
        rating: Math.min(5, Math.max(1, Number(rating))),
        status: status || 'approved',
        order_code: order_code || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating testimonial:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/admin/testimonials:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/testimonials - Update status, reply, or content
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, admin_reply, name, message, rating } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updatePayload.status = status;
    if (admin_reply !== undefined) updatePayload.admin_reply = admin_reply;
    if (name !== undefined) updatePayload.name = name.trim().replace(/^@/, '');
    if (message !== undefined) updatePayload.message = message.trim();
    if (rating !== undefined) updatePayload.rating = Number(rating);

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .update(updatePayload)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating testimonial:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH /api/admin/testimonials:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/testimonials - Delete testimonial by id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', Number(id));

    if (error) {
      console.error('Supabase error deleting testimonial:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Testimoni berhasil dihapus' });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/testimonials:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
