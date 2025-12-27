# Database Schema - Kongre Yönetim Sistemi

## Veritabanı Genel Bakış

**ORM:** Prisma 5.20.0
**Development Database:** SQLite
**Production Database:** PostgreSQL / MySQL (ready)
**Toplam Tablo Sayısı:** 13

---

## 📊 Tablo Özeti

| # | Tablo Adı | Açıklama | İlişkiler |
|---|-----------|----------|-----------|
| 1 | **User** | Kullanıcılar | → Application, Review, Accommodation |
| 2 | **Event** | Etkinlikler | → Application, Timeline, Documents, Results, Gallery, Schedule |
| 3 | **Application** | Başvurular | ← User, Event → Payment, Review |
| 4 | **EventTimeline** | Önemli Tarihler | ← Event |
| 5 | **CongressDocument** | Dökümanlar | ← Event |
| 6 | **CongressResult** | Sonuçlar | ← Event |
| 7 | **CongressGallery** | Galeri | ← Event |
| 8 | **CongressSchedule** | Program | ← Event |
| 9 | **Announcement** | Duyurular | ← Event |
| 10 | **Payment** | Ödemeler | ← Application |
| 11 | **Review** | Hakem Değerlendirmeleri | ← Application, User |
| 12 | **Accommodation** | Konaklama | ← Event, User |
| 13 | **PasswordResetToken** | Şifre Sıfırlama Tokenları | ← User |

---

## 🔑 Anahtar İlişkiler

### User İlişkileri
```
User (1) ──────< (N) Application
User (1) ──────< (N) Review
User (1) ──────< (N) Accommodation
User (1) ──────< (1) PasswordResetToken
```

### Event İlişkileri
```
Event (1) ─────< (N) Application
Event (1) ─────< (N) EventTimeline
Event (1) ─────< (N) CongressDocument
Event (1) ─────< (N) CongressResult
Event (1) ─────< (N) CongressGallery
Event (1) ─────< (N) CongressSchedule
Event (1) ─────< (N) Announcement
Event (1) ─────< (N) Accommodation
```

### Application İlişkileri
```
Application (1) ───< (1) Payment
Application (1) ───< (N) Review
```

---

## 📋 Tablo Detayları

### 1. User (users)

**Açıklama:** Sistem kullanıcıları

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| email | String | Unique | Email adresi |
| password | String | - | Bcrypt hash (10 rounds) |
| ad | String | - | İsim |
| soyad | String | - | Soyisim |
| unvan | String? | Nullable | Akademik unvan |
| kurum | String? | Nullable | Çalıştığı kurum |
| telefon | String? | Nullable | Telefon numarası |
| role | String | Enum | SUPER_ADMIN, ADMIN, ORGANIZATOR, HAKEM, KATILIMCI |
| aktif | Boolean | default: true | Hesap aktif mi? |
| email_verified | Boolean | default: false | Email doğrulandı mı? |
| ilk_giris | Boolean | default: true | İlk giriş mi? |
| son_giris_tarihi | DateTime? | Nullable | Son giriş zamanı |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `email` (unique)
- `role`

---

### 2. Event (events)

**Açıklama:** Kongre/Etkinlikler

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| slug | String | Unique | URL-friendly identifier |
| baslik | String | - | Etkinlik başlığı |
| alt_baslik | String? | Nullable | Alt başlık |
| tip | String | Enum | KONGRE, SEMPOZYUM, PANEL, CALISTAY |
| aciklama | String? | HTML | Açıklama (HTML) |
| baslangic_tarihi | DateTime | - | Başlangıç tarihi |
| bitis_tarihi | DateTime | - | Bitiş tarihi |
| son_basvuru_tarihi | DateTime | - | Son başvuru tarihi |
| erken_kayit_tarihi | DateTime? | Nullable | Erken kayıt son tarihi |
| yer | String | - | Mekan |
| adres | String? | Nullable | Detaylı adres |
| online | Boolean | default: false | Online/Hybrid? |
| online_link | String? | Nullable | Online link (Zoom, Teams) |
| ucret | Float | default: 0 | Standart ücret |
| para_birimi | String | default: TRY | Para birimi |
| erken_kayit_ucret | Float? | Nullable | Erken kayıt ücreti |
| ogrenci_ucret | Float? | Nullable | Öğrenci ücreti |
| ucretsiz | Boolean | default: false | Ücretsiz mi? |
| gorsel_url | String? | Nullable | Banner/Poster URL |
| logo_url | String? | Nullable | Logo URL |
| amaclar_hedefler | String? | HTML | Amaçlar (HTML) |
| hedef_kitle | String? | HTML | Hedef kitle (HTML) |
| bilimsel_program | String? | HTML | Bilimsel program (HTML) |
| kurullar | String? | JSON | Kurullar (JSON) |
| sponsor_bilgileri | String? | JSON | Sponsorlar (JSON) |
| durum | String | Enum | TASLAK, YAYINDA, TAMAMLANDI, IPTAL |
| basvuru_aktif | Boolean | default: true | Başvurular aktif mi? |
| max_katilimci | Int? | Nullable | Katılımcı limiti |
| sertifika_aktif | Boolean | default: true | Sertifika aktif mi? |
| katilim_sertifikasi | String? | Nullable | Sertifika şablonu URL |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |
| created_by_id | String? | FK → User | Oluşturan admin |

