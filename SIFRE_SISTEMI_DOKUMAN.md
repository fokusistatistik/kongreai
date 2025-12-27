# Şifre Politikası ve Sıfırlama Sistemi Dokümantasyonu

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Şifre Politikası](#şifre-politikası)
3. [İlk Giriş Akışı](#ilk-giriş-akışı)
4. [Şifremi Unuttum Sistemi](#şifremi-unuttum-sistemi)
5. [Teknik Detaylar](#teknik-detaylar)
6. [Güvenlik Önlemleri](#güvenlik-önlemleri)
7. [API Endpoints](#api-endpoints)
8. [n8n Webhook Entegrasyonu](#n8n-webhook-entegrasyonu)
9. [Kurulum ve Yapılandırma](#kurulum-ve-yapılandırma)

---

## Genel Bakış

Bu sistem, Kocaeli İl Sağlık Müdürlüğü Görev Yönetim Sistemi için güvenli bir şifre yönetimi çözümü sağlar. Sistem üç ana bileşenden oluşur:

1. **İlk Giriş Zorlaması**: Yeni kullanıcılar ilk girişte şifrelerini değiştirmeye zorlanır
2. **Şifre Politikası**: Güçlü şifre kuralları ve gerçek zamanlı validasyon
3. **Şifre Sıfırlama**: Email tabanlı güvenli şifre sıfırlama mekanizması

---

## Şifre Politikası

### Kurallar

- ✅ **Minimum 8 karakter** zorunlu
- ✅ **En az 1 büyük harf** (A-Z)
- ✅ **En az 1 küçük harf** (a-z)
- ✅ **En az 1 rakam** (0-9)
- ⚪ **Özel karakter** önerilen ama zorunlu değil

### Şifre Gücü Göstergesi

Sistem, kullanıcının girdiği şifreyi gerçek zamanlı olarak analiz eder ve üç seviyede gösterir:

- 🔴 **Zayıf** (< 50 puan): Minimum gereksinimleri karşılamıyor
- 🟡 **Orta** (50-74 puan): Kabul edilebilir ama güçlendirilebilir
- 🟢 **Güçlü** (≥ 75 puan): Önerilen seviye

### Validasyon

Zod schema kullanılarak hem frontend hem backend'de validasyon yapılır:

```typescript
// lib/validations/password.ts
export const sifreSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .regex(/[A-Z]/, 'En az 1 büyük harf içermelidir')
  .regex(/[a-z]/, 'En az 1 küçük harf içermelidir')
  .regex(/[0-9]/, 'En az 1 rakam içermelidir');
```

---

## İlk Giriş Akışı

### 1. Yeni Kullanıcı Oluşturma

```sql
INSERT INTO personel (
  tc_kimlik_no, ad, soyad, email, password,
  rol_id, birim_id, ilk_giris
) VALUES (
  '12345678901', 'Ahmet', 'Yılmaz', 'ahmet.yilmaz@saglik.gov.tr',
  '$2a$10$...', -- bcrypt hash (geçici şifre)
  'rol_uuid', 'birim_uuid', TRUE -- ilk_giris: true
);
```

### 2. Geçici Şifre Gönderimi

n8n webhook otomatik olarak email gönderir:

```
Konu: Görev Yönetim Sistemi - Giriş Bilgileriniz

Sayın Ahmet Yılmaz,

Görev Yönetim Sistemi hesabınız oluşturulmuştur.

Email: ahmet.yilmaz@saglik.gov.tr
Geçici Şifre: Abc123xyz

İlk girişinizde şifrenizi değiştirmeniz gerekecektir.

Giriş: https://gorev.kocaelism.saglik.gov.tr/login
```

### 3. İlk Giriş ve Yönlendirme

```typescript
// Kullanıcı login olduğunda
if (data.ilk_giris === true) {
  // Cookie set et
  response.cookies.set('ilk_giris', 'true', { httpOnly: true });

  // Şifre değiştirme sayfasına yönlendir
  router.push('/sifre-degistir');
}
```

### 4. Middleware Kontrolü

```typescript
// middleware.ts
if (ilkGiris && !pathname.startsWith('/sifre-degistir')) {
  // Kullanıcı başka sayfaya erişmeye çalışıyor
  // Şifre değiştirme sayfasına zorla yönlendir
  return NextResponse.redirect('/sifre-degistir');
}
```

### 5. Şifre Değiştirme

- Kullanıcı eski şifreyi (geçici) ve yeni şifresini girer
- Yeni şifre politika kurallarına uygun olmalı
- Başarılı değişiklik sonrası `ilk_giris: false` yapılır
- Kullanıcı ana sayfaya yönlendirilir

---

## Şifremi Unuttum Sistemi

### Akış Diyagramı

```
[Login Sayfası]
    ↓ (Şifremi Unuttum)
[Şifre Sıfırlama Formu]
    ↓ (TC + Email)
[API: /api/sifre-sifirla]
    ↓ (Proxy)
[n8n Webhook: /webhook/sifre-sifirla]
    ↓ (Doğrula + Token Oluştur)
[Email Gönderimi]
    ↓ (Kullanıcı linke tıklar)
[Şifre Yenileme Sayfası: /sifre-yenile?token=xyz]
    ↓ (Yeni şifre + Tekrar)
[API: /api/sifre-yenile]
    ↓ (Proxy)
[n8n Webhook: /webhook/sifre-yenile]
    ↓ (Token doğrula + Şifre güncelle)
[Login Sayfası]
```

### Adım Adım

#### 1. Şifre Sıfırlama Talebi

**Sayfa**: `/sifre-sifirla`

Kullanıcı şu bilgileri girer:
- TC Kimlik No (11 hane)
- Email adresi

**Validasyon**:
```typescript
tc_kimlik_no: z.string()
  .length(11, 'TC Kimlik No 11 haneli olmalıdır')
  .regex(/^\d+$/, 'Sadece rakamlardan oluşmalıdır')

email: z.string()
  .email('Geçerli bir email adresi giriniz')
```

#### 2. API İsteği

**Endpoint**: `POST /api/sifre-sifirla`

**Rate Limiting**: 5 dakikada 1 istek (IP bazlı)

```typescript
// Rate limiting kontrolü
const rateLimit = checkRateLimit(ip, 'password-reset', {
  windowMs: 5 * 60 * 1000, // 5 dakika
  maxRequests: 1
});

if (!rateLimit.allowed) {
  return 429 Too Many Requests
}
```

#### 3. n8n Webhook İşleme

**Endpoint**: `POST https://n8n.fokusistatistik.com/webhook/sifre-sifirla`

**İşlemler**:
1. TC Kimlik No ve email eşleşmesi kontrol et
2. Kullanıcı aktif mi kontrol et
3. UUID token oluştur
4. Token'ı veritabanına kaydet:
   ```sql
   INSERT INTO password_reset_tokens (
     personel_id, tc_kimlik_no, email, token,
     expires_at, ip_adresi
   ) VALUES (
     'user_uuid', '12345678901', 'email@saglik.gov.tr',
     'token_uuid', NOW() + INTERVAL '1 hour', '192.168.1.1'
   );
   ```
5. Email gönder

#### 4. Email Şablonu

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* Kurumsal stil */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="[KISM_LOGO_URL]" alt="Kocaeli İSM">
      <h1>Şifre Sıfırlama Talebi</h1>
    </div>

    <div class="content">
      <p>Sayın {{ ad }} {{ soyad }},</p>

      <p>Şifre sıfırlama talebiniz alınmıştır. Şifrenizi sıfırlamak için aşağıdaki butona tıklayınız:</p>

      <a href="https://gorev.kocaelism.saglik.gov.tr/sifre-yenile?token={{ token }}"
         class="button">
        Şifremi Sıfırla
      </a>

      <p class="info">
        ⚠️ Bu bağlantı 1 saat geçerlidir.<br>
        ⚠️ Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
      </p>
    </div>

    <div class="footer">
      <p>Kocaeli İl Sağlık Müdürlüğü<br>
      Powered by FOKUS İstatistik</p>
    </div>
  </div>
</body>
</html>
```

#### 5. Şifre Yenileme

**Sayfa**: `/sifre-yenile?token=xyz`

**İşlemler**:
1. Token URL'den alınır
2. Token formatı kontrol edilir (UUID)
3. Kullanıcı yeni şifre girer (2 kez)
4. Şifre politikası validasyonu
5. API'ye POST isteği

#### 6. Token Doğrulama ve Şifre Güncelleme

**Endpoint**: `POST /api/sifre-yenile`

n8n webhook işlemleri:
1. Token'ı veritabanında bul
2. Kontroller:
   - Token var mı?
   - Expire olmamış mı? (`expires_at > NOW()`)
   - Kullanılmamış mı? (`kullanildi = false`)
3. Şifreyi bcrypt ile hashle
4. Personel tablosunu güncelle:
   ```sql
   UPDATE personel
   SET password = '$2a$10$...', updated_at = NOW()
   WHERE id = 'user_uuid';
   ```
5. Token'ı kullanılmış olarak işaretle:
   ```sql
   UPDATE password_reset_tokens
   SET kullanildi = TRUE
   WHERE token = 'token_uuid';
   ```

---

## Teknik Detaylar

### Dosya Yapısı

```
halksagligi/
├── app/
│   ├── api/
│   │   ├── login/route.ts                 # Login endpoint
│   │   ├── sifre-degistir/route.ts        # Şifre değiştirme
│   │   ├── sifre-sifirla/route.ts         # Şifre sıfırlama talebi
│   │   └── sifre-yenile/route.ts          # Token ile şifre yenileme
│   ├── login/page.tsx                     # Login sayfası
│   ├── sifre-degistir/page.tsx            # İlk giriş şifre değiştirme
│   ├── sifre-sifirla/page.tsx             # Şifremi unuttum formu
│   └── sifre-yenile/page.tsx              # Şifre yenileme sayfası
├── components/
│   └── password-input.tsx                 # Şifre input component
├── lib/
│   ├── validations/
│   │   └── password.ts                    # Şifre validation schemas
│   ├── rate-limit.ts                      # Rate limiting utility
│   ├── log.ts                             # Audit logging
│   └── prisma.ts                          # Prisma client
├── middleware.ts                          # Next.js middleware
└── prisma/
    └── schema.prisma                      # Database schema
```

### Database Schema

#### Personel Tablosu (Güncellemeler)

```prisma
model Personel {
  // ... mevcut alanlar

  // YENİ ALAN
  ilk_giris  Boolean   @default(true)  // İlk giriş kontrolü

  // ... diğer alanlar
}
```

#### Password Reset Tokens Tablosu

```prisma
model PasswordResetToken {
  id           String    @id @default(uuid())

  // Kullanıcı Bilgisi
  personel_id  String
  tc_kimlik_no String    @db.VarChar(11)
  email        String    @db.VarChar(100)

  // Token Bilgisi
  token        String    @unique @default(uuid())
  expires_at   DateTime  // 1 saat geçerli
  kullanildi   Boolean   @default(false)

  // Güvenlik
  ip_adresi    String?   @db.VarChar(45)

  created_at   DateTime  @default(now())

  @@index([token])
  @@index([personel_id])
  @@index([expires_at])
  @@map("password_reset_tokens")
}
```

### Components

#### PasswordInput Component

**Özellikler**:
- Şifre göster/gizle toggle (eye icon)
- Gerçek zamanlı şifre gücü göstergesi
- Politika kuralları checklist (✓/✗)
- Tailwind CSS ile stil

**Props**:
```typescript
interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  showStrengthMeter?: boolean;  // Şifre gücü göster
  error?: string;
  required?: boolean;
  autoComplete?: string;
}
```

**Kullanım**:
```tsx
<PasswordInput
  id="yeni_sifre"
  name="yeni_sifre"
  value={formData.yeni_sifre}
  onChange={handleChange}
  label="Yeni Şifre"
  showStrengthMeter={true}
  required
/>
```

---

## Güvenlik Önlemleri

### 1. Rate Limiting

**İmplementasyon**: In-memory Map (Development)
**Production**: Redis kullanılmalı

**Limitler**:
- **Şifre Sıfırlama**: 5 dakikada 1 istek (IP bazlı)
- **Login**: 15 dakikada 5 istek (IP bazlı)
- **Şifre Değiştirme**: 1 saatte 3 istek (IP bazlı)

```typescript
// lib/rate-limit.ts
export const RATE_LIMITS = {
  PASSWORD_RESET: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 1,
  },
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
};
```

### 2. Token Güvenliği

- Token UUID formatında (tahmin edilemez)
- 1 saat expire süresi
- Tek kullanımlık (kullanıldıktan sonra invalid)
- IP adresi kaydı

### 3. Cookie Güvenliği

```typescript
response.cookies.set('auth_token', token, {
  httpOnly: true,              // JavaScript erişimini engelle (XSS)
  secure: NODE_ENV === 'production',  // Sadece HTTPS
  sameSite: 'lax',             // CSRF koruması
  maxAge: 60 * 60 * 24 * 7,    // 7 gün
  path: '/',
});
```

### 4. Audit Logging

Tüm şifre işlemleri loglanır:

```typescript
await logAktivite({
  personel_id: 'user_uuid',
  personel_email: 'user@saglik.gov.tr',
  islem: 'sifre.degistir',
  tablo: 'personel',
  kayit_id: 'user_uuid',
  aciklama: 'Şifre başarıyla değiştirildi',
  ip_adresi: '192.168.1.1',
  user_agent: 'Mozilla/5.0 ...',
});
```

**Loglanan İşlemler**:
- `login` - Başarılı giriş
- `login.basarisiz` - Başarısız giriş
- `login.rate_limit` - Rate limit aşımı
- `sifre.degistir` - Şifre değiştirme
- `sifre.sifirla.talep` - Şifre sıfırlama talebi
- `sifre.sifirla.rate_limit` - Rate limit aşımı
- `sifre.yenile` - Token ile şifre yenileme

### 5. Bcrypt Hash

Tüm şifreler bcrypt ile hashlenmiş olarak saklanır:

```typescript
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Hash
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verify
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
```

---

## API Endpoints

### POST /api/login

**Açıklama**: Kullanıcı girişi

**Request**:
```json
{
  "email": "user@saglik.gov.tr",
  "password": "Abc123xyz"
}
```

**Response (Başarılı)**:
```json
{
  "success": true,
  "personel": {
    "id": "uuid",
    "ad": "Ahmet",
    "soyad": "Yılmaz",
    "email": "user@saglik.gov.tr",
    "rol": { ... },
    "birim": { ... },
    "ilk_giris": false
  },
  "token": "jwt_token",
  "ilk_giris": false
}
```

**Response (İlk Giriş)**:
```json
{
  "success": true,
  "personel": { ... },
  "token": "jwt_token",
  "ilk_giris": true  // ⚠️ Frontend şifre değiştirmeye yönlendirmeli
}
```

**Rate Limit**: 15 dakikada 5 istek

---

### POST /api/sifre-degistir

**Açıklama**: Şifre değiştirme (ilk giriş veya normal)

**Request**:
```json
{
  "eski_sifre": "TempPass123",
  "yeni_sifre": "MyNewPass123",
  "yeni_sifre_tekrar": "MyNewPass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Şifre başarıyla değiştirildi"
}
```

**Rate Limit**: 1 saatte 3 istek

---

### POST /api/sifre-sifirla

**Açıklama**: Şifre sıfırlama talebi oluşturur

**Request**:
```json
{
  "tc_kimlik_no": "12345678901",
  "email": "user@saglik.gov.tr"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Şifre sıfırlama bağlantısı email adresinize gönderildi"
}
```

**Rate Limit**: 5 dakikada 1 istek

---

### POST /api/sifre-yenile

**Açıklama**: Token ile şifre yenileme

**Request**:
```json
{
  "token": "uuid-token-xyz",
  "yeni_sifre": "MyNewPass123",
  "yeni_sifre_tekrar": "MyNewPass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Şifre başarıyla yenilendi"
}
```

---

## n8n Webhook Entegrasyonu

### Gerekli Webhook Endpoints

#### 1. /webhook/login

**Method**: POST

**Request Body**:
```json
{
  "email": "user@saglik.gov.tr",
  "password": "plaintext_password",
  "ip_adresi": "192.168.1.1",
  "user_agent": "Mozilla/5.0 ..."
}
```

**Response (Başarılı)**:
```json
{
  "personel": {
    "id": "uuid",
    "tc_kimlik_no": "12345678901",
    "ad": "Ahmet",
    "soyad": "Yılmaz",
    "email": "user@saglik.gov.tr",
    "telefon": "0262...",
    "rol": { ... },
    "birim": { ... },
    "ilk_giris": false,
    "aktif": true
  },
  "token": "jwt_token_xyz"
}
```

**İşlemler**:
1. Email ile personel bul
2. Aktif mi kontrol et
3. Şifre bcrypt ile verify et
4. JWT token oluştur
5. `son_giris_tarihi` ve `son_giris_ip` güncelle
6. Response döndür

---

#### 2. /webhook/sifre-degistir

**Method**: POST

**Request Body**:
```json
{
  "eski_sifre": "TempPass123",
  "yeni_sifre": "MyNewPass123",
  "ip_adresi": "192.168.1.1",
  "user_agent": "Mozilla/5.0 ..."
}
```

**Response**:
```json
{
  "personel_id": "uuid",
  "email": "user@saglik.gov.tr",
  "ilk_giris": true  // Eğer ilk giriş ise
}
```

**İşlemler**:
1. Auth token'dan kullanıcı belirle
2. Eski şifre verify et
3. Yeni şifreyi bcrypt ile hashle
4. Database güncelle:
   ```sql
   UPDATE personel
   SET password = '$2a$10$...',
       ilk_giris = FALSE,
       updated_at = NOW()
   WHERE id = 'user_uuid';
   ```
5. Response döndür

---

#### 3. /webhook/sifre-sifirla

**Method**: POST

**Request Body**:
```json
{
  "tc_kimlik_no": "12345678901",
  "email": "user@saglik.gov.tr",
  "ip_adresi": "192.168.1.1",
  "user_agent": "Mozilla/5.0 ..."
}
```

**Response**:
```json
{
  "personel_id": "uuid",
  "email": "user@saglik.gov.tr",
  "token": "reset_token_uuid"
}
```

**İşlemler**:
1. TC Kimlik No ve email ile personel bul
2. Eşleşme var mı kontrol et
3. Aktif mi kontrol et
4. UUID token oluştur
5. Token'ı database'e kaydet:
   ```sql
   INSERT INTO password_reset_tokens (
     personel_id, tc_kimlik_no, email,
     token, expires_at, ip_adresi
   ) VALUES (
     'uuid', '12345678901', 'email@saglik.gov.tr',
     'token_uuid', NOW() + INTERVAL '1 hour', '192.168.1.1'
   );
   ```
6. Email gönder (template kullanarak)
7. Response döndür

---

#### 4. /webhook/sifre-yenile

**Method**: POST

**Request Body**:
```json
{
  "token": "reset_token_uuid",
  "yeni_sifre": "MyNewPass123",
  "ip_adresi": "192.168.1.1",
  "user_agent": "Mozilla/5.0 ..."
}
```

**Response**:
```json
{
  "personel_id": "uuid",
  "email": "user@saglik.gov.tr"
}
```

**İşlemler**:
1. Token'ı database'de bul:
   ```sql
   SELECT * FROM password_reset_tokens
   WHERE token = 'token_uuid'
     AND expires_at > NOW()
     AND kullanildi = FALSE;
   ```
2. Token yoksa veya expire → Error
3. Yeni şifreyi bcrypt ile hashle
4. Personel şifresini güncelle:
   ```sql
   UPDATE personel
   SET password = '$2a$10$...',
       updated_at = NOW()
   WHERE id = (SELECT personel_id FROM password_reset_tokens WHERE token = 'token_uuid');
   ```
5. Token'ı kullanılmış yap:
   ```sql
   UPDATE password_reset_tokens
   SET kullanildi = TRUE
   WHERE token = 'token_uuid';
   ```
6. Response döndür

---

## Kurulum ve Yapılandırma

### 1. Environment Variables

`.env.local` dosyası oluştur:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/halksagligi"

# n8n Webhook URL
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com"

# App URL (Email linkleri için)
NEXT_PUBLIC_APP_URL="https://gorev.kocaelism.saglik.gov.tr"

# Environment
NODE_ENV="production"
```

### 2. Prisma Migration

```bash
# Schema'yı database'e uygula
npx prisma migrate dev --name add_password_reset_system

# Prisma client generate et
npx prisma generate
```

### 3. Dependencies

Gerekli paketler zaten kurulu:

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "zod": "^3.x",
    "@prisma/client": "^5.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "typescript": "^5.x",
    "tailwindcss": "^3.x"
  }
}
```

### 4. n8n Workflow Import

n8n'de 4 webhook workflow'u oluştur ve yukarıdaki spesifikasyonlara göre yapılandır.

### 5. Test

#### Manual Test

1. **İlk Giriş Testi**:
   ```sql
   -- Test kullanıcısı oluştur
   INSERT INTO personel (..., ilk_giris) VALUES (..., TRUE);
   ```
   - Login ol
   - /sifre-degistir'e yönlendirildiğini kontrol et
   - Şifre değiştir
   - Ana sayfaya erişebildiğini kontrol et

2. **Şifre Sıfırlama Testi**:
   - /sifre-sifirla'ya git
   - TC ve email gir
   - Email'i kontrol et
   - Linke tıkla
   - Yeni şifre belirle
   - Login ol

3. **Rate Limiting Testi**:
   - 5 dakika içinde 2. kez şifre sıfırlama talebi yap
   - 429 hatası almalısın

#### Integration Test

```typescript
// tests/password-system.test.ts
describe('Password System', () => {
  test('İlk giriş şifre değiştirme', async () => {
    // Test implementation
  });

  test('Şifre sıfırlama akışı', async () => {
    // Test implementation
  });

  test('Rate limiting', async () => {
    // Test implementation
  });
});
```

---

## Sorun Giderme

### Email Gelmiyor

1. Spam klasörünü kontrol et
2. n8n webhook loglarını kontrol et
3. Email servisi çalışıyor mu kontrol et

### Token Geçersiz

1. Token expire olmuş olabilir (1 saat)
2. Token zaten kullanılmış olabilir
3. Database'de token'ı kontrol et:
   ```sql
   SELECT * FROM password_reset_tokens WHERE token = 'xyz';
   ```

### Rate Limit Hatası

1. 5 dakika bekle
2. Veya manuel olarak rate limit'i sıfırla (development'ta restart)
3. Production'da Redis cache'i temizle

### Middleware Loop

1. `publicPaths` ve `firstLoginAllowedPaths` array'lerini kontrol et
2. Cookie'lerin doğru set edildiğini kontrol et

---

## Gelecek Geliştirmeler

### Planlanan Özellikler

1. **2FA (İki Faktörlü Doğrulama)**
   - SMS ile kod gönderimi
   - Google Authenticator entegrasyonu

2. **Şifre Geçmişi**
   - Son 5 şifreyi kaydet
   - Aynı şifrenin tekrar kullanılmasını engelle

3. **Hesap Kilitleme**
   - 5 başarısız denemeden sonra hesabı kilitle
   - Admin onayı ile kilit açma

4. **Şifre Süresi Dolum**
   - 90 günde bir şifre değiştirme zorunluluğu
   - Expire uyarı emaili

5. **Redis Rate Limiting**
   - In-memory yerine Redis kullan
   - Distributed system desteği

---

## Lisans ve İletişim

**Proje**: Kocaeli İl Sağlık Müdürlüğü Görev Yönetim Sistemi
**Geliştirici**: FOKUS İstatistik
**Tarih**: 2025
**Versiyon**: 1.0.0

**Destek**: support@fokusistatistik.com
