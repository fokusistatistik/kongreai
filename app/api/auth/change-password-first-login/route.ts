import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPassword } = body;

    // Validation
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, ilk_giris: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    // Check if user is in first login state
    if (!user.ilk_giris) {
      return NextResponse.json(
        { error: 'Bu işlem sadece ilk giriş için geçerlidir.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and set ilk_giris to false
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        ilk_giris: false,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Şifreniz başarıyla değiştirildi.',
      success: true,
    });
  } catch (error: any) {
    console.error('First login password change error:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
