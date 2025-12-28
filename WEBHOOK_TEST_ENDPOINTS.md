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

5. **Etkinlik Güncelleme**
   `https://n8n.fokusistatistik.com/webhook-test/event-update`

6. **Etkinlik Detay Getir**
   `https://n8n.fokusistatistik.com/webhook-test/event-get`

7. **Etkinlik Listele**
   `https://n8n.fokusistatistik.com/webhook-test/event-list`

---

## 👥 Welcome Emails (2)

8. **Hakem Hoşgeldin Email**
   `https://n8n.fokusistatistik.com/webhook-test/reviewer-welcome`

9. **Kullanıcı Hoşgeldin Email**
   `https://n8n.fokusistatistik.com/webhook-test/user-welcome`

---

## 📝 Application Operations (4)

10. **Başvuru Gönder**
    `https://n8n.fokusistatistik.com/webhook-test/application-submit`

11. **Başvuru Güncelle**
    `https://n8n.fokusistatistik.com/webhook-test/application-update`

12. **Başvuru Listele** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/application-list`
    - Filtreler: `eventId`, `userId`, `status`, `limit`, `offset`
    - User & Admin ekranları için

13. **Başvuru Detay Getir** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/application-get`
    - Tek başvuru detayı için

---

## 💳 Payment Operations (4)

14. **Ödeme İşle**
    `https://n8n.fokusistatistik.com/webhook-test/payment-process`

15. **Ödeme Doğrula**
    `https://n8n.fokusistatistik.com/webhook-test/payment-verify`

16. **Ödeme Listele** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/payment-list`
    - Filtreler: `eventId`, `userId`, `status`, `odeme_tipi`, `limit`, `offset`
    - User & Admin ekranları için

17. **Ödeme Detay Getir** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/payment-get`
    - Tek ödeme detayı için

---

## ⭐ Review Operations (3)

18. **Değerlendirme Gönder**
    `https://n8n.fokusistatistik.com/webhook-test/review-submit`

19. **Değerlendirme Listele** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/review-list`
    - Filtreler: `eventId`, `reviewerId`, `applicationId`, `karar`, `limit`, `offset`
    - Hakem & Admin ekranları için

20. **Değerlendirme Detay Getir** ⭐ YENİ
    `https://n8n.fokusistatistik.com/webhook-test/review-get`
    - Tek değerlendirme detayı için

---

## 📬 Result Notifications (3)

21. **Genel Sonuç Bildirimi**
    `https://n8n.fokusistatistik.com/webhook-test/result-notify`

22. **Kabul Bildirimi**
    `https://n8n.fokusistatistik.com/webhook-test/acceptance-notify`

23. **Red Bildirimi**
    `https://n8n.fokusistatistik.com/webhook-test/rejection-notify`

---

## 📊 Reports & Analytics (5) ⭐ YENİ

24. **Dashboard İstatistikleri**
    `https://n8n.fokusistatistik.com/webhook-test/dashboard-stats`
    - **Kullanım**: User/Admin/Hakem dashboard sayfaları
    - **Request**: `{ userId, role }`
    - **Response**: Toplam/bekleyen başvuru, ödeme, değerlendirme sayıları

25. **Etkinlik Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/event-report`
    - **Kullanım**: Admin etkinlik detay raporları
    - **Request**: `{ eventId }`
    - **Response**: Başvuru tipleri, durumlar, ödemeler, ortalama puanlar

26. **Başvuru Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/application-report`
    - **Kullanım**: Admin başvuru raporları (filtrelenmiş)
    - **Request**: `{ eventId?, userId?, startDate?, endDate? }`
    - **Response**: Detaylı başvuru listesi

27. **Ödeme Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/payment-report`
    - **Kullanım**: Admin ödeme raporları (filtrelenmiş)
    - **Request**: `{ eventId?, userId?, startDate?, endDate?, odeme_tipi? }`
    - **Response**: Detaylı ödeme listesi

28. **Hakem Performans Raporu**
    `https://n8n.fokusistatistik.com/webhook-test/reviewer-report`
    - **Kullanım**: Admin hakem performans değerlendirmesi
    - **Request**: `{ eventId?, reviewerId? }`
    - **Response**: Hakem başına değerlendirme sayıları, ortalama puan, kabul/red oranları

---

## 👤 User & Reviewer Lists (2) ⭐ YENİ

29. **Kullanıcı Listele**
    `https://n8n.fokusistatistik.com/webhook-test/user-list`
    - **Kullanım**: Admin kullanıcı yönetimi ekranı
    - **Request**: `{ role?, limit?, offset? }`
    - **Response**: Kullanıcı listesi (email, name, role, email_verified)

30. **Hakem Listele**
    `https://n8n.fokusistatistik.com/webhook-test/reviewer-list`
    - **Kullanım**: Admin hakem yönetimi ekranı
    - **Request**: `{ eventId?, limit?, offset? }`
    - **Response**: Hakem listesi (uzmanlık alanı, değerlendirme istatistikleri)

---

## 📈 Toplam Özet

- **Toplam Endpoint**: 30
- **Yeni Eklenenler**: 12
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

## 🎯 Sonraki Adımlar

1. ✅ Tüm webhook path'ler `/webhook-test/` olarak güncellendi
2. ✅ Listeleme ve raporlama webhook'ları eklendi
3. ⏳ API endpoint'leri oluşturulacak
4. ⏳ User/Admin ekranları oluşturulacak
5. ⏳ Dashboard sayfaları webhook ile entegre edilecek

---

## 📝 Notlar

- Tüm webhook'lar **10 saniye timeout** ile çalışır
- **Graceful degradation**: Webhook başarısız olsa bile sistem çalışmaya devam eder
- Tüm veriler önce **local database**'e yazılır, sonra webhook'a gönderilir
- `operationType` parametresi ile create/update/process işlemleri ayırt edilir
