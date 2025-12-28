# n8n Webhook Integration Documentation

## Base URL
```
https://n8n.fokusistatistik.com
```

## Webhook Endpoints

### 1. Email Verification
**Path:** `/webhook/email-verification`
**Method:** `POST`

#### Request Body
```json
{
  "email": "user@example.com",
  "userId": "uuid-string",
  "verificationToken": "token-string",
  "userName": "John Doe"
}
```

#### Response
```json
{
  "success": true,
  "sent": true,
  "messageId": "unique-message-id",
  "message": "Verification email sent successfully"
}
```

---

### 2. Password Reset
**Path:** `/webhook/password-reset`
**Method:** `POST`

#### Request Body
```json
{
  "email": "user@example.com",
  "resetToken": "token-string",
  "resetUrl": "https://example.com/auth/reset-password?token=xxx",
  "userName": "John Doe",
  "expiresInSeconds": 180
}
```

#### Response
```json
{
  "success": true,
  "sent": true,
  "messageId": "unique-message-id",
  "expiresAt": "2025-12-28T15:30:00Z",
  "message": "Password reset email sent successfully"
}
```

**Important Notes:**
- Token expires in exactly 180 seconds (3 minutes)
- Frontend displays countdown timer
- Email should include expiration time

---

### 3. General Email Sending
**Path:** `/webhook/send-email`
**Method:** `POST`

#### Request Body
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>HTML Content</h1>",
  "text": "Plain text content (optional)",
  "from": "noreply@example.com (optional)"
}
```

#### Response
```json
{
  "success": true,
  "sent": true,
  "messageId": "unique-message-id"
}
```

---

### 4. Event Create
**Path:** `/webhook/event-create`
**Method:** `POST`

#### Request Body
```json
{
  "baslik": "1. Uluslararası Tıp Kongresi",
  "slug": "1-uluslararasi-tip-kongresi",
  "tip": "KONGRE",
  "aciklama": "Kongre açıklaması",
  "baslangic_tarihi": "2026-05-15T09:00:00Z",
  "bitis_tarihi": "2026-05-17T18:00:00Z",
  "son_basvuru_tarihi": "2026-04-30T23:59:59Z",
  "yer": "İstanbul Kongre Merkezi",
  "adres": "Harbiye Mahallesi, İstanbul",
  "online": false,
  "ucret": 1500.00,
  "erken_kayit_ucret": 1200.00,
  "ogrenci_ucret": 750.00,
  "erken_kayit_tarihi": "2026-04-15T23:59:59Z",
  "max_katilimci": 500,
  "durum": "TASLAK",
  "created_by_email": "admin@example.com"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "slug": "1-uluslararasi-tip-kongresi",
    "baslik": "1. Uluslararası Tıp Kongresi",
    "tip": "KONGRE",
    "aciklama": "Kongre açıklaması",
    "baslangic_tarihi": "2026-05-15T09:00:00Z",
    "bitis_tarihi": "2026-05-17T18:00:00Z",
    "son_basvuru_tarihi": "2026-04-30T23:59:59Z",
    "yer": "İstanbul Kongre Merkezi",
    "adres": "Harbiye Mahallesi, İstanbul",
    "durum": "TASLAK",
    "ucret": 1500.00,
    "created_at": "2025-12-28T12:00:00Z",
    "updated_at": "2025-12-28T12:00:00Z"
  }
}
```

---

### 5. Event Update
**Path:** `/webhook/event-update`
**Method:** `POST`

#### Request Body
```json
{
  "eventId": "uuid-string",
  "updates": {
    "baslik": "Updated Title",
    "durum": "YAYINDA",
    "ucret": 1600.00
  },
  "updated_by_email": "admin@example.com"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "baslik": "Updated Title",
    "durum": "YAYINDA",
    "ucret": 1600.00,
    "updated_at": "2025-12-28T13:00:00Z"
  }
}
```

---

### 6. Event Get (Single Event)
**Path:** `/webhook/event-get`
**Method:** `POST`

#### Request Body (by ID)
```json
{
  "eventId": "uuid-string"
}
```

#### Request Body (by Slug)
```json
{
  "slug": "1-uluslararasi-tip-kongresi"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "slug": "1-uluslararasi-tip-kongresi",
    "baslik": "1. Uluslararası Tıp Kongresi",
    "tip": "KONGRE",
    "aciklama": "Kongre açıklaması",
    "baslangic_tarihi": "2026-05-15T09:00:00Z",
    "bitis_tarihi": "2026-05-17T18:00:00Z",
    "son_basvuru_tarihi": "2026-04-30T23:59:59Z",
    "yer": "İstanbul Kongre Merkezi",
    "adres": "Harbiye Mahallesi, İstanbul",
    "durum": "YAYINDA",
    "ucret": 1500.00,
    "created_at": "2025-12-28T12:00:00Z",
    "updated_at": "2025-12-28T12:00:00Z"
  }
}
```

---

### 7. Event List (Multiple Events)
**Path:** `/webhook/event-list`
**Method:** `POST`

#### Request Body
```json
{
  "durum": "YAYINDA",
  "limit": 50,
  "offset": 0
}
```

**All fields are optional. Empty body returns all events.**

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "slug": "event-1",
      "baslik": "Event 1",
      "tip": "KONGRE",
      "durum": "YAYINDA",
      "baslangic_tarihi": "2026-05-15T09:00:00Z",
      "bitis_tarihi": "2026-05-17T18:00:00Z",
      "yer": "İstanbul",
      "ucret": 1500.00,
      "created_at": "2025-12-28T12:00:00Z"
    },
    {
      "id": "uuid-string-2",
      "slug": "event-2",
      "baslik": "Event 2",
      "tip": "SEMPOZYUM",
      "durum": "YAYINDA",
      "baslangic_tarihi": "2026-06-01T09:00:00Z",
      "bitis_tarihi": "2026-06-03T18:00:00Z",
      "yer": "Ankara",
      "ucret": 1200.00,
      "created_at": "2025-12-28T13:00:00Z"
    }
  ]
}
```

