import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = session.user as any;

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { ad, soyad, email, telefon, unvan, kurum, password, aktif } = body;

    // Validate required fields
    if (!ad || !soyad || !email || !password || !unvan || !kurum) {
      return NextResponse.json({ error: 'Ad, soyad, e-posta, ünvan, kurum ve şifre zorunludur' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create reviewer (HAKEM)
    const newReviewer = await prisma.user.create({
      data: {
        ad,
        soyad,
        email: email.toLowerCase(),
        password: hashedPassword,
        telefon: telefon || null,
        unvan,
        kurum,
        role: 'HAKEM',
        aktif: aktif !== undefined ? aktif : true,
        email_verified: false,
        ilk_giris: true, // Require password change on first login
      },
    });

    // TODO: Send email with temporary password
    // This should be handled by n8n webhook or email service
    // For now, we'll just log it (in production, integrate with email service)
    console.log(`New reviewer created: ${newReviewer.email} with temporary password`);

    return NextResponse.json({
      success: true,
      reviewer: {
        id: newReviewer.id,
        email: newReviewer.email,
        ad: newReviewer.ad,
        soyad: newReviewer.soyad,
        role: newReviewer.role,
      },
      message: 'Hakem başarıyla oluşturuldu. E-posta ile giriş bilgileri gönderilecektir.',
    });
  } catch (error: any) {
    console.error('Reviewer creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Hakem oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
