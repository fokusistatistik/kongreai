import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import { registerSchema, validateAndSanitize } from '@/app/lib/validation';
import { checkRateLimit, getIpFromRequest, RATE_LIMITS } from '@/app/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limiting check
    const ip = getIpFromRequest(request);
    const rateLimitResult = checkRateLimit(ip, 'register', RATE_LIMITS.API_GENERAL);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: `Çok fazla kayıt denemesi. ${rateLimitResult.retryAfter} saniye sonra tekrar deneyin.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          }
        }
      );
    }

    const body = await request.json();
    const { ad, soyad, email, telefon, unvan, kurum, password } = body;

    // Validate input using Zod schema
    const validation = validateAndSanitize({
      ad,
      soyad,
      email,
      password,
      telefon: telefon || '',
      unvan: unvan || '',
      kurum: kurum || '',
    }, registerSchema);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Validasyon hatası',
        details: validation.errors
      }, { status: 400 });
    }

    const validatedData = validation.data;

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifre hash
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        ad: validatedData.ad,
        soyad: validatedData.soyad,
        email: validatedData.email,
        telefon: validatedData.telefon || null,
        unvan: validatedData.unvan || null,
        kurum: validatedData.kurum || null,
        password: hashedPassword,
        role: 'KATILIMCI',
        aktif: true,
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        user_id: user.id,
        user_email: user.email,
        islem: 'user.register',
        tablo: 'users',
        kayit_id: user.id,
        aciklama: `Yeni kullanıcı kaydı: ${user.ad} ${user.soyad}`,
      },
    });

    return NextResponse.json(
      {
        message: 'Kayıt başarılı',
        user: {
          id: user.id,
          email: user.email,
          ad: user.ad,
          soyad: user.soyad,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
