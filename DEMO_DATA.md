# Demo Data Setup Guide

This document provides information about demo data and login credentials for testing the Congress Management System.

## Running the Demo Data Script

To populate the database with demo data, run:

```bash
npx tsx scripts/setup-demo.ts
```

This script will:
1. Create the `event_timeline` table if it doesn't exist
2. Create 1 admin user
3. Create 2 demo participant users
4. Create 1 sample congress event
5. Create 7 timeline items for the event

## Login Credentials

### Admin Account
- **Email:** `admin@kongreai.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Access:** Full admin panel access, can manage all events, users, and settings

### Demo Participant 1
- **Email:** `ahmet.yilmaz@example.com`
- **Password:** `demo123`
- **Role:** KATILIMCI (Participant)
- **Title:** Doç. Dr.
- **Institution:** İstanbul Üniversitesi

### Demo Participant 2
- **Email:** `ayse.kaya@example.com`
- **Password:** `demo123`
- **Role:** KATILIMCI (Participant)
- **Title:** Prof. Dr.
- **Institution:** Ankara Üniversitesi

## Demo Event

### Event Details
- **Title:** 1. Uluslararası Tıp Kongresi 2025
- **Subtitle:** Modern Tıp ve Teknoloji Buluşması
- **Type:** KONGRE (Congress)
- **Slug:** `1-uluslararasi-tip-kongresi-2025`
- **URL:** `/events/1-uluslararasi-tip-kongresi-2025`

### Event Dates
- **Event Start:** May 15, 2025
- **Event End:** May 18, 2025
- **Application Deadline:** March 31, 2025
- **Early Registration:** February 28, 2025

### Pricing
- **Standard Registration:** 750 TRY
- **Early Registration:** 500 TRY
- **Student Fee:** 250 TRY

### Venue
- **Location:** İstanbul Kongre ve Sergi Merkezi
- **Address:** Yeşilköy Mah. Atatürk Cad. No:12 Bakırköy/İstanbul
- **Online Option:** Yes (Hybrid event)
- **Zoom Link:** https://zoom.us/j/kongreai2025

## Timeline Items

The demo event includes 7 timeline items:

1. **Erken Kayıt Son Tarihi** (Early Registration Deadline)
   - Date: February 28, 2025
   - Type: BASVURU

2. **Bildiri Gönderme Son Tarihi** (Abstract Submission Deadline)
   - Date: March 15, 2025
   - Type: BILDIRI

3. **Başvuru Son Tarihi** (Application Deadline)
   - Date: March 31, 2025
   - Type: BASVURU

4. **Kabul Edilen Bildirilerin Açıklanması** (Accepted Abstracts Announcement)
   - Date: April 15, 2025
   - Type: SONUC

5. **Kesin Kayıt Son Tarihi** (Final Registration Deadline)
   - Date: April 30, 2025
   - Type: ONEMLI

6. **Kongre Başlangıç Tarihi** (Congress Start Date)
   - Date: May 15, 2025
   - Type: ETKINLIK

7. **Kongre Bitiş Tarihi** (Congress End Date)
   - Date: May 18, 2025
   - Type: ETKINLIK

## Testing Scenarios

### As Admin (admin@kongreai.com)
1. Access admin panel at `/admin`
2. Manage events, users, and all subsections
3. View and edit timeline items
4. Manage documents, results, gallery, and schedule
5. View all applications

### As Participant (ahmet.yilmaz@example.com or ayse.kaya@example.com)
1. Browse events at `/`
2. View event details at `/events/1-uluslararasi-tip-kongresi-2025`
3. See timeline visualization with important dates
4. Apply to the event (if logged in)
5. View application status in dashboard

### Public Access (No Login)
1. Browse home page and event listings
2. View event details and timeline
3. Access privacy policy at `/gizlilik-politikasi`
4. Access about page at `/hakkimizda`

## Roles and Permissions

| Role | Access Level |
|------|--------------|
| ADMIN | Full system access, event management, user management |
| ORGANIZATOR | Event management, participant management |
| HAKEM | Review submissions, provide feedback |
| KATILIMCI | Apply to events, view personal dashboard |

## Notes

- All passwords are hashed using bcrypt with 10 salt rounds
- Email verification is set to true for demo users
- First login flag is set to false for smoother testing
- The demo event is published (YAYINDA status)
- Applications are active for the demo event
- Maximum participants: 500

## Troubleshooting

If you encounter issues:
1. Make sure the `event_timeline` table exists in your database
2. Run `npx tsx scripts/setup-demo.ts` to create demo data
3. Check that the Prisma client is generated: `npx prisma generate`
4. Verify database connection in `.env` file

## Cleanup

To remove demo data:
```sql
DELETE FROM event_timeline WHERE created_by_email = 'admin@kongreai.com';
DELETE FROM Event WHERE slug = '1-uluslararasi-tip-kongresi-2025';
DELETE FROM User WHERE email IN ('admin@kongreai.com', 'ahmet.yilmaz@example.com', 'ayse.kaya@example.com');
```
