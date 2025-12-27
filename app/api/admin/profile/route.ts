import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const user = session.user as any;
    const role = user?.role;

    // Check if user has admin privileges
    if (role !== 'ADMIN' && role !== 'HAKEM' && role !== 'SUPER_ADMIN' && role !== 'ORGANIZATOR') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ad, soyad, unvan, kurum, telefon } = body;

    // Validation
    if (!ad || !soyad) {
      return NextResponse.json(
        { error: 'Ad ve soyad zorunludur.' },
        { status: 400 }
      );
    }

    // Update admin profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ad,
        soyad,
        unvan: unvan || null,
        kurum: kurum || null,
        telefon: telefon || null,
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
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Profil başarıyla güncellendi.',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Admin profile update error:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
