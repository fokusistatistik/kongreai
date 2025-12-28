// n8n Webhook Integration Service
// Base URL: n8n.fokusistatistik.com

const N8N_BASE_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

// Webhook paths
export const WEBHOOK_PATHS = {
  EMAIL_VERIFICATION: '/webhook/email-verification',
  PASSWORD_RESET: '/webhook/password-reset',
  SEND_EMAIL: '/webhook/send-email',
  EVENT_CREATE: '/webhook/event-create',
  EVENT_UPDATE: '/webhook/event-update',
  EVENT_GET: '/webhook/event-get',
  EVENT_LIST: '/webhook/event-list',
  REVIEWER_WELCOME: '/webhook/reviewer-welcome',
  USER_WELCOME: '/webhook/user-welcome',
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
