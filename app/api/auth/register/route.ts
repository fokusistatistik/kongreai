import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad, soyad, email, telefon, unvan, kurum, password } = body;

    // Validation
    if (!ad || !soyad || !email || !password) {
      return NextResponse.json(
        { error: 'Ad, soyad, e-posta ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifre hash
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        ad,
        soyad,
        email,
        telefon: telefon || null,
        unvan: unvan || null,
        kurum: kurum || null,
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
