import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET /api/admin/storage - Get active proof count and run 90-day auto-cleanup
export async function GET() {
  try {
    // 1. Run Auto-Cleanup: Set payment_proof_path = null for orders older than 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    try {
      await supabaseAdmin
        .from('orders')
        .update({ payment_proof_path: null })
        .lt('created_at', ninetyDaysAgo)
        .not('payment_proof_path', 'is', null);
    } catch (cleanupErr) {
      console.error('Auto cleanup error:', cleanupErr);
    }

    // 2. Count active proofs currently stored in database
    const { count, error } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .not('payment_proof_path', 'is', null);

    if (error) {
      console.error('Supabase count error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 3. Count proofs nearing 90-day threshold (older than 80 days, i.e. < 10 days remaining)
    const eightyDaysAgo = new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString();
    const { count: expiringCount } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', eightyDaysAgo)
      .not('payment_proof_path', 'is', null);

    return NextResponse.json({
      success: true,
      activeProofsCount: count || 0,
      expiringSoonCount: expiringCount || 0,
      autoCleanupActive: true,
      retentionDays: 90,
      testimonialRetention: 'Permanen',
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/storage:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
