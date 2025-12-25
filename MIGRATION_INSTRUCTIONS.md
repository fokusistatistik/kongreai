# Database Migration Instructions

## Önemli: Veritabanı Güncellemesi Gerekli

Bu commit'ten sonra veritabanı şemasında önemli değişiklikler yapıldı. Uygulamayı çalıştırmadan önce aşağıdaki adımları **mutlaka** takip edin.

## 1. Prisma Migration'ı Çalıştırın

Veritabanına yeni tablolar (Accommodation, Announcement) eklemek için:

```bash
npx prisma migrate dev --name add_accommodation_and_announcements
```

**Not:** Eğer network hatası alırsanız (403 Forbidden), şu komutu kullanın:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name add_accommodation_and_announcements
```

Alternatif olarak, migration olmadan direkt push yapabilirsiniz:

```bash
npx prisma db push
```

## 2. Seed Script'i Çalıştırın

Süper admin ve test kullanıcılarını oluşturmak için:

```bash
npm run seed
```

Bu komut aşağıdaki kullanıcıları oluşturacak:

### Süper Admin
- **Email:** emrebostanoglu@gmail.com
- **Şifre:** 123456
- **Rol:** SUPER_ADMIN

### Test Kullanıcıları
1. **Admin**
   - Email: admin@kongreai.com
   - Şifre: admin123
   - Rol: ADMIN

2. **Hakem**
   - Email: hakem@kongreai.com
   - Şifre: hakem123
   - Rol: HAKEM

3. **Katılımcı**
   - Email: user@kongreai.com
   - Şifre: user123
   - Rol: KATILIMCI

## 3. Yeni Özellikler

### Schema Değişiklikleri

**Accommodation Model (Konaklama Sistemi)**
- Otel rezervasyon yönetimi
- Oda tipi seçimi (TEK, CIFT, SUIT)
- Multi-currency desteği (TRY, USD, EUR)
- Ödeme durumu takibi

**Announcement Model (Duyuru Sistemi)**
- Etkinlik bazlı duyurular
- Duyuru tipleri (BILGI, UYARI, ONEMLI, ACIL)
- Öncelik sistemi
- Yayın tarihi yönetimi

**Extended Role System**
- SUPER_ADMIN: Tüm yetkilere sahip
- ADMIN: Sistem yöneticisi
- ORGANIZATOR: Etkinlik organizatörü
- HAKEM: Başvuru değerlendirmeci
- KATILIMCI: Normal kullanıcı

### Yeni Sayfalar

**Kullanıcı Profil Sayfası** (`/dashboard/profile`)
- Kişisel bilgi güncelleme
- Şifre değiştirme
- Responsive tasarım

**Admin Profil Sayfası** (`/admin/profile`)
- Admin bilgi güncelleme
- Rol görüntüleme
- Şifre değiştirme
- Dark theme

### API Routes

**Kullanıcı API'leri**
- `PUT /api/user/profile` - Profil güncelleme
- `POST /api/user/change-password` - Şifre değiştirme

**Admin API'leri**
- `PUT /api/admin/profile` - Admin profil güncelleme
- `POST /api/admin/change-password` - Admin şifre değiştirme

## 4. Şifre Değiştirme

Tüm kullanıcılar (süper admin dahil) artık:
- **Kullanıcı paneli:** `/dashboard/profile` adresinden
- **Admin paneli:** `/admin/profile` adresinden

Şifrelerini değiştirebilir.

## 5. Sorun Giderme

### Migration Hatası
Eğer migration sırasında hata alırsanız:

```bash
# Prisma client'ı yeniden oluşturun
npx prisma generate

# Database'i sıfırlayın (DİKKAT: Tüm verileri siler!)
npx prisma migrate reset

# Seed'i tekrar çalıştırın
npm run seed
```

### Network Hatası
403 Forbidden hatası alıyorsanız, environment variable kullanın:

```bash
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
```

Sonra migration'ı tekrar deneyin.

## 6. Sıradaki Adımlar

Profil sayfaları tamamlandı. Sıradaki özellikler:

1. **Etkinlik Detay Sayfası** - Etkinlik bilgileri ve başvuru formu
2. **Başvuru + Ödeme Akışı** - Iyzico entegrasyonu (UI hazır)
3. **Konaklama Seçimi** - Otel rezervasyon sistemi
4. **Duyuru Sistemi** - Admin panelinden duyuru yönetimi
5. **Hakem Değerlendirme** - Başvuru inceleme sistemi

## 7. Geliştirme Ortamı

Uygulamayı başlatmak için:

```bash
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresini açın.

### Test Hesapları ile Giriş

**Normal Kullanıcı Girişi:** `http://localhost:3000/auth/login`
**Admin Girişi:** `http://localhost:3000/admin/login`

---

**Not:** Tüm şifreler bcrypt ile hashlenmiş durumda ve güvenli şekilde saklanmaktadır.
