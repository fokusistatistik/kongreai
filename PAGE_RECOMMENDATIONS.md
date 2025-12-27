# Kongre Yönetim Sistemi - Sayfa Önerileri ve Geliştirme Planı

## Mevcut Durum

### ✅ Tamamlanmış Sayfalar
- Ana Sayfa (/)
- Hakkımızda (/hakkimizda)
- Gizlilik Politikası (/gizlilik-politikasi)
- Kullanıcı Girişi (/login)
- Kullanıcı Kaydı (/auth/register)
- Admin Girişi (/admin/login)
- Kullanıcı Dashboard (/dashboard)
- Kullanıcı Profili (/dashboard/profile)
- Başvurularım (/dashboard/applications)
- Admin Dashboard (/admin)
- Admin Profili (/admin/profile)
- 404 Sayfası (/not-found)

---

## 🎯 Öncelikli Sayfalar (Temel Fonksiyonellik)

### 1. Etkinlik Detay Sayfası
**URL**: `/events/[slug]`
**Öncelik**: ⭐⭐⭐⭐⭐ Kritik

**Özellikler:**
- Etkinlik başlığı ve açıklama
- Tarih, konum, süre bilgileri
- Katılım ücreti (multi-currency)
- Başvuru formu (SOZLU_BILDIRI, POSTER, KATILIMCI)
- Konaklama seçenekleri
- Program ve takvim
- Organizatör bilgileri
- İlgili duyurular
- Başvuru son tarihi countdown
- Sosyal medya paylaşım butonları

**Kullanıcı Deneyimi:**
```
[Hero Image/Banner]
------------------------
Etkinlik Başlığı
Tarih | Konum | Süre
------------------------
[Tabs]
- Genel Bilgi
- Program
- Konaklama
- Başvuru Yap
- Duyurular
------------------------
```

---

### 2. Etkinlik Başvuru Sayfası
**URL**: `/events/[slug]/apply`
**Öncelik**: ⭐⭐⭐⭐⭐ Kritik

**Özellikler:**
- Multi-step form (3-4 adım)
- Başvuru tipi seçimi
- Bildiri/poster bilgileri
- Dosya yükleme (PDF, DOC)
- Konaklama seçimi (opsiyonel)
- Ödeme bilgileri
- Iyzico payment gateway entegrasyonu
- Form validasyonu
- İlerleme göstergesi
- Özet ve onay ekranı

**Form Adımları:**
```
Adım 1: Başvuru Tipi
   - Sözlü Bildiri
   - Poster
   - Sadece Katılımcı

Adım 2: Bildiri Bilgileri
   - Başlık
   - Özet
   - Anahtar Kelimeler
   - Dosya Yükleme

Adım 3: Konaklama (Opsiyonel)
   - Otel seçimi
   - Oda tipi
   - Tarih seçimi

Adım 4: Ödeme
   - Ödeme yöntemi (Iyzico, Havale)
   - Fatura bilgileri
   - Ödeme onayı
```

---

### 3. Başvuru Detay Sayfası
**URL**: `/dashboard/applications/[id]`
**Öncelik**: ⭐⭐⭐⭐⭐ Kritik

**Özellikler:**
- Başvuru durumu (timeline view)
- Bildiri bilgileri ve dosyası
- Hakem notları ve değerlendirmesi
- Ödeme bilgisi ve fatura
- Konaklama rezervasyon detayı
- Revizyon talebi durumunda yeniden yükleme
- İletişim geçmişi
- İptal/geri çekme seçeneği

---

### 4. Admin Etkinlik Yönetimi
**URL**: `/admin/events`
**Öncelik**: ⭐⭐⭐⭐⭐ Kritik

**Özellikler:**
- Tüm etkinlikler listesi (tablo view)
- Durum filtreleme (Taslak, Yayında, Tamamlandı)
- Arama ve sıralama
- Yeni etkinlik oluştur butonu
- Hızlı düzenleme/silme
- Toplu işlemler
- Export (CSV, PDF)

**URL**: `/admin/events/new` ve `/admin/events/[id]/edit`
**Özellikler:**
- Etkinlik bilgileri formu
- Tarih ve konum ayarları
- Başvuru ayarları
- Ücretlendirme (multi-currency)
- Konaklama seçenekleri ekleme
- Program/takvim oluşturma
- Görsel/banner yükleme
- Taslak kaydetme
- Önizleme

---

