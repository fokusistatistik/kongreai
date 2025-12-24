/**
 * Payment Service - Mock Implementation
 *
 * Bu dosya ödeme işlemleri için temel altyapıyı sağlar.
 * Şu anda mock (sahte) implementasyon içerir.
 * Gerçek Iyzico entegrasyonu Faz 2'de yapılacaktır.
 */

export interface PaymentInitParams {
  applicationId: string;
  userId: string;
  amount: number;
  userEmail: string;
  userName: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  message: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Ödeme işlemi başlatır (Mock)
 * Gerçek implementasyonda Iyzico 3D Secure checkout URL'i dönecek
 */
export async function initializePayment(params: PaymentInitParams): Promise<PaymentResult> {
  try {
    // Mock implementation - gerçek Iyzico entegrasyonu için placeholder
    console.log('Payment initialization (MOCK):', params);

    // Simüle edilmiş başarılı yanıt
    return {
      success: true,
      paymentId: `MOCK_${Date.now()}`,
      message: 'Ödeme mock modunda başlatıldı. Gerçek ödeme için Iyzico entegrasyonu gereklidir.',
      checkoutUrl: `/dashboard/payment/mock?applicationId=${params.applicationId}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Ödeme başlatılamadı',
      error: error.message,
    };
  }
}

/**
 * Ödeme durumunu sorgular
 */
export async function checkPaymentStatus(paymentId: string): Promise<{
  paid: boolean;
  status: string;
}> {
  // Mock implementation
  return {
    paid: false,
    status: 'BEKLIYOR',
  };
}

/**
 * Manuel ödeme onayı (Admin için)
 */
export async function approvePaymentManually(paymentId: string, adminId: string): Promise<boolean> {
  try {
    // Gerçek implementasyonda veritabanı güncelleme yapılacak
    console.log(`Payment ${paymentId} approved by admin ${adminId}`);
    return true;
  } catch (error) {
    console.error('Payment approval failed:', error);
    return false;
  }
}

/**
 * Havale/EFT dekont yükleme
 */
export async function uploadTransferReceipt(
  paymentId: string,
  fileUrl: string
): Promise<PaymentResult> {
  try {
    // Mock implementation
    return {
      success: true,
      message: 'Dekont yüklendi. Onay için bekleyiniz.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Dekont yüklenemedi',
      error: error.message,
    };
  }
}

/**
 * Iyzico webhook callback handler (Faz 2)
 * Bu fonksiyon Iyzico'dan gelen ödeme sonuç bildirimlerini işler
 */
export async function handleIyzicoCallback(token: string): Promise<void> {
  // Faz 2'de implement edilecek
  console.log('Iyzico callback received (MOCK):', token);
}
