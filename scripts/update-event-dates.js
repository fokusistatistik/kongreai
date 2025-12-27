// Update event dates to 2026
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateEventDates() {
  try {
    console.log('Checking for events...');

    // Get all events
    const events = await prisma.event.findMany({
      select: {
        id: true,
        baslik: true,
        baslangic_tarihi: true,
        bitis_tarihi: true,
        durum: true,
      },
    });

    console.log(`Found ${events.length} event(s)`);

    if (events.length === 0) {
      console.log('No events found. Creating a demo event...');

      // Create demo event with 2026 dates
      const demoEvent = await prisma.event.create({
        data: {
          slug: '1-uluslararasi-tip-kongresi-2026',
          baslik: '1. Uluslararası Tıp Kongresi 2026',
          aciklama: 'Tıp alanındaki en son gelişmelerin paylaşılacağı, ulusal ve uluslararası katılımcıların buluşacağı prestijli bir etkinlik.',
          detayli_aciklama: 'Bu kongre, tıp alanında çalışan akademisyenler, araştırmacılar ve sağlık profesyonelleri için bir araya gelme fırsatı sunmaktadır.',
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

      console.log('✅ Demo event created:', demoEvent.baslik);
      console.log('Event ID:', demoEvent.id);
      console.log('Slug:', demoEvent.slug);
      console.log('Start Date:', demoEvent.baslangic_tarihi);
      console.log('End Date:', demoEvent.bitis_tarihi);
      console.log('Status:', demoEvent.durum);

      // Create timeline items
      const timelineItems = [
        {
          baslik: 'Erken Kayıt Son Tarihi',
          aciklama: 'Erken kayıt indiriminden faydalanmak için son tarih',
          tarih: '2026-03-31',
          tip: 'BASVURU',
          ikon: '💰',
          yayinlandi: true,
          sira: 1,
        },
        {
          baslik: 'Bildiri Gönderme Son Tarihi',
          aciklama: 'Özet bildiri gönderimi için son tarih',
          tarih: '2026-04-30',
          tip: 'BILDIRI',
          ikon: '📄',
          yayinlandi: true,
          sira: 2,
        },
        {
          baslik: 'Bildiri Kabul Duyuruları',
          aciklama: 'Kabul edilen bildirilerin açıklanması',
          tarih: '2026-05-15',
          tip: 'SONUC',
          ikon: '✅',
          yayinlandi: true,
          sira: 3,
        },
        {
          baslik: 'Standart Kayıt Son Tarihi',
          aciklama: 'Normal ücret ile kayıt için son tarih',
          tarih: '2026-05-31',
          tip: 'BASVURU',
          ikon: '📝',
          yayinlandi: true,
          sira: 4,
        },
        {
          baslik: 'Kongre Başlangıç',
          aciklama: 'Kongrenin açılış töreni ve ilk oturumlar',
          tarih: '2026-06-15',
          tip: 'ETKINLIK',
          ikon: '🎉',
          yayinlandi: true,
          sira: 5,
        },
        {
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
          data: {
            ...item,
            event_id: demoEvent.id,
            id: undefined, // Let Prisma generate UUID
          },
        });
      }

      console.log(`✅ Created ${timelineItems.length} timeline items`);

    } else {
      // Update existing events
      for (const event of events) {
        console.log(`\nUpdating event: ${event.baslik}`);

        // Calculate new dates (move to 2026, keep month and day)
        const oldStart = new Date(event.baslangic_tarihi);
        const oldEnd = new Date(event.bitis_tarihi);

        const newStart = new Date(2026, oldStart.getMonth(), oldStart.getDate(), oldStart.getHours(), oldStart.getMinutes());
        const newEnd = new Date(2026, oldEnd.getMonth(), oldEnd.getDate(), oldEnd.getHours(), oldEnd.getMinutes());

        const updated = await prisma.event.update({
          where: { id: event.id },
          data: {
            baslangic_tarihi: newStart,
            bitis_tarihi: newEnd,
            durum: 'YAYINDA', // Make sure it's visible
            updated_at: new Date(),
          },
        });

        console.log(`  Old dates: ${oldStart.toISOString()} - ${oldEnd.toISOString()}`);
        console.log(`  New dates: ${newStart.toISOString()} - ${newEnd.toISOString()}`);
        console.log(`  Status: ${updated.durum}`);

        // Update timeline dates
        const timeline = await prisma.eventTimeline.findMany({
          where: { event_id: event.id },
        });

        for (const item of timeline) {
          const oldDate = new Date(item.tarih + 'T00:00:00Z');
          const newDate = new Date(2026, oldDate.getMonth(), oldDate.getDate());
          const newDateStr = newDate.toISOString().split('T')[0];

          await prisma.eventTimeline.update({
            where: { id: item.id },
            data: {
              tarih: newDateStr,
              yayinlandi: true, // Make sure it's visible
            },
          });
        }

        if (timeline.length > 0) {
          console.log(`  ✅ Updated ${timeline.length} timeline items`);
        }
      }
    }

    console.log('\n✅ All done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateEventDates();
