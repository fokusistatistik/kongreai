# n8n Webhook Architecture Documentation

This document outlines the webhook integration architecture for the Congress Management System with n8n workflows hosted at `n8n.fokusistatistik.com`.

## Overview

The system uses n8n webhooks for:
1. **Event Data Flow** - Registration, updates, results
2. **File Management** - Google Drive integration instead of direct uploads
3. **Email Communications** - All email processes
4. **Notifications** - Real-time updates and alerts

**Base Webhook URL:** `https://n8n.fokusistatistik.com/webhook`

---

## Webhook Endpoints

### 1. Event Registration Webhooks

#### POST /webhook/event-registration
**Purpose:** Handle new event registrations/applications

**Request Body:**
```json
{
  "eventId": "uuid",
  "eventTitle": "1. Uluslararası Tıp Kongresi 2025",
  "userId": "uuid",
  "user": {
    "email": "user@example.com",
    "ad": "Ahmet",
    "soyad": "Yılmaz",
    "unvan": "Doç. Dr.",
    "kurum": "İstanbul Üniversitesi",
    "telefon": "0555 111 2222"
  },
  "applicationData": {
    "registrationType": "STANDARD|EARLY|STUDENT",
    "paymentAmount": 750,
    "participationType": "ONLINE|ONSITE|HYBRID"
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "applicationId": "uuid",
  "confirmationCode": "CONF-2025-001",
  "message": "Başvurunuz alındı"
}
```

**Workflow Actions:**
1. Store registration data
2. Generate confirmation code
3. Send confirmation email
4. Create calendar event (optional)
5. Notify admins

---

#### PUT /webhook/event-registration/{applicationId}
**Purpose:** Update existing event registration

**Request Body:**
```json
{
  "applicationId": "uuid",
  "updates": {
    "status": "CONFIRMED|CANCELLED|PENDING",
    "paymentStatus": "PAID|PENDING|REFUNDED",
    "notes": "Additional information"
  },
  "updatedBy": {
    "userId": "uuid",
    "role": "ADMIN|USER"
  },
  "timestamp": "2025-12-27T11:00:00Z"
}
```

---

### 2. Abstract/Paper Submission Webhooks

#### POST /webhook/abstract-submission
**Purpose:** Handle abstract/paper submissions

**Request Body:**
```json
{
  "eventId": "uuid",
  "userId": "uuid",
  "submission": {
    "title": "Yapay Zeka ve Tıp",
    "abstract": "Özet metni...",
    "keywords": ["AI", "Medicine", "Technology"],
    "category": "OZEL|POSTER",
    "authors": [
      {
        "ad": "Ahmet",
        "soyad": "Yılmaz",
        "email": "ahmet@example.com",
        "kurum": "İstanbul Üniversitesi",
        "isCorresponding": true
      }
    ]
  },
  "fileMetadata": {
    "driveFileId": "google-drive-file-id",
    "fileName": "abstract.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf"
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "submissionId": "uuid",
  "submissionCode": "ABS-2025-042",
  "message": "Bildiri başarıyla gönderildi",
  "driveFileUrl": "https://drive.google.com/file/d/..."
}
```

---

### 3. File Management Webhooks (Google Drive Integration)

#### POST /webhook/file-upload
**Purpose:** Request file upload to Google Drive

**Request Body:**
```json
{
  "userId": "uuid",
  "fileMetadata": {
    "fileName": "document.pdf",
    "fileType": "ABSTRACT|PRESENTATION|CERTIFICATE|OTHER",
    "relatedTo": {
      "type": "EVENT|APPLICATION|RESULT",
      "id": "uuid"
    }
  },
  "uploadUrl": "temporary-signed-url-for-client-upload",
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "uploadUrl": "https://storage.googleapis.com/...",
  "driveFileId": "google-drive-file-id",
  "expiresIn": 3600,
  "instructions": "Upload file to this URL within 1 hour"
}
```

**Workflow Actions:**
1. Generate Google Drive folder structure
2. Create signed upload URL
3. Return upload URL to client
4. Monitor upload completion
5. Store file metadata in database

---

#### GET /webhook/file-download/{fileId}
**Purpose:** Get download URL for a file

**Query Parameters:**
- `userId`: User ID requesting the file
- `fileId`: Google Drive file ID

**Expected Response:**
```json
{
  "success": true,
  "downloadUrl": "https://drive.google.com/uc?export=download&id=...",
  "fileName": "document.pdf",
  "fileSize": 1024000,
  "expiresIn": 3600
}
```

---

### 4. Results and Announcements Webhooks

#### POST /webhook/event-results
**Purpose:** Publish event results (accepted papers, awards, etc.)

