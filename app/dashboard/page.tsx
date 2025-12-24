import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, CreditCard } from 'lucide-react';
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

async function getAvailableEvents() {
  const today = new Date();
  return await prisma.event.findMany({
    where: {
      durum: 'YAYINDA',
      basvuru_aktif: true,
      son_basvuru_tarihi: { gte: today },
    },
    orderBy: { son_basvuru_tarihi: 'asc' },
    take: 3,
  });
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const applications = await getUserApplications(session.user.id);
  const availableEvents = await getAvailableEvents();

  // İstatistikler
  const stats = {
    total: applications.length,
    beklemede: applications.filter((a) => a.durum === 'BEKLEMEDE').length,
    kabul: applications.filter((a) => a.durum === 'KABUL').length,
    red: applications.filter((a) => a.durum === 'RED').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hoş Geldiniz, {session.user.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Başvurularınızı yönetin ve yeni etkinliklere katılın
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Profil Ayarları
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          title="Toplam Başvuru"
          value={stats.total}
          color="bg-blue-500"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Beklemede"
          value={stats.beklemede}
          color="bg-yellow-500"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Kabul Edildi"
          value={stats.kabul}
          color="bg-green-500"
        />
        <StatCard
          icon={<XCircle className="w-6 h-6" />}
          title="Reddedildi"
          value={stats.red}
          color="bg-red-500"
        />
      </div>

      {/* Available Events */}
      {availableEvents.length > 0 && (
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Başvuru Yapabileceğiniz Etkinlikler</h2>
              <p className="text-gray-600 text-sm mt-1">Son başvuru tarihi yaklaşan etkinlikler</p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
            >
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableEvents.map((event) => {
              const hasApplied = applications.some((app) => app.event_id === event.id);
              return (
                <QuickEventCard key={event.id} event={event} hasApplied={hasApplied} />
              );
            })}
          </div>
        </section>
      )}

      {/* Applications Table */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Başvurularım</h2>
          <p className="text-gray-600 text-sm mt-1">Tüm başvurularınızın durumunu buradan takip edebilirsiniz</p>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz başvuru yapmadınız</h3>
            <p className="text-gray-500 mb-6">
              Aktif etkinliklere başvuru yaparak bilimsel çalışmalarınızı paylaşabilirsiniz.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Etkinliklere Göz At
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Etkinlik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başvuru Tipi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başvuru Tarihi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <ApplicationRow key={application.id} application={application} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Quick Event Card Component
function QuickEventCard({ event, hasApplied }: { event: any; hasApplied: boolean }) {
  const sonBasvuru = new Date(event.son_basvuru_tarihi);
  const today = new Date();
  const daysLeft = Math.ceil((sonBasvuru.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{event.baslik}</h3>
        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded shrink-0">
          {event.tip}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <Calendar className="w-4 h-4" />
        <span className="text-xs">
          Son başvuru: {sonBasvuru.toLocaleDateString('tr-TR')}
        </span>
      </div>
      {daysLeft <= 7 && (
        <div className="mb-3 flex items-center gap-1 text-orange-600 text-xs font-medium">
          <AlertCircle className="w-4 h-4" />
          {daysLeft} gün kaldı!
        </div>
      )}
      {hasApplied ? (
        <div className="text-center py-2 bg-gray-100 text-gray-600 rounded text-sm font-medium">
          Başvuru Yapıldı
        </div>
      ) : (
        <Link
          href={`/events/${event.slug}`}
          className="block text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Başvur
        </Link>
      )}
    </div>
  );
}

// Application Row Component
function ApplicationRow({ application }: { application: any }) {
  const statusConfig: any = {
    BEKLEMEDE: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
    HAKEMDE: { label: 'Hakem Değerlendirmesinde', color: 'bg-blue-100 text-blue-800' },
    KABUL: { label: 'Kabul Edildi', color: 'bg-green-100 text-green-800' },
    RED: { label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
    REVIZYON: { label: 'Revizyon Gerekli', color: 'bg-orange-100 text-orange-800' },
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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-start gap-3">
          <div>
            <Link
              href={`/events/${application.event.slug}`}
              className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
            >
              {application.event.baslik}
            </Link>
            {application.baslik && (
              <p className="text-sm text-gray-500 line-clamp-1 mt-1">{application.baslik}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{application.tip.replace('_', ' ')}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatus.color}`}>
          {paymentStatus.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(application.created_at).toLocaleDateString('tr-TR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link
          href={`/dashboard/applications/${application.id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          Detay
        </Link>
      </td>
    </tr>
  );
}
