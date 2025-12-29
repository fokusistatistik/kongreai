// n8n Webhook Integration Service
// Base URL: n8n.fokusistatistik.com
// TEST MODE: All webhooks use /webhook-test/ prefix

import { v4 as uuidv4 } from 'uuid';

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY; // Optional for security

// Webhook Security Check
if (process.env.NODE_ENV === 'production' && !WEBHOOK_API_KEY) {
  console.warn(
    '⚠️  WARNING: WEBHOOK_API_KEY is not set in production!\n' +
    'For security, set WEBHOOK_API_KEY environment variable.\n' +
    'Generate one with: openssl rand -hex 32\n' +
    'Then configure n8n workflows to validate this key in headers.'
  );
}

// Webhook paths - TEST MODE
export const WEBHOOK_PATHS = {
  // Email & Authentication
  EMAIL_VERIFICATION: '/webhook-test/email-verification',
  PASSWORD_RESET: '/webhook-test/password-reset',
  SEND_EMAIL: '/webhook-test/send-email',

  // Event Operations
  EVENT_CREATE: '/webhook-test/event-create',
  EVENT_UPDATE: '/webhook-test/event-update',
  EVENT_DELETE: '/webhook-test/event-delete',
  EVENT_GET: '/webhook-test/event-get',
  EVENT_LIST: '/webhook-test/event-list',

  // Event Documents
  DOCUMENT_UPLOAD: '/webhook-test/document-upload',
  DOCUMENT_LIST: '/webhook-test/document-list',
  DOCUMENT_DELETE: '/webhook-test/document-delete',
  DOCUMENT_GET: '/webhook-test/document-get',

  // Event Program
  PROGRAM_CREATE: '/webhook-test/program-create',
  PROGRAM_UPDATE: '/webhook-test/program-update',
  PROGRAM_LIST: '/webhook-test/program-list',
  PROGRAM_DELETE: '/webhook-test/program-delete',

  // Event Announcements
  ANNOUNCEMENT_CREATE: '/webhook-test/announcement-create',
  ANNOUNCEMENT_UPDATE: '/webhook-test/announcement-update',
  ANNOUNCEMENT_LIST: '/webhook-test/announcement-list',
  ANNOUNCEMENT_DELETE: '/webhook-test/announcement-delete',

  // Welcome Emails
  REVIEWER_WELCOME: '/webhook-test/reviewer-welcome',
  USER_WELCOME: '/webhook-test/user-welcome',

  // Application Operations
  APPLICATION_SUBMIT: '/webhook-test/application-submit',
  APPLICATION_UPDATE: '/webhook-test/application-update',
  APPLICATION_LIST: '/webhook-test/application-list',
  APPLICATION_GET: '/webhook-test/application-get',

  // Payment Operations
  PAYMENT_PROCESS: '/webhook-test/payment-process',
  PAYMENT_VERIFY: '/webhook-test/payment-verify',
  PAYMENT_LIST: '/webhook-test/payment-list',
  PAYMENT_GET: '/webhook-test/payment-get',

  // Review Operations
  REVIEW_SUBMIT: '/webhook-test/review-submit',
  REVIEW_LIST: '/webhook-test/review-list',
  REVIEW_GET: '/webhook-test/review-get',

  // Result Notifications
  RESULT_NOTIFY: '/webhook-test/result-notify',
  ACCEPTANCE_NOTIFY: '/webhook-test/acceptance-notify',
  REJECTION_NOTIFY: '/webhook-test/rejection-notify',

  // Reports & Analytics
  DASHBOARD_STATS: '/webhook-test/dashboard-stats',
  EVENT_REPORT: '/webhook-test/event-report',
  APPLICATION_REPORT: '/webhook-test/application-report',
  PAYMENT_REPORT: '/webhook-test/payment-report',
  REVIEWER_REPORT: '/webhook-test/reviewer-report',

  // User & Reviewer Lists
  USER_LIST: '/webhook-test/user-list',
  REVIEWER_LIST: '/webhook-test/reviewer-list',

  // Reviewer Assignment Operations
  REVIEWER_ASSIGN: '/webhook-test/reviewer-assign',
  REVIEWER_UNASSIGN: '/webhook-test/reviewer-unassign',
  REVIEWER_ASSIGNMENTS_LIST: '/webhook-test/reviewer-assignments-list',
  REVIEWER_ASSIGNMENT_UPDATE: '/webhook-test/reviewer-assignment-update',
  EVENT_REVIEWERS_LIST: '/webhook-test/event-reviewers-list',
} as const;

