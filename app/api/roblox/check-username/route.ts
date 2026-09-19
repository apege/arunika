import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();

  if (!username) {
    return NextResponse.json(
      { success: false, message: 'Username tidak boleh kosong' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch user details from Roblox Users API
    const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: false,
      }),
      cache: 'no-store',
    });

    if (!userRes.ok) {
      throw new Error(`Roblox API responded with status ${userRes.status}`);
    }

    const userData = await userRes.json();

    if (!userData.data || userData.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Username Roblox "@${username}" tidak ditemukan. Pastikan ejaan sudah benar.`,
      });
    }

    const user = userData.data[0];
    const userId = user.id;

    // 2. Fetch avatar headshot thumbnail
    let avatarUrl = '';
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`,
        { cache: 'no-store' }
      );
      if (thumbRes.ok) {
        const thumbData = await thumbRes.json();
        if (thumbData.data && thumbData.data.length > 0) {
          avatarUrl = thumbData.data[0].imageUrl;
        }
      }
    } catch {
      // Thumbnail fetch failed, continue with empty avatarUrl
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          displayName: user.displayName,
          hasVerifiedBadge: user.hasVerifiedBadge || false,
          avatarUrl,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Roblox user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal menghubungi server Roblox. Silakan coba beberapa saat lagi.',
      },
      { status: 500 }
    );
  }
}