**Request Body:**
```json
{
  "eventId": "uuid",
  "resultType": "ABSTRACT_ACCEPTANCE|AWARD|SCHEDULE|GENERAL",
  "results": [
    {
      "submissionId": "uuid",
      "status": "ACCEPTED|REJECTED|REVISION",
      "userId": "uuid",
      "userEmail": "user@example.com",
      "notes": "Reviewer comments",
      "presentationType": "ORAL|POSTER",
      "sessionInfo": {
        "date": "2025-05-16",
        "time": "14:00-15:30",
        "room": "Salon A"
      }
    }
  ],
  "publishedBy": {
    "userId": "uuid",
    "email": "admin@kongreai.com"
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "publishedCount": 45,
  "emailsSent": 45,
  "message": "Sonuçlar başarıyla yayınlandı"
}
```

**Workflow Actions:**
1. Validate results data
2. Store in database
3. Generate personalized emails for each participant
4. Send notification emails
5. Update event status
6. Log all actions

---

#### GET /webhook/event-results/{eventId}
**Purpose:** Retrieve published results for an event

**Query Parameters:**
- `userId`: Optional - filter results for specific user
- `resultType`: Optional - filter by result type

**Expected Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "title": "Kabul Edilen Bildiriler",
      "type": "ABSTRACT_ACCEPTANCE",
      "publishDate": "2025-04-15",
      "content": "HTML content",
      "attachments": [
        {
          "fileName": "accepted-papers.pdf",
          "driveFileId": "google-drive-id",
          "downloadUrl": "..."
        }
      ]
    }
  ]
}
```

---

### 5. Email Communication Webhooks

#### POST /webhook/email/send
**Purpose:** Send email through n8n workflow

**Request Body:**
```json
{
  "to": ["user@example.com"],
  "cc": ["admin@kongreai.com"],
  "bcc": [],
  "subject": "Kongre Başvuru Onayı",
  "template": "REGISTRATION_CONFIRMATION|ABSTRACT_ACCEPTED|PAYMENT_RECEIPT|GENERAL",
  "templateData": {
    "userName": "Ahmet Yılmaz",
    "eventTitle": "1. Uluslararası Tıp Kongresi 2025",
    "confirmationCode": "CONF-2025-001",
    "customData": {}
  },
  "attachments": [
    {
      "fileName": "confirmation.pdf",
      "driveFileId": "google-drive-file-id"
    }
  ],
  "priority": "HIGH|NORMAL|LOW",
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "email-message-id",
  "sentTo": ["user@example.com"],
  "timestamp": "2025-12-27T10:30:15Z"
}
```

---

#### POST /webhook/email/bulk
**Purpose:** Send bulk emails (newsletters, announcements)

**Request Body:**
```json
{
  "recipients": [
    {
      "email": "user1@example.com",
      "name": "Ahmet Yılmaz",
      "customData": {
        "confirmationCode": "CONF-2025-001"
      }
    }
  ],
  "template": "EVENT_REMINDER|DEADLINE_REMINDER|NEWSLETTER",
  "templateData": {
    "eventTitle": "1. Uluslararası Tıp Kongresi 2025",
    "eventDate": "2025-05-15",
    "eventUrl": "https://kongreai.com/events/1-uluslararasi-tip-kongresi-2025"
  },
  "scheduledTime": "2025-12-28T09:00:00Z",
  "timestamp": "2025-12-27T10:30:00Z"
}
```

---

### 6. Notification Webhooks

#### POST /webhook/notifications/send
**Purpose:** Send real-time notifications (in-app, SMS, push)

**Request Body:**
```json
{
  "userId": "uuid",
  "notificationType": "APPLICATION_STATUS|DEADLINE_REMINDER|RESULT_PUBLISHED|GENERAL",
  "channels": ["IN_APP", "EMAIL", "SMS"],
  "title": "Başvuru Durumu Güncellendi",
  "message": "Kongre başvurunuz onaylandı",
  "data": {
    "eventId": "uuid",
    "actionUrl": "/dashboard/applications/uuid"
  },
  "priority": "HIGH|NORMAL|LOW",
  "timestamp": "2025-12-27T10:30:00Z"
}
```

---

### 7. Payment Integration Webhooks

#### POST /webhook/payment/initiate
**Purpose:** Initiate payment process

**Request Body:**
```json
{
  "userId": "uuid",
  "eventId": "uuid",
  "applicationId": "uuid",
  "amount": 750,
  "currency": "TRY",
  "paymentMethod": "CREDIT_CARD|BANK_TRANSFER|ONLINE",
  "billingInfo": {
    "name": "Ahmet Yılmaz",
    "email": "user@example.com",
    "phone": "0555 111 2222",
    "address": "...",
    "taxId": "..."
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "paymentId": "uuid",
  "paymentUrl": "https://payment.gateway.com/...",
  "expiresIn": 900,
  "instructions": "Complete payment within 15 minutes"
}
```

---

#### POST /webhook/payment/callback
**Purpose:** Handle payment gateway callbacks

**Request Body:**
```json
{
  "paymentId": "uuid",
  "status": "SUCCESS|FAILED|PENDING|CANCELLED",
  "transactionId": "payment-gateway-transaction-id",
  "amount": 750,
  "currency": "TRY",
  "paymentMethod": "CREDIT_CARD",
  "timestamp": "2025-12-27T10:35:00Z",
  "gatewayData": {}
}
```

**Workflow Actions:**
1. Verify payment with gateway
2. Update application status
3. Generate receipt
4. Send confirmation email with receipt
5. Update event participant count

---

### 8. Analytics and Reporting Webhooks

#### POST /webhook/analytics/track
**Purpose:** Track user actions and events

**Request Body:**
```json
{
  "eventType": "PAGE_VIEW|BUTTON_CLICK|FORM_SUBMIT|DOWNLOAD",
  "userId": "uuid",
  "sessionId": "session-id",
  "page": "/events/1-uluslararasi-tip-kongresi-2025",
  "action": "view_event|apply_event|download_document",
  "metadata": {
    "eventId": "uuid",
    "device": "desktop|mobile",
    "browser": "Chrome",
    "referrer": "..."
  },
  "timestamp": "2025-12-27T10:30:00Z"
}
```

---

#### GET /webhook/analytics/report/{eventId}
**Purpose:** Generate event analytics report

**Query Parameters:**
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `metrics`: views,applications,conversions,revenue

**Expected Response:**
```json
{
  "success": true,
  "eventId": "uuid",
  "period": {
    "start": "2025-01-01",
    "end": "2025-12-27"
  },
  "metrics": {
    "totalViews": 5420,
    "totalApplications": 342,
    "conversionRate": 6.3,
    "totalRevenue": 256500,
    "averageTicketPrice": 750
  },
  "charts": {
    "applicationsOverTime": [...],
    "revenueByType": [...]
  }
}
```

---

## User Information Payload

For all webhook calls, include user context:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN|ORGANIZATOR|HAKEM|KATILIMCI",
    "profile": {
      "ad": "Ahmet",
      "soyad": "Yılmaz",
      "unvan": "Doç. Dr.",
      "kurum": "İstanbul Üniversitesi",
      "telefon": "0555 111 2222"
    },
    "permissions": ["EVENT_VIEW", "EVENT_APPLY", "EVENT_MANAGE"],
    "session": {
      "id": "session-id",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-12-27T10:00:00Z"
    }
  }
}
```

---

## Security and Authentication

### API Key Authentication
All webhook calls must include authentication:

**Header:**
```
X-API-Key: your-secure-api-key
Content-Type: application/json
```

### Request Signing (Optional)
For sensitive operations, use request signing:

```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(requestBody))
  .digest('hex');

// Include in header
headers['X-Signature'] = signature;
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR|AUTH_ERROR|NOT_FOUND|SERVER_ERROR",
    "message": "Human-readable error message",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2025-12-27T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request / Validation Error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## Rate Limiting

- **Default:** 100 requests per minute per API key
- **Bulk Operations:** 10 requests per minute
- **File Uploads:** 20 requests per hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640616000
```

---

## Webhook Retry Policy

If a webhook fails:
1. Retry after 1 minute
2. Retry after 5 minutes
3. Retry after 15 minutes
4. Retry after 1 hour
5. Mark as failed and notify admin

---

## Testing

### Test Webhook URLs
- **Base URL:** `https://n8n.fokusistatistik.com/webhook-test`
- **Mode:** Add `?test=true` to any endpoint

### Example Test Call
```bash
curl -X POST https://n8n.fokusistatistik.com/webhook/event-registration?test=true \
  -H "X-API-Key: test-key" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "test-event-id",
    "userId": "test-user-id",
    "user": {
      "email": "test@example.com",
      "ad": "Test",
      "soyad": "User"
    }
  }'
```

---

## Monitoring and Logging

All webhook calls are logged with:
- Request/Response payloads
- Execution time
- Success/Failure status
- Error messages
- User context

**Log Retention:** 90 days

---

## Implementation Checklist

### Phase 1: Core Webhooks
- [ ] Event registration webhook
- [ ] Email sending webhook
- [ ] Basic file upload webhook

### Phase 2: File Management
- [ ] Google Drive integration
- [ ] File download webhook
- [ ] File metadata storage

### Phase 3: Advanced Features
- [ ] Results publication webhook
- [ ] Bulk email webhook
- [ ] Payment integration webhooks

### Phase 4: Analytics
- [ ] Analytics tracking webhook
- [ ] Reporting webhook
- [ ] Dashboard integration

---

## Support

For webhook integration support:
- **Technical Documentation:** This file
- **API Status:** https://n8n.fokusistatistik.com/status
- **Support Email:** support@fokusistatistik.com

---

**Last Updated:** 2025-12-27
**Version:** 1.0.0
