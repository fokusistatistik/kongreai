# Şifre Sıfırlama Sistemi - Kurulum ve Kullanım

## Genel Bakış

Kongre Yönetim Sistemi, n8n webhook entegrasyonu ile güvenli şifre sıfırlama özelliğine sahiptir. E-posta doğrulaması n8n üzerinden yapılır ve kullanıcılar 180 saniye içinde e-postalarını doğrulayarak şifrelerini sıfırlayabilirler.

## Akış Diyagramı

```
1. Kullanıcı → /auth/forgot-password → Email girer
2. Backend → Token oluşturur → n8n webhook'a gönderir
3. n8n → Email gönderir → Doğrulama linki
4. Kullanıcı → /auth/reset-password → 180 saniye countdown
5. Kullanıcı → Email'deki linke tıklar
6. n8n → /api/auth/verify-reset-token → Token doğrulanır
7. Frontend → Polling ile token durumunu kontrol eder
8. Token doğrulandı → Yeni şifre formu gösterilir
9. Kullanıcı → Yeni şifre girer
10. Backend → Şifreyi günceller → Login'e yönlendir
```

## Database Migration

Önce veritabanı migration'ını çalıştırın:

```bash
# Development (SQLite)
npx prisma migrate dev --name add_password_reset

# Production (PostgreSQL önerilir)
npx prisma migrate deploy
```

Eğer network hatası alırsanız:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name add_password_reset
```

## Environment Variables

`.env` dosyanıza şu değişkeni ekleyin:

```bash
# n8n webhook URL for password reset emails
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com/webhook/password-reset"
```

## n8n Workflow Kurulumu

### 1. n8n'de Yeni Workflow Oluşturun

**Workflow Adı**: `Password Reset - Kongre Sistemi`

### 2. Webhook Node Ekleyin

**Node Type**: Webhook
**HTTP Method**: POST
**Path**: `/webhook/password-reset`

**Beklenen Request Body**:
```json
{
  "email": "user@example.com",
  "token": "abc123...",
  "name": "Ahmet Yılmaz",
  "resetUrl": "https://kongreai.com/auth/reset-password?token=abc123...",
  "expiresAt": "2024-12-27T15:30:00Z"
}
```

### 3. Email Node Ekleyin

**Node Type**: Send Email (Gmail / SMTP)

**Email Template**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <img src="https://static.fokusistatistik.com/resimler/fokus216k.png" alt="Logo" style="width: 80px; height: 80px;">
    <h1 style="color: white; margin: 20px 0 0 0;">Şifre Sıfırlama</h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; color: #333;">Merhaba <strong>{{$json["name"]}}</strong>,</p>

    <p style="font-size: 14px; color: #666; line-height: 1.6;">
      Şifre sıfırlama talebiniz alındı. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{$json["resetUrl"]}}"
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
        Şifremi Sıfırla
      </a>
    </div>

    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      Link şu zamana kadar geçerlidir: <strong>{{$json["expiresAt"]}}</strong>
    </p>

    <p style="font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
      Bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
    </p>
  </div>

  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© 2024 Kongre Yönetim Sistemi</p>
  </div>
</body>
</html>
```

**Email Fields**:
- **To**: `{{$json["email"]}}`
- **Subject**: `Şifre Sıfırlama Talebi - Kongre Sistemi`
- **HTML**: Yukarıdaki template

### 4. HTTP Request Node Ekleyin (Callback)

Email gönderildikten sonra backend'e doğrulama yapıldığını bildirmek için:

**Node Type**: HTTP Request
**Method**: POST
**URL**: `https://yourdomain.com/api/auth/verify-reset-token`

**Body**:
```json
{
  "token": "{{$json["token"]}}",
  "verified": true
}
```

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

### 5. Workflow'u Aktif Edin

n8n'de workflow'u **Active** olarak işaretleyin.

## Test Etme

### 1. Manuel Test

