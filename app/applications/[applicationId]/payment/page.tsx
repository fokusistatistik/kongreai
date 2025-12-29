import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Building2, CheckCircle, ArrowLeft, DollarSign } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getApplication(applicationId: string, userId: string) {
  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
      user_id: userId, // Security: Only show user's own applications
    },
    include: {
      event: true,
      user: true,
    },
  });

  return application;
}

async function getPayment(applicationId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      application_id: applicationId,
    },
  });

  return payment;
}

interface PageProps {
  params: {
    applicationId: string;
  };
}

export default async function PaymentSelectionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const user = session.user as any;

  const application = await getApplication(params.applicationId, user.id);

  if (!application) {
    notFound();
  }

  // Check if payment already exists
  const existingPayment = await getPayment(params.applicationId);

  // Determine payment amount based on event pricing
  const event = application.event;
  let paymentAmount = event.ucret || 0;

  // Check if event is free
  if (event.ucretsiz) {
    paymentAmount = 0;
  }

  // Check for student discount (if applicable)
  if (application.user.ogrenci && event.ogrenci_ucret) {
    paymentAmount = event.ogrenci_ucret;
  }

  // Check for early registration
  const now = new Date();
  const erkenKayit = event.erken_kayit_tarihi ? new Date(event.erken_kayit_tarihi) : null;
  if (erkenKayit && now <= erkenKayit && event.erken_kayit_ucret) {
    paymentAmount = event.erken_kayit_ucret;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Başvurularıma Dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ödeme Yöntemi Seçin</h1>
          <p className="text-gray-600 mt-2">{event.baslik}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Payment Options */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free Event */}
              {paymentAmount === 0 && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Ücretsiz Etkinlik
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Bu etkinlik ücretsizdir. Başvurunuz tamamlanmıştır.
                  </p>
                  <Link
                    href="/dashboard/applications"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Başvurularıma Dön
                  </Link>
                </div>
              )}

              {/* Paid Event */}
              {paymentAmount > 0 && (
                <>
                  {/* Payment Already Made */}
                  {existingPayment && existingPayment.durum !== 'IPTAL' && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-1">
                            Ödeme Kaydı Mevcut
                          </h3>
                          <p className="text-sm text-blue-800">
                            Bu başvuru için daha önce ödeme yapılmış.
                            Durum: <span className="font-medium">{existingPayment.durum}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* iyzico Payment Option */}
                  <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-500 transition-all p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Kredi/Banka Kartı ile Ödeme
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Güvenli iyzico altyapısı ile anında ödeme yapın
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1 mb-4">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Anında onay
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            3D Secure güvenli ödeme
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Tüm kartlar kabul edilir
                          </li>
                        </ul>
                        <Link
                          href={`/applications/${params.applicationId}/payment/iyzico`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Kartla Öde
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* EFT/Havale Payment Option */}
                  <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-green-500 transition-all p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Building2 className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Havale / EFT ile Ödeme
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Banka havalesi veya EFT ile ödeme yapın
                        </p>
                        <ul className="text-sm text-gray-700 space-y-1 mb-4">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Havale/EFT ile ödeme
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Ödeme dekontunu yükleyin
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            1-2 iş günü içinde onaylanır
                          </li>
                        </ul>
                        <Link
                          href={`/applications/${params.applicationId}/payment/bank-transfer`}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Havale Bilgilerini Gör
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ödeme Özeti</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Başvuru Tipi</span>
                    <span className="font-medium text-gray-900">{application.tip}</span>
                  </div>

                  {application.baslik && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-gray-500 mb-1">Bildiri Başlığı</p>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {application.baslik}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Katılım Ücreti</span>
                      <span className="font-medium text-gray-900">
                        {event.ucret ? `${event.ucret} ₺` : 'Ücretsiz'}
                      </span>
                    </div>

                    {application.user.ogrenci && event.ogrenci_ucret && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-green-600">Öğrenci İndirimi</span>
                        <span className="font-medium text-green-600">
                          -{(event.ucret || 0) - event.ogrenci_ucret} ₺
                        </span>
                      </div>
                    )}

                    {erkenKayit && now <= erkenKayit && event.erken_kayit_ucret && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-green-600">Erken Kayıt İndirimi</span>
                        <span className="font-medium text-green-600">
                          -{(event.ucret || 0) - event.erken_kayit_ucret} ₺
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Toplam</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {paymentAmount === 0 ? 'Ücretsiz' : `${paymentAmount} ₺`}
                    </span>
                  </div>
                </div>

                {erkenKayit && now <= erkenKayit && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-800">
                      <strong>Erken Kayıt Fırsatı!</strong> <br />
                      {new Date(erkenKayit).toLocaleDateString('tr-TR')} tarihine kadar geçerli
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