// ============================================
// STANDARD CONTEXT INTERFACES
// ============================================

/**
 * Standard user context included in all webhook requests
 */
export interface WebhookRequestedBy {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string; // USER, HAKEM, ADMIN, SUPER_ADMIN, ORGANIZATOR
}

/**
 * Event context when operation is related to an event
 */
export interface WebhookEventContext {
  eventId: string;
  eventName: string;
  eventSlug: string;
  eventType: string; // KONGRE, SEMPOZYUM, KONFERANS, etc.
  eventDates: {
    baslangicTarihi: string; // ISO 8601
    bitisTarihi: string; // ISO 8601
    sonBasvuruTarihi: string; // ISO 8601
  };
}

/**
 * Standard metadata included in all webhook requests
 */
export interface WebhookMetadata {
  requestId: string; // Unique tracking ID (UUID)
  timestamp: string; // ISO 8601 timestamp
  source: string; // 'web-app' | 'mobile-app' | 'admin-panel'
  environment: string; // 'production' | 'test' | 'development'
}

/**
 * Base webhook request with standard context
 */
export interface BaseWebhookRequest {
  metadata: WebhookMetadata;
  requestedBy: WebhookRequestedBy;
  event?: WebhookEventContext; // Optional, included when operation relates to event
}

interface WebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create standard metadata for webhook request
 */
function createWebhookMetadata(): WebhookMetadata {
  return {
    requestId: uuidv4(),
    timestamp: new Date().toISOString(),
    source: 'web-app',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
  };
}

/**
 * Send request to n8n webhook
 */
async function sendWebhookRequest<T = any>(
  path: string,
  data: any,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    timeout?: number;
  }
): Promise<WebhookResponse<T>> {
  const { method = 'POST', timeout = 10000 } = options || {};

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Add metadata to all requests if not already present
    const requestData = {
      ...data,
      metadata: data.metadata || createWebhookMetadata(),
    };

    // Build headers with optional API key authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured (for webhook authentication)
    if (WEBHOOK_API_KEY) {
      headers['X-Webhook-API-Key'] = WEBHOOK_API_KEY;
    }

    const response = await fetch(`${N8N_BASE_URL}${path}`, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(requestData) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
      message: result.message,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Webhook request timeout',
      };
    }

    return {
      success: false,
      error: error.message || 'Webhook request failed',
    };
  }
}

// ============================================
// EMAIL VERIFICATION
// ============================================

export interface EmailVerificationRequest extends BaseWebhookRequest {
  user: {
    userId: string;
    userEmail: string;
    userName: string;
  };
  verification: {
    verificationToken: string;
    verificationUrl: string;
  };
}

export interface EmailVerificationResponse {
  sent: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmailVerification(
  data: EmailVerificationRequest
): Promise<WebhookResponse<EmailVerificationResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EMAIL_VERIFICATION, data);
}

// ============================================
// PASSWORD RESET
// ============================================

export interface PasswordResetRequest extends BaseWebhookRequest {
  user: {
    userId: string;
    userEmail: string;
    userName: string;
  };
  reset: {
    resetToken: string;
    resetUrl: string;
    expiresInSeconds: number; // 180 seconds
    expiresAt: string; // ISO 8601
  };
}

export interface PasswordResetResponse {
  sent: boolean;
  messageId?: string;
  expiresAt: string;
  error?: string;
}

export async function sendPasswordResetEmail(
  data: PasswordResetRequest
): Promise<WebhookResponse<PasswordResetResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PASSWORD_RESET, data);
}

// ============================================
// GENERAL EMAIL SENDING
// ============================================

export interface SendEmailRequest extends BaseWebhookRequest {
  email: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
  };
}

