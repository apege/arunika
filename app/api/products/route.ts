import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/products - Fetch active products for catalog / all products if query all=true
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    let query = supabaseAdmin
      .from('products')
      .select('id, name, robux, price, is_active, image_path')
      .order('robux', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching products:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Cache at Cloudflare Edge for 5 minutes on public storefront requests, zero-cache for admin
    const headers: Record<string, string> = includeInactive
      ? { 'Cache-Control': 'no-store' }
      : { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400' };

    return NextResponse.json({ success: true, data: data || [] }, { headers });
  } catch (err: any) {
    console.error('Error in GET /api/products:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, robux, price, is_active = true, image_path = null } = body;

    if (!robux || !price) {
      return NextResponse.json(
        { success: false, error: 'Nominal Robux dan Harga wajib diisi' },
        { status: 400 }
      );
    }

    const formattedName = name || `${Number(robux).toLocaleString('id-ID')} Robux`;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: formattedName,
        robux: Number(robux),
        price: Number(price),
        is_active: Boolean(is_active),
        image_path: image_path || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating product:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/products:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH /api/products - Update product (Admin)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, robux, price, is_active, image_path } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID wajib disertakan' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (robux !== undefined) updatePayload.robux = Number(robux);
    if (price !== undefined) updatePayload.price = Number(price);
    if (is_active !== undefined) updatePayload.is_active = Boolean(is_active);
    if (image_path !== undefined) updatePayload.image_path = image_path;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating product:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Error in PATCH /api/products:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/products - Delete product (Admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting product:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err: any) {
    console.error('Error in DELETE /api/products:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
