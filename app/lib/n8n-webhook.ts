// n8n Webhook Integration Service
// Base URL: n8n.fokusistatistik.com
// TEST MODE: All webhooks use /webhook-test/ prefix

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

// Webhook paths - TEST MODE
export const WEBHOOK_PATHS = {
  // Email & Authentication
  EMAIL_VERIFICATION: '/webhook-test/email-verification',
  PASSWORD_RESET: '/webhook-test/password-reset',
  SEND_EMAIL: '/webhook-test/send-email',

  // Event Operations
  EVENT_CREATE: '/webhook-test/event-create',
  EVENT_UPDATE: '/webhook-test/event-update',
  EVENT_GET: '/webhook-test/event-get',
  EVENT_LIST: '/webhook-test/event-list',

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
} as const;

interface WebhookResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

    const response = await fetch(`${N8N_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
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

export interface EmailVerificationRequest {
  email: string;
  userId: string;
  verificationToken: string;
  userName: string;
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

export interface PasswordResetRequest {
  email: string;
  resetToken: string;
  resetUrl: string;
  userName: string;
  expiresInSeconds: number; // 180 seconds
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

export interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
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

export interface EventCreateRequest {
  baslik: string;
  slug: string;
  tip: string;
  aciklama?: string;
  baslangic_tarihi: string;
  bitis_tarihi: string;
  son_basvuru_tarihi: string;
  yer: string;
  adres?: string;
  online?: boolean;
  ucret?: number;
  erken_kayit_ucret?: number;
  ogrenci_ucret?: number;
  erken_kayit_tarihi?: string;
  max_katilimci?: number;
  durum: string;
  created_by_email: string;
}

export interface EventUpdateRequest {
  eventId: string;
  updates: Partial<EventCreateRequest>;
  updated_by_email: string;
}

export interface EventGetRequest {
  eventId?: string;
  slug?: string;
}

export interface EventListRequest {
  durum?: string;
  limit?: number;
  offset?: number;
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
  data: EventUpdateRequest & { operationType: 'create' | 'update' }
): Promise<WebhookResponse<EventResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_UPDATE, data);
}

export async function getEventViaWebhook(
  data: EventGetRequest
): Promise<WebhookResponse<EventResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_GET, data, { method: 'POST' });
}

export async function listEventsViaWebhook(
  data?: EventListRequest
): Promise<WebhookResponse<EventResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.EVENT_LIST, data || {}, { method: 'POST' });
}

// ============================================
// WELCOME EMAILS
// ============================================

export interface ReviewerWelcomeRequest {
  email: string;
  name: string;
  temporaryPassword: string;
  loginUrl: string;
}

export interface UserWelcomeRequest {
  email: string;
  name: string;
  eventName?: string;
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

export interface ApplicationSubmitRequest {
  applicationId: string;
  userId: string;
  eventId: string;
  eventName: string;
  applicantName: string;
  applicantEmail: string;
  tip: string; // SOZLU_BILDIRI, POSTER, DINLEYICI
  baslik?: string;
  ozet?: string;
  anahtar_kelimeler?: string;
  kategori?: string;
  operationType: 'create' | 'update';
}

export interface ApplicationResponse {
  applicationId: string;
  status: string;
  notificationSent: boolean;
  message?: string;
}

export interface ApplicationListRequest {
  eventId?: string;
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
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
  data?: ApplicationListRequest
): Promise<WebhookResponse<ApplicationDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_LIST, data || {}, { method: 'POST' });
}

export async function getApplicationViaWebhook(
  data: { applicationId: string }
): Promise<WebhookResponse<ApplicationDetailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_GET, data, { method: 'POST' });
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export interface PaymentProcessRequest {
  paymentId: string;
  applicationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  tutar: number;
  para_birimi: string;
  odeme_tipi: string; // IYZICO, HAVALE, NAKIT
  operationType: 'process' | 'verify' | 'approve' | 'reject';
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  transactionId?: string;
  notificationSent: boolean;
  message?: string;
}

export interface PaymentListRequest {
  eventId?: string;
  userId?: string;
  status?: string;
  odeme_tipi?: string;
  limit?: number;
  offset?: number;
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
  data?: PaymentListRequest
): Promise<WebhookResponse<PaymentDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_LIST, data || {}, { method: 'POST' });
}

export async function getPaymentViaWebhook(
  data: { paymentId: string }
): Promise<WebhookResponse<PaymentDetailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_GET, data, { method: 'POST' });
}

// ============================================
// REVIEW OPERATIONS
// ============================================

export interface ReviewSubmitRequest {
  reviewId: string;
  applicationId: string;
  reviewerName: string;
  reviewerEmail: string;
  applicantName: string;
  applicantEmail: string;
  eventName: string;
  bildiriBaslik: string;
  puan?: number;
  karar: string; // KABUL, RED, REVIZYON
  yorum?: string;
  operationType: 'submit' | 'update';
}

export interface ReviewResponse {
  reviewId: string;
  status: string;
  notificationSent: boolean;
  message?: string;
}

export interface ReviewListRequest {
  eventId?: string;
  reviewerId?: string;
  applicationId?: string;
  karar?: string;
  limit?: number;
  offset?: number;
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
  data?: ReviewListRequest
): Promise<WebhookResponse<ReviewDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEW_LIST, data || {}, { method: 'POST' });
}

export async function getReviewViaWebhook(
  data: { reviewId: string }
): Promise<WebhookResponse<ReviewDetailResponse>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEW_GET, data, { method: 'POST' });
}

// ============================================
// RESULT NOTIFICATIONS
// ============================================

export interface ResultNotificationRequest {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  eventName: string;
  bildiriBaslik?: string;
  karar: string; // KABUL, RED, REVIZYON
  hakem_notu?: string;
  revizyon_talep?: string;
  sunum_tarihi?: string;
  sunum_salonu?: string;
  oturum?: string;
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

export interface DashboardStatsRequest {
  userId?: string;
  role: string; // USER, HAKEM, ADMIN, SUPER_ADMIN
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
  totalReviews?: number;
  pendingReviews?: number;
  completedReviews?: number;
}

export interface EventReportRequest {
  eventId: string;
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

export interface ApplicationReportRequest {
  eventId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentReportRequest {
  eventId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  odeme_tipi?: string;
}

export interface ReviewerReportRequest {
  eventId?: string;
  reviewerId?: string;
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
  data?: ApplicationReportRequest
): Promise<WebhookResponse<ApplicationDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.APPLICATION_REPORT, data || {}, { method: 'POST' });
}

export async function getPaymentReport(
  data?: PaymentReportRequest
): Promise<WebhookResponse<PaymentDetailResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.PAYMENT_REPORT, data || {}, { method: 'POST' });
}

export async function getReviewerReport(
  data: ReviewerReportRequest
): Promise<WebhookResponse<ReviewerReportResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_REPORT, data, { method: 'POST' });
}

// ============================================
// USER & REVIEWER LISTS
// ============================================

export interface UserListRequest {
  role?: string;
  limit?: number;
  offset?: number;
}

export interface UserListResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

export interface ReviewerListRequest {
  eventId?: string;
  limit?: number;
  offset?: number;
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
  data?: UserListRequest
): Promise<WebhookResponse<UserListResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.USER_LIST, data || {}, { method: 'POST' });
}

export async function listReviewersViaWebhook(
  data?: ReviewerListRequest
): Promise<WebhookResponse<ReviewerListResponse[]>> {
  return sendWebhookRequest(WEBHOOK_PATHS.REVIEWER_LIST, data || {}, { method: 'POST' });
}
