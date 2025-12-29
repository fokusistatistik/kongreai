import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, ArrowRight, FileText } from 'lucide-react';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

async function getActiveEvents() {
  const now = new Date();

  // Get events that are active and accepting applications
  const events = await prisma.event.findMany({
    where: {
      durum: 'YAYINDA',
      son_basvuru_tarihi: {
        gte: now,
      },
    },
    orderBy: [
      { son_basvuru_tarihi: 'asc' },
      { baslangic_tarihi: 'asc' },
    ],
  });

  return events;
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  const events = await getActiveEvents();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return 'Süresi dolmuş';
    if (days === 1) return '1 gün kaldı';
    return `${days} gün kaldı`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Açık Etkinlikler
          </h1>
          <p className="text-gray-600">
            Başvuru kabul eden kongre ve etkinlikler
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Şu Anda Açık Etkinlik Bulunmuyor
            </h2>
            <p className="text-gray-600 mb-6">
              Yeni etkinlikler açıldığında burada görüntülenecektir.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                formatDate={formatDate}
                getTimeRemaining={getTimeRemaining}
                isLoggedIn={!!session}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({
  event,
  formatDate,
  getTimeRemaining,
  isLoggedIn,
}: {
  event: any;
  formatDate: (date: Date) => string;
  getTimeRemaining: (deadline: Date) => string;
  isLoggedIn: boolean;
}) {
  const timeRemaining = getTimeRemaining(event.son_basvuru_tarihi);
  const isUrgent = timeRemaining.includes('gün kaldı') && parseInt(timeRemaining) <= 7;

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300">
      {/* Event Type Badge */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
            {event.tip}
          </span>
          <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            {event.kapsam}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {event.baslik}
        </h3>
        {event.alt_baslik && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{event.alt_baslik}</p>
        )}
      </div>

      {/* Event Details */}
      <div className="p-4 space-y-3">
        {/* Location */}
        {(event.sehir || event.mekan) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">
              {event.sehir && event.mekan
                ? `${event.sehir}, ${event.mekan}`
                : event.sehir || event.mekan}
            </span>
          </div>
        )}

        {/* Event Dates */}
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-gray-700">
            <p>{formatDate(event.baslangic_tarihi)}</p>
            <p className="text-xs text-gray-500">
              {formatDate(event.bitis_tarihi)} tarihine kadar
            </p>
          </div>
        </div>

        {/* Application Deadline */}
        <div className="flex items-start gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-700">
              Son Başvuru: {formatDate(event.son_basvuru_tarihi)}
            </p>
            <p
              className={`text-xs font-medium ${
                isUrgent ? 'text-red-600' : 'text-orange-600'
              }`}
            >
              {timeRemaining}
            </p>
          </div>
        </div>

        {/* Description */}
        {event.aciklama && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-600 line-clamp-3"
               dangerouslySetInnerHTML={{ __html: event.aciklama.substring(0, 150) + '...' }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-gray-50 space-y-2">
        <Link
          href={`/events/${event.slug}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          Detayları Gör
        </Link>

        {isLoggedIn ? (
          <Link
            href={`/events/${event.slug}/apply`}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              isUrgent
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Başvuru Yap
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/login?redirect=/events/${event.slug}/apply`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Başvuru Yapmak İçin Giriş Yapın
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
