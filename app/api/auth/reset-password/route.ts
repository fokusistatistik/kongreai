import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token ve yeni şifre gereklidir.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Find reset token
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      select: {
        id: true,
        email: true,
        n8n_verified: true,
        expires_at: true,
        used: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Geçersiz token.' },
        { status: 404 }
      );
    }

    // Check if verified by n8n
    if (!resetToken.n8n_verified) {
      return NextResponse.json(
        { error: 'E-posta doğrulaması yapılmamış.' },
        { status: 403 }
      );
    }

    // Check if expired
    if (new Date() > resetToken.expires_at) {
      return NextResponse.json(
        { error: 'Token süresi doldu.' },
        { status: 410 }
      );
    }

    // Check if already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Bu token zaten kullanıldı.' },
        { status: 410 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: {
          password: hashedPassword,
          updated_at: new Date(),
        },
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: {
          used: true,
          used_at: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Şifreniz başarıyla değiştirildi.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Şifre sıfırlanamadı. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
