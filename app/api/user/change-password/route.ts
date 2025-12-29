import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getIpFromRequest, RATE_LIMITS } from '@/app/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor.' },
        { status: 401 }
      );
    }

    // Rate limiting check
    const ip = getIpFromRequest(request);
    const rateLimitResult = checkRateLimit(ip, 'password-change', RATE_LIMITS.PASSWORD_CHANGE);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Çok fazla şifre değiştirme denemesi. ${rateLimitResult.retryAfter} saniye sonra tekrar deneyin.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          }
        }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurun.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Şifre başarıyla değiştirildi.',
    });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Şifre değiştirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
