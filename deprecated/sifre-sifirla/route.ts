import { NextRequest, NextResponse } from 'next/server';
import { sifreSifirlaSchema } from '@/lib/validations/password';
import { logAktivite } from '@/lib/log';
import { prisma } from '@/lib/prisma';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

// Rate limiting: IP başına son istek zamanları (in-memory)
// Production'da Redis kullanılmalı
const rateLimitMap = new Map<string, number[]>();

/**
 * Rate limiting kontrolü
 * Aynı IP'den 5 dakikada max 1 istek
 */
function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 dakika
  const maxRequests = 1;

  // IP'nin geçmiş isteklerini al
  const requests = rateLimitMap.get(ip) || [];

  // Pencere dışındaki istekleri temizle
  const validRequests = requests.filter((time) => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    // Limit aşıldı
    const oldestRequest = Math.min(...validRequests);
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000); // saniye cinsinden
    return { allowed: false, retryAfter };
  }

  // Yeni isteği ekle
  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);

  // Eski girişleri temizle (memory leak önlemi)
  if (rateLimitMap.size > 10000) {
    const sortedEntries = Array.from(rateLimitMap.entries())
      .sort((a, b) => Math.max(...b[1]) - Math.max(...a[1]));
    rateLimitMap.clear();
    sortedEntries.slice(0, 5000).forEach(([key, value]) => {
      rateLimitMap.set(key, value);
    });
  }

  return { allowed: true };
}

/**
 * POST /api/sifre-sifirla
 * Şifre sıfırlama talebi oluşturur (SERVER-SIDE)
 * 1. Kullanıcı doğrulama
 * 2. Token oluşturma ve DB'ye kaydetme (SUNUCUDA)
 * 3. Email gönderme (n8n webhook - OPERASYONEL)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validated = sifreSifirlaSchema.parse(body);

    // IP adresi al
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Rate limiting kontrolü
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      await logAktivite({
        islem: 'sifre.sifirla.rate_limit',
        tablo: 'personel',
        aciklama: `Rate limit aşıldı: ${ip}`,
      });

      return NextResponse.json(
        {
          error: `Çok fazla istek. Lütfen ${rateLimit.retryAfter} saniye sonra tekrar deneyiniz.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter?.toString() || '300',
          },
        }
      );
    }

    // 1. Kullanıcıyı bul (hem TC hem email eşleşmeli - güvenlik)
    const personel = await prisma.personel.findFirst({
      where: {
        tc_kimlik_no: validated.tc_kimlik_no,
        email: validated.email,
      },
      select: {
        id: true,
        tc_kimlik_no: true,
        email: true,
        ad: true,
        soyad: true,
        aktif: true,
      },
    });

    // Güvenlik: Kullanıcı bulunamadı ama generic mesaj ver (email enumeration önleme)
    if (!personel) {
      // Fake success response (güvenlik)
      await logAktivite({
        islem: 'sifre.sifirla.kullanici_bulunamadi',
        tablo: 'personel',
        aciklama: `Şifre sıfırlama denemesi - kullanıcı bulunamadı: ${validated.tc_kimlik_no} / ${validated.email}`,
      });

      return NextResponse.json({
        success: true,
        message: 'Eğer bu bilgiler sistemde kayıtlıysa, şifre sıfırlama bağlantısı email adresinize gönderildi',
      });
    }

    // Kullanıcı aktif değilse
    if (!personel.aktif) {
      await logAktivite({
        personel_id: personel.id,
        personel_email: personel.email,
        islem: 'sifre.sifirla.pasif_kullanici',
        tablo: 'personel',
        kayit_id: personel.id,
        aciklama: `Pasif kullanıcı için şifre sıfırlama denemesi`,
      });

      return NextResponse.json(
        { error: 'Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.' },
        { status: 403 }
      );
    }

    // 2. Önceki kullanılmamış tokenları iptal et (temizlik)
    await prisma.passwordResetToken.updateMany({
      where: {
        personel_id: personel.id,
        kullanildi: false,
      },
      data: {
        kullanildi: true, // Eski tokenları kullanıldı olarak işaretle
      },
    });

    // 3. Yeni token oluştur ve DB'ye kaydet
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // 1 saat geçerli

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        personel_id: personel.id,
        tc_kimlik_no: personel.tc_kimlik_no,
        email: personel.email,
        expires_at: tokenExpiry,
        ip_adresi: ip,
      },
    });

    // 4. n8n'e email gönderme isteği yap (SADECE OPERASYONEL)
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://halksagligi.fokusistatistik.com'}/sifre-yenile?token=${resetToken.token}`;

    try {
      await fetch(`${N8N_WEBHOOK_URL}/webhook/sifre-sifirla-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: personel.email,
          ad: personel.ad,
          soyad: personel.soyad,
          reset_url: resetUrl,
          expires_at: tokenExpiry.toISOString(),
        }),
      });
    } catch (emailError) {
      // Email gönderimi başarısız olsa bile token oluşturuldu
      // Kullanıcıya success mesajı ver (token DB'de)
    }

    // 5. Başarılı log
    await logAktivite({
      personel_id: personel.id,
      personel_email: personel.email,
      islem: 'sifre.sifirla.talep',
      tablo: 'personel',
      kayit_id: personel.id,
      aciklama: `Şifre sıfırlama talebi oluşturuldu`,
    });

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi',
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
