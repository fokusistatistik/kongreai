import { NextRequest, NextResponse } from 'next/server';
import { sifreYenileSchema } from '@/lib/validations/password';
import { logAktivite } from '@/lib/log';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/sifre-yenile
 * Token ile şifre yeniler (TAMAMEN SUNUCUDA)
 * 1. Token kontrol (DB'de)
 * 2. Token expire kontrolü
 * 3. Şifre güncelle (DB'de)
 * 4. Token kullanıldı işaretle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validated = sifreYenileSchema.parse(body);

    // 1. Token'ı DB'de bul
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validated.token },
    });

    // Token bulunamadı
    if (!resetToken) {
      await logAktivite({
        islem: 'sifre.yenile.gecersiz_token',
        tablo: 'personel',
        aciklama: `Geçersiz token ile şifre yenileme denemesi`,
      });

      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı' },
        { status: 400 }
      );
    }

    // Token zaten kullanılmış
    if (resetToken.kullanildi) {
      await logAktivite({
        personel_id: resetToken.personel_id,
        personel_email: resetToken.email,
        islem: 'sifre.yenile.kullanilmis_token',
        tablo: 'personel',
        kayit_id: resetToken.personel_id,
        aciklama: `Kullanılmış token ile şifre yenileme denemesi`,
      });

      return NextResponse.json(
        { error: 'Bu şifre sıfırlama bağlantısı zaten kullanılmış. Lütfen yeni bir talepte bulunun.' },
        { status: 400 }
      );
    }

    // Token süresi dolmuş
    if (new Date() > resetToken.expires_at) {
      await logAktivite({
        personel_id: resetToken.personel_id,
        personel_email: resetToken.email,
        islem: 'sifre.yenile.suresi_dolmus_token',
        tablo: 'personel',
        kayit_id: resetToken.personel_id,
        aciklama: `Süresi dolmuş token ile şifre yenileme denemesi`,
      });

      // Token'ı kullanıldı olarak işaretle (güvenlik)
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { kullanildi: true },
      });

      return NextResponse.json(
        { error: 'Şifre sıfırlama bağlantısının süresi dolmuş. Lütfen yeni bir talepte bulunun.' },
        { status: 400 }
      );
    }

    // 2. Personeli bul
    const personel = await prisma.personel.findUnique({
      where: { id: resetToken.personel_id },
      select: {
        id: true,
        email: true,
        ad: true,
        soyad: true,
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

    // 3. Yeni şifreyi hashle ve güncelle
    const hashedPassword = await bcrypt.hash(validated.yeni_sifre, 10);

    await prisma.personel.update({
      where: { id: personel.id },
      data: {
        password: hashedPassword,
        ilk_giris: false, // Şifre yenilendi, artık ilk giriş değil
      },
    });

    // 4. Token'ı kullanıldı olarak işaretle
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { kullanildi: true },
    });

    // 5. Başarılı log
    await logAktivite({
      personel_id: personel.id,
      personel_email: personel.email,
      islem: 'sifre.yenile',
      tablo: 'personel',
      kayit_id: personel.id,
      aciklama: `Şifre token ile yenilendi`,
    });

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla yenilendi',
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
