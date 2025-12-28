import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Plus, ArrowLeft, Eye, Edit, MapPin, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getEvents() {
  return await prisma.event.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      slug: true,
      baslik: true,
      aciklama: true,
      baslangic_tarihi: true,
      bitis_tarihi: true,
      konum: true,
      sehir: true,
      durum: true,
      max_katilimci: true,
      created_at: true,
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin/login');
  }

  const user = session.user as any;

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const events = await getEvents();

  const stats = {
    total: events.length,
    active: events.filter(e => e.durum === 'YAYINDA').length,
    draft: events.filter(e => e.durum === 'TASLAK').length,
    completed: events.filter(e => e.durum === 'TAMAMLANDI').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Paneline Dön
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Etkinlik Yönetimi</h1>
                <p className="text-gray-600 mt-1">Tüm etkinlikleri görüntüleyin ve yönetin</p>
              </div>
            </div>
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Yeni Etkinlik
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Toplam Etkinlik</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Yayında</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Taslak</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.draft}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Tamamlandı</div>
            <div className="text-2xl font-bold text-gray-600 mt-1">{stats.completed}</div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz etkinlik yok</h3>
              <p className="text-gray-500 mb-6">İlk etkinliğinizi oluşturarak başlayın</p>
              <Link
                href="/admin/events/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Yeni Etkinlik Oluştur
              </Link>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.baslik}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{event.aciklama}</p>
                    </div>
                    <div className="ml-4">
                      {event.durum === 'YAYINDA' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Yayında
                        </span>
                      )}
                      {event.durum === 'TASLAK' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3" />
                          Taslak
                        </span>
                      )}
                      {event.durum === 'TAMAMLANDI' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <CheckCircle className="w-3 h-3" />
                          Tamamlandı
                        </span>
                      )}
                      {event.durum === 'IPTAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3" />
                          İptal
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.baslangic_tarihi).toLocaleDateString('tr-TR')} - {new Date(event.bitis_tarihi).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {event.konum}, {event.sehir}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {event._count.applications} başvuru
                      {event.max_katilimci && ` / ${event.max_katilimci} kontenjan`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Link
                      href={`/admin/events/${event.id}/manage`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Yönet
                    </Link>
                    <Link
                      href={`/events/${event.slug}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Görüntüle
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