export interface SendEmailResponse {
  sent: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(
  data: SendEmailRequest
): Promise<WebhookResponse<SendEmailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.SEND_EMAIL, data);
}

// ============================================
// EVENT OPERATIONS
// ============================================

export interface EventCreateRequest extends BaseWebhookRequest {
  event: {
    baslik: string;
    slug: string; // Auto-generated from baslik
    tip: string;
    aciklama?: string;
    dates: {
      baslangicTarihi: string; // Day only (date), stored as 23:59:59
      erkenBasvuruSonTarihi?: string; // Day only (date), stored as 23:59:59
      sonBasvuruTarihi: string; // Day only (date), stored as 23:59:59
      sonucAciklamaTarihi?: string; // Day only (date), stored as 23:59:59
      kongreBaslangicTarihi: string; // Day only (date), stored as 23:59:59
      kongreBitisTarihi: string; // Day only (date), stored as 23:59:59
    };
    location: {
      yer: string;
      adres?: string;
      online: boolean;
    };
    fees: {
      standartUcret: number;
      erkenKayitUcret: number;
      ogrenciUcret: number;
      paraBirimi: string; // TRY, USD, EUR
    };
    settings: {
      durum: string; // TASLAK, YAYINDA, TAMAMLANDI, IPTAL
      maxKatilimci?: number;
    };
  };
}

export interface EventUpdateRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  updates: Partial<EventCreateRequest['event']>;
  operationType: 'create' | 'update';
}

export interface EventGetRequest extends BaseWebhookRequest {
  event: {
    eventId?: string;
    eventSlug?: string;
  };
}

export interface EventListRequest extends BaseWebhookRequest {
  filters: {
    durum?: string;
    tip?: string;
    limit?: number;
    offset?: number;
  };
}

export interface EventResponse {
  id: string;
  slug: string;
  baslik: string;
  tip: string;
  aciklama?: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  son_basvuru_tarihi: string;
  yer: string;
  adres?: string;
  durum: string;
  ucret?: number;
  created_at: string;
  updated_at: string;
}

export async function createEventViaWebhook(
  data: EventCreateRequest
): Promise<WebhookResponse<EventResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_CREATE, data);
}

export async function updateEventViaWebhook(
  data: EventUpdateRequest
): Promise<WebhookResponse<EventResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_UPDATE, data);
}

export async function getEventViaWebhook(
  data: EventGetRequest
): Promise<WebhookResponse<EventResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_GET, data, { method: 'POST' });
}

export async function listEventsViaWebhook(
  data: EventListRequest
): Promise<WebhookResponse<EventResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_LIST, data, { method: 'POST' });
}

export async function deleteEventViaWebhook(
  data: BaseWebhookRequest & { event: { eventId: string } }
): Promise<WebhookResponse<{ deleted: boolean; message?: string }>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_DELETE, data);
}

// ============================================
// WELCOME EMAILS
// ============================================

export interface ReviewerWelcomeRequest extends BaseWebhookRequest {
  reviewer: {
    reviewerId: string;
    reviewerEmail: string;
    reviewerName: string;
    uzmanlikAlani?: string;
  };
  credentials: {
    temporaryPassword: string;
    loginUrl: string;
    mustChangePassword: boolean;
  };
}

export interface UserWelcomeRequest extends BaseWebhookRequest {
  user: {
    userId: string;
    userEmail: string;
    userName: string;
  };
  event?: WebhookEventContext;
}

export async function sendReviewerWelcomeEmail(
  data: ReviewerWelcomeRequest
): Promise<WebhookResponse<SendEmailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_WELCOME, data);
}

export async function sendUserWelcomeEmail(
  data: UserWelcomeRequest
): Promise<WebhookResponse<SendEmailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.USER_WELCOME, data);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format webhook error for user display
 */
export function formatWebhookError(response: WebhookResponse): string {
  if (response.error) {
    return response.error;
  }
  return 'İşlem sırasında bir hata oluştu';
}

/**
 * Check if webhook service is available
 */
export async function checkWebhookHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================
// APPLICATION OPERATIONS
// ============================================