**İndeksler:**
- `slug` (unique)
- `durum`
- `baslangic_tarihi`
- `son_basvuru_tarihi`

---

### 3. Application (applications)

**Açıklama:** Etkinlik başvuruları

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| user_id | String | FK → User | Kullanıcı ID |
| durum | String | Enum | BEKLEMEDE, ONAYLANDI, REDDEDILDI, IPTAL |
| basvuru_notu | String? | Nullable | Kullanıcı notu |
| yonetici_notu | String? | Nullable | Admin notu |
| bildiri_baslik | String? | Nullable | Bildiri başlığı |
| bildiri_ozet | String? | Nullable | Bildiri özeti |
| anahtar_kelimeler | String? | Nullable | Anahtar kelimeler |
| kategori | String? | Nullable | Bildiri kategorisi |
| yazarlar | String? | JSON | Yazarlar listesi (JSON) |
| dosya_url | String? | Nullable | Bildiri dosyası URL |
| ek_dosya_url | String? | Nullable | Ek dosya URL |
| poster_url | String? | Nullable | Poster URL |
| sunum_tercihi | String? | Enum | SOZLU, POSTER |
| bildiri_durum | String | Enum | BEKLEMEDE, HAKEMDE, KABUL, RED, REVIZYON |
| hakem_notu | String? | Nullable | Hakem yorumu |
| revizyon_talep | String? | Nullable | Revizyon talepleri |
| yonetici_notu_bildiri | String? | Nullable | Admin notu |
| sunum_tarihi | String? | Nullable | Sunum tarihi |
| sunum_salonu | String? | Nullable | Sunum salonu |
| oturum | String? | Nullable | Oturum bilgisi |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `user_id`
- `durum`
- `bildiri_durum`

---

### 4. EventTimeline (event_timeline)

**Açıklama:** Etkinlik önemli tarihleri

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| baslik | String | - | Tarih başlığı |
| aciklama | String? | Nullable | Açıklama |
| tarih | String | - | Tarih (YYYY-MM-DD) |
| tip | String | Enum | ONEMLI, BASVURU, BILDIRI, SONUC, ETKINLIK, DUYURU |
| ikon | String? | Nullable | İkon adı |
| yayinlandi | Boolean | default: true | Yayında mı? |
| sira | Int | default: 0 | Sıralama |
| created_by_email | String? | Nullable | Oluşturan email |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `tip`
- `tarih`
- `yayinlandi`

**Örnek Veriler:**
```sql
INSERT INTO event_timeline VALUES
  ('uuid1', 'event-uuid', 'Bildiri Gönderme Son Tarihi',
   'Bildirilerin sistem üzerinden gönderilmesi için son tarih',
   '2025-03-15', 'BILDIRI', 'file', 1, 1,
   'admin@kongreai.com', '2025-01-01', '2025-01-01');
```

---

### 5. CongressDocument (congress_documents)