---

### 8. Reviewer Welcome Email
**Path:** `/webhook/reviewer-welcome`
**Method:** `POST`

#### Request Body
```json
{
  "email": "reviewer@example.com",
  "name": "Dr. Jane Smith",
  "temporaryPassword": "Temp123!@#",
  "loginUrl": "https://example.com/auth/login"
}
```

#### Response
```json
{
  "success": true,
  "sent": true,
  "messageId": "unique-message-id"
}
```

**Important Notes:**
- Sent when a new reviewer is created
- Includes temporary password
- User must change password on first login

---

### 9. User Welcome Email
**Path:** `/webhook/user-welcome`
**Method:** `POST`

#### Request Body
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "eventName": "1. Uluslararası Tıp Kongresi"
}
```

#### Response
```json
{
  "success": true,
  "sent": true,
  "messageId": "unique-message-id"
}
```

---

## Error Responses

All webhooks return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Timeout Configuration

All webhook requests have a **10-second timeout** by default. If n8n doesn't respond within 10 seconds, the request is aborted and an error is returned.

---

## Environment Variables

Required environment variable in Next.js application:

```bash
N8N_WEBHOOK_URL=https://n8n.fokusistatistik.com
```

---

## Implementation Example

```typescript
import { sendPasswordResetEmail } from '@/app/lib/n8n-webhook';

// Send password reset email
const result = await sendPasswordResetEmail({
  email: 'user@example.com',
  resetToken: 'abc123',
  resetUrl: 'https://example.com/reset?token=abc123',
  userName: 'John Doe',
  expiresInSeconds: 180,
});

if (result.success) {
  console.log('Email sent:', result.data.messageId);
} else {
  console.error('Error:', result.error);
}
```

---

## Testing Webhooks

### Test Password Reset (180 Second Countdown)
```bash
curl -X POST https://n8n.fokusistatistik.com/webhook/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "resetToken": "test-token-123",
    "resetUrl": "https://example.com/reset?token=test-token-123",
    "userName": "Test User",
    "expiresInSeconds": 180
  }'
```

### Test Event Create
```bash
curl -X POST https://n8n.fokusistatistik.com/webhook/event-create \
  -H "Content-Type: application/json" \
  -d '{
    "baslik": "Test Event",
    "slug": "test-event",
    "tip": "KONGRE",
    "baslangic_tarihi": "2026-05-15T09:00:00Z",
    "bitis_tarihi": "2026-05-17T18:00:00Z",
    "son_basvuru_tarihi": "2026-04-30T23:59:59Z",
    "yer": "Test Location",
    "durum": "TASLAK",
    "created_by_email": "admin@example.com"
  }'
```

---

### 10. Application Submit
**Path:** `/webhook/application-submit`
**Method:** `POST`

#### Request Body
```json
{
  "applicationId": "uuid-string",
  "userId": "uuid-string",
  "eventId": "uuid-string",
  "eventName": "1. Uluslararası Tıp Kongresi",
  "applicantName": "Dr. John Doe",
  "applicantEmail": "john.doe@example.com",
  "tip": "SOZLU_BILDIRI",
  "baslik": "COVID-19 Araştırması",
  "ozet": "Bu çalışmada COVID-19 ile ilgili...",
  "anahtar_kelimeler": "COVID-19, pandemi, sağlık",
  "kategori": "Tıp",
  "operationType": "create"
}
```

**Application Types (tip):**
- `SOZLU_BILDIRI` - Oral Presentation
- `POSTER` - Poster Presentation
- `DINLEYICI` - Listener/Attendee

**Operation Types:**
- `create` - New application submission
- `update` - Update existing application

#### Response
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid-string",
    "status": "SUBMITTED",
    "notificationSent": true,
    "message": "Application submitted successfully"
  }
}
```

---

### 11. Application Update
**Path:** `/webhook/application-update`
**Method:** `POST`

#### Request Body
```json
{
  "applicationId": "uuid-string",
  "userId": "uuid-string",
  "eventId": "uuid-string",
  "eventName": "1. Uluslararası Tıp Kongresi",
  "applicantName": "Dr. John Doe",
  "applicantEmail": "john.doe@example.com",
  "tip": "SOZLU_BILDIRI",
  "baslik": "Updated Title",
  "ozet": "Updated abstract...",
  "anahtar_kelimeler": "updated, keywords",
  "kategori": "Tıp",
  "operationType": "update"
}
```

