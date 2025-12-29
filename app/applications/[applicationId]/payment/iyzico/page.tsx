'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, CreditCard, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function IyzicoPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // Fetch application details
  useEffect(() => {
    if (!session) return;

    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${params.applicationId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Application not found');
        }

        const data = await response.json();
        setApplication(data.application);
        setPaymentAmount(data.paymentAmount || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [session, params.applicationId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Initialize payment with iyzico
      const response = await fetch('/api/payment/iyzico/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: params.applicationId,
          amount: paymentAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment initialization failed');
      }

      // Redirect to iyzico payment page
      if (result.paymentPageUrl) {
        window.location.href = result.paymentPageUrl;
      } else if (result.checkoutFormContent) {
        // For checkout form integration
        document.write(result.checkoutFormContent);
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm border p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Hata</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Başvurularıma Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/applications/${params.applicationId}/payment`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Kart ile Ödeme</h1>
            <p className="text-gray-600 mt-2">{application?.event?.baslik}</p>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Lock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Güvenli ödeme - iyzico altyapısı ile korunmaktadır
              </span>
            </div>

            {/* Payment Amount */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Ödenecek Tutar</span>
                <span className="text-3xl font-bold text-blue-600">{paymentAmount} ₺</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Payment Info */}
            <div className="mb-6 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  256-bit SSL güvenlik sertifikası ile korumalı ödeme
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">
                  3D Secure doğrulama ile ekstra güvenlik
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Tüm banka kartları kabul edilir</span>
              </div>
            </div>

            {/* Payment Button */}
            <form onSubmit={handlePayment}>
              <button
                type="submit"
                disabled={processing}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Ödeme sayfasına yönlendiriliyorsunuz...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Ödeme Sayfasına Git
                  </>
                )}
              </button>
            </form>

            {/* iyzico Logo */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-gray-500 mb-2">Ödeme Altyapı Sağlayıcısı</p>
              <img
                src="https://www.iyzico.com/assets/images/content/logo.svg"
                alt="iyzico"
                className="h-8 mx-auto opacity-50"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Bilgi:</strong> Ödeme işleminizi tamamladıktan sonra otomatik olarak
              başvuru sayfanıza yönlendirileceksiniz. Ödeme dekontunuz e-posta adresinize
              gönderilecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