```bash
curl -X POST https://kongreai.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. UI'dan Test

1. `https://kongreai.com/login` sayfasına gidin
2. "Şifremi Unuttum" linkine tıklayın
3. E-posta adresinizi girin
4. E-postanızı kontrol edin
5. Doğrulama linkine tıklayın
6. Yeni şifrenizi belirleyin

## API Endpoints

### POST /api/auth/forgot-password

Şifre sıfırlama talebi başlatır ve n8n webhook'a çağrı yapar.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (Success):
```json
{
  "message": "Şifre sıfırlama talebi alındı.",
  "token": "abc123..."
}
```

**Response** (Error):
```json
{
  "error": "Bu e-posta adresi sistemde kayıtlı değil."
}
```

---

### POST /api/auth/check-reset-status

Token durumunu kontrol eder (frontend polling için).

**Request**:
```json
{
  "token": "abc123..."
}
```

**Response** (Not Verified):
```json
{
  "verified": false,
  "email": "user@example.com"
}
```

**Response** (Verified):
```json
{
  "verified": true,
  "email": "user@example.com"
}
```

---

### POST /api/auth/reset-password

Yeni şifreyi kaydeder.

**Request**:
```json
{
  "token": "abc123...",
  "newPassword": "newpass123"
}
```

**Response** (Success):
```json
{
  "message": "Şifreniz başarıyla değiştirildi."
}
```

**Response** (Error):
```json
{
  "error": "E-posta doğrulaması yapılmamış."
}
```

---

### GET/POST /api/auth/verify-reset-token

n8n callback endpoint veya direkt browser erişimi.

**GET Request** (Browser):
```
https://kongreai.com/api/auth/verify-reset-token?token=abc123...
```

**Response**: Redirects to `/auth/reset-password?token=abc123...`

**POST Request** (n8n):
```json
{
  "token": "abc123...",
  "verified": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token doğrulandı."
}
```

## Güvenlik Özellikleri

1. **Token Expiration**: 30 dakika
2. **One-Time Use**: Token kullanıldıktan sonra geçersiz
3. **Bcrypt Hashing**: 12 rounds
4. **n8n Verification**: Email doğrulaması zorunlu
5. **Countdown Timer**: 180 saniye timeout
6. **Rate Limiting**: (Önerilir - implement edilmeli)

## Sorun Giderme

### Email Gelmiyor

1. n8n workflow'unun aktif olduğundan emin olun
2. n8n logs'larını kontrol edin
3. SMTP ayarlarını doğrulayın
4. Spam klasörünü kontrol edin

### Token Doğrulanmıyor

1. 180 saniye süresi dolmuş olabilir
2. Token zaten kullanılmış olabilir
3. n8n callback çalışmamış olabilir (n8n logs)
4. Database'de `n8n_verified` false olarak kalıyor mu kontrol edin

### Database Migration Hatası

```bash
# Eğer prisma engine download hatası alırsanız
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev
```

## Production Deployment

### 1. Environment Variables

```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
NEXTAUTH_URL="https://kongreai.com"
NEXTAUTH_SECRET="your-production-secret-here"
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com/webhook/password-reset"
```

### 2. Migration

```bash
npx prisma migrate deploy
```

### 3. n8n Production Webhook

Production n8n workflow'unda webhook URL'ini production domain ile güncelleyin.

### 4. Email Template

Email template'ini branding'inize göre özelleştirin.

## Gelecek Geliştirmeler

- [ ] Rate limiting (5 deneme / saat)
- [ ] SMS doğrulama alternatifi
- [ ] 2FA (Two-Factor Authentication)
- [ ] Password strength meter
- [ ] Şifre geçmişi kontrolü (son 3 şifre kullanılamaz)
- [ ] Email template customization UI
- [ ] Audit logs (kim, ne zaman şifre sıfırladı)

---

**Son Güncelleme**: 2024-12-27
**Versiyon**: 1.0.0
**Dokümantasyon**: Emre Bostanoğlu
