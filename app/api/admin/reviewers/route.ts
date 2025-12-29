import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { reviewerSchema, validateAndSanitize } from '@/app/lib/validation';

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
    const { ad, soyad, email, telefon, unvan, kurum, password, aktif, uzmanlik_alani } = body;

    // Validate input using Zod schema
    const validation = validateAndSanitize({
      ad,
      soyad,
      email,
      telefon: telefon || '',
      unvan,
      kurum,
      password,
      uzmanlik_alani,
    }, reviewerSchema);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validasyon hatası',
        details: validation.errors
      }, { status: 400 });
    }

    const validatedData = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create reviewer (HAKEM)
    const newReviewer = await prisma.user.create({
      data: {
        ad: validatedData.ad,
        soyad: validatedData.soyad,
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        telefon: validatedData.telefon || null,
        unvan: validatedData.unvan,
        kurum: validatedData.kurum,
        uzmanlik_alani: validatedData.uzmanlik_alani || null,
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