export interface ApplicationSubmitRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  application: {
    applicationId: string;
    tip: string; // SOZLU_BILDIRI, POSTER, DINLEYICI
    baslik?: string;
    ozet?: string;
    anahtarKelimeler?: string;
    kategori?: string;
    status: string; // TASLAK, GONDERILDI, DEGERLENDIRILIYOR, KABUL, RED
  };
  applicant: {
    userId: string;
    userName: string;
    userEmail: string;
    phone?: string;
    institution?: string;
    department?: string;
  };
  operationType: 'create' | 'update';
}

export interface ApplicationResponse {
  applicationId: string;
  status: string;
  notificationSent: boolean;
  message?: string;
}

export interface ApplicationListRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    userId?: string;
    status?: string;
    tip?: string;
    limit?: number;
    offset?: number;
  };
}

export interface ApplicationDetailResponse {
  id: string;
  eventId: string;
  eventName: string;
  userId: string;
  userName: string;
  userEmail: string;
  tip: string;
  baslik?: string;
  ozet?: string;
  anahtar_kelimeler?: string;
  kategori?: string;
  status: string;
  hakem_notu?: string;
  karar?: string;
  created_at: string;
  updated_at: string;
}

export async function submitApplicationViaWebhook(
  data: ApplicationSubmitRequest
): Promise<WebhookResponse<ApplicationResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_SUBMIT, data);
}

export async function updateApplicationViaWebhook(
  data: ApplicationSubmitRequest
): Promise<WebhookResponse<ApplicationResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_UPDATE, data);
}

export async function listApplicationsViaWebhook(
  data: ApplicationListRequest
): Promise<WebhookResponse<ApplicationDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_LIST, data, { method: 'POST' });
}

export async function getApplicationViaWebhook(
  data: BaseWebhookRequest & { application: { applicationId: string } }
): Promise<WebhookResponse<ApplicationDetailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_GET, data, { method: 'POST' });
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export interface PaymentProcessRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  application: {
    applicationId: string;
    baslik?: string;
    tip: string;
  };
  payment: {
    paymentId: string;
    tutar: number;
    paraBirimi: string; // TRY, USD, EUR
    odemeTipi: string; // IYZICO, HAVALE, NAKIT
    status: string; // BEKLEMEDE, TAMAMLANDI, BASARISIZ, IPTAL
    transactionId?: string;
  };
  payer: {
    userId: string;
    userName: string;
    userEmail: string;
    phone?: string;
  };
  operationType: 'process' | 'verify' | 'approve' | 'reject';
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  transactionId?: string;
  notificationSent: boolean;
  message?: string;
}

export interface PaymentListRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    userId?: string;
    status?: string;
    odemeTipi?: string;
    startDate?: string; // ISO 8601
    endDate?: string; // ISO 8601
    limit?: number;
    offset?: number;
  };
}

export interface PaymentDetailResponse {
  id: string;
  applicationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  tutar: number;
  para_birimi: string;
  odeme_tipi: string;
  status: string;
  transactionId?: string;
  odeme_tarihi?: string;
  created_at: string;
  updated_at: string;
}

export async function processPaymentViaWebhook(
  data: PaymentProcessRequest
): Promise<WebhookResponse<PaymentResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_PROCESS, data);
}

export async function verifyPaymentViaWebhook(
  data: PaymentProcessRequest
): Promise<WebhookResponse<PaymentResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_VERIFY, data);
}

export async function listPaymentsViaWebhook(
  data: PaymentListRequest
): Promise<WebhookResponse<PaymentDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_LIST, data, { method: 'POST' });
}

export async function getPaymentViaWebhook(
  data: BaseWebhookRequest & { payment: { paymentId: string } }
): Promise<WebhookResponse<PaymentDetailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_GET, data, { method: 'POST' });
}

// ============================================
// REVIEW OPERATIONS
// ============================================

export interface ReviewSubmitRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  application: {
    applicationId: string;
    baslik: string;
    tip: string;
  };
  applicant: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  review: {
    reviewId: string;
    puan?: number;
    karar: string; // KABUL, RED, REVIZYON
    yorum?: string;
    revizyonTalebi?: string;
    status: string; // BEKLEMEDE, TAMAMLANDI
  };
  reviewer: {
    reviewerId: string;
    reviewerName: string;
    reviewerEmail: string;
    uzmanlikAlani?: string;
  };
  operationType: 'submit' | 'update';
}

