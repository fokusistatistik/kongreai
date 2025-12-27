import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token gereklidir.' },
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

    // Return verification status
    return NextResponse.json({
      verified: resetToken.n8n_verified,
      email: resetToken.email,
    });
  } catch (error: any) {
    console.error('Check reset status error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu.' },
      { status: 500 }
    );
  }
}
