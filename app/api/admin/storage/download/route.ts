import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { supabaseAdmin } from '../../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all orders with active payment proof images
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_code, roblox_username, robux, price, created_at, payment_proof_path')
      .not('payment_proof_path', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proofs for backup:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada bukti transfer yang tersimpan saat ini.' },
        { status: 404 }
      );
    }

    const zip = new JSZip();
    let summaryText = `CADANGAN BUKTI TRANSFER PEMBAYARAN - ARUNIKA STORE\n`;
    summaryText += `Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}\n`;
    summaryText += `Total Bukti Transfer: ${orders.length} file\n`;
    summaryText += `=======================================================\n\n`;

    let fileIndex = 1;
    for (const order of orders) {
      const proof = order.payment_proof_path;
      if (!proof) continue;

      const dateStr = new Date(order.created_at)
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      const cleanUser = (order.roblox_username || 'player').replace(/[^a-zA-Z0-9_-]/g, '_');
      const orderCode = order.order_code || `ARK${order.id}`;

      let extension = 'webp';
      let base64Data = proof;

      if (proof.startsWith('data:image/')) {
        const matches = proof.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          base64Data = matches[2];
        }
      }

      const fileName = `${dateStr}_${orderCode}_${cleanUser}.${extension}`;
      const buffer = Buffer.from(base64Data, 'base64');
      zip.file(fileName, buffer);

      summaryText += `${fileIndex}. File: ${fileName} | Order: #${orderCode} | User: @${order.roblox_username} | Nominal: Rp ${(order.price || 0).toLocaleString('id-ID')} (${(order.robux || 0).toLocaleString('id-ID')} R$)\n`;
      fileIndex++;
    }

    zip.file('RINGKASAN_CADANGAN.txt', summaryText);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const nowIso = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `backup_bukti_transfer_arunika_${nowIso}.zip`;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Error generating backup zip:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal membuat file cadangan ZIP' },
      { status: 500 }
    );
  }
}
