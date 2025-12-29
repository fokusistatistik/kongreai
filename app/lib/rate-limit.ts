/**
 * Rate Limiting Utility
 *
 * PRODUCTION NOT: Bu in-memory implementasyon production için uygun değildir.
 * Production'da Redis kullanılmalıdır.
 */

interface RateLimitConfig {
  windowMs: number; // Zaman penceresi (milisaniye)
  maxRequests: number; // Maksimum istek sayısı
}

// IP başına rate limit map (in-memory)
const rateLimitMaps = new Map<string, Map<string, number[]>>();

/**
 * Rate limiting kontrolü yapar
 *
 * @param ip - IP adresi
 * @param key - Rate limit key (örn: 'password-reset', 'login')
 * @param config - Rate limit konfigürasyonu
 * @returns allowed: boolean, retryAfter?: number (saniye)
 */
export function checkRateLimit(
  ip: string,
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now();
  const { windowMs, maxRequests } = config;

  // Key için map al veya oluştur
  if (!rateLimitMaps.has(key)) {
    rateLimitMaps.set(key, new Map());
  }

  const limitMap = rateLimitMaps.get(key)!;

  // IP'nin geçmiş isteklerini al
  const requests = limitMap.get(ip) || [];

  // Pencere dışındaki istekleri temizle
  const validRequests = requests.filter((time) => now - time < windowMs);

  if (validRequests.length >= maxRequests) {
    // Limit aşıldı
    const oldestRequest = Math.min(...validRequests);
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000); // saniye
    return {
      allowed: false,
      retryAfter,
      remaining: 0,
    };
  }

  // Yeni isteği ekle
  validRequests.push(now);
  limitMap.set(ip, validRequests);

  // Memory leak önlemi: Çok fazla IP birikirse eski olanları temizle
  if (limitMap.size > 10000) {
    const sortedEntries = Array.from(limitMap.entries()).sort(
      (a, b) => Math.max(...b[1]) - Math.max(...a[1])
    );
    limitMap.clear();
    sortedEntries.slice(0, 5000).forEach(([key, value]) => {
      limitMap.set(key, value);
    });
  }

  return {
    allowed: true,
    remaining: maxRequests - validRequests.length,
  };
}

/**
 * Önceden tanımlanmış rate limit konfigürasyonları
 */
export const RATE_LIMITS = {
  // Şifre sıfırlama: 5 dakikada 1 istek
  PASSWORD_RESET: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 1,
  },

  // Login: 15 dakikada 10 istek (çok sıkı olmayan, makul limit)
  // Bir kullanıcı 15 dakikada 10 kere yanlış şifre deneyebilir
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  },

  // Genel API: 1 dakikada 60 istek
  API_GENERAL: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },

  // Şifre değiştirme: 1 saatte 3 istek
  PASSWORD_CHANGE: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },
};

/**
 * IP adresini NextRequest'ten çıkarır
 */
export function getIpFromRequest(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
