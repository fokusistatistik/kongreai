# n8n Webhook TEST Endpoints

**BASE URL**: `https://n8n.fokusistatistik.com`

Tüm webhook'lar `/webhook-test/` prefix'i ile TEST modundadır.

---

## 📧 Email & Authentication (3)

1. **Email Doğrulama**
   `https://n8n.fokusistatistik.com/webhook-test/email-verification`

2. **Şifre Sıfırlama**
   `https://n8n.fokusistatistik.com/webhook-test/password-reset`

3. **Genel Email Gönderimi**
   `https://n8n.fokusistatistik.com/webhook-test/send-email`

---

## 🎉 Event Operations (4)

4. **Etkinlik Oluşturma**
   `https://n8n.fokusistatistik.com/webhook-test/event-create`
   - **Tarih Yapısı (YENİ)**: erken_basvuru_son_tarihi, son_basvuru_tarihi, sonuc_aciklama_tarihi, kongre_baslangic_tarihi, kongre_bitis_tarihi
   - **Format**: Sadece tarih (YYYY-MM-DD), sistem tarafında 23:59:59 olarak kaydedilir
   - **URL Slug**: Otomatik oluşturulur (Türkçe karakter desteği)

5. **Etkinlik Güncelleme**
   `https://n8n.fokusistatistik.com/webhook-test/event-update`
   - **operationType**: 'update' (değişen alanlar gönderilir)
   - **Tarih Alanları**: Yeni tarih yapısı ile uyumlu
   - **Backward Compatibility**: Eski tarih alanları da desteklenir

6. **Etkinlik Detay Getir**
   `https://n8n.fokusistatistik.com/webhook-test/event-get`

7. **Etkinlik Listele**
   `https://n8n.fokusistatistik.com/webhook-test/event-list`

---

## 📄 Event Sub-Sections Management (10) ⭐ YENİ

8. **Döküman Yükleme**
   `https://n8n.fokusistatistik.com/webhook-test/document-upload`
   - **Dosya Tipleri**: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
   - **Max Boyut**: 9MB
   - **Max Döküman**: 8 adet (sabit slot ID: 1-8)
   - **Request**: eventId, documentSlot (1-8), fileName, fileSize, fileType, fileMimeType, fileUrl, aciklama
   - **UI Entegrasyonu**: Event create/edit sayfalarında aktif

9. **Döküman Listele**
   `https://n8n.fokusistatistik.com/webhook-test/document-list`

10. **Döküman Sil**
    `https://n8n.fokusistatistik.com/webhook-test/document-delete`
    - Slot ID değişmez, sadece döküman silinir

11. **Döküman Detay Getir**
    `https://n8n.fokusistatistik.com/webhook-test/document-get`

12. **Program Oluştur**
    `https://n8n.fokusistatistik.com/webhook-test/program-create`
    - **Request**: eventId, baslik, items[] (tarih, baslangicSaati, bitisSaati, baslik, aciklama, konum, konusmacilar)
    - **Sıralama**: Başlangıç saatine göre otomatik kronolojik

13. **Program Güncelle**
    `https://n8n.fokusistatistik.com/webhook-test/program-update`

14. **Program Listele**
    `https://n8n.fokusistatistik.com/webhook-test/program-list`
    - **Response**: Başlangıç saatine göre sıralı

15. **Program Sil**
    `https://n8n.fokusistatistik.com/webhook-test/program-delete`

16. **Duyuru Oluştur** 🔄 ENTEGRASYONlu
    `https://n8n.fokusistatistik.com/webhook-test/announcement-create`
    - **Kullanım**: Etkinlik Kaynakları + Kongre Alt Bölümler Yönetimi (birleşik)
    - **Request**: eventId, baslik, icerik, tip (DUYURU/UYARI/BILGILENDIRME), oncelik (1-5)

17. **Duyuru Güncelle**
    `https://n8n.fokusistatistik.com/webhook-test/announcement-update`

18. **Duyuru Listele**
    `https://n8n.fokusistatistik.com/webhook-test/announcement-list`

19. **Duyuru Sil**
    `https://n8n.fokusistatistik.com/webhook-test/announcement-delete`

