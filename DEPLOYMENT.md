# Deployment Guide - Kongre Yönetim Sistemi

Bu döküman projeyi `test.fokusistatistik.com/kongreai` adresine deploy etmek için gerekli adımları içerir.

## 📋 Gereksinimler

- Node.js 18+
- npm veya yarn
- PM2 (production process manager)
- Nginx (reverse proxy)

## 🚀 Quick Start (Production Deployment)

### 1. Repository'yi Klonlayın

```bash
cd /var/www/
git clone <repo-url> kongreai
cd kongreai
git checkout claude/congress-management-system-MulSF
```

### 2. Environment Ayarları

```bash
# .env.production dosyasını düzenleyin
nano .env.production

# NEXTAUTH_SECRET değerini değiştirin:
openssl rand -base64 32
```

**Önemli:** `.env.production` dosyasında şu değerleri kontrol edin:
- `NEXTAUTH_SECRET` - Güvenli bir secret key
- `NEXTAUTH_URL` - https://test.fokusistatistik.com/kongreai
- `DATABASE_URL` - file:./production.db

### 3. Dependencies Yükleyin

```bash
npm install
```

### 4. Production Database Oluşturun

```bash
npm run db:setup:prod
```

Bu komut:
- ✅ Yeni `production.db` oluşturur
- ✅ Tüm tabloları oluşturur
- ✅ Admin kullanıcısı ekler (admin@kongreai.com / admin123)

### 5. Production Build

```bash
npm run build:prod
```

### 6. PM2 ile Başlatın

```bash
# PM2 kurulu değilse
npm install -g pm2

# Uygulamayı başlat
pm2 start npm --name "kongreai" -- start

# Otomatik başlatma
pm2 startup
pm2 save
```

### 7. Nginx Yapılandırması

`/etc/nginx/sites-available/test.fokusistatistik.com` dosyasına ekleyin:

```nginx
server {
    listen 80;
    server_name test.fokusistatistik.com;

    # Mevcut site ayarları...

    # Kongre AI için location block
    location /kongreai {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Nginx'i yeniden başlatın:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 İlk Giriş

1. Tarayıcıda açın: https://test.fokusistatistik.com/kongreai
2. Giriş yapın:
   - Email: `admin@kongreai.com`
   - Şifre: `admin123`
3. **ÖNEMLİ:** İlk girişte şifrenizi değiştirin!

## 📊 Veritabanı Yönetimi

### Prisma Studio (GUI)

```bash
npm run db:studio
# http://localhost:5555
```

### Backup Alma

```bash
# Manual backup
cp prisma/production.db prisma/production.db.backup-$(date +%Y%m%d-%H%M%S)
```

## 🔄 Güncelleme (Update)

```bash
cd /var/www/kongreai
git pull origin claude/congress-management-system-MulSF
npm install
npm run build:prod
pm2 restart kongreai
```

## 📝 Environment Variables

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `NEXT_PUBLIC_BASE_PATH` | Subdirectory path | `/kongreai` |
| `NEXTAUTH_URL` | Full app URL | `https://test.fokusistatistik.com/kongreai` |
| `NEXTAUTH_SECRET` | Secret key | (use openssl rand -base64 32) |
| `DATABASE_URL` | SQLite DB path | `file:./production.db` |
