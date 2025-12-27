'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, Award, Bell, Clock, CheckCircle } from 'lucide-react';

interface EventTimelineProps {
  eventId: string;
}

interface TimelineItem {
  id: string;
  baslik: string;
  aciklama?: string;
  tarih: string; // YYYY-MM-DD
  tip: string;
  ikon?: string;
  sira: number;
}

export default function EventTimeline({ eventId }: EventTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/timeline`);
        if (res.ok) {
          const data = await res.json();
          setTimeline(data.timeline || []);
        }
      } catch (error) {
        console.error('Timeline fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchTimeline();
    }
  }, [eventId]);

  const getIcon = (tip: string, ikon?: string) => {
    // Custom icon override
    if (ikon === 'award') return <Award className="w-5 h-5" />;
    if (ikon === 'bell') return <Bell className="w-5 h-5" />;
    if (ikon === 'clock') return <Clock className="w-5 h-5" />;
    if (ikon === 'check') return <CheckCircle className="w-5 h-5" />;
    if (ikon === 'file') return <FileText className="w-5 h-5" />;

    // Default based on type
    switch (tip) {
      case 'BILDIRI':
        return <FileText className="w-5 h-5" />;
      case 'SONUC':
        return <Award className="w-5 h-5" />;
      case 'DUYURU':
        return <Bell className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const getStyles = (tip: string) => {
    switch (tip) {
      case 'BILDIRI':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-900',
          icon: 'text-purple-600',
          dot: 'bg-purple-600',
        };
      case 'SONUC':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-900',
          icon: 'text-green-600',
          dot: 'bg-green-600',
        };
      case 'DUYURU':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-900',
          icon: 'text-yellow-600',
          dot: 'bg-yellow-600',
        };
      case 'BASVURU':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: 'text-blue-600',
          dot: 'bg-blue-600',
        };
      case 'ETKINLIK':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-900',
          icon: 'text-indigo-600',
          dot: 'bg-indigo-600',
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isDatePassed = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (loading || timeline.length === 0) {
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
