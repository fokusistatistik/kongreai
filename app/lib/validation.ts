import { z } from 'zod';

// Phone number validation for Turkish format: +90 535 404 07 12
const turkishPhoneRegex = /^\+90\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/;

// Date format validation: gg.aa.yyyy
const turkishDateRegex = /^\d{2}\.\d{2}\.\d{4}$/;

// Slug format: lowercase letters, numbers, and hyphens only
const slugRegex = /^[a-z0-9-]+$/;

// SQL Injection prevention - basic blacklist
const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b|--|;|\/\*|\*\/|xp_|sp_)/gi;

/**
 * User registration validation schema
 */
export const registerSchema = z.object({
  ad: z.string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir')
    .refine((val) => !sqlInjectionPattern.test(val), 'Geçersiz karakterler içeriyor'),
  soyad: z.string()
    .min(2, 'Soyad en az 2 karakter olmalı')
    .max(50, 'Soyad en fazla 50 karakter olabilir')
    .refine((val) => !sqlInjectionPattern.test(val), 'Geçersiz karakterler içeriyor'),
  email: z.string().email('Geçerli bir e-posta adresi girin').toLowerCase(),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermeli'),
  telefon: z.string()
    .regex(turkishPhoneRegex, 'Telefon formatı: +90 535 404 07 12')
    .optional()
    .or(z.literal('')),
  unvan: z.string()
    .min(2, 'Ünvan en az 2 karakter olmalı')
    .max(100, 'Ünvan en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
  kurum: z.string()
    .min(2, 'Kurum en az 2 karakter olmalı')
    .max(200, 'Kurum en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
});

/**
 * Reviewer validation schema
 */
export const reviewerSchema = z.object({
  ad: z.string().min(2, 'Ad en az 2 karakter olmalı').max(50, 'Ad en fazla 50 karakter olabilir'),
  soyad: z.string().min(2, 'Soyad en az 2 karakter olmalı').max(50, 'Soyad en fazla 50 karakter olabilir'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermeli'),
  telefon: z.string()
    .regex(turkishPhoneRegex, 'Telefon formatı: +90 535 404 07 12')
    .optional()
    .or(z.literal('')),
  unvan: z.string().min(2, 'Ünvan en az 2 karakter olmalı').max(100, 'Ünvan en fazla 100 karakter olabilir'),
  kurum: z.string().min(2, 'Kurum en az 2 karakter olmalı').max(200, 'Kurum en fazla 200 karakter olabilir'),
  uzmanlik_alani: z.string().optional(),
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string()
    .min(8, 'Yeni şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Yeni şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermeli'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

/**
 * Password reset validation schema
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token gerekli'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermeli'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı gerekli'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  ad: z.string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir')
    .refine((val) => !sqlInjectionPattern.test(val), 'Geçersiz karakterler içeriyor'),
  soyad: z.string()
    .min(2, 'Soyad en az 2 karakter olmalı')
    .max(50, 'Soyad en fazla 50 karakter olabilir')
    .refine((val) => !sqlInjectionPattern.test(val), 'Geçersiz karakterler içeriyor'),
  telefon: z.string()
    .regex(turkishPhoneRegex, 'Telefon formatı: +90 535 404 07 12')
    .optional()
    .or(z.literal('')),
  unvan: z.string()
    .min(2, 'Ünvan en az 2 karakter olmalı')
    .max(100, 'Ünvan en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
  kurum: z.string()
    .min(2, 'Kurum en az 2 karakter olmalı')
    .max(200, 'Kurum en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
});

/**
 * Event validation schema
 */
export const eventSchema = z.object({
  baslik: z.string()
    .min(5, 'Başlık en az 5 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir')
    .refine((val) => !sqlInjectionPattern.test(val), 'Geçersiz karakterler içeriyor'),
  slug: z.string()
    .min(3, 'Slug en az 3 karakter olmalı')
    .max(100, 'Slug en fazla 100 karakter olabilir')
    .regex(slugRegex, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  tip: z.enum(['KONGRE', 'SEMPOZYUM', 'KONFERANS', 'CALISHTAY', 'DIGER']),
  kapsam: z.enum(['ULUSAL', 'ULUSLARARASI']),
  baslangic_tarihi: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, 'Geçerli bir tarih girin'),
  bitis_tarihi: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, 'Geçerli bir tarih girin'),
  son_basvuru_tarihi: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime());
  }, 'Geçerli bir tarih girin'),
  yer: z.string().min(3, 'Yer en az 3 karakter olmalı').max(200, 'Yer en fazla 200 karakter olabilir'),
  ucret: z.number().min(0, 'Ücret negatif olamaz').optional().default(0),
  erken_kayit_ucret: z.number().min(0, 'Ücret negatif olamaz').optional(),
  ogrenci_ucret: z.number().min(0, 'Ücret negatif olamaz').optional(),
  ucretsiz: z.boolean().optional().default(false),
}).refine((data) => {
  // Bitiş tarihi başlangıç tarihinden önce olamaz
  const start = new Date(data.baslangic_tarihi);
  const end = new Date(data.bitis_tarihi);
  return end >= start;
}, {
  message: 'Bitiş tarihi başlangıç tarihinden önce olamaz',
  path: ['bitis_tarihi'],
}).refine((data) => {
  // Son başvuru tarihi başlangıç tarihinden önce olmalı
  const start = new Date(data.baslangic_tarihi);
  const deadline = new Date(data.son_basvuru_tarihi);
  return deadline <= start;
}, {
  message: 'Son başvuru tarihi etkinlik başlangıcından sonra olamaz',
  path: ['son_basvuru_tarihi'],
});

/**
 * Format Turkish date (gg.aa.yyyy) to ISO format
 */
export function parseTurkishDate(dateStr: string): string | null {
  if (!turkishDateRegex.test(dateStr)) return null;

  const [day, month, year] = dateStr.split('.');
  const date = new Date(`${year}-${month}-${day}`);

  if (isNaN(date.getTime())) return null;

  return date.toISOString();
}

/**
 * Format ISO date to Turkish date (gg.aa.yyyy)
 */
export function formatToTurkishDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Sanitize input to prevent SQL injection
 */
export function sanitizeInput(input: string): string {
  return input.replace(sqlInjectionPattern, '');
}

/**
 * Validate and sanitize multiple inputs
 */
export function validateAndSanitize<T extends Record<string, any>>(
  data: T,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}