#### Response
Same as Application Submit

---

### 12. Payment Process
**Path:** `/webhook/payment-process`
**Method:** `POST`

#### Request Body
```json
{
  "paymentId": "uuid-string",
  "applicationId": "uuid-string",
  "userId": "uuid-string",
  "userName": "Dr. John Doe",
  "userEmail": "john.doe@example.com",
  "eventName": "1. Uluslararası Tıp Kongresi",
  "tutar": 1500.00,
  "para_birimi": "TRY",
  "odeme_tipi": "IYZICO",
  "operationType": "process"
}
```

**Payment Types (odeme_tipi):**
- `IYZICO` - Credit card payment via Iyzico
- `HAVALE` - Bank transfer
- `NAKIT` - Cash payment

**Operation Types:**
- `process` - Process new payment
- `verify` - Verify payment status
- `approve` - Approve manual payment (HAVALE/NAKIT)
- `reject` - Reject manual payment

#### Response
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid-string",
    "status": "COMPLETED",
    "transactionId": "iyzico-transaction-id",
    "notificationSent": true,
    "message": "Payment processed successfully"
  }
}
```

---

### 13. Payment Verify
**Path:** `/webhook/payment-verify`
**Method:** `POST`

#### Request Body
Same as Payment Process with `operationType: "verify"`

#### Response
Same as Payment Process

---

### 14. Review Submit
**Path:** `/webhook/review-submit`
**Method:** `POST`

#### Request Body
```json
{
  "reviewId": "uuid-string",
  "applicationId": "uuid-string",
  "reviewerName": "Prof. Dr. Jane Smith",
  "reviewerEmail": "jane.smith@example.com",
  "applicantName": "Dr. John Doe",
  "applicantEmail": "john.doe@example.com",
  "eventName": "1. Uluslararası Tıp Kongresi",
  "bildiriBaslik": "COVID-19 Araştırması",
  "puan": 85,
  "karar": "KABUL",
  "yorum": "Çalışma metodolojik olarak güçlü...",
  "operationType": "submit"
}
```

**Review Decisions (karar):**
- `KABUL` - Accept
- `RED` - Reject
- `REVIZYON` - Revision required

**Operation Types:**
- `submit` - Submit new review
- `update` - Update existing review

#### Response
```json
{
  "success": true,
  "data": {
    "reviewId": "uuid-string",
    "status": "SUBMITTED",
    "notificationSent": true,
    "message": "Review submitted successfully"
  }
}
```

---

### 15. Result Notification (General)
**Path:** `/webhook/result-notify`
**Method:** `POST`

#### Request Body
```json
{
  "applicationId": "uuid-string",
  "applicantName": "Dr. John Doe",
  "applicantEmail": "john.doe@example.com",
  "eventName": "1. Uluslararası Tıp Kongresi",
  "bildiriBaslik": "COVID-19 Araştırması",
  "karar": "KABUL",
  "hakem_notu": "Çalışma metodolojik olarak güçlü",
  "revizyon_talep": "",
  "sunum_tarihi": "2026-05-16T14:00:00Z",
  "sunum_salonu": "Salon A",
  "oturum": "Tıp Oturumu 1"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "notificationId": "uuid-string",
    "sent": true,
    "messageId": "unique-message-id",
    "message": "Result notification sent successfully"
  }
}
```

---

### 16. Acceptance Notification
**Path:** `/webhook/acceptance-notify`
**Method:** `POST`

#### Request Body
Same as Result Notification (with `karar: "KABUL"`)

#### Response
Same as Result Notification

**Important Notes:**
- Sent when application is accepted
- Includes presentation details (date, room, session)
- Should include payment instructions if applicable

---

### 17. Rejection Notification
**Path:** `/webhook/rejection-notify`
**Method:** `POST`

#### Request Body
Same as Result Notification (with `karar: "RED"`)

#### Response
Same as Result Notification

**Important Notes:**
- Sent when application is rejected
- Should include reviewer feedback if available
- Professional and constructive tone

---

## Notes

1. **Password Reset Timing**: Exactly 180 seconds (3 minutes) for security
2. **Event Operations**: All event CRUD operations go through webhooks for centralized management
3. **Application Workflow**: Application → Payment → Review → Result Notification
4. **Payment Types**: Support for online (Iyzico), bank transfer (Havale), and cash payments
5. **Review Process**: Reviewers can accept, reject, or request revisions
6. **Notification System**: Automated notifications for all major status changes
7. **Error Handling**: Application continues to work even if webhook fails (graceful degradation)
8. **Database Records**: All records are created in local database even if webhook fails
9. **Retry Logic**: Currently no automatic retry. Consider implementing if needed.
10. **operationType Pattern**: All webhooks use operationType to distinguish actions (create/update/process/verify/approve/reject)

---

## Support

For webhook issues, contact:
- n8n Instance: https://n8n.fokusistatistik.com
- Technical Support: admin@fokusistatistik.com