### 5. Admin Başvuru Yönetimi
**URL**: `/admin/applications`
**Öncelik**: ⭐⭐⭐⭐⭐ Kritik

**Özellikler:**
- Tüm başvurular listesi
- Durum filtreleme
- Etkinlik bazlı gruplandırma
- Hakem atama toplu işlem
- Excel export
- Durum güncelleme (toplu)

**URL**: `/admin/applications/[id]`
**Özellikler:**
- Başvuru detayları
- Dosya görüntüleme/indirme
- Hakem atama dropdown
- Durum değiştirme
- Not ekleme
- Geçmiş aktiviteler
- Email gönderme

---

## 📊 İkinci Öncelikli Sayfalar (Gelişmiş Özellikler)

### 6. Admin Kullanıcı Yönetimi
**URL**: `/admin/users`
**Öncelik**: ⭐⭐⭐⭐

**Özellikler:**
- Tüm kullanıcılar listesi
- Rol bazlı filtreleme
- Arama (ad, email, kurum)
- Kullanıcı oluşturma
- Rol atama/değiştirme
- Hesap aktivasyon/deaktivasyon
- Kullanıcı istatistikleri

**URL**: `/admin/users/[id]`
**Özellikler:**
- Kullanıcı profil bilgileri
- Başvuru geçmişi
- Ödeme geçmişi
- Aktivite logu
- Düzenleme yetkileri

---

### 7. Admin Ödeme Yönetimi
**URL**: `/admin/payments`
**Öncelik**: ⭐⭐⭐⭐

**Özellikler:**
- Ödeme listesi (tablo)
- Durum filtreleme
- Tarih aralığı seçimi
- Tutar bazlı sıralama
- Manuel onaylama
- İade işlemi
- Fatura oluşturma
- Ödeme raporları
- Export (Excel, PDF)

---

### 8. Admin Hakem Sistemi
**URL**: `/admin/reviewers`
**Öncelik**: ⭐⭐⭐⭐

**Özellikler:**
- Hakem listesi
- Uzmanl ık alanı tagging
- Başvuru atama sistemi
- İş yükü göstergesi
- Performans istatistikleri

**URL**: `/admin/reviewers/assign`
**Özellikler:**
- Başvuru seçimi
- Otomatik hakem önerisi (uzmanlık bazlı)
- Manuel hakem seçimi
- Toplu atama
- Bildirim gönderme

---

### 9. Admin Duyuru Yönetimi
**URL**: `/admin/announcements`
**Öncelik**: ⭐⭐⭐⭐

**Özellikler:**
- Duyuru listesi
- Tip filtreleme (Bilgi, Uyarı, Önemli, Acil)
- Yayın durumu toggle
- Öncelik sıralaması

**URL**: `/admin/announcements/new`
**Özellikler:**
- WYSIWYG editor (Tiptap veya Quill)
- Etkinlik seçimi (veya genel)
- Tip seçimi
- Öncelik ayarı
- Yayın tarihi planlama
- Önizleme
- Taslak kaydetme

---

### 10. Hakem Değerlendirme Sayfası
**URL**: `/reviewer/applications`
**Öncelik**: ⭐⭐⭐⭐

**Özellikler:**
- Atanan başvurular listesi
- Durum bazlı tab'ler (Bekleyen, Değerlendirilen)
- Dosya görüntüleme
- Değerlendirme formu
- Not ekleme
- Karar verme (Kabul, Red, Revizyon)
- Geri bildirim gönderme

---

## 🎨 Kullanıcı Deneyimi Sayfaları

### 11. SSS (Sık Sorulan Sorular)
**URL**: `/sss` veya `/faq`
**Öncelik**: ⭐⭐⭐

**Özellikler:**
- Kategori bazlı gruplandırma
- Arama fonksiyonu
- Accordion/collapse UI
- "Cevabınızı bulamadınız mı?" call-to-action

**Kategoriler:**
- Kayıt ve Üyelik
- Başvuru Süreci
- Ödeme ve Faturalama
- Konaklama
- Teknik Sorunlar

---

### 12. İletişim Sayfası
**URL**: `/iletisim`
**Öncelik**: ⭐⭐⭐

**Özellikler:**
- İletişim formu
- Email, telefon, adres bilgileri
- Harita entegrasyonu (Google Maps)
- Sosyal medya linkleri
- Çalışma saatleri
- Departman bazlı iletişim

---

### 13. Kullanıcı Bildirimleri
**URL**: `/dashboard/notifications`
**Öncelik**: ⭐⭐⭐

