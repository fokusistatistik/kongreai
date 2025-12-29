import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, DollarSign, FileText, CheckCircle, Globe } from 'lucide-react';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/app/lib/auth/options';
import EventSubsectionsTabs from '@/components/event-subsections-tabs';
import EventAnnouncementsBanner from '@/components/event-announcements-banner';
import EventTimeline from '@/components/event-timeline';
import { sanitizeHTML } from '@/app/lib/sanitize';

async function getEvent(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      applications: {
        select: {
          id: true,
          user_id: true,
        },
      },
    },
  });

  return event;
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  const session = await getServerSession(authOptions);

  if (!event) {
    notFound();
  }

  const baslangic = new Date(event.baslangic_tarihi);
  const bitis = new Date(event.bitis_tarihi);
  const sonBasvuru = new Date(event.son_basvuru_tarihi);
  const today = new Date();

  const hasApplied = session?.user
    ? event.applications.some((app) => app.user_id === session.user.id)
    : false;

  const isDeadlinePassed = sonBasvuru < today;
  const canApply = event.basvuru_aktif && !isDeadlinePassed && !hasApplied;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner - Logo + Event Title */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0 container mx-auto px-4 z-10">
          <nav className="text-sm text-white/90">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span className="mx-2">/</span>
            <span className="text-white font-medium">Etkinlik Detayı</span>
          </nav>
        </div>

        {/* Logo + Event Title */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
              {event.logo_url && (
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-2xl max-w-md w-full">
                  <img
                    src={event.logo_url}
                    alt={`${event.baslik} Logo`}
                    className="w-full h-auto max-h-24 md:max-h-32 object-contain"
                  />
                </div>
              )}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg max-w-4xl">
                {event.baslik}
              </h1>
              {event.alt_baslik && (
                <p className="text-lg md:text-xl text-white/90 drop-shadow-md max-w-3xl">
                  {event.alt_baslik}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 md:py-8 -mt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements Banner */}
            <div className="relative z-10">
              <EventAnnouncementsBanner eventId={event.id} />
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 relative z-10">
              <div className="flex items-start justify-between mb-6">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {event.tip}
                </span>
                {event.durum === 'YAYINDA' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Başvurular Açık
                  </span>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8">
                <InfoItem
                  icon={<Calendar className="w-4 h-4 md:w-5 md:h-5" />}
                  label="Etkinlik Tarihi"
                  value={`${baslangic.toLocaleDateString('tr-TR')} - ${bitis.toLocaleDateString('tr-TR')}`}
                />
                <InfoItem
                  icon={<MapPin className="w-4 h-4 md:w-5 md:h-5" />}
                  label="Mekan"
                  value={event.yer}
                />
                <InfoItem
                  icon={<Clock className="w-4 h-4 md:w-5 md:h-5" />}
                  label="Son Başvuru"
                  value={sonBasvuru.toLocaleDateString('tr-TR')}
                  highlight={!isDeadlinePassed}
                />
                <InfoItem
                  icon={<DollarSign className="w-4 h-4 md:w-5 md:h-5" />}
                  label="Katılım Ücreti"
                  value={event.ucretsiz ? 'Ücretsiz' : `${event.ucret} ₺`}
                />
              </div>

              {/* Online Event Info */}
              {event.online && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">Online / Hybrid Etkinlik</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Bu etkinliğe online olarak da katılabilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              {event.aciklama && (
                <div className="prose max-w-none mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Etkinlik Hakkında</h2>
                  <div
                    className="text-sm md:text-base text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.aciklama) }}
                  />
                </div>
              )}

              {/* Objectives */}
              {event.amaclar_hedefler && (
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Amaçlar ve Hedefler</h2>
                  <div
                    className="text-sm md:text-base text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.amaclar_hedefler) }}
                  />
                </div>
              )}

              {/* Target Audience */}
              {event.hedef_kitle && (
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Hedef Kitle</h2>
                  <div
                    className="text-sm md:text-base text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.hedef_kitle) }}
                  />
                </div>
              )}

              {/* Scientific Program */}
              {event.bilimsel_program && (
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Bilimsel Program</h2>
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(event.bilimsel_program) }}
                  />
                </div>
              )}
            </div>

            {/* Event Timeline (Important Dates) */}
            <EventTimeline event={{
              baslangic_tarihi: event.baslangic_tarihi,
              bitis_tarihi: event.bitis_tarihi,
              son_basvuru_tarihi: event.son_basvuru_tarihi,
              erken_kayit_tarihi: event.erken_kayit_tarihi,
            }} />

            {/* Event Subsections (Documents, Results, Gallery, Schedule) */}
            <EventSubsectionsTabs eventId={event.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* CTA Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Başvuru</h3>

                {!session ? (
                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm mb-4">
                      Başvuru yapmak için giriş yapmanız gerekmektedir.
                    </p>
                    <Link
                      href="/login"
                      className="block w-full py-2.5 md:py-3 px-4 md:px-6 text-sm md:text-base bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full py-2.5 md:py-3 px-4 md:px-6 text-sm md:text-base border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
                    >
                      Üye Ol
                    </Link>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-3" />
                    <p className="font-medium text-gray-900 mb-2">Başvurunuz Alındı</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Bu etkinliğe daha önce başvuru yaptınız.
                    </p>
                    <Link
                      href="/dashboard"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Başvurularımı Görüntüle →
                    </Link>
                  </div>
                ) : isDeadlinePassed ? (
                  <div className="text-center py-4">
                    <Clock className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-900 mb-2">Başvuru Süresi Doldu</p>
                    <p className="text-sm text-gray-600">
                      Son başvuru tarihi geçmiştir.
                    </p>
                  </div>
                ) : canApply ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                      Başvuru yapabilirsiniz!
                    </div>
                    <Link
                      href={`/events/${event.slug}/apply`}
                      className="block w-full py-2.5 md:py-3 px-4 md:px-6 text-sm md:text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Başvuru Yap
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Başvurular şu anda kapalıdır.</p>
                  </div>
                )}
              </div>

              {/* Important Dates */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Önemli Tarihler</h3>
                <div className="space-y-3 text-sm">
                  <DateItem label="Son Başvuru Tarihi" date={sonBasvuru} />
                  {event.erken_kayit_tarihi && (
                    <DateItem label="Erken Kayıt Son Tarih" date={new Date(event.erken_kayit_tarihi)} />
                  )}
                  <DateItem label="Etkinlik Başlangıç" date={baslangic} />
                  <DateItem label="Etkinlik Bitiş" date={bitis} />
                </div>
              </div>

              {/* Pricing */}
              {!event.ucretsiz && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Ücretlendirme</h3>
                  <div className="space-y-2 text-sm">
                    <PriceItem label="Standart Kayıt" price={event.ucret} />
                    {event.erken_kayit_ucret && (
                      <PriceItem label="Erken Kayıt" price={event.erken_kayit_ucret} highlight />
                    )}
                    {event.ogrenci_ucret && (
                      <PriceItem label="Öğrenci" price={event.ogrenci_ucret} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoItem({ icon, label, value, highlight = false }: any) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
      <div className={`${highlight ? 'text-blue-600' : 'text-gray-600'} mt-0.5`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className={`font-semibold ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}

function DateItem({ label, date }: { label: string; date: Date }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{date.toLocaleDateString('tr-TR')}</span>
    </div>
  );
}

function PriceItem({ label, price, highlight = false }: any) {
  return (
    <div
      className={`flex justify-between items-center py-2 px-3 rounded ${
        highlight ? 'bg-green-50 border border-green-200' : ''
      }`}
    >
      <span className={highlight ? 'text-green-900 font-medium' : 'text-gray-600'}>{label}</span>
      <span className={`font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{price} ₺</span>
    </div>
  );
}