**Açıklama:** Etkinlik dökümanları

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| baslik | String | - | Döküman başlığı |
| aciklama | String? | Nullable | Açıklama |
| dosya_url | String | - | Dosya URL |
| dosya_tipi | String | Enum | PDF, DOCX, XLSX, PPTX |
| dosya_boyut | Int? | Nullable | Dosya boyutu (bytes) |
| kategori | String | Enum | GENEL, PROGRAM, TEMPLATE, ABSTRACT_TEMPLATE, SERTIFIKA |
| yayinlandi | Boolean | default: true | Yayında mı? |
| sira | Int | default: 0 | Sıralama |
| indirme_sayisi | Int | default: 0 | İndirme sayacı |
| created_by_email | String? | Nullable | Oluşturan email |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `kategori`
- `yayinlandi`

---

### 6. CongressResult (congress_results)

**Açıklama:** Etkinlik sonuçları

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| baslik | String | - | Sonuç başlığı |
| icerik | String | HTML | Sonuç içeriği (HTML) |
| tip | String | Enum | KABUL_LISTESI, ODULLER, ISTATISTIK, GENEL |
| dosya_url | String? | Nullable | Ek dosya URL |
| yayinlandi | Boolean | default: true | Yayında mı? |
| yayin_tarihi | DateTime? | Nullable | Yayınlanma zamanı |
| sira | Int | default: 0 | Sıralama |
| created_by_email | String? | Nullable | Oluşturan email |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `tip`
- `yayinlandi`

---

### 7. CongressGallery (congress_gallery)

**Açıklama:** Etkinlik galerisi

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| baslik | String? | Nullable | Görsel başlığı |
| aciklama | String? | Nullable | Açıklama |
| medya_url | String | - | Medya URL |
| medya_tipi | String | Enum | IMAGE, VIDEO |
| thumbnail_url | String? | Nullable | Thumbnail URL |
| kategori | String | Enum | GENEL, OTURUM, GALA, POSTER, SOSYAL |
| yayinlandi | Boolean | default: true | Yayında mı? |
| sira | Int | default: 0 | Sıralama |
| uploaded_by_email | String? | Nullable | Yükleyen email |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `medya_tipi`
- `kategori`

---

### 8. CongressSchedule (congress_schedule)

**Açıklama:** Etkinlik programı

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| gun | String | - | Gün ("1. Gün", "2025-05-15") |
| baslik | String | - | Oturum başlığı |
| aciklama | String? | Nullable | Açıklama |
| baslangic_saati | String | - | Başlangıç saati ("09:00") |
| bitis_saati | String | - | Bitiş saati ("10:30") |
| salon | String? | Nullable | Salon bilgisi |
| tip | String | Enum | OTURUM, PANEL, KAHVE_ARASI, YEMEK, SOSYAL, ACILIS, KAPANIS |
| konusmacilar | String? | JSON | Konuşmacılar (JSON) |
| oturum_baskani | String? | Nullable | Oturum başkanı |
| yayinlandi | Boolean | default: true | Yayında mı? |
| sira | Int | default: 0 | Sıralama |
| created_by_email | String? | Nullable | Oluşturan email |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `gun`
- `tip`

---

### 9. Announcement (announcements)

**Açıklama:** Etkinlik duyuruları

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| baslik | String | - | Duyuru başlığı |
| icerik | String | HTML | Duyuru içeriği (HTML) |
| tip | String | Enum | ACIL, UYARI, ONEMLI, BILGI |
| oncelik | Int | default: 5 | Öncelik (1-10) |
| yayinlandi | Boolean | default: false | Yayında mı? |
| yayin_baslangic | DateTime? | Nullable | Yayın başlangıç |
| yayin_bitis | DateTime? | Nullable | Yayın bitiş |
| created_by_email | String? | Nullable | Oluşturan email |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `tip`
- `yayinlandi`
- `oncelik`

---

### 10. Payment (payments)

**Açıklama:** Ödeme bilgileri

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| application_id | String | FK → Application, Unique | Başvuru ID |
| tutar | Float | - | Ödeme tutarı |
| para_birimi | String | default: TRY | Para birimi |
| durum | String | Enum | BEKLEMEDE, ODENDI, IPTAL, IADE |
| odeme_yontemi | String? | Enum | KREDI_KARTI, BANKA_HAVALESI, NAKIT, ONLINE |
| odeme_tarihi | DateTime? | Nullable | Ödeme tarihi |
| odeme_referans | String? | Nullable | Referans no |
| fatura_bilgileri | String? | JSON | Fatura bilgileri (JSON) |
| makbuz_url | String? | Nullable | Makbuz URL |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `application_id` (unique)
- `durum`