export interface ReviewResponse {
  reviewId: string;
  status: string;
  notificationSent: boolean;
  message?: string;
}

export interface ReviewListRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    reviewerId?: string;
    applicationId?: string;
    karar?: string;
    status?: string;
    limit?: number;
    offset?: number;
  };
}

export interface ReviewDetailResponse {
  id: string;
  applicationId: string;
  bildiriBaslik: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  applicantName: string;
  applicantEmail: string;
  eventName: string;
  puan?: number;
  karar: string;
  yorum?: string;
  created_at: string;
  updated_at: string;
}

export async function submitReviewViaWebhook(
  data: ReviewSubmitRequest
): Promise<WebhookResponse<ReviewResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEW_SUBMIT, data);
}

export async function listReviewsViaWebhook(
  data: ReviewListRequest
): Promise<WebhookResponse<ReviewDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEW_LIST, data, { method: 'POST' });
}

export async function getReviewViaWebhook(
  data: BaseWebhookRequest & { review: { reviewId: string } }
): Promise<WebhookResponse<ReviewDetailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEW_GET, data, { method: 'POST' });
}

// ============================================
// RESULT NOTIFICATIONS
// ============================================

export interface ResultNotificationRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  application: {
    applicationId: string;
    baslik?: string;
    tip: string;
  };
  applicant: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  result: {
    karar: string; // KABUL, RED, REVIZYON
    hakemNotu?: string;
    revizyonTalebi?: string;
  };
  presentation?: {
    sunumTarihi: string; // ISO 8601
    sunumSalonu: string;
    oturum: string;
  };
}

export interface ResultNotificationResponse {
  notificationId: string;
  sent: boolean;
  messageId?: string;
  message?: string;
}

export async function notifyApplicationResult(
  data: ResultNotificationRequest
): Promise<WebhookResponse<ResultNotificationResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.RESULT_NOTIFY, data);
}

export async function notifyAcceptance(
  data: ResultNotificationRequest
): Promise<WebhookResponse<ResultNotificationResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.ACCEPTANCE_NOTIFY, data);
}

export async function notifyRejection(
  data: ResultNotificationRequest
): Promise<WebhookResponse<ResultNotificationResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REJECTION_NOTIFY, data);
}

// ============================================
// REPORTS & ANALYTICS
// ============================================

export interface DashboardStatsRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    startDate?: string; // ISO 8601
    endDate?: string; // ISO 8601
  };
}

export interface DashboardStatsResponse {
  totalEvents: number;
  activeEvents: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  totalUsers: number;
  totalReviews?: number;
  pendingReviews?: number;
  completedReviews?: number;
}

export interface EventReportRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
}

export interface EventReportResponse {
  eventId: string;
  eventName: string;
  totalApplications: number;
  applicationsByType: {
    SOZLU_BILDIRI: number;
    POSTER: number;
    DINLEYICI: number;
  };
  applicationsByStatus: {
    BEKLEMEDE: number;
    DEGERLENDIRILIYOR: number;
    KABUL: number;
    RED: number;
  };
  totalPayments: number;
  completedPayments: number;
  totalRevenue: number;
  totalReviews: number;
  averageScore: number;
}

export interface ApplicationReportRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    userId?: string;
    startDate?: string; // ISO 8601
    endDate?: string; // ISO 8601
    status?: string;
    tip?: string;
  };
}

export interface PaymentReportRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    userId?: string;
    startDate?: string; // ISO 8601
    endDate?: string; // ISO 8601
    odemeTipi?: string;
    status?: string;
  };
}

export interface ReviewerReportRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    reviewerId?: string;
  };
}

export interface ReviewerReportResponse {
  reviewerId: string;
  reviewerName: string;
  totalReviews: number;
  completedReviews: number;
  pendingReviews: number;
  averageScore: number;
  acceptanceRate: number;
  rejectionRate: number;
}

export async function getDashboardStats(
  data: DashboardStatsRequest
): Promise<WebhookResponse<DashboardStatsResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.DASHBOARD_STATS, data, { method: 'POST' });
}