**Özellikler:**
- Bildirim listesi (chronological)
- Okundu/okunmadı işaretleme
- Tip bazlı filtreleme
- Bildirim ayarları
- Toplu silme/işaretleme
- Real-time updates (WebSocket)

---

### 14. Sertifikalar ve Belgeler
**URL**: `/dashboard/certificates`
**Öncelik**: ⭐⭐⭐

**Özellikler:**
- Katılım sertifikası indirme
- Kabul edilen bildirilerin sertifikaları
- PDF formatında
- QR kod doğrulama
- Arşiv

---

## 📈 Analiz ve Raporlama

### 15. Admin Raporlama
**URL**: `/admin/reports`
**Öncelik**: ⭐⭐⭐

**Özellikler:**
- Dashboard charts (Recharts veya Chart.js)
- Etkinlik bazlı istatistikler
- Başvuru trendleri
- Gelir raporları
- Kullanıcı büyümesi
- Export (PDF, Excel)

**Rapor Tipleri:**
- Etkinlik Raporu
- Başvuru Analizi
- Gelir/Gider
- Kullanıcı Analizi
- Hakem Performansı

---

## 🔧 Teknik ve Yönetim Sayfaları

### 16. Admin Sistem Ayarları
**URL**: `/admin/settings`
**Öncelik**: ⭐⭐⭐

**Özellikler:**
- Genel site ayarları
- Email şablonları
- Payment gateway konfigürasyonu
- Dosya upload limitleri
- Dil ve para birimi ayarları
- Güvenlik ayarları

**Tabs:**
- Genel
- Email
- Ödeme
- Güvenlik
- Entegrasyonlar

---

### 17. Email Şablonları
**URL**: `/admin/email-templates`
**Öncelik**: ⭐⭐

**Özellikler:**
- Email şablon listesi
- WYSIWYG editor
- Değişken placeholder'ları ({name}, {event_name}, vb.)
- Önizleme
- Test email gönderme

**Şablon Tipleri:**
- Hoş geldiniz emaili
- Başvuru onayı
- Ödeme alındı
- Hakem ataması
- Başvuru kabul/red
- Etkinlik hatırlatması

---

## 🌐 Ekstra Özellikler ve Sayfalar

### 18. Etkinlik Takvimi
**URL**: `/calendar`
**Öncelik**: ⭐⭐

**Özellikler:**
- Takvim görünümü (aylık/haftalık)
- Tüm etkinlikleri takvimde gösterme
- Filtreleme (tip, konum)
- ICS export (Google Calendar, Outlook)
- Hatırlatma ayarlama

---

### 19. Geçmiş Etkinlikler Arşivi
**URL**: `/etkinlikler/arsiv`
**Öncelik**: ⭐⭐

**Özellikler:**
- Tamamlanmış etkinlikler
- Yıl bazlı filtreleme
- Fotoğraf galerileri
- Bildiri kitapçıkları (PDF)
- İstatistikler (katılımcı sayısı, vb.)

---

### 20. Blog/Haberler
**URL**: `/blog` veya `/haberler`
**Öncelik**: ⭐⭐

**Özellikler:**
- Makale listesi
- Kategori filtreleme
- Arama
- Yorum sistemi (opsiyonel)
- RSS feed
- Admin panel blog yönetimi

---

### 21. Sponsorlar ve Ortaklar
**URL**: `/sponsorlar`
**Öncelik**: ⭐⭐

**Özellikler:**
- Sponsor logoları
- Seviye bazlı gruplandırma (Platinum, Gold, Silver)
- Sponsor detay sayfaları
- Admin panel sponsor yönetimi

---

### 22. Galeri
**URL**: `/galeri`
**Öncelik**: ⭐⭐

**Özellikler:**
- Etkinlik fotoğrafları
- Lightbox görünüm
- Etkinlik bazlı albümler
- Admin panel galeri yönetimi
- Toplu yükleme

---

### 23. Kayıt Formu Şablonları
**URL**: `/admin/form-templates`
**Öncelik**: ⭐⭐

**Özellikler:**
- Özel soru ekleme
- Form builder (drag-drop)
- Conditional logic
- Etkinlik başına özelleştirme
- Export responses

---

### 24. Ödül ve Başarılar
**URL**: `/oduller`
**Öncelik**: ⭐

