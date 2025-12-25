import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('123456', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'emrebostanoglu@gmail.com' },
    update: {},
    create: {
      email: 'emrebostanoglu@gmail.com',
      password: superAdminPassword,
      ad: 'Emre',
      soyad: 'Bostanoğlu',
      role: 'SUPER_ADMIN',
      aktif: true,
      email_verified: true,
      ilk_giris: false,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  // Create sample regular admin
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kongreai.com' },
    update: {},
    create: {
      email: 'admin@kongreai.com',
      password: adminPassword,
      ad: 'Admin',
      soyad: 'User',
      role: 'ADMIN',
      aktif: true,
      email_verified: true,
      ilk_giris: false,
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create sample reviewer
  const hakemPassword = await bcrypt.hash('hakem123', 12);

  const hakem = await prisma.user.upsert({
    where: { email: 'hakem@kongreai.com' },
    update: {},
    create: {
      email: 'hakem@kongreai.com',
      password: hakemPassword,
      ad: 'Hakem',
      soyad: 'User',
      unvan: 'Prof. Dr.',
      kurum: 'Örnek Üniversite',
      role: 'HAKEM',
      aktif: true,
      email_verified: true,
      ilk_giris: false,
    },
  });

  console.log('✅ Hakem created:', hakem.email);

  // Create sample participant
  const katilimciPassword = await bcrypt.hash('user123', 12);

  const katilimci = await prisma.user.upsert({
    where: { email: 'user@kongreai.com' },
    update: {},
    create: {
      email: 'user@kongreai.com',
      password: katilimciPassword,
      ad: 'Test',
      soyad: 'Kullanıcı',
      role: 'KATILIMCI',
      aktif: true,
      email_verified: true,
      ilk_giris: false,
    },
  });

  console.log('✅ Katılımcı created:', katilimci.email);

  console.log('\n📋 Login Credentials:');
  console.log('==========================================');
  console.log('SUPER ADMIN:');
  console.log('  Email: emrebostanoglu@gmail.com');
  console.log('  Password: 123456');
  console.log('');
  console.log('ADMIN:');
  console.log('  Email: admin@kongreai.com');
  console.log('  Password: admin123');
  console.log('');
  console.log('HAKEM:');
  console.log('  Email: hakem@kongreai.com');
  console.log('  Password: hakem123');
  console.log('');
  console.log('KATILIMCI:');
  console.log('  Email: user@kongreai.com');
  console.log('  Password: user123');
  console.log('==========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
