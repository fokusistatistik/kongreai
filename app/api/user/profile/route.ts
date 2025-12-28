import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ad, soyad, unvan, kurum, telefon, ogrenci, ulke, sehir } = body;

    // Validation
    if (!ad || !soyad) {
      return NextResponse.json(
        { error: 'Ad ve soyad zorunludur.' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ad,
        soyad,
        unvan: unvan || null,
        kurum: kurum || null,
        telefon: telefon || null,
        ogrenci: ogrenci !== undefined ? ogrenci : false,
        ulke: ulke || null,
        sehir: sehir || null,
        updated_at: new Date(),
      },
      select: {
        id: true,
        email: true,
        ad: true,
        soyad: true,
        unvan: true,
        kurum: true,
        telefon: true,
        ogrenci: true,
        ulke: true,
        sehir: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi.',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