**Özellikler:**
- En iyi bildiri ödülleri
- Genç araştırmacı ödülleri
- Ödül kazananlar listesi
- Yıl bazlı arşiv

---

### 25. Kariyer Fırsatları
**URL**: `/kariyer`
**Öncelik**: ⭐

**Özellikler:**
- Açık pozisyonlar
- Başvuru formu
- Şirket kültürü
- Admin panel ilan yönetimi

---

## 🚀 Gelişmiş Teknolojik Özellikler

### 26. Canlı Yayın/Hybrid Etkinlik
**URL**: `/events/[slug]/live`
**Öncelik**: ⭐

**Özellikler:**
- Video streaming (YouTube, Zoom entegrasyonu)
- Canlı chat
- Q&A sistemi
- Poll/Anket
- Kayıt erişimi

---

### 27. Networking Platform
**URL**: `/network`
**Öncelik**: ⭐

**Özellikler:**
- Katılımcı listesi
- Profil sayfaları
- Mesajlaşma sistemi
- İlgi alanı eşleştirme
- Toplantı planlama

---

### 28. Mobil Uygulama Dashboard
**URL**: `/mobile-app`
**Öncelik**: ⭐

**Özellikler:**
- QR kod check-in
- Push notification yönetimi
- App analytics
- Versiyon kontrolü

---

## 📝 Öneri Özeti ve Önceliklendirme

### Hemen Yapılmalı (Sprint 1)
1. Etkinlik Detay Sayfası
2. Başvuru Sayfası (Multi-step Form)
3. Başvuru Detay Sayfası
4. Admin Etkinlik Yönetimi (CRUD)
5. Admin Başvuru Yönetimi

### Kısa Vadeli (Sprint 2)
6. Admin Kullanıcı Yönetimi
7. Admin Ödeme Yönetimi
8. Hakem Değerlendirme Sistemi
9. Admin Duyuru Yönetimi
10. Bildirimler Sayfası

### Orta Vadeli (Sprint 3)
11. SSS Sayfası
12. İletişim Sayfası
13. Raporlama ve Analiz
14. Email Şablonları
15. Sertifika Sistemi

### Uzun Vadeli
16. Blog/Haberler
17. Etkinlik Takvimi
18. Galeri
19. Sponsorlar
20. Networking Platform

---

## 🎯 Kullanıcı Hikayeleri (User Stories)

### Katılımcı (KATILIMCI)
- **AS** bir katılımcı, **I WANT TO** etkinliklere başvuru yapabilmek, **SO THAT** bilimsel çalışmamı paylaşabileyim.
- **AS** bir katılımcı, **I WANT TO** başvuru durumumu takip edebilmek, **SO THAT** sürecin neresinde olduğumu bileyim.
- **AS** bir katılımcı, **I WANT TO** konaklama rezervasyonu yapabilmek, **SO THAT** etkinlik için konaklamayı halledeyim.

### Hakem (HAKEM)
- **AS** bir hakem, **I WANT TO** atanan başvuruları değerlendirebilmek, **SO THAT** bilimsel katkı sağlayabileyim.
- **AS** bir hakem, **I WANT TO** başvuru dosyalarını kolayca inceleyebilmek, **SO THAT** hızlı değerlendirme yapabileyim.

### Admin (ADMIN, SUPER_ADMIN)
- **AS** bir admin, **I WANT TO** etkinlik oluşturabilmek, **SO THAT** yeni kongreler organize edeyim.
- **AS** bir admin, **I WANT TO** ödemeleri yönetebilmek, **SO THAT** gelir takibi yapabileyim.
- **AS** bir admin, **I WANT TO** raporlar oluşturabilmek, **SO THAT** veri bazlı kararlar alabilirim.

---

## 💡 UX/UI Geliştirme Önerileri

### Loading States
- Skeleton loaders kullanımı
- Progress indicator'lar
- Optimistic updates

### Error Handling
- User-friendly hata mesajları
- Retry mekanizması
- Fallback UI'lar

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader desteği
- Color contrast standartları

### Mobile Responsiveness
- Touch-friendly butonlar
- Responsive tables
- Mobile-first approach
- PWA özellikleri

### Performance
- Image optimization (Next.js Image)
- Code splitting
- Lazy loading
- Caching strategies

---

*Bu dokümantasyon, sistemin geliştirilmesi için yol haritası niteliğindedir. Öncelikler ve özellikler, kullanıcı geri bildirimlerine göre güncellenebilir.*

*Son Güncelleme: 2025-12-27*