---

## 👥 Welcome Emails (2)

23. **Hakem Hoşgeldin Email**
    `https://n8n.fokusistatistik.com/webhook-test/reviewer-welcome`

24. **Kullanıcı Hoşgeldin Email**
    `https://n8n.fokusistatistik.com/webhook-test/user-welcome`

---

## 📝 Application Operations (4)

25. **Başvuru Gönder**
    `https://n8n.fokusistatistik.com/webhook-test/application-submit`

26. **Başvuru Güncelle**
    `https://n8n.fokusistatistik.com/webhook-test/application-update`

27. **Başvuru Listele** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/application-list`
    - Filtreler: `eventId`, `userId`, `status`, `limit`, `offset`
    - User & Admin ekranları için

28. **Başvuru Detay Getir** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/application-get`
    - Tek başvuru detayı için

---

## 💳 Payment Operations (4)

29. **Ödeme İşle**
    `https://n8n.fokusistatistik.com/webhook-test/payment-process`

30. **Ödeme Doğrula**
    `https://n8n.fokusistatistik.com/webhook-test/payment-verify`

31. **Ödeme Listele** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/payment-list`
    - Filtreler: `eventId`, `userId`, `status`, `odeme_tipi`, `limit`, `offset`
    - User & Admin ekranları için

32. **Ödeme Detay Getir** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/payment-get`
    - Tek ödeme detayı için

---

## ⭐ Review Operations (3)

33. **Değerlendirme Gönder**
    `https://n8n.fokusistatistik.com/webhook-test/review-submit`

34. **Değerlendirme Listele** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/review-list`
    - Filtreler: `eventId`, `reviewerId`, `applicationId`, `karar`, `limit`, `offset`
    - Hakem & Admin ekranları için

35. **Değerlendirme Detay Getir** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/review-get`
    - Tek değerlendirme detayı için

---

## 📬 Result Notifications (3)

36. **Genel Sonuç Bildirimi**
    `https://n8n.fokusistatistik.com/webhook-test/result-notify`

37. **Kabul Bildirimi**
    `https://n8n.fokusistatistik.com/webhook-test/acceptance-notify`

38. **Red Bildirimi**
    `https://n8n.fokusistatistik.com/webhook-test/rejection-notify`

---

## 📊 Reports & Analytics (5) ⭐ YENİ

24. **Dashboard İstatistikleri** ✅ AKTİF
    `https://n8n.fokusistatistik.com/webhook-test/dashboard-stats`
    - **Kullanım**: User/Admin/Hakem dashboard sayfaları (admin paneli entegre edildi)
    - **Request**: `{ metadata, requestedBy: { userId, userEmail, userName, userRole }, filters }`
    - **Response**: totalEvents, activeEvents, totalApplications, pendingApplications, totalPayments, pendingPayments, totalUsers
    - **Graceful Degradation**: Webhook başarısız olursa Prisma fallback kullanılır

39. **Etkinlik Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/event-report`
    - **Kullanım**: Admin etkinlik detay raporları
    - **Request**: `{ eventId }`
    - **Response**: Başvuru tipleri, durumlar, ödemeler, ortalama puanlar

40. **Başvuru Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/application-report`
    - **Kullanım**: Admin başvuru raporları (filtrelenmiş)
    - **Request**: `{ eventId?, userId?, startDate?, endDate? }`
    - **Response**: Detaylı başvuru listesi

41. **Ödeme Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/payment-report`
    - **Kullanım**: Admin ödeme raporları (filtrelenmiş)
    - **Request**: `{ eventId?, userId?, startDate?, endDate?, odeme_tipi? }`
    - **Response**: Detaylı ödeme listesi

42. **Hakem Performans Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/reviewer-report`
    - **Kullanım**: Admin hakem performans değerlendirmesi
    - **Request**: `{ eventId?, reviewerId? }`
    - **Response**: Hakem başına değerlendirme sayıları, ortalama puan, kabul/red oranları

---

## 👤 User & Reviewer Lists (2) ⭐ YENİ

