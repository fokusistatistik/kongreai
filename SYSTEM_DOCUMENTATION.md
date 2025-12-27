# Kongre Yönetim Sistemi - Kapsamlı Sistem Dokümantasyonu

**Versiyon:** 1.0.0
**Son Güncelleme:** 2025-12-27
**Proje Adı:** Congress Management System (KongreAI)

---

## 📋 İçindekiler

1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Database Mimarisi](#database-mimarisi)
4. [API Endpoint'leri](#api-endpointleri)
5. [Kimlik Doğrulama ve Yetkilendirme](#kimlik-doğrulama-ve-yetkilendirme)
6. [Dosya Yapısı](#dosya-yapısı)
7. [Özellikler ve Modüller](#özellikler-ve-modüller)
8. [Webhook Entegrasyonu](#webhook-entegrasyonu)
9. [Deployment](#deployment)
10. [Geliştirici Kılavuzu](#geliştirici-kılavuzu)

---

## 🎯 Sistem Genel Bakış

### Proje Tanımı
Bilimsel kongre, sempozyum ve etkinliklerin kapsamlı yönetimi için geliştirilmiş modern web uygulaması.

### Ana Amaçlar
- ✅ Online etkinlik kaydı ve yönetimi
- ✅ Bildiri/abstract gönderimi ve değerlendirmesi
- ✅ Katılımcı yönetimi ve sertifikasyon
- ✅ Etkinlik timeline ve duyuru sistemi
- ✅ Admin paneli ile merkezi yönetim
- ✅ Rol bazlı erişim kontrolü

### Hedef Kullanıcılar
1. **Etkinlik Yöneticileri (Admin/Organizatör)**
2. **Hakemler** - Bildiri değerlendirme
3. **Katılımcılar** - Kayıt ve başvuru
4. **Misafir Kullanıcılar** - Etkinlik görüntüleme

---

## 💻 Teknoloji Stack

### Frontend
```json
{
  "Framework": "Next.js 14.2.15 (App Router)",
  "UI Library": "React 18.3.1",
  "Styling": "Tailwind CSS 3.4.17",
  "UI Components": [
    "Radix UI (Select, Tabs)",
    "Lucide React (Icons)",
    "Recharts (Grafik ve analitik)"
  ],
  "Type Safety": "TypeScript 5.7.2",
  "State Management": "React Hooks + Server Components"
}
```

### Backend
```json
{
  "Runtime": "Node.js 22.x",
  "Framework": "Next.js API Routes",
  "Database ORM": "Prisma 5.20.0",
  "Database": "SQLite (development), PostgreSQL (production ready)",
  "Authentication": "NextAuth.js 4.24.10",
  "Password Hashing": "bcryptjs 2.4.3",
  "Validation": "Zod 3.23.8"
}
```

### Altyapı ve Araçlar
```json
{
  "Package Manager": "npm",
  "Linting": "ESLint 8.57.1",
  "Code Formatting": "Next.js built-in",
  "Build Tool": "Next.js + Turbopack",
  "PWA Support": "next-pwa 5.6.0",
  "Version Control": "Git",
  "CI/CD": "GitHub Actions (optional)"
}
```

---

## 🗄️ Database Mimarisi

### Genel Bakış
- **ORM:** Prisma
- **Veritabanı:** SQLite (dev), PostgreSQL/MySQL (prod)
- **Migration Stratejisi:** Prisma Migrate
- **Seed Data:** Demo data scripts included

### Database Diyagramı

```
┌─────────────┐
│    User     │──┐
└─────────────┘  │
                 │ 1:N
                 ├──────┐
┌─────────────┐  │      │
│    Event    │──┤      │
└─────────────┘  │      │
       │         │      │
       │ 1:N     │      │
       ├─────────┼──────┼─────────┐
       │         │      │         │
       ▼         ▼      ▼         ▼
┌──────────┐ ┌──────────────┐ ┌─────────────┐
│Timeline  │ │ Application  │ │  Documents  │
└──────────┘ └──────────────┘ └─────────────┘
                    │
                    ▼
              ┌──────────┐
              │ Payment  │
              └──────────┘
```

### Tablo Detayları

#### 1. User (Kullanıcılar)
```typescript
{
  id: String (UUID, PK)
  email: String (Unique)
  password: String (bcrypt hash)

  // Kişisel Bilgiler
  ad: String
  soyad: String
  unvan: String?               // "Prof. Dr.", "Doç. Dr."
  kurum: String?               // Çalıştığı kurum
  telefon: String?

  // Rol ve Yetki
  role: Enum                   // SUPER_ADMIN, ADMIN, ORGANIZATOR, HAKEM, KATILIMCI

  // Hesap Durumu
  aktif: Boolean (default: true)
  email_verified: Boolean (default: false)
  ilk_giris: Boolean (default: true)
  son_giris_tarihi: DateTime?

  // İlişkiler
  applications: Application[]
  reviews: Review[]
  accommodations: Accommodation[]

  // Timestamps
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `email` (unique)
- `role`

---

#### 2. Event (Kongre/Etkinlik)
```typescript
{
  id: String (UUID, PK)
  slug: String (Unique)          // URL-friendly

  // Temel Bilgiler
  baslik: String
  alt_baslik: String?
  tip: Enum                      // KONGRE, SEMPOZYUM, PANEL, CALISTAY
  aciklama: String? (HTML)

  // Tarihler
  baslangic_tarihi: DateTime
  bitis_tarihi: DateTime
  son_basvuru_tarihi: DateTime
  erken_kayit_tarihi: DateTime?

  // Mekan
  yer: String
  adres: String?
  online: Boolean (default: false)
  online_link: String?

  // Fiyatlandırma
  ucret: Float (default: 0)
  para_birimi: String (default: "TRY")
  erken_kayit_ucret: Float?
  ogrenci_ucret: Float?
  ucretsiz: Boolean (default: false)

  // Görsel ve Medya
  gorsel_url: String?
  logo_url: String?

  // İçerik Alanları
  amaclar_hedefler: String? (HTML)
  hedef_kitle: String? (HTML)
  bilimsel_program: String? (HTML)
  kurullar: String? (JSON)
  sponsor_bilgileri: String? (JSON)

  // Durum
  durum: Enum                    // TASLAK, YAYINDA, TAMAMLANDI, IPTAL

  // Ayarlar
  basvuru_aktif: Boolean (default: true)
  max_katilimci: Int?
  sertifika_aktif: Boolean (default: true)
  katilim_sertifikasi: String?

  // İlişkiler
  applications: Application[]
  accommodations: Accommodation[]
  announcements: Announcement[]
  documents: CongressDocument[]
  results: CongressResult[]
  gallery: CongressGallery[]
  schedule: CongressSchedule[]
  timeline: EventTimeline[]

  // Timestamps
  created_at: DateTime
  updated_at: DateTime
  created_by_id: String?
}
```

**Indexes:**
- `slug` (unique)
- `durum`
- `baslangic_tarihi`
- `son_basvuru_tarihi`

---

#### 3. Application (Başvuru)
```typescript
{
  id: String (UUID, PK)

  // İlişkiler
  event_id: String (FK -> Event)
  user_id: String (FK -> User)

  // Başvuru Bilgileri
  durum: Enum                    // BEKLEMEDE, ONAYLANDI, REDDEDILDI, IPTAL
  basvuru_notu: String?
  yonetici_notu: String?

  // Bildiri Bilgileri (Opsiyonel)
  bildiri_baslik: String?
  bildiri_ozet: String?
  anahtar_kelimeler: String?
  kategori: String?
  yazarlar: String? (JSON)

  // Dosyalar
  dosya_url: String?
  ek_dosya_url: String?
  poster_url: String?

  // Sunum Tercihi
  sunum_tercihi: Enum?           // SOZLU, POSTER

  // Bildiri Durumu
  bildiri_durum: Enum            // BEKLEMEDE, HAKEMDE, KABUL, RED, REVIZYON
  hakem_notu: String?
  revizyon_talep: String?

  // Sunum Bilgileri
  sunum_tarihi: String?
  sunum_salonu: String?
  oturum: String?

  // İlişkiler
  payment: Payment?
  reviews: Review[]

  // Timestamps
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `event_id`
- `user_id`
- `durum`
- `bildiri_durum`

---

#### 4. EventTimeline (Etkinlik Önemli Tarihleri)
```typescript
{
  id: String (UUID, PK)

  // İlişki
  event_id: String (FK -> Event)

  // Timeline Bilgileri
  baslik: String                 // "Bildiri Gönderme Son Tarihi"
  aciklama: String?
  tarih: String                  // ISO format (YYYY-MM-DD)

  // Kategori
  tip: Enum                      // ONEMLI, BASVURU, BILDIRI, SONUC, ETKINLIK, DUYURU

  // UI Özelleştirme
  ikon: String?                  // "calendar", "file", "award", "bell", "clock", "check"

  // Görünürlük
  yayinlandi: Boolean (default: true)
  sira: Int (default: 0)

  // Metadata
  created_by_email: String?
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `event_id`
- `tip`
- `tarih`
- `yayinlandi`

---

#### 5. CongressDocument (Dokümanlar)
```typescript
{
  id: String (UUID, PK)

  // İlişki
  event_id: String (FK -> Event)

  // Döküman Bilgileri
  baslik: String
  aciklama: String?
  dosya_url: String
  dosya_tipi: Enum               // PDF, DOCX, XLSX, PPTX
  dosya_boyut: Int?

  // Kategori
  kategori: Enum                 // GENEL, PROGRAM, TEMPLATE, ABSTRACT_TEMPLATE, SERTIFIKA

  // Görünürlük
  yayinlandi: Boolean (default: true)
  sira: Int (default: 0)

  // Metadata
  indirme_sayisi: Int (default: 0)
  created_by_email: String?
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `event_id`
- `kategori`
- `yayinlandi`

---

#### 6. CongressResult (Sonuçlar)
```typescript
{
  id: String (UUID, PK)

  // İlişki
  event_id: String (FK -> Event)

  // Sonuç Bilgileri
  baslik: String
  icerik: String (HTML)
  tip: Enum                      // KABUL_LISTESI, ODULLER, ISTATISTIK, GENEL

  // Dosya
  dosya_url: String?

  // Yayın Bilgileri
  yayinlandi: Boolean (default: true)
  yayin_tarihi: DateTime?
  sira: Int (default: 0)

  // Metadata
  created_by_email: String?
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `event_id`
- `tip`
- `yayinlandi`

---

#### 7. CongressGallery (Galeri)
```typescript
{
  id: String (UUID, PK)

  // İlişki
  event_id: String (FK -> Event)

  // Medya Bilgileri
  baslik: String?
  aciklama: String?
  medya_url: String
  medya_tipi: Enum               // IMAGE, VIDEO
  thumbnail_url: String?

  // Kategori
  kategori: Enum                 // GENEL, OTURUM, GALA, POSTER, SOSYAL

  // Görünürlük
  yayinlandi: Boolean (default: true)
  sira: Int (default: 0)

  // Metadata
  uploaded_by_email: String?
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `event_id`
- `medya_tipi`
- `kategori`

---

#### 8. CongressSchedule (Program)
```typescript
{
  id: String (UUID, PK)

  // İlişki
  event_id: String (FK -> Event)

  // Program Bilgileri
  gun: String                    // "1. Gün", "2025-05-15"
  baslik: String
  aciklama: String?

  // Zaman
  baslangic_saati: String        // "09:00"
  bitis_saati: String            // "10:30"

  // Mekan
  salon: String?

  // Tip
  tip: Enum                      // OTURUM, PANEL, KAHVE_ARASI, YEMEK, SOSYAL, ACILIS, KAPANIS

  // Konuşmacılar
  konusmacilar: String? (JSON)   // [{"ad": "X", "unvan": "Y", "konu": "Z"}]
  oturum_baskani: String?

  // Görünürlük
  yayinlandi: Boolean (default: true)
  sira: Int (default: 0)

  // Metadata
  created_by_email: String?
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `event_id`
- `gun`
- `tip`

---

#### 9. Announcement (Duyurular)
```typescript
{
  id: String (UUID, PK)

  // İlişki
  event_id: String (FK -> Event)

  // Duyuru Bilgileri
  baslik: String
  icerik: String (HTML)
  tip: Enum                      // ACIL, UYARI, ONEMLI, BILGI
  oncelik: Int (default: 5)      // 1-10 arası

  // Yayın Kontrolü
  yayinlandi: Boolean (default: false)
  yayin_baslangic: DateTime?
  yayin_bitis: DateTime?

  // Metadata
  created_by_email: String?
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `event_id`
- `tip`
- `yayinlandi`
- `oncelik`

---

#### 10. Payment (Ödeme)
```typescript
{
  id: String (UUID, PK)

  // İlişki
  application_id: String (FK -> Application, Unique)

  // Ödeme Bilgileri
  tutar: Float
  para_birimi: String (default: "TRY")

  // Durum
  durum: Enum                    // BEKLEMEDE, ODENDI, IPTAL, IADE

  // Ödeme Yöntemi
  odeme_yontemi: Enum?           // KREDI_KARTI, BANKA_HAVALESI, NAKIT, ONLINE

  // Detaylar
  odeme_tarihi: DateTime?
  odeme_referans: String?
  fatura_bilgileri: String? (JSON)
  makbuz_url: String?

  // Timestamps
  created_at: DateTime
  updated_at: DateTime
}
```

**Indexes:**
- `application_id` (unique)
- `durum`

---

#### 11. Accommodation (Konaklama)
```typescript
{
  id: String (UUID, PK)

  // İlişkiler
  event_id: String (FK -> Event)
  user_id: String (FK -> User)

  // Otel Bilgileri
  otel_adi: String
  oda_tipi: String               // "Tek", "Çift", "Suite"
  giris_tarihi: DateTime
  cikis_tarihi: DateTime

  // Fiyat
  fiyat: Float
  para_birimi: String (default: "TRY")

  // Durum
  durum: Enum                    // BEKLEMEDE, ONAYLANDI, IPTAL
  rezervasyon_kodu: String?

  // Timestamps
  created_at: DateTime
  updated_at: DateTime
}
```

---

#### 12. Review (Hakem Değerlendirmesi)
```typescript
{
  id: String (UUID, PK)

  // İlişkiler
  application_id: String (FK -> Application)
  reviewer_id: String (FK -> User)

  // Değerlendirme
  puan: Int                      // 1-10 arası
  yorum: String?
  karar: Enum                    // KABUL, RED, REVIZYON_GEREKLI

  // Durum
  tamamlandi: Boolean (default: false)
  tamamlanma_tarihi: DateTime?

  // Timestamps
  created_at: DateTime
  updated_at: DateTime
}
```

---

#### 13. PasswordResetToken
```typescript
{
  id: String (UUID, PK)
  user_id: String (FK -> User)
  token: String (Unique)
  expires_at: DateTime
  used: Boolean (default: false)
  created_at: DateTime
}
```

---

### Database İlişkileri

```
User (1) ──────< (N) Application
User (1) ──────< (N) Review
User (1) ──────< (N) Accommodation
User (1) ──────< (1) PasswordResetToken

Event (1) ─────< (N) Application
Event (1) ─────< (N) Accommodation
Event (1) ─────< (N) Announcement
Event (1) ─────< (N) CongressDocument
Event (1) ─────< (N) CongressResult
Event (1) ─────< (N) CongressGallery
Event (1) ─────< (N) CongressSchedule
Event (1) ─────< (N) EventTimeline

Application (1) ───< (1) Payment
Application (1) ───< (N) Review
```

---

## 🔌 API Endpoint'leri

### Kimlik Doğrulama API'leri

#### POST /api/auth/register
**Açıklama:** Yeni kullanıcı kaydı
**Erişim:** Public
**Request Body:**
```json
{
  "ad": "Ahmet",
  "soyad": "Yılmaz",
  "email": "user@example.com",
  "password": "secure123",
  "telefon": "0555 111 2222",
  "unvan": "Doç. Dr.",
  "kurum": "İstanbul Üniversitesi"
}
```
**Response:**
```json
{
  "success": true,
  "userId": "uuid",
  "message": "Kayıt başarılı"
}
```

---

#### POST /api/auth/[...nextauth]
**Açıklama:** NextAuth.js authentication endpoint
**Erişim:** Public
**Desteklenen:** `signIn`, `signOut`, `session`, `providers`

---

#### POST /api/auth/forgot-password
**Açıklama:** Şifre sıfırlama talebi
**Erişim:** Public
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Workflow:**
1. Token oluştur
2. n8n webhook'a gönder
3. Email gönderimi

---

#### POST /api/auth/reset-password
**Açıklama:** Şifre sıfırlama (token ile)
**Erişim:** Public
**Request Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

---

### Admin API'leri

#### GET /api/admin/events/[eventId]
**Açıklama:** Etkinlik detaylarını getir (admin)
**Erişim:** ADMIN role required
**Response:**
```json
{
  "event": {
    "id": "uuid",
    "baslik": "Kongre Adı",
    "durum": "YAYINDA",
    ...
  }
}
```

---

#### POST /api/admin/events/[eventId]/timeline
**Açıklama:** Yeni timeline öğesi oluştur
**Erişim:** ADMIN
**Request Body:**
```json
{
  "baslik": "Bildiri Gönderme Son Tarihi",
  "aciklama": "Bildirilerin sistem üzerinden gönderilmesi için son tarih",
  "tarih": "2025-03-15",
  "tip": "BILDIRI",
  "ikon": "file",
  "yayinlandi": true,
  "sira": 1
}
```

---

#### PUT /api/admin/events/[eventId]/timeline/[timelineId]
**Açıklama:** Timeline öğesini güncelle
**Erişim:** ADMIN

---

#### DELETE /api/admin/events/[eventId]/timeline/[timelineId]
**Açıklama:** Timeline öğesini sil
**Erişim:** ADMIN

---

#### GET /api/admin/events/[eventId]/documents
**Açıklama:** Etkinlik dökümanlarını listele
**Erişim:** ADMIN

---

#### POST /api/admin/events/[eventId]/documents
**Açıklama:** Yeni döküman ekle
**Erişim:** ADMIN

---

#### PUT /api/admin/events/[eventId]/documents/[documentId]
**Açıklama:** Döküman güncelle
**Erişim:** ADMIN

---

#### DELETE /api/admin/events/[eventId]/documents/[documentId]
**Açıklama:** Döküman sil
**Erişim:** ADMIN

---

#### GET /api/admin/events/[eventId]/results
**Açıklama:** Sonuçları listele
**Erişim:** ADMIN

---

#### POST /api/admin/events/[eventId]/results
**Açıklama:** Yeni sonuç ekle
**Erişim:** ADMIN

---

#### GET /api/admin/events/[eventId]/gallery
**Açıklama:** Galeri öğelerini listele
**Erişim:** ADMIN

---

#### POST /api/admin/events/[eventId]/gallery
**Açıklama:** Galeri öğesi ekle
**Erişim:** ADMIN

---

#### GET /api/admin/events/[eventId]/schedule
**Açıklama:** Program öğelerini listele
**Erişim:** ADMIN

---

#### POST /api/admin/events/[eventId]/schedule
**Açıklama:** Program öğesi ekle
**Erişim:** ADMIN

---

### Public API'leri

#### GET /api/events/[eventId]/timeline
**Açıklama:** Yayınlanan timeline öğelerini getir
**Erişim:** Public
**Response:**
```json
{
  "timeline": [
    {
      "id": "uuid",
      "baslik": "Erken Kayıt Son Tarihi",
      "tarih": "2025-02-28",
      "tip": "BASVURU",
      "ikon": "clock"
    }
  ]
}
```

---

#### GET /api/events/[eventId]/documents
**Açıklama:** Yayınlanan dökümanları getir
**Erişim:** Public

---

#### GET /api/events/[eventId]/results
**Açıklama:** Yayınlanan sonuçları getir
**Erişim:** Public

---

#### GET /api/events/[eventId]/gallery
**Açıklama:** Yayınlanan galeri öğelerini getir
**Erişim:** Public

---

#### GET /api/events/[eventId]/schedule
**Açıklama:** Yayınlanan programı getir
**Erişim:** Public

---

#### GET /api/events/[eventId]/announcements
**Açıklama:** Yayınlanan duyuruları getir
**Erişim:** Public
**Query Parameters:**
- `tip` (optional): Filter by announcement type

---

### User API'leri

#### GET /api/user/profile
**Açıklama:** Kullanıcı profili getir
**Erişim:** Authenticated

---

#### PUT /api/user/profile
**Açıklama:** Profil güncelle
**Erişim:** Authenticated

---

#### POST /api/user/change-password
**Açıklama:** Şifre değiştir (login iken)
**Erişim:** Authenticated

---

## 🔐 Kimlik Doğrulama ve Yetkilendirme

### NextAuth.js Yapılandırması

**Provider:** Credentials (Email + Password)
**Session Strategy:** JWT
**JWT Secret:** Environment variable
**Password Hashing:** bcrypt (10 rounds)

### Roller ve Yetkiler

| Rol | Erişim Seviyesi | Yetkiler |
|-----|----------------|----------|
| **SUPER_ADMIN** | Full System Access | Tüm işlemler, kullanıcı yönetimi |
| **ADMIN** | Event Management | Etkinlik yönetimi, katılımcı yönetimi |
| **ORGANIZATOR** | Event Organization | Etkinlik düzenleme, başvuru yönetimi |
| **HAKEM** | Review Access | Bildiri değerlendirme |
| **KATILIMCI** | User Access | Başvuru yapma, profil yönetimi |

### Middleware Koruması

**Dosya:** `/middleware.ts`

**Public Paths:**
- `/`
- `/login`
- `/auth/register`
- `/events/*`
- `/hakkimizda`
- `/gizlilik-politikasi`

**Protected Paths:**
- `/dashboard/*` - Authenticated users
- `/admin/*` - ADMIN role only

**Kod Örneği:**
```typescript
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin kontrolü
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const publicPaths = ['/', '/login', '/auth/register', '/hakkimizda', '/gizlilik-politikasi'];

        if (publicPaths.includes(path) || path.startsWith('/events/')) {
          return true;
        }

        return !!token;
      },
    },
  }
);
```

---

## 📂 Dosya Yapısı

```
kongreai/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin paneli
│   │   ├── events/
│   │   │   └── [eventId]/
│   │   │       └── manage/       # Etkinlik yönetimi
│   │   └── login/
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin API'leri
│   │   │   ├── events/
│   │   │   │   └── [eventId]/
│   │   │   │       ├── documents/
│   │   │   │       ├── results/
│   │   │   │       ├── gallery/
│   │   │   │       ├── schedule/
│   │   │   │       └── timeline/
│   │   │   ├── change-password/
│   │   │   └── profile/
│   │   ├── auth/                 # Auth API'leri
│   │   │   ├── [...nextauth]/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── events/               # Public event API
│   │   │   └── [eventId]/
│   │   │       ├── announcements/
│   │   │       ├── documents/
│   │   │       ├── results/
│   │   │       ├── gallery/
│   │   │       ├── schedule/
│   │   │       └── timeline/
│   │   └── user/                 # User API'leri
│   │       ├── profile/
│   │       └── change-password/
│   ├── auth/                     # Auth pages
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── dashboard/                # User dashboard
│   ├── events/                   # Public event pages
│   │   └── [slug]/
│   ├── gizlilik-politikasi/      # Privacy policy
│   ├── hakkimizda/               # About page
│   ├── lib/                      # Shared utilities
│   │   ├── auth/
│   │   │   └── options.ts
│   │   └── prisma.ts
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React Components
│   ├── chatbot.tsx               # AI Chatbot
│   ├── site-header.tsx           # Header
│   ├── site-footer.tsx           # Footer
│   ├── mobile-nav.tsx            # Mobile navigation
│   ├── event-timeline.tsx        # Timeline component
│   ├── event-subsections-tabs.tsx
│   ├── event-announcements-banner.tsx
│   ├── toast-container.tsx
│   ├── confirm-dialog.tsx
│   └── providers.tsx             # NextAuth provider
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── dev.db                    # SQLite database (dev)
│   ├── seed-demo.ts              # Demo data seeder
│   ├── add_event_timeline.sql    # Migration SQL
│   └── migrations/               # Prisma migrations
├── scripts/                      # Helper scripts
│   ├── setup-demo.ts             # Demo data setup
│   ├── build-production.sh
│   └── setup-production-db.sh
├── public/                       # Static files
│   ├── manifest.json             # PWA manifest
│   └── ...
├── .env                          # Environment variables
├── .env.example                  # Example env file
├── middleware.ts                 # Next.js middleware
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── DEMO_DATA.md                  # Demo data docs
├── N8N_WEBHOOK_ARCHITECTURE.md   # Webhook docs
└── SYSTEM_DOCUMENTATION.md       # This file
```

---

## ✨ Özellikler ve Modüller

### 1. Kullanıcı Yönetimi
- ✅ Kayıt ve giriş sistemi
- ✅ Rol bazlı erişim kontrolü
- ✅ Profil yönetimi
- ✅ Şifre sıfırlama (n8n webhook)
- ✅ Email doğrulama

### 2. Etkinlik Yönetimi
- ✅ Etkinlik oluşturma ve düzenleme
- ✅ Çoklu etkinlik tipi (Kongre, Sempozyum, Panel, Çalıştay)
- ✅ Online/Hybrid etkinlik desteği
- ✅ Fiyatlandırma yönetimi (Standart, Erken kayıt, Öğrenci)
- ✅ Katılımcı limiti kontrolü
- ✅ Durum yönetimi (Taslak, Yayında, Tamamlandı, İptal)

### 3. Timeline Sistemi ⭐ YENİ
- ✅ Esnek tarih yönetimi
- ✅ Çoklu timeline tipi (Başvuru, Bildiri, Sonuç, Etkinlik, Duyuru)
- ✅ Özelleştirilebilir ikonlar
- ✅ Görsel timeline görüntüleme
- ✅ Geçmiş tarih işaretleme
- ✅ Admin panelinde tam CRUD

### 4. Döküman Yönetimi
- ✅ Döküman yükleme ve kategorilendirme
- ✅ Kategoriler: Genel, Program, Şablon, Abstract, Sertifika
- ✅ İndirme sayacı
- ✅ Dosya tipi kontrolü (PDF, DOCX, XLSX, PPTX)

### 5. Sonuç ve Raporlama
- ✅ Sonuç yayınlama sistemi
- ✅ Kabul listesi, Ödüller, İstatistikler
- ✅ HTML içerik desteği
- ✅ Dosya eklentisi

### 6. Galeri Sistemi
- ✅ Fotoğraf ve video desteği
- ✅ Kategoriler: Genel, Oturum, Gala, Poster, Sosyal
- ✅ Thumbnail desteği
- ✅ Grid görünüm

### 7. Program Yönetimi
- ✅ Günlük program oluşturma
- ✅ Oturum başkanı atama
- ✅ Konuşmacı bilgileri (JSON)
- ✅ Salon ve zaman yönetimi
- ✅ PDF export özelliği

### 8. Duyuru Sistemi
- ✅ Öncelikli duyurular
- ✅ Duyuru tipleri: Acil, Uyarı, Önemli, Bilgi
- ✅ Zamanlı yayın (başlangıç-bitiş)
- ✅ Kullanıcı bazlı kapatma (localStorage)
- ✅ Banner gösterimi

### 9. Başvuru Sistemi
- ✅ Online başvuru formu
- ✅ Bildiri gönderimi
- ✅ Çoklu yazar desteği
- ✅ Dosya ekleme
- ✅ Hakem değerlendirme sistemi
- ✅ Durum takibi

### 10. Ödeme Sistemi
- ✅ Çoklu ödeme yöntemi
- ✅ Ödeme takibi
- ✅ Fatura bilgileri
- ✅ Makbuz oluşturma

### 11. Chatbot
- ✅ AI destekli yardım asistanı
- ✅ Kullanıcı context'i
- ✅ Session bazlı sohbet
- ✅ Karakter limiti (1000)

### 12. PWA Desteği
- ✅ Offline çalışma
- ✅ Mobil kurulum
- ✅ Service worker
- ✅ Manifest.json

---

## 🔗 Webhook Entegrasyonu

### n8n Webhook Mimarisi

Detaylı webhook dokümantasyonu için: **[N8N_WEBHOOK_ARCHITECTURE.md](./N8N_WEBHOOK_ARCHITECTURE.md)**

**Base URL:** `https://n8n.fokusistatistik.com/webhook`

### Webhook Kategorileri

1. **Event Registration** - Etkinlik kayıt işlemleri
2. **Abstract Submission** - Bildiri gönderimi
3. **File Management** - Google Drive entegrasyonu
4. **Results Publication** - Sonuç yayınlama
5. **Email Communications** - Email gönderimi
6. **Notifications** - Bildirimler
7. **Payment Integration** - Ödeme işlemleri
8. **Analytics** - Analitik ve raporlama

### Örnek Webhook Çağrısı

```javascript
// Event Registration
const response = await fetch('https://n8n.fokusistatistik.com/webhook/event-registration', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.N8N_API_KEY
  },
  body: JSON.stringify({
    eventId: 'uuid',
    userId: 'uuid',
    user: {
      email: 'user@example.com',
      ad: 'Ahmet',
      soyad: 'Yılmaz'
    },
    applicationData: {
      registrationType: 'STANDARD',
      paymentAmount: 750
    },
    timestamp: new Date().toISOString()
  })
});

const result = await response.json();
```

---

## 🚀 Deployment

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kongreai"

# NextAuth
NEXTAUTH_URL="https://kongreai.com"
NEXTAUTH_SECRET="your-secret-key-here"

# n8n Webhook
N8N_WEBHOOK_URL="https://n8n.fokusistatistik.com/webhook"
N8N_API_KEY="your-n8n-api-key"

# Optional
NODE_ENV="production"
```

### Build ve Deploy Adımları

#### 1. Development
```bash
npm install
npm run dev
```

#### 2. Production Build
```bash
# Database migration
npm run db:migrate:deploy

# Build
npm run build

# Start
npm run start
```

#### 3. Docker Deployment (Opsiyonel)
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Database Migration

```bash
# Development
npm run db:push

# Production
npm run db:migrate:deploy

# Create migration
npm run db:migrate
```

### Demo Data Setup

```bash
# Run demo data seeder
npx tsx scripts/setup-demo.ts
```

---

## 👨‍💻 Geliştirici Kılavuzu

### Proje Kurulumu

```bash
# 1. Clone repository
git clone https://github.com/fokusistatistik/kongreai.git
cd kongreai

# 2. Install dependencies
npm install

# 3. Setup database
cp .env.example .env
# Edit .env file with your database URL

# 4. Run migrations
npm run db:push

# 5. (Optional) Seed demo data
npx tsx scripts/setup-demo.ts

# 6. Start development server
npm run dev
```

### Kodlama Standartları

#### TypeScript
- Strict mode enabled
- Type safety zorunlu
- Interface over type (tercih edilen)

#### Components
- Server Components varsayılan
- 'use client' sadece gerektiğinde
- Props interface tanımla

#### API Routes
- Error handling zorunlu
- Validation (Zod)
- Consistent response format

#### Styling
- Tailwind CSS classes
- Responsive design (mobile-first)
- Dark mode hazır (optional)

### Git Workflow

```bash
# Feature branch
git checkout -b feature/timeline-system

# Commit
git add .
git commit -m "feat: Add event timeline system"

# Push
git push origin feature/timeline-system

# Pull request
# Create PR on GitHub
```

### Testing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build test
npm run build
```

---

## 📊 Veritabanı ER Diyagramı

```mermaid
erDiagram
    USER ||--o{ APPLICATION : creates
    USER ||--o{ REVIEW : writes
    USER ||--o{ ACCOMMODATION : books
    USER ||--o{ PASSWORD_RESET_TOKEN : has

    EVENT ||--o{ APPLICATION : accepts
    EVENT ||--o{ ANNOUNCEMENT : contains
    EVENT ||--o{ CONGRESS_DOCUMENT : has
    EVENT ||--o{ CONGRESS_RESULT : publishes
    EVENT ||--o{ CONGRESS_GALLERY : shows
    EVENT ||--o{ CONGRESS_SCHEDULE : schedules
    EVENT ||--o{ EVENT_TIMELINE : tracks
    EVENT ||--o{ ACCOMMODATION : offers

    APPLICATION ||--|| PAYMENT : requires
    APPLICATION ||--o{ REVIEW : receives

    USER {
        string id PK
        string email UK
        string password
        string ad
        string soyad
        string role
    }

    EVENT {
        string id PK
        string slug UK
        string baslik
        datetime baslangic_tarihi
        datetime bitis_tarihi
        string durum
    }

    EVENT_TIMELINE {
        string id PK
        string event_id FK
        string baslik
        string tarih
        string tip
    }

    APPLICATION {
        string id PK
        string event_id FK
        string user_id FK
        string durum
    }
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Prisma Generate Error
```bash
# Solution
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

#### 2. Database Connection
```bash
# Check DATABASE_URL in .env
# For SQLite
DATABASE_URL="file:./dev.db"

# For PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

#### 3. NextAuth Session Issues
```bash
# Clear cookies
# Check NEXTAUTH_SECRET in .env
# Restart development server
```

---

## 📝 Changelog

### Version 1.0.0 (2025-12-27)

**✨ New Features:**
- Event Timeline System with flexible date management
- Chatbot with circular border styling
- Public access for privacy and about pages
- Comprehensive webhook architecture documentation
- Demo data setup scripts

**🔧 Improvements:**
- Updated all 2024 references to 2025
- Fixed navbar/footer visibility on login/register pages
- Enhanced admin panel with timeline management tab

**📚 Documentation:**
- Added SYSTEM_DOCUMENTATION.md
- Added N8N_WEBHOOK_ARCHITECTURE.md
- Added DEMO_DATA.md
- Updated README.md

---

## 📧 İletişim ve Destek

**Proje Sahibi:** FOKUS İstatistik
**Email:** support@fokusistatistik.com
**Website:** https://fokusistatistik.com
**n8n Webhook URL:** https://n8n.fokusistatistik.com

---

## 📄 Lisans

Bu proje özel lisans altındadır. FOKUS İstatistik'in izni olmadan kopyalama, dağıtma veya değiştirme yasaktır.

**Copyright © 2025 FOKUS İstatistik. Tüm hakları saklıdır.**

---

**Son Güncelleme:** 2025-12-27
**Döküman Versiyonu:** 1.0.0
**Sistem Versiyonu:** 1.0.0