export async function getEventReport(
  data: EventReportRequest
): Promise<WebhookResponse<EventReportResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_REPORT, data, { method: 'POST' });
}

export async function getApplicationReport(
  data: ApplicationReportRequest
): Promise<WebhookResponse<ApplicationDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_REPORT, data, { method: 'POST' });
}

export async function getPaymentReport(
  data: PaymentReportRequest
): Promise<WebhookResponse<PaymentDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_REPORT, data, { method: 'POST' });
}

export async function getReviewerReport(
  data: ReviewerReportRequest
): Promise<WebhookResponse<ReviewerReportResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_REPORT, data, { method: 'POST' });
}

// ============================================
// USER & REVIEWER LISTS
// ============================================

export interface UserListRequest extends BaseWebhookRequest {
  filters: {
    role?: string;
    emailVerified?: boolean;
    limit?: number;
    offset?: number;
  };
}

export interface UserListResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

export interface ReviewerListRequest extends BaseWebhookRequest {
  filters: {
    eventId?: string;
    uzmanlikAlani?: string;
    limit?: number;
    offset?: number;
  };
}

export interface ReviewerListResponse {
  id: string;
  email: string;
  name: string;
  uzmanlik_alani?: string;
  totalReviews: number;
  pendingReviews: number;
  completedReviews: number;
}

export async function listUsersViaWebhook(
  data: UserListRequest
): Promise<WebhookResponse<UserListResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.USER_LIST, data, { method: 'POST' });
}

export async function listReviewersViaWebhook(
  data: ReviewerListRequest
): Promise<WebhookResponse<ReviewerListResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_LIST, data, { method: 'POST' });
}

// ============================================
// EVENT DOCUMENT MANAGEMENT
// ============================================

export interface DocumentUploadRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  document: {
    documentId: string;
    documentSlot: number; // Slot number (1-8), fixed ID that persists even if document is deleted
    fileName: string;
    fileSize: number; // in bytes, max 9MB (9437184 bytes)
    fileType: string; // Auto-detected: pdf, doc, docx, xls, xlsx, jpg, jpeg, png
    fileMimeType: string;
    fileUrl: string; // Uploaded file URL
    aciklama: string; // Document description (e.g., "Kongre Kuralları", "Örnek Bildiri Formatı")
    category?: string; // Optional category
  };
}

export interface DocumentResponse {
  documentId: string;
  fileUrl: string;
  status: string;
  message?: string;
}

export interface DocumentListRequest extends BaseWebhookRequest {
  filters: {
    eventId: string;
    category?: string;
    limit?: number;
    offset?: number;
  };
}

export interface DocumentDetailResponse {
  id: string;
  eventId: string;
  documentSlot: number; // Slot number (1-8), fixed
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  aciklama: string;
  category?: string;
  uploadedBy: string;
  created_at: string;
}

export async function uploadDocumentViaWebhook(
  data: DocumentUploadRequest
): Promise<WebhookResponse<DocumentResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.DOCUMENT_UPLOAD, data);
}

export async function listDocumentsViaWebhook(
  data: DocumentListRequest
): Promise<WebhookResponse<DocumentDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.DOCUMENT_LIST, data, { method: 'POST' });
}

export async function getDocumentViaWebhook(
  data: BaseWebhookRequest & { document: { documentId: string } }
): Promise<WebhookResponse<DocumentDetailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.DOCUMENT_GET, data, { method: 'POST' });
}

export async function deleteDocumentViaWebhook(
  data: BaseWebhookRequest & { document: { documentId: string; eventId: string } }
): Promise<WebhookResponse<{ deleted: boolean; message?: string }>> {
  return sendWebhookRequest(WEBHOOK_PATHS.DOCUMENT_DELETE, data);
}

// ============================================
// EVENT PROGRAM MANAGEMENT
// ============================================

export interface ProgramCreateRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  program: {
    programId: string;
    baslik: string; // Program title (e.g., "Kongre Programı")
    maddeler: ProgramItem[]; // Program items/agenda
    sira: number; // Display order
  };
}

