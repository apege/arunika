import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/admin/blacklists - Fetch all blacklisted accounts
export async function GET() {
  try {
    const { data: blacklists, error } = await supabaseAdmin
      .from('blacklists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching blacklists:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: blacklists || [] });
  } catch (err: any) {
    console.error('Error in GET /api/admin/blacklists:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/blacklists - Add account to blacklist
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roblox_username, reason, roblox_user_id, phone } = body;

    if (!roblox_username) {
      return NextResponse.json(
        { success: false, error: 'Username Roblox wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUsername = roblox_username.trim().replace(/^@/, '');

    const { data, error } = await supabaseAdmin
      .from('blacklists')
      .insert({
        roblox_username: cleanUsername,
        reason: reason || 'Indikasi penipuan atau penyalahgunaan',
        roblox_user_id: roblox_user_id ? String(roblox_user_id) : null,
        phone: phone ? String(phone).replace(/[^0-9]/g, '') : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating blacklist:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/admin/blacklists:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blacklists - Remove account from blacklist by id or username
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');

    if (!id && !username) {
      return NextResponse.json(
        { success: false, error: 'ID or username is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin.from('blacklists').delete();
    if (id) {
      query = query.eq('id', Number(id));
    } else if (username) {
      query = query.eq('roblox_username', username.trim().replace(/^@/, ''));
    }

    const { error } = await query;

    if (error) {
      console.error('Supabase error deleting blacklist:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil dihapus dari blacklist' });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/blacklists:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
