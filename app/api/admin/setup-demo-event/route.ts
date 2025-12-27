import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('Checking for existing events...');

    // Check for existing events
    const existingEvents = await prisma.event.findMany({
      select: {
        id: true,
        baslik: true,
      },
    });

    // If events exist, do nothing
    if (existingEvents.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Events already exist. No action taken.',
        existingEvents: existingEvents.map(e => ({ id: e.id, baslik: e.baslik })),
      });
    }

    // Create new demo event if none exists
    console.log('No events found. Creating demo event...');

    const demoEvent = await prisma.event.create({
        data: {
          slug: '1-uluslararasi-tip-kongresi-2026',
          baslik: '1. Uluslararası Tıp Kongresi 2026',
          aciklama: 'Tıp alanındaki en son gelişmelerin paylaşılacağı, ulusal ve uluslararası katılımcıların buluşacağı prestijli bir etkinlik.',
          detayli_aciklama: `# Kongre Hakkında

Bu kongre, tıp alanında çalışan akademisyenler, araştırmacılar ve sağlık profesyonelleri için benzersiz bir networking ve bilgi paylaşımı fırsatı sunmaktadır.

## Konular
- Dahiliye ve Alt Uzmanlıklar
- Cerrahi Bilimler
- Kadın Hastalıkları ve Doğum
- Çocuk Sağlığı ve Hastalıkları
- Halk Sağlığı
- Tıbbi Teknolojiler

## Kimler Katılmalı?
- Tıp Fakültesi Öğretim Üyeleri
- Araştırma Görevlileri
- Uzman Hekimler
- Tıp Fakültesi Öğrencileri`,
          baslangic_tarihi: new Date('2026-06-15T09:00:00Z'),
          bitis_tarihi: new Date('2026-06-17T18:00:00Z'),
          konum: 'İstanbul Kongre Merkezi',
          sehir: 'İstanbul',
          ulke: 'Türkiye',
          durum: 'YAYINDA',
          max_katilimci: 500,
          erken_kayit_ucreti: 750,
          standart_kayit_ucreti: 1000,
          ogrenci_kayit_ucreti: 500,
          erken_kayit_bitis: new Date('2026-03-31T23:59:59Z'),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

    // Create timeline items
    const timelineItems = [
        {
          event_id: demoEvent.id,
          baslik: 'Erken Kayıt Son Tarihi',
          aciklama: 'Erken kayıt indiriminden faydalanmak için son tarih',
          tarih: '2026-03-31',
          tip: 'BASVURU',
          ikon: '💰',
          yayinlandi: true,
          sira: 1,
        },
        {
          event_id: demoEvent.id,
          baslik: 'Bildiri Gönderme Son Tarihi',
          aciklama: 'Özet bildiri gönderimi için son tarih',
          tarih: '2026-04-30',
          tip: 'BILDIRI',
          ikon: '📄',
          yayinlandi: true,
          sira: 2,
        },
        {
          event_id: demoEvent.id,
          baslik: 'Bildiri Kabul Duyuruları',
          aciklama: 'Kabul edilen bildirilerin açıklanması',
          tarih: '2026-05-15',
          tip: 'SONUC',
          ikon: '✅',
          yayinlandi: true,
          sira: 3,
        },
        {
          event_id: demoEvent.id,
          baslik: 'Standart Kayıt Son Tarihi',
          aciklama: 'Normal ücret ile kayıt için son tarih',
          tarih: '2026-05-31',
          tip: 'BASVURU',
          ikon: '📝',
          yayinlandi: true,
          sira: 4,
        },
        {
          event_id: demoEvent.id,
          baslik: 'Kongre Başlangıç',
          aciklama: 'Kongrenin açılış töreni ve ilk oturumlar',
          tarih: '2026-06-15',
          tip: 'ETKINLIK',
          ikon: '🎉',
          yayinlandi: true,
          sira: 5,
        },
        {
          event_id: demoEvent.id,
          baslik: 'Sertifika Dağıtımı',
          aciklama: 'Katılım sertifikalarının dağıtılması',
          tarih: '2026-06-17',
          tip: 'ETKINLIK',
          ikon: '🏆',
          yayinlandi: true,
          sira: 6,
        },
    ];

    for (const item of timelineItems) {
      await prisma.eventTimeline.create({
        data: item,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo event created successfully with 2026 dates',
      event: {
        id: demoEvent.id,
        baslik: demoEvent.baslik,
        slug: demoEvent.slug,
        dates: `${demoEvent.baslangic_tarihi.toISOString().split('T')[0]} - ${demoEvent.bitis_tarihi.toISOString().split('T')[0]}`,
        durum: demoEvent.durum,
        timelineItems: timelineItems.length,
      },
    });
  } catch (error: any) {
    console.error('Error setting up demo event:', error);
    return NextResponse.json(
      { error: 'Failed to setup demo event', details: error.message },
      { status: 500 }
    );
  }
}