export interface ProgramItem {
  id: string;
  baslik: string; // Item title
  aciklama?: string; // Item description
  tarih?: string; // ISO 8601 date
  baslangicSaati?: string; // HH:mm format
  bitisSaati?: string; // HH:mm format
  konum?: string; // Location/room
  konusmacilar?: string[]; // Speaker names
  sira: number; // Display order
}

export interface ProgramResponse {
  programId: string;
  status: string;
  message?: string;
}

export interface ProgramListRequest extends BaseWebhookRequest {
  filters: {
    eventId: string;
    limit?: number;
    offset?: number;
  };
}

export interface ProgramDetailResponse {
  id: string;
  eventId: string;
  baslik: string;
  maddeler: ProgramItem[];
  sira: number;
  created_at: string;
  updated_at: string;
}

export async function createProgramViaWebhook(
  data: ProgramCreateRequest
): Promise<WebhookResponse<ProgramResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PROGRAM_CREATE, data);
}

export async function updateProgramViaWebhook(
  data: ProgramCreateRequest & { operationType: 'update' }
): Promise<WebhookResponse<ProgramResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PROGRAM_UPDATE, data);
}

export async function listProgramsViaWebhook(
  data: ProgramListRequest
): Promise<WebhookResponse<ProgramDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PROGRAM_LIST, data, { method: 'POST' });
}

export async function deleteProgramViaWebhook(
  data: BaseWebhookRequest & { program: { programId: string; eventId: string } }
): Promise<WebhookResponse<{ deleted: boolean; message?: string }>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PROGRAM_DELETE, data);
}

// ============================================
// EVENT ANNOUNCEMENTS
// ============================================

export interface AnnouncementCreateRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  announcement: {
    announcementId: string;
    baslik: string; // Announcement title
    icerik: string; // Announcement content/body
    tip: string; // Type: DUYURU, UYARI, BILGILENDIRME
    oncelik: number; // Priority: 1 (high) to 5 (low)
    aktif: boolean; // Active/visible status
    yayinTarihi?: string; // Publication date (ISO 8601)
    bitisTarihi?: string; // Expiry date (ISO 8601)
  };
}

export interface AnnouncementResponse {
  announcementId: string;
  status: string;
  message?: string;
}

export interface AnnouncementListRequest extends BaseWebhookRequest {
  filters: {
    eventId: string;
    tip?: string;
    aktif?: boolean;
    limit?: number;
    offset?: number;
  };
}

export interface AnnouncementDetailResponse {
  id: string;
  eventId: string;
  baslik: string;
  icerik: string;
  tip: string;
  oncelik: number;
  aktif: boolean;
  yayinTarihi?: string;
  bitisTarihi?: string;
  created_at: string;
  updated_at: string;
}

export async function createAnnouncementViaWebhook(
  data: AnnouncementCreateRequest
): Promise<WebhookResponse<AnnouncementResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.ANNOUNCEMENT_CREATE, data);
}

export async function updateAnnouncementViaWebhook(
  data: AnnouncementCreateRequest & { operationType: 'update' }
): Promise<WebhookResponse<AnnouncementResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.ANNOUNCEMENT_UPDATE, data);
}

export async function listAnnouncementsViaWebhook(
  data: AnnouncementListRequest
): Promise<WebhookResponse<AnnouncementDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.ANNOUNCEMENT_LIST, data, { method: 'POST' });
}

export async function deleteAnnouncementViaWebhook(
  data: BaseWebhookRequest & { announcement: { announcementId: string; eventId: string } }
): Promise<WebhookResponse<{ deleted: boolean; message?: string }>> {
  return sendWebhookRequest(WEBHOOK_PATHS.ANNOUNCEMENT_DELETE, data);
}

// ============================================
// REVIEWER ASSIGNMENT MANAGEMENT
// ============================================

/**
 * Assign a reviewer to an event or application
 */
export interface ReviewerAssignRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  assignment: {
    assignmentId: string; // Unique ID for this assignment
    reviewerId: string;
    reviewerName: string;
    reviewerEmail: string;
    applicationId?: string; // Optional: assign to specific application
    uzmanlikAlani?: string;
    notlar?: string; // Assignment notes
  };
}

