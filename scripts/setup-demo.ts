/**
 * Setup Demo - Creates event_timeline table and seeds demo data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createEventTimelineTable() {
  console.log('📋 Creating event_timeline table...\n');

  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS event_timeline (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        baslik TEXT NOT NULL,
        aciklama TEXT,
        tarih TEXT NOT NULL,
        tip TEXT NOT NULL DEFAULT 'ONEMLI',
        ikon TEXT,
        yayinlandi INTEGER NOT NULL DEFAULT 1,
        sira INTEGER NOT NULL DEFAULT 0,
        created_by_email TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES Event(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_event_timeline_event_id ON event_timeline(event_id)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_event_timeline_tip ON event_timeline(tip)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_event_timeline_tarih ON event_timeline(tarih)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_event_timeline_yayinlandi ON event_timeline(yayinlandi)`;

    console.log('✅ event_timeline table created successfully\n');
  } catch (error) {
    console.log('ℹ️  Table may already exist, continuing...\n');
  }
}

async function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n');

  // 1. CREATE ADMIN USER
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@kongreai.com' },
  });

  let admin;
  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping...\n');
    admin = existingAdmin;
  } else {
    admin = await prisma.user.create({
      data: {
        email: 'admin@kongreai.com',
        password: adminPassword,
        ad: 'Admin',
        soyad: 'Yönetici',
        unvan: 'Sistem Yöneticisi',
        kurum: 'KongreAI Platform',
        telefon: '0555 000 0001',
        role: 'ADMIN',
        aktif: true,
        email_verified: true,
        ilk_giris: false,
      },
    });
    console.log(`✅ Admin created: ${admin.email} (Password: admin123)\n`);
  }

  // 2. CREATE DEMO USERS
  console.log('👥 Creating demo users...');
  const user1Password = await bcrypt.hash('demo123', 10);

  const existingUser1 = await prisma.user.findUnique({
    where: { email: 'ahmet.yilmaz@example.com' },
  });

  let user1;
  if (existingUser1) {
    console.log('ℹ️  User 1 already exists, skipping...');
    user1 = existingUser1;
  } else {
    user1 = await prisma.user.create({
      data: {
        email: 'ahmet.yilmaz@example.com',
        password: user1Password,
        ad: 'Ahmet',
        soyad: 'Yılmaz',
        unvan: 'Doç. Dr.',
        kurum: 'İstanbul Üniversitesi',
        telefon: '0555 111 2222',
        role: 'KATILIMCI',
        aktif: true,
        email_verified: true,
        ilk_giris: false,
      },
    });
    console.log(`✅ User 1 created: ${user1.email} (Password: demo123)`);
  }

  const user2Password = await bcrypt.hash('demo123', 10);

  const existingUser2 = await prisma.user.findUnique({
    where: { email: 'ayse.kaya@example.com' },
  });

  let user2;
  if (existingUser2) {
    console.log('ℹ️  User 2 already exists, skipping...\n');
    user2 = existingUser2;
  } else {
    user2 = await prisma.user.create({
      data: {
        email: 'ayse.kaya@example.com',
        password: user2Password,
        ad: 'Ayşe',
        soyad: 'Kaya',
        unvan: 'Prof. Dr.',
        kurum: 'Ankara Üniversitesi',
        telefon: '0555 333 4444',
        role: 'KATILIMCI',
        aktif: true,
        email_verified: true,
        ilk_giris: false,
      },
    });
    console.log(`✅ User 2 created: ${user2.email} (Password: demo123)\n`);
  }

  // 3. CREATE DEMO EVENT
  console.log('📅 Creating demo event...');

  const existingEvent = await prisma.event.findUnique({
    where: { slug: '1-uluslararasi-tip-kongresi-2025' },
  });

  let event;
  if (existingEvent) {
    console.log('ℹ️  Event already exists, skipping...\n');
    event = existingEvent;
  } else {
    event = await prisma.event.create({
      data: {
        slug: '1-uluslararasi-tip-kongresi-2025',
        baslik: '1. Uluslararası Tıp Kongresi 2025',
        alt_baslik: 'Modern Tıp ve Teknoloji Buluşması',
        tip: 'KONGRE',
        aciklama: `
          <h3>Kongre Hakkında</h3>
          <p>1. Uluslararası Tıp Kongresi, tıp dünyasının önde gelen isimlerini bir araya getiren prestijli bir etkinliktir.</p>
          <p>Bu yıl, modern tıbbın en güncel gelişmeleri, yapay zeka uygulamaları ve yeni tedavi yöntemleri ele alınacaktır.</p>

          <h4>Kongre Temaları:</h4>
          <ul>
            <li>Yapay Zeka ve Tıp</li>
            <li>Kişiselleştirilmiş Tedavi Yaklaşımları</li>
            <li>Telemedicine ve Dijital Sağlık</li>
            <li>Gen Tedavileri ve Biyoteknoloji</li>
            <li>Pandemi Sonrası Sağlık Sistemleri</li>
          </ul>
        `,
        baslangic_tarihi: new Date('2025-05-15'),
        bitis_tarihi: new Date('2025-05-18'),
        son_basvuru_tarihi: new Date('2025-03-31'),
        erken_kayit_tarihi: new Date('2025-02-28'),
        yer: 'İstanbul Kongre ve Sergi Merkezi',
        adres: 'Yeşilköy Mah. Atatürk Cad. No:12 Bakırköy/İstanbul',
        online: true,
        online_link: 'https://zoom.us/j/kongreai2025',
        ucret: 750,
        para_birimi: 'TRY',
        erken_kayit_ucret: 500,
        ogrenci_ucret: 250,
        ucretsiz: false,
        gorsel_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
        amaclar_hedefler: `
          <p>Kongremizin temel amaçları:</p>
          <ul>
            <li>Tıp alanındaki en son gelişmeleri paylaşmak</li>
            <li>Uluslararası işbirliği fırsatları yaratmak</li>
            <li>Genç araştırmacıları desteklemek</li>
            <li>Multidisipliner yaklaşımları teşvik etmek</li>
          </ul>
        `,
        hedef_kitle: `
          <p>Kongremiz aşağıdaki katılımcıları hedeflemektedir:</p>
          <ul>
            <li>Tıp Fakültesi Öğretim Üyeleri</li>
            <li>Uzman Hekimler ve Asistanlar</li>
            <li>Araştırmacılar ve Doktora Öğrencileri</li>
            <li>Sağlık Yöneticileri</li>
            <li>Tıbbi Teknoloji Geliştiricileri</li>
          </ul>
        `,
        bilimsel_program: `
          <h4>Program Özeti:</h4>
          <p><strong>15 Mayıs:</strong> Açılış Töreni ve Ana Oturum</p>
          <p><strong>16-17 Mayıs:</strong> Paralel Oturumlar ve Poster Sunumları</p>
          <p><strong>18 Mayıs:</strong> Workshop'lar ve Kapanış Töreni</p>
        `,
        durum: 'YAYINDA',
        basvuru_aktif: true,
        max_katilimci: 500,
        sertifika_aktif: true,
        created_by_id: admin.id,
      },
    });
    console.log(`✅ Event created: ${event.baslik}\n`);
  }

  // 4. CREATE TIMELINE ITEMS FOR THE EVENT
  console.log('⏰ Creating timeline items...');

  const timelineItems = [
    {
      baslik: 'Erken Kayıt Son Tarihi',
      aciklama: 'Erken kayıt indiriminden yararlanmak için son tarih',
      tarih: '2025-02-28',
      tip: 'BASVURU',
      ikon: 'clock',
      yayinlandi: true,
      sira: 0,
    },
    {
      baslik: 'Bildiri Gönderme Son Tarihi',
      aciklama: 'Bildiri özetlerinin sistem üzerinden gönderilmesi için son tarih',
      tarih: '2025-03-15',
      tip: 'BILDIRI',
      ikon: 'file',
      yayinlandi: true,
      sira: 1,
    },
    {
      baslik: 'Başvuru Son Tarihi',
      aciklama: 'Kongreye katılım başvurusu için son tarih',
      tarih: '2025-03-31',
      tip: 'BASVURU',
      ikon: 'calendar',
      yayinlandi: true,
      sira: 2,
    },
    {
      baslik: 'Kabul Edilen Bildirilerin Açıklanması',
      aciklama: 'Kabul edilen bildiri sonuçları e-posta ile bildirilecektir',
      tarih: '2025-04-15',
      tip: 'SONUC',
      ikon: 'award',
      yayinlandi: true,
      sira: 3,
    },
    {
      baslik: 'Kesin Kayıt Son Tarihi',
      aciklama: 'Katılımcıların kesin kayıt ve ödeme yapması için son tarih',
      tarih: '2025-04-30',
      tip: 'ONEMLI',
      ikon: 'check',
      yayinlandi: true,
      sira: 4,
    },
    {
      baslik: 'Kongre Başlangıç Tarihi',
      aciklama: '1. Uluslararası Tıp Kongresi başlıyor!',
      tarih: '2025-05-15',
      tip: 'ETKINLIK',
      ikon: 'calendar',
      yayinlandi: true,
      sira: 5,
    },
    {
      baslik: 'Kongre Bitiş Tarihi',
      aciklama: 'Kapanış töreni ve sertifika dağıtımı',
      tarih: '2025-05-18',
      tip: 'ETKINLIK',
      ikon: 'award',
      yayinlandi: true,
      sira: 6,
    },
  ];

  for (const item of timelineItems) {
    // Check if timeline item already exists
    const existing = await prisma.eventTimeline.findFirst({
      where: {
        event_id: event.id,
        baslik: item.baslik,
      },
    });

    if (!existing) {
      await prisma.eventTimeline.create({
        data: {
          ...item,
          event_id: event.id,
          created_by_email: admin.email,
        },
      });
      console.log(`  ✓ ${item.baslik}`);
    } else {
      console.log(`  ℹ️  ${item.baslik} (already exists)`);
    }
  }

  console.log('\n✨ Demo data setup completed successfully!\n');
  console.log('='.repeat(60));
  console.log('LOGIN CREDENTIALS:');
  console.log('='.repeat(60));
  console.log('\n👤 ADMIN:');
  console.log('   Email: admin@kongreai.com');
  console.log('   Password: admin123');
  console.log('   Role: ADMIN');
  console.log('\n👤 DEMO USER 1:');
  console.log('   Email: ahmet.yilmaz@example.com');
  console.log('   Password: demo123');
  console.log('   Role: KATILIMCI (Participant)');
  console.log('   Institution: İstanbul Üniversitesi');
  console.log('\n👤 DEMO USER 2:');
  console.log('   Email: ayse.kaya@example.com');
  console.log('   Password: demo123');
  console.log('   Role: KATILIMCI (Participant)');
  console.log('   Institution: Ankara Üniversitesi');
  console.log('\n📅 DEMO EVENT:');
  console.log('   Title: 1. Uluslararası Tıp Kongresi 2025');
  console.log('   Slug: 1-uluslararasi-tip-kongresi-2025');
  console.log('   URL: /events/1-uluslararasi-tip-kongresi-2025');
  console.log('   Timeline Items: 7 important dates');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  await createEventTimelineTable();
  await seedDemoData();
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
