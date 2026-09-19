import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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
    bannerImage: null,
  },
  qris: {
    nmid: 'ID1029384756102',
    isInstalled: true,
    qrisImage: null,
  },
  logo: {
    logoPath: '/logo.png',
    isInstalled: true,
  },
};

const settingsFilePath = path.join(process.cwd(), 'app', 'data', 'store_settings.json');

function readLocalSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const raw = fs.readFileSync(settingsFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local store settings:', err);
  }
  return DEFAULT_SETTINGS;
}

function writeLocalSettings(data: any) {
  try {
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local store settings:', err);
  }
}

// GET /api/settings - Fetch global store settings
export async function GET() {
  try {
    // 1. Try to read from Supabase if table exists
    try {
      const { data: dbSettings, error: dbError } = await supabaseAdmin
        .from('store_settings')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!dbError && dbSettings && dbSettings.settings) {
        return NextResponse.json(
          { success: true, data: dbSettings.settings },
          {
            headers: {
              'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
            },
          }
        );
      }
    } catch {
      // Table doesn't exist, proceed to local JSON
    }

    // 2. Read from persistent local file
    const settings = readLocalSettings();
    return NextResponse.json(
      { success: true, data: settings },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
        },
      }
    );
  } catch (err: any) {
    console.error('Error in GET /api/settings:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch settings' },
      { status: 500 }
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

    // 1. Persist to local JSON file
    writeLocalSettings(mergedSettings);

    // 2. Also try to persist to Supabase if table exists
    try {
      await supabaseAdmin.from('store_settings').upsert({
        id: 1,
        settings: mergedSettings,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Ignore if table not yet created
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan toko berhasil disimpan secara global',
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
