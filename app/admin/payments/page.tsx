import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, ArrowLeft, Calendar, User, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getPayments() {
  return await prisma.payment.findMany({
    orderBy: { created_at: 'desc' },
    take: 50,
    include: {
      application: {
        select: {
          user: {
            select: {
              ad: true,
              soyad: true,
              email: true,
            },
          },
          event: {
            select: {
              baslik: true,
            },
          },
        },
      },
    },
  });
}

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const payments = await getPayments();

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.durum === 'ODENDI').length,
    pending: payments.filter(p => p.durum === 'BEKLIYOR').length,
    failed: payments.filter(p => p.durum === 'RED' || p.durum === 'IPTAL').length,
    totalAmount: payments
      .filter(p => p.durum === 'ODENDI')
      .reduce((sum, p) => sum + p.tutar, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Paneline Dön
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-orange-600 rounded-lg">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Ödeme Yönetimi</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Etkinlik ödemelerini görüntüleyin</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Not:</strong> Ödeme işlemleri n8n webhook üzerinden yönetilmektedir.
            Bu sayfa sadece kayıtları görüntüleme amaçlıdır.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Toplam İşlem</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Tamamlanan</div>
            <div className="text-xl md:text-2xl font-bold text-green-600 mt-1">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Bekleyen</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4">
            <div className="text-xs md:text-sm text-gray-600">Başarısız</div>
            <div className="text-xl md:text-2xl font-bold text-red-600 mt-1">{stats.failed}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-4 col-span-2 md:col-span-1">
            <div className="text-xs md:text-sm text-gray-600">Toplam Tutar</div>
            <div className="text-xl md:text-2xl font-bold text-green-600 mt-1">
              ₺{stats.totalAmount.toLocaleString('tr-TR')}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Etkinlik
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Yöntem
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Tarih
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    İşlem ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Henüz ödeme kaydı bulunmuyor</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 md:gap-2">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hidden sm:block" />
                          <div className="text-xs md:text-sm">
                            <div className="font-medium text-gray-900">
                              {payment.application.user.ad} {payment.application.user.soyad}
                            </div>
                            <div className="text-gray-500 truncate max-w-[150px] md:max-w-none">{payment.application.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 hidden md:table-cell">
                        <div className="text-xs md:text-sm text-gray-900 max-w-xs truncate">
                          {payment.application?.event.baslik || '-'}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-semibold text-gray-900">
                          ₺{payment.tutar.toLocaleString('tr-TR')}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                          <CreditCard className="w-3 h-3 md:w-4 md:h-4" />
                          {payment.odeme_tipi || 'IYZICO'}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {payment.durum === 'ODENDI' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            <span className="hidden sm:inline">Ödendi</span>
                          </span>
                        )}
                        {payment.durum === 'BEKLIYOR' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">Bekliyor</span>
                          </span>
                        )}
                        {(payment.durum === 'RED' || payment.durum === 'IPTAL') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3" />
                            <span className="hidden sm:inline">{payment.durum === 'RED' ? 'Red' : 'İptal'}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                          {new Date(payment.created_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="text-xs font-mono text-gray-500 truncate max-w-[100px]">
                          {payment.islem_id || '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
