'use client';

import { useMemo } from 'react';
import { Calendar, FileText, Award, Bell, Clock, CheckCircle, Flag, User } from 'lucide-react';

interface EventTimelineProps {
  event: {
    baslangic_tarihi: Date | string;
    bitis_tarihi: Date | string;
    son_basvuru_tarihi: Date | string;
    erken_kayit_tarihi?: Date | string | null;
  };
}

interface TimelineItem {
  id: string;
  baslik: string;
  aciklama?: string;
  tarih: Date;
  tip: string;
  ikon?: string;
  sira: number;
}

export default function EventTimeline({ event }: EventTimelineProps) {
  // Build timeline items from event dates
  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];

    // Early registration deadline (if exists)
    if (event.erken_kayit_tarihi) {
      items.push({
        id: 'erken-kayit',
        baslik: 'Erken Kayıt Son Tarihi',
        aciklama: 'Erken kayıt indiriminden yararlanmak için son tarih',
        tarih: new Date(event.erken_kayit_tarihi),
        tip: 'ERKEN_KAYIT',
        ikon: 'clock',
        sira: 1,
      });
    }

    // Application deadline
    items.push({
      id: 'son-basvuru',
      baslik: 'Son Başvuru Tarihi',
      aciklama: 'Etkinliğe başvuru için son tarih',
      tarih: new Date(event.son_basvuru_tarihi),
      tip: 'BASVURU',
      ikon: 'file',
      sira: 2,
    });

    // Event start date
    items.push({
      id: 'baslangic',
      baslik: 'Etkinlik Başlangıç Tarihi',
      aciklama: 'Etkinliğin başlama tarihi',
      tarih: new Date(event.baslangic_tarihi),
      tip: 'ETKINLIK_BASLANGIC',
      ikon: 'flag',
      sira: 3,
    });

    // Event end date
    items.push({
      id: 'bitis',
      baslik: 'Etkinlik Bitiş Tarihi',
      aciklama: 'Etkinliğin sona erme tarihi',
      tarih: new Date(event.bitis_tarihi),
      tip: 'ETKINLIK_BITIS',
      ikon: 'check',
      sira: 4,
    });

    // Sort by date (chronological order)
    return items.sort((a, b) => a.tarih.getTime() - b.tarih.getTime());
  }, [event]);

  const getIcon = (tip: string, ikon?: string) => {
    // Custom icon override
    if (ikon === 'award') return <Award className="w-5 h-5" />;
    if (ikon === 'bell') return <Bell className="w-5 h-5" />;
    if (ikon === 'clock') return <Clock className="w-5 h-5" />;
    if (ikon === 'check') return <CheckCircle className="w-5 h-5" />;
    if (ikon === 'file') return <FileText className="w-5 h-5" />;
    if (ikon === 'flag') return <Flag className="w-5 h-5" />;

    // Default based on type
    switch (tip) {
      case 'ERKEN_KAYIT':
        return <Clock className="w-5 h-5" />;
      case 'BASVURU':
        return <FileText className="w-5 h-5" />;
      case 'ETKINLIK_BASLANGIC':
        return <Flag className="w-5 h-5" />;
      case 'ETKINLIK_BITIS':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getStyles = (tip: string) => {
    switch (tip) {
      case 'ERKEN_KAYIT':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-900',
          icon: 'text-orange-600',
          dot: 'bg-orange-600',
        };
      case 'BASVURU':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600',
          dot: 'bg-blue-600',
        };
      case 'ETKINLIK_BASLANGIC':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-900',
          icon: 'text-indigo-600',
          dot: 'bg-indigo-600',
        };
      case 'ETKINLIK_BITIS':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          icon: 'text-green-600',
          dot: 'bg-green-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-900',
          icon: 'text-gray-600',
          dot: 'bg-gray-600',
        };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isDatePassed = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  if (timeline.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Önemli Tarihler</h2>

      <div className="space-y-4">
        {timeline.map((item, index) => {
          const styles = getStyles(item.tip);
          const passed = isDatePassed(item.tarih);

          return (
            <div key={item.id} className="relative">
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div className="absolute left-[15px] top-10 bottom-[-16px] w-0.5 bg-gray-200"></div>
              )}

              {/* Timeline item */}
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.dot} flex items-center justify-center relative z-10`}>
                  <div className="text-white">
                    {getIcon(item.tip, item.ikon)}
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 ${passed ? 'opacity-60' : ''}`}>
                  <div className={`${styles.bg} ${styles.border} border rounded-lg p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold ${styles.text}`}>{item.baslik}</h3>
                      {passed && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Geçti
                        </span>
                      )}
                    </div>

                    <p className={`text-sm font-semibold ${styles.icon} mb-1`}>
                      📅 {formatDate(item.tarih)}
                    </p>

                    {item.aciklama && (
                      <p className={`text-sm ${styles.text} mt-2`}>
                        {item.aciklama}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
