import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch orders, testimonials count, and blacklists count in parallel
    const [ordersResult, testimonialsResult, blacklistsResult] = await Promise.all([
      supabaseAdmin
        .from('orders')
        .select('price, robux, payment_status, order_status, payment_method'),
      supabaseAdmin
        .from('testimonials')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('blacklists')
        .select('*', { count: 'exact', head: true }),
    ]);

    if (ordersResult.error) {
      console.error('Supabase error fetching orders for stats:', ordersResult.error);
      return NextResponse.json({ success: false, error: ordersResult.error.message }, { status: 500 });
    }

    const allOrders = ordersResult.data || [];
    const testimonialsCount = testimonialsResult.count || 0;
    const blacklistsCount = blacklistsResult.count || 0;

    // Calculate metrics
    let totalOmset = 0;
    let totalRobuxTerjual = 0;
    let countMasuk = 0;
    let countDiproses = 0;
    let countSelesai = 0;
    let countDibatalkan = 0;
    let websiteOmset = 0;
    let websiteCount = 0;
    let whatsappOmset = 0;
    let whatsappCount = 0;
    let paidCount = 0;

    for (const order of allOrders) {
      const pStatus = (order.payment_status || '').toLowerCase();
      const oStatus = (order.order_status || '').toLowerCase();
      const isPaid = pStatus === 'paid' || oStatus === 'completed' || pStatus === 'settlement' || pStatus === 'success';
      const isWebsite = (order.payment_method || '').toLowerCase() === 'website';

      if (isPaid) {
        totalOmset += Number(order.price) || 0;
        totalRobuxTerjual += Number(order.robux) || 0;
        paidCount += 1;

        if (isWebsite) {
          websiteOmset += Number(order.price) || 0;
          websiteCount += 1;
        } else {
          whatsappOmset += Number(order.price) || 0;
          whatsappCount += 1;
        }
      }

      if (oStatus === 'pending') countMasuk += 1;
      else if (oStatus === 'processing') countDiproses += 1;
      else if (oStatus === 'completed') countSelesai += 1;
      else if (oStatus === 'cancelled') countDibatalkan += 1;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalOmset,
        totalRobuxTerjual,
        totalOrders: allOrders.length,
        paidCount,
        countMasuk,
        countDiproses,
        countSelesai,
        countDibatalkan,
        paymentBreakdown: {
          website: { omset: websiteOmset, count: websiteCount },
          whatsapp: { omset: whatsappOmset, count: whatsappCount },
        },
        testimonialsCount: testimonialsCount || 0,
        blacklistsCount: blacklistsCount || 0,
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/stats:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
