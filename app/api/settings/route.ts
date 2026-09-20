import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  storeName: 'ArunikaStore',
  whatsappCS: '6281234567890',
  promo: {
    isActive: true,
    packageId: 'rbx-2400',
    packageLabel: '2.400 Robux',
    packagePrice: 45000,
    headline: '⚡ PROMO FLASH SALE ROBUX HARI INI!',
    description: 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!',
    countdownDate: '30 September 2026 • 23:59 WIB',
    bannerImage: null as string | null,
  },
  qris: {
    nmid: 'ID1029384756102',
    isInstalled: true,
    qrisImage: null as string | null,
  },
  logo: {
    logoPath: '/logo.png',
    isInstalled: true,
  },
};

// GET /api/settings - Fetch global store settings
export async function GET() {
  try {
    const { data: row, error: dbError } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!dbError && row) {
      let parsedFromAdminNote: any = {};
      if (row.admin_note) {
        try {
          parsedFromAdminNote = JSON.parse(row.admin_note);
        } catch {
          // ignore parsing error
        }
      }

      const formattedSettings = {
        storeName: row.store_name || parsedFromAdminNote.storeName || DEFAULT_SETTINGS.storeName,
        whatsappCS: row.whatsapp_number || parsedFromAdminNote.whatsappCS || DEFAULT_SETTINGS.whatsappCS,
        promo: {
          isActive: row.promo_active !== undefined && row.promo_active !== null ? row.promo_active : (parsedFromAdminNote.promo?.isActive ?? DEFAULT_SETTINGS.promo.isActive),
          packageId: row.promo_original_label || parsedFromAdminNote.promo?.packageId || DEFAULT_SETTINGS.promo.packageId,
          packageLabel: row.promo_title || parsedFromAdminNote.promo?.packageLabel || DEFAULT_SETTINGS.promo.packageLabel,
          packagePrice: row.promo_discount_price || parsedFromAdminNote.promo?.packagePrice || DEFAULT_SETTINGS.promo.packagePrice,
          headline: row.promo_tag || parsedFromAdminNote.promo?.headline || DEFAULT_SETTINGS.promo.headline,
          description: row.promo_subtitle || parsedFromAdminNote.promo?.description || DEFAULT_SETTINGS.promo.description,
          countdownDate: parsedFromAdminNote.promo?.countdownDate || DEFAULT_SETTINGS.promo.countdownDate,
          bannerImage: row.banner_image_path || parsedFromAdminNote.promo?.bannerImage || null,
        },
        qris: {
          nmid: parsedFromAdminNote.qris?.nmid || DEFAULT_SETTINGS.qris.nmid,
          isInstalled: parsedFromAdminNote.qris?.isInstalled ?? DEFAULT_SETTINGS.qris.isInstalled,
          qrisImage: row.qris_image_path || parsedFromAdminNote.qris?.qrisImage || null,
        },
        logo: {
          logoPath: row.logo_image_path || parsedFromAdminNote.logo?.logoPath || DEFAULT_SETTINGS.logo.logoPath,
          isInstalled: parsedFromAdminNote.logo?.isInstalled ?? DEFAULT_SETTINGS.logo.isInstalled,
        },
      };

      return NextResponse.json(
        { success: true, data: formattedSettings },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    return NextResponse.json(
      { success: true, data: DEFAULT_SETTINGS },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    console.error('Error in GET /api/settings:', err);
    return NextResponse.json(
      { success: true, data: DEFAULT_SETTINGS },
      { status: 200 }
    );
  }
}

// POST /api/settings - Update global store settings (Admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid settings payload' },
        { status: 400 }
      );
    }

    const mergedSettings = {
      ...DEFAULT_SETTINGS,
      ...body,
      promo: {
        ...DEFAULT_SETTINGS.promo,
        ...(body.promo || {}),
      },
      qris: {
        ...DEFAULT_SETTINGS.qris,
        ...(body.qris || {}),
      },
      logo: {
        ...DEFAULT_SETTINGS.logo,
        ...(body.logo || {}),
      },
    };

    const dbPayload = {
      store_name: mergedSettings.storeName,
      whatsapp_number: mergedSettings.whatsappCS,
      qris_image_path: mergedSettings.qris?.qrisImage || null,
      logo_image_path: mergedSettings.logo?.logoPath || '/logo.png',
      banner_image_path: mergedSettings.promo?.bannerImage || null,
      promo_active: Boolean(mergedSettings.promo?.isActive),
      promo_tag: mergedSettings.promo?.headline || '',
      promo_title: mergedSettings.promo?.packageLabel || '',
      promo_subtitle: mergedSettings.promo?.description || '',
      promo_original_label: mergedSettings.promo?.packageId || '',
      promo_discount_price: Number(mergedSettings.promo?.packagePrice) || 0,
      admin_note: JSON.stringify(mergedSettings),
      updated_at: new Date().toISOString(),
    };

    // Check if row exists in store_settings
    const { data: existingRows } = await supabaseAdmin
      .from('store_settings')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (existingRows && existingRows.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('store_settings')
        .update(dbPayload)
        .eq('id', existingRows[0].id);

      if (updateError) {
        console.error('Supabase update store_settings error:', updateError);
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('store_settings')
        .insert(dbPayload);

      if (insertError) {
        console.error('Supabase insert store_settings error:', insertError);
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan toko berhasil disimpan secara permanen di database!',
      data: mergedSettings,
    });
  } catch (err: any) {
    console.error('Error in POST /api/settings:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
