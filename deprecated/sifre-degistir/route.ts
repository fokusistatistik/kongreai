import { NextRequest, NextResponse } from 'next/server';
import { sifreDegistirSchema } from '@/lib/validations/password';
import { logAktivite } from '@/lib/log';
import { getCurrentUser } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/sifre-degistir
 * Kullanıcının şifresini değiştirir (TAMAMEN SUNUCUDA)
 * İlk giriş veya normal şifre değiştirme
 * 1. Session kontrolü
 * 2. Eski şifre kontrolü
 * 3. Yeni şifre güncelle
 * 4. ilk_giris = false yap
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Session kontrolü - kullanıcı login olmalı
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation
    const validated = sifreDegistirSchema.parse(body);

    // 2. Kullanıcıyı DB'den al (şifreyle birlikte)
    const personel = await prisma.personel.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        password: true,
        ilk_giris: true,
        aktif: true,
      },
    });

    if (!personel) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    if (!personel.aktif) {
      return NextResponse.json(
        { error: 'Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.' },
        { status: 403 }
      );
    }

    // 3. Eski şifre kontrolü
    const isOldPasswordValid = await bcrypt.compare(validated.eski_sifre, personel.password);

    if (!isOldPasswordValid) {
      await logAktivite({
        personel_id: user.id,
        personel_email: user.email,
        islem: 'sifre.degistir.yanlis_eski_sifre',
        tablo: 'personel',
        kayit_id: user.id,
        aciklama: `Şifre değiştirme başarısız - yanlış eski şifre`,
      });

      return NextResponse.json(
        { error: 'Eski şifreniz hatalı' },
        { status: 400 }
      );
    }

    // 4. Yeni şifreyi hashle ve güncelle
    const hashedPassword = await bcrypt.hash(validated.yeni_sifre, 10);

    await prisma.personel.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        ilk_giris: false, // Artık ilk giriş değil
      },
    });

    // 5. Başarılı log
    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'sifre.degistir',
      tablo: 'personel',
      kayit_id: user.id,
      aciklama: `Şifre başarıyla değiştirildi${personel.ilk_giris ? ' (İlk giriş)' : ''}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi',
    });
  } catch (error: any) {
    // Zod validation hatası
    if (error.errors) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
