'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Building2,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import FileUpload, { type UploadedFile } from '@/components/file-upload';

export default function BankTransferPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [application, setApplication] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [uploadedReceipt, setUploadedReceipt] = useState<UploadedFile | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Bank account details (these would come from environment or database in production)
  const bankAccounts = [
    {
      bank: 'Türkiye İş Bankası',
      branch: 'Merkez Şubesi',
      accountName: 'Kongre Yönetim A.Ş.',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
      swift: 'ISBKTRIS',
    },
    {
      bank: 'Garanti BBVA',
      branch: 'Kadıköy Şubesi',
      accountName: 'Kongre Yönetim A.Ş.',
      iban: 'TR11 1111 1111 1111 1111 1111 11',
      swift: 'TGBATRIS',
    },
  ];

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitReceipt = async () => {
    if (!uploadedReceipt) {
      setError('Lütfen ödeme dekontunuzu yükleyin');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/bank-transfer/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: params.applicationId,
          receiptFile: uploadedReceipt,
          amount: paymentAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit receipt');
    } finally {
      setSubmitting(false);
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm border p-8 max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dekont Gönderildi!</h2>
          <p className="text-gray-600 mb-6">
            Ödeme dekontunuz alındı. 1-2 iş günü içinde kontrol edilerek onaylanacaktır.
          </p>
          <p className="text-sm text-gray-500">Dashboard sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/applications/${params.applicationId}/payment`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Havale / EFT ile Ödeme</h1>
            <p className="text-gray-600 mt-2">{application?.event?.baslik}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Instructions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Amount */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 mb-1">Ödenecek Tutar</p>
                    <p className="text-4xl font-bold text-blue-900">{paymentAmount} ₺</p>
                  </div>
                  <Building2 className="w-16 h-16 text-blue-400" />
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Banka Hesap Bilgileri</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Aşağıdaki hesaplardan birine ödemenizi yapabilirsiniz
                  </p>
                </div>

                <div className="divide-y">
                  {bankAccounts.map((account, index) => (
                    <div key={index} className="p-6 space-y-3">
                      <h3 className="font-semibold text-gray-900 text-lg mb-4">
                        {account.bank}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Hesap Adı</p>
                          <p className="text-sm font-medium text-gray-900">
                            {account.accountName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Şube</p>
                          <p className="text-sm font-medium text-gray-900">{account.branch}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">IBAN</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm font-mono bg-gray-50 px-3 py-2 rounded border">
                            {account.iban}
                          </code>
                          <button
                            onClick={() => copyToClipboard(account.iban, `iban-${index}`)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="IBAN'ı kopyala"
                          >
                            {copiedField === `iban-${index}` ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">SWIFT Kodu</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm font-mono bg-gray-50 px-3 py-2 rounded border">
                            {account.swift}
                          </code>
                          <button
                            onClick={() => copyToClipboard(account.swift, `swift-${index}`)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="SWIFT kodunu kopyala"
                          >
                            {copiedField === `swift-${index}` ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Receipt */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ödeme Dekontunu Yükleyin
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Ödemenizi yaptıktan sonra banka dekontunuzu veya havale/EFT alındı belgesini
                  yükleyin
                </p>

                <FileUpload
                  applicationId={params.applicationId as string}
                  fileType="supplementary"
                  label="Ödeme Dekontu"
                  description="Banka dekontu, havale/EFT makbuzu (PDF, JPG, PNG)"
                  required
                  onUploadSuccess={(file) => setUploadedReceipt(file)}
                  onUploadError={(err) => setError(err)}
                />

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmitReceipt}
                  disabled={!uploadedReceipt || submitting}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Dekontu Gönder
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Instructions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ödeme Talimatları</h3>

                <ol className="space-y-4 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Havale/EFT Yapın</p>
                      <p className="text-gray-600 text-xs">
                        Yukarıdaki hesaplardan birine <strong>{paymentAmount} ₺</strong> havale
                        veya EFT yapın
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      2
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Dekont Alın</p>
                      <p className="text-gray-600 text-xs">
                        Banka dekontunu veya havale makbuzunu alın
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      3
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Dekontu Yükleyin</p>
                      <p className="text-gray-600 text-xs">
                        Dekontun fotoğrafını veya PDF'ini sisteme yükleyin
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-xs">
                      4
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Onay Bekleyin</p>
                      <p className="text-gray-600 text-xs">
                        Ödemeniz 1-2 iş günü içinde kontrol edilip onaylanacaktır
                      </p>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Önemli:</strong> Açıklama kısmına başvuru numaranızı yazmayı unutmayın
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
