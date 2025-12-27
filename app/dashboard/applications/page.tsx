import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, Download } from 'lucide-react';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth/options';

async function getUserApplications(userId: string) {
  return await prisma.application.findMany({
    where: { user_id: userId },
    include: {
      event: true,
      payment: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const applications = await getUserApplications(session.user.id);

  // Statistics
  const stats = {
    total: applications.length,
    beklemede: applications.filter((a) => a.durum === 'BEKLEMEDE').length,
    hakemde: applications.filter((a) => a.durum === 'HAKEMDE').length,
    kabul: applications.filter((a) => a.durum === 'KABUL').length,
    red: applications.filter((a) => a.durum === 'RED').length,
    revizyon: applications.filter((a) => a.durum === 'REVIZYON').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            Başvurularım
          </h1>
          <p className="text-gray-600 mt-2">
            Tüm başvurularınızı görüntüleyin ve takip edin
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            title="Toplam"
            value={stats.total}
            icon={<FileText className="h-5 w-5" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Beklemede"
            value={stats.beklemede}
            icon={<Clock className="h-5 w-5" />}
            color="bg-yellow-500"
          />
          <StatCard
            title="Hakem'de"
            value={stats.hakemde}
            icon={<AlertCircle className="h-5 w-5" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Kabul"
            value={stats.kabul}
            icon={<CheckCircle className="h-5 w-5" />}
            color="bg-green-500"
          />
          <StatCard
            title="Red"
            value={stats.red}
            icon={<XCircle className="h-5 w-5" />}
            color="bg-red-500"
          />
          <StatCard
            title="Revizyon"
            value={stats.revizyon}
            icon={<AlertCircle className="h-5 w-5" />}
            color="bg-orange-500"
          />
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Henüz başvuru yapmadınız
            </h3>
            <p className="text-gray-500 mb-6">
              Aktif etkinliklere başvuru yaparak bilimsel çalışmalarınızı paylaşabilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Etkinliklere Göz At
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Etkinlik & Başvuru
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <ApplicationRow key={application.id} application={application} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Application Row Component
function ApplicationRow({ application }: { application: any }) {
  const statusConfig: any = {
    BEKLEMEDE: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
    HAKEMDE: { label: 'Hakem Değerlendirmesinde', color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="h-4 w-4" /> },
    KABUL: { label: 'Kabul Edildi', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
    RED: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
    REVIZYON: { label: 'Revizyon Gerekli', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle className="h-4 w-4" /> },
  };

  const paymentConfig: any = {
    BEKLIYOR: { label: 'Ödeme Bekleniyor', color: 'bg-yellow-100 text-yellow-800' },
    ODENDI: { label: 'Ödendi', color: 'bg-green-100 text-green-800' },
    IPTAL: { label: 'İptal', color: 'bg-gray-100 text-gray-800' },
  };

  const status = statusConfig[application.durum] || statusConfig.BEKLEMEDE;
  const paymentStatus = application.payment
    ? paymentConfig[application.payment.durum]
    : { label: 'Ödeme Yok', color: 'bg-gray-100 text-gray-800' };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <Link
            href={`/events/${application.event.slug}`}
            className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1 block"
          >
            {application.event.baslik}
          </Link>
          {application.baslik && (
            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
              <span className="font-medium">Başvuru:</span> {application.baslik}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {new Date(application.event.baslangic_tarihi).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {application.tip.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${status.color}`}>
          {status.icon}
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${paymentStatus.color}`}>
          {paymentStatus.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        <div className="flex flex-col">
          <span>{new Date(application.created_at).toLocaleDateString('tr-TR')}</span>
          <span className="text-xs text-gray-400">
            {new Date(application.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/dashboard/applications/${application.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            Detay
          </Link>
          {application.dosya_url && (
            <a
              href={application.dosya_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              İndir
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}