export interface ReviewerAssignResponse {
  assignmentId: string;
  status: string;
  notificationSent: boolean;
  message?: string;
}

/**
 * Remove a reviewer from an event or application
 */
export interface ReviewerUnassignRequest extends BaseWebhookRequest {
  event: WebhookEventContext;
  assignment: {
    assignmentId?: string; // Optional: specific assignment ID
    reviewerId: string;
    applicationId?: string; // Optional: unassign from specific application
  };
  reason?: string; // Reason for unassignment
}

export interface ReviewerUnassignResponse {
  success: boolean;
  message?: string;
}

/**
 * List reviewer's assignments (for reviewer dashboard)
 */
export interface ReviewerAssignmentsListRequest extends BaseWebhookRequest {
  reviewer: {
    reviewerId: string;
  };
  filters: {
    eventId?: string;
    durum?: string; // BEKLEMEDE, KABUL_EDILDI, REDDEDILDI, TAMAMLANDI
    limit?: number;
    offset?: number;
  };
}

export interface ReviewerAssignmentDetail {
  assignmentId: string;
  eventId: string;
  eventName: string;
  eventSlug: string;
  eventDates: {
    baslangicTarihi: string;
    bitisTarihi: string;
    sonBasvuruTarihi: string;
  };
  applicationId?: string;
  applicationBaslik?: string;
  applicantName?: string;
  applicantEmail?: string;
  durum: string; // BEKLEMEDE, KABUL_EDILDI, REDDEDILDI, TAMAMLANDI
  atanmaTarihi: string;
  kabulTarihi?: string;
  tamamlanmaTarihi?: string;
  notlar?: string;
  reviewStatus?: {
    puan?: number;
    karar?: string;
    tamamlandi: boolean;
  };
}

/**
 * Update reviewer assignment status (accept/reject assignment)
 */
export interface ReviewerAssignmentUpdateRequest extends BaseWebhookRequest {
  assignment: {
    assignmentId: string;
    reviewerId: string;
  };
  update: {
    durum: string; // KABUL_EDILDI, REDDEDILDI
    redNedeni?: string; // Reason for rejection
    notlar?: string;
  };
}

export interface ReviewerAssignmentUpdateResponse {
  assignmentId: string;
  durum: string;
  message?: string;
}

/**
 * List all reviewers assigned to an event (for admin)
 */
export interface EventReviewersListRequest extends BaseWebhookRequest {
  event: {
    eventId: string;
  };
  filters: {
    durum?: string; // BEKLEMEDE, KABUL_EDILDI, REDDEDILDI, TAMAMLANDI
    applicationId?: string; // Filter by specific application
    limit?: number;
    offset?: number;
  };
}

export interface EventReviewerDetail {
  assignmentId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  uzmanlikAlani?: string;
  applicationId?: string;
  applicationBaslik?: string;
  durum: string;
  atanmaTarihi: string;
  kabulTarihi?: string;
  notlar?: string;
  reviewCount: number;
  completedReviews: number;
  pendingReviews: number;
}

// Webhook functions
export async function assignReviewerViaWebhook(
  data: ReviewerAssignRequest
): Promise<WebhookResponse<ReviewerAssignResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_ASSIGN, data);
}

export async function unassignReviewerViaWebhook(
  data: ReviewerUnassignRequest
): Promise<WebhookResponse<ReviewerUnassignResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_UNASSIGN, data);
}

export async function listReviewerAssignmentsViaWebhook(
  data: ReviewerAssignmentsListRequest
): Promise<WebhookResponse<ReviewerAssignmentDetail[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_ASSIGNMENTS_LIST, data, { method: 'POST' });
}

export async function updateReviewerAssignmentViaWebhook(
  data: ReviewerAssignmentUpdateRequest
): Promise<WebhookResponse<ReviewerAssignmentUpdateResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_ASSIGNMENT_UPDATE, data);
}

export async function listEventReviewersViaWebhook(
  data: EventReviewersListRequest
): Promise<WebhookResponse<EventReviewerDetail[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_REVIEWERS_LIST, data, { method: 'POST' });
}

