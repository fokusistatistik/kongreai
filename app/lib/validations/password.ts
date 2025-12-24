import { z } from 'zod';

// ============================================
// ŞİFRE POLİTİKASI VALIDATION
// ============================================

/**
 * Şifre Politikası:
 * - Minimum 8 karakter
 * - En az 1 büyük harf
 * - En az 1 küçük harf
 * - En az 1 rakam
 * - Özel karakter önerilen ama zorunlu değil
 */
export const sifreSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .regex(/[A-Z]/, 'En az 1 büyük harf içermelidir')
  .regex(/[a-z]/, 'En az 1 küçük harf içermelidir')
  .regex(/[0-9]/, 'En az 1 rakam içermelidir');

/**
 * Şifre gücünü hesaplar (0-100 arası)
 */
export function sifreGucuHesapla(sifre: string): {
  skor: number;
  seviye: 'zayif' | 'orta' | 'guclu';
  mesajlar: string[];
} {
  let skor = 0;
  const mesajlar: string[] = [];

  // Uzunluk kontrolü (max 40 puan)
  if (sifre.length >= 8) {
    skor += 10;
  }
  if (sifre.length >= 12) {
    skor += 15;
  }
  if (sifre.length >= 16) {
    skor += 15;
  }

  // Büyük harf (15 puan)
  if (/[A-Z]/.test(sifre)) {
    skor += 15;
    mesajlar.push('✓ Büyük harf');
  } else {
    mesajlar.push('✗ Büyük harf gerekli');
  }

  // Küçük harf (15 puan)
  if (/[a-z]/.test(sifre)) {
    skor += 15;
    mesajlar.push('✓ Küçük harf');
  } else {
    mesajlar.push('✗ Küçük harf gerekli');
  }

  // Rakam (15 puan)
  if (/[0-9]/.test(sifre)) {
    skor += 15;
    mesajlar.push('✓ Rakam');
  } else {
    mesajlar.push('✗ Rakam gerekli');
  }

  // Özel karakter (15 puan, opsiyonel)
  if (/[^A-Za-z0-9]/.test(sifre)) {
    skor += 15;
    mesajlar.push('✓ Özel karakter');
  } else {
    mesajlar.push('○ Özel karakter (önerilen)');
  }

  // Seviye belirleme
  let seviye: 'zayif' | 'orta' | 'guclu';
  if (skor < 50) {
    seviye = 'zayif';
  } else if (skor < 75) {
    seviye = 'orta';
  } else {
    seviye = 'guclu';
  }

  return { skor, seviye, mesajlar };
}

// ============================================
// ŞİFRE DEĞİŞTİRME VALIDATION
// ============================================

export const sifreDegistirSchema = z
  .object({
    eski_sifre: z.string().min(1, 'Eski şifre gereklidir'),
    yeni_sifre: sifreSchema,
    yeni_sifre_tekrar: z.string(),
  })
  .refine((data) => data.yeni_sifre === data.yeni_sifre_tekrar, {
    message: 'Şifreler eşleşmiyor',
    path: ['yeni_sifre_tekrar'],
  })
  .refine((data) => data.eski_sifre !== data.yeni_sifre, {
    message: 'Yeni şifre eski şifre ile aynı olamaz',
    path: ['yeni_sifre'],
  });

export type SifreDegistirInput = z.infer<typeof sifreDegistirSchema>;

// ============================================
// ŞİFRE SIFIRLAMA TALEBİ VALIDATION
// ============================================

export const sifreSifirlaSchema = z.object({
  tc_kimlik_no: z
    .string()
    .length(11, 'TC Kimlik No 11 haneli olmalıdır')
    .regex(/^\d+$/, 'TC Kimlik No sadece rakamlardan oluşmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
});

export type SifreSifirlaInput = z.infer<typeof sifreSifirlaSchema>;

// ============================================
// ŞİFRE YENİLEME VALIDATION
// ============================================

export const sifreYenileSchema = z
  .object({
    token: z.string().uuid('Geçersiz token formatı'),
    yeni_sifre: sifreSchema,
    yeni_sifre_tekrar: z.string(),
  })
  .refine((data) => data.yeni_sifre === data.yeni_sifre_tekrar, {
    message: 'Şifreler eşleşmiyor',
    path: ['yeni_sifre_tekrar'],
  });

export type SifreYenileInput = z.infer<typeof sifreYenileSchema>;