---

### 11. Review (reviews)

**Açıklama:** Hakem değerlendirmeleri

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| application_id | String | FK → Application | Başvuru ID |
| reviewer_id | String | FK → User | Hakem ID |
| puan | Int | - | Puan (1-10) |
| yorum | String? | Nullable | Hakem yorumu |
| karar | String | Enum | KABUL, RED, REVIZYON_GEREKLI |
| tamamlandi | Boolean | default: false | Tamamlandı mı? |
| tamamlanma_tarihi | DateTime? | Nullable | Tamamlanma zamanı |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `application_id`
- `reviewer_id`

---

### 12. Accommodation (accommodations)

**Açıklama:** Konaklama rezervasyonları

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| event_id | String | FK → Event | Etkinlik ID |
| user_id | String | FK → User | Kullanıcı ID |
| otel_adi | String | - | Otel adı |
| oda_tipi | String | - | Oda tipi |
| giris_tarihi | DateTime | - | Giriş tarihi |
| cikis_tarihi | DateTime | - | Çıkış tarihi |
| fiyat | Float | - | Fiyat |
| para_birimi | String | default: TRY | Para birimi |
| durum | String | Enum | BEKLEMEDE, ONAYLANDI, IPTAL |
| rezervasyon_kodu | String? | Nullable | Rezervasyon kodu |
| created_at | DateTime | auto | Oluşturulma zamanı |
| updated_at | DateTime | auto | Güncellenme zamanı |

**İndeksler:**
- `event_id`
- `user_id`

---

### 13. PasswordResetToken (password_reset_tokens)

**Açıklama:** Şifre sıfırlama tokenları

| Alan | Tip | Özellik | Açıklama |
|------|-----|---------|----------|
| id | String | PK, UUID | Birincil anahtar |
| user_id | String | FK → User | Kullanıcı ID |
| token | String | Unique | Reset token |
| expires_at | DateTime | - | Geçerlilik süresi |
| used | Boolean | default: false | Kullanıldı mı? |
| created_at | DateTime | auto | Oluşturulma zamanı |

**İndeksler:**
- `user_id`
- `token` (unique)

---

## 🔄 Migration Stratejisi

### Development
```bash
# Schema değişikliklerini veritabanına uygula
npx prisma db push

# Yeni migration oluştur
npx prisma migrate dev --name migration_name
```

### Production
```bash
# Migrationları uygula
npx prisma migrate deploy

# Prisma Client'ı oluştur
npx prisma generate
```

---

## 📝 Örnek Sorgular

### Kullanıcı ve Başvuruları
```typescript
const userWithApplications = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    applications: {
      include: {
        event: true,
        payment: true
      }
    }
  }
});
```

### Etkinlik ve Tüm Alt Verileri
```typescript
const eventFull = await prisma.event.findUnique({
  where: { slug: 'kongre-2025' },
  include: {
    timeline: { where: { yayinlandi: true }, orderBy: { tarih: 'asc' } },
    documents: { where: { yayinlandi: true } },
    results: { where: { yayinlandi: true } },
    gallery: { where: { yayinlandi: true } },
    schedule: { where: { yayinlandi: true }, orderBy: { sira: 'asc' } },
    announcements: { where: { yayinlandi: true }, orderBy: { oncelik: 'desc' } }
  }
});
```

### Timeline ile Etkinlik
```typescript
const upcomingTimeline = await prisma.eventTimeline.findMany({
  where: {
    event_id: 'event-uuid',
    yayinlandi: true,
    tarih: { gte: new Date().toISOString().split('T')[0] }
  },
  orderBy: { tarih: 'asc' },
  include: { event: true }
});
```

---

## 🛠️ Database Bakım

### Backup
```bash
# SQLite backup
cp prisma/dev.db prisma/dev.db.backup

# PostgreSQL backup
pg_dump kongreai > backup.sql
```

### Restore
```bash
# SQLite restore
cp prisma/dev.db.backup prisma/dev.db

# PostgreSQL restore
psql kongreai < backup.sql
```

### Database Studio
```bash
# Prisma Studio ile görsel yönetim
npx prisma studio
```

---

**Son Güncelleme:** 2025-12-27
**Schema Versiyonu:** 1.0.0
**Döküman Sahibi:** FOKUS İstatistik
