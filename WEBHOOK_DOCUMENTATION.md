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

## Notes

1. **Password Reset Timing**: Exactly 180 seconds (3 minutes) for security
2. **Event Operations**: All event CRUD operations go through webhooks for centralized management
3. **Error Handling**: Application continues to work even if webhook fails (graceful degradation)
4. **Database Records**: Token/event records are still created in local database even if webhook fails
5. **Retry Logic**: Currently no automatic retry. Consider implementing if needed.

---

## Support

For webhook issues, contact:
- n8n Instance: https://n8n.fokusistatistik.com
- Technical Support: admin@fokusistatistik.com