43. **Kullanıcı Listele**
    `https://n8n.fokusistatistik.com/webhook-test/user-list`
    - **Kullanım**: Admin kullanıcı yönetimi ekranı
    - **Request**: `{ role?, limit?, offset? }`
    - **Response**: Kullanıcı listesi (email, name, role, email_verified)

44. **Hakem Listele**
    `https://n8n.fokusistatistik.com/webhook-test/reviewer-list`
    - **Kullanım**: Admin hakem yönetimi ekranı
    - **Request**: `{ eventId?, limit?, offset? }`
    - **Response**: Hakem listesi (uzmanlık alanı, değerlendirme istatistikleri)

---

## 📈 Toplam Özet

- **Toplam Endpoint**: 44
- **Yeni Eklenenler (Bu Güncelleme)**: 13 Event Sub-Sections Management
  - 4 Document Management (upload, list, delete, get)
  - 4 Program Management (create, update, list, delete)
  - 4 Announcement Management (create, update, list, delete)
  - 3 Gallery Management (upload, list, delete)
- **Önceki Eklenenler**: 12
  - 2 Application (list, get)
  - 2 Payment (list, get)
  - 2 Review (list, get)
  - 5 Reports (dashboard, event, application, payment, reviewer)
  - 2 Lists (users, reviewers)

---

## 🔑 Kullanım Alanları

### **User Dashboard** (Kullanıcı Ekranları)
- `/webhook-test/dashboard-stats` - İstatistikler
- `/webhook-test/application-list?userId=xxx` - Başvurularım
- `/webhook-test/payment-list?userId=xxx` - Ödemelerim
- `/webhook-test/event-list?durum=YAYINDA` - Aktif etkinlikler

### **Hakem Dashboard** (Hakem Ekranları)
- `/webhook-test/dashboard-stats` - İstatistikler
- `/webhook-test/review-list?reviewerId=xxx` - Atanan değerlendirmeler
- `/webhook-test/application-list?eventId=xxx` - Etkinlik başvuruları

### **Admin Dashboard** (Admin Ekranları)
- `/webhook-test/dashboard-stats` - Genel istatistikler
- `/webhook-test/event-report?eventId=xxx` - Etkinlik raporları
- `/webhook-test/application-report` - Başvuru raporları
- `/webhook-test/payment-report` - Ödeme raporları
- `/webhook-test/reviewer-report` - Hakem performans raporları
- `/webhook-test/user-list` - Kullanıcı yönetimi
- `/webhook-test/reviewer-list` - Hakem yönetimi

---

## 🎯 Tamamlanan İşlemler

1. ✅ Tüm webhook path'ler `/webhook-test/` olarak güncellendi
2. ✅ Listeleme ve raporlama webhook'ları eklendi
3. ✅ Event sub-sections management webhook'ları eklendi (13 endpoint)
4. ✅ Event create/edit UI güncellemeleri:
   - 4 adımlı wizard (Temel Bilgiler, Tarihler, Ücretler, Dökümanlar)
   - Yeni tarih yapısı (date-only inputs, 23:59:59 otomatik)
   - URL slug otomatik oluşturma
   - Döküman yükleme (9MB max, tip validasyonu)
5. ✅ Admin dashboard n8n entegrasyonu:
   - Dashboard stats webhook ile entegre edildi
   - Graceful degradation (Prisma fallback)
6. ✅ Standardize webhook structure (metadata, requestedBy, event context)

## 🎯 Sonraki Adımlar

1. ⏳ Event sub-sections management sayfaları (Dökümanlar, Program, Duyurular, Galeri)
2. ⏳ User/Admin başvuru listeleme ekranları webhook entegrasyonu
3. ⏳ Ödeme listeleme ekranları webhook entegrasyonu
4. ⏳ Hakem değerlendirme ekranları webhook entegrasyonu
5. ⏳ Raporlama dashboard'ları (etkinlik, başvuru, ödeme, hakem raporları)

---

## 📝 Notlar

- Tüm webhook'lar **10 saniye timeout** ile çalışır
- **Graceful degradation**: Webhook başarısız olsa bile sistem çalışmaya devam eder
- Tüm veriler önce **local database**'e yazılır, sonra webhook'a gönderilir
- `operationType` parametresi ile create/update/process işlemleri ayırt edilir
