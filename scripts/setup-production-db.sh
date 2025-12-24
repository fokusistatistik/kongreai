#!/bin/bash

# Production Database Setup Script
# Bu script production ortamında yeni database oluşturur ve seed yapar

set -e

echo "🚀 Kongre Yönetim Sistemi - Production Database Setup"
echo "=================================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production dosyası bulunamadı!"
    echo "Lütfen önce .env.production dosyasını oluşturun."
    exit 1
fi

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

echo "📊 Environment: $NODE_ENV"
echo "🗄️  Database: $DATABASE_URL"
echo ""

# Backup existing production.db if exists
if [ -f "prisma/production.db" ]; then
    BACKUP_FILE="prisma/production.db.backup-$(date +%Y%m%d-%H%M%S)"
    echo "📦 Mevcut database yedekleniyor: $BACKUP_FILE"
    cp prisma/production.db "$BACKUP_FILE"
    echo "✅ Yedek alındı"
    echo ""
fi

# Generate Prisma Client
echo "🔧 Prisma Client generate ediliyor..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
echo "✅ Prisma Client hazır"
echo ""

# Push schema to database (creates tables)
echo "📝 Database schema oluşturuluyor..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push --accept-data-loss
echo "✅ Schema oluşturuldu"
echo ""

# Create admin user
echo "👤 Admin kullanıcısı oluşturuluyor..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const prisma = new PrismaClient();

  try {
    const adminPassword = 'admin123'; // İlk giriş sonrası değiştirin!
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@kongreai.com' },
      update: {},
      create: {
        email: 'admin@kongreai.com',
        password: hashedPassword,
        ad: 'Admin',
        soyad: 'User',
        role: 'ADMIN',
        aktif: true,
        email_verified: true,
        ilk_giris: true,
      },
    });

    console.log('✅ Admin kullanıcısı oluşturuldu:');
    console.log('   Email: admin@kongreai.com');
    console.log('   Şifre: admin123 (ÖNEMLİ: İlk girişte değiştirin!)');

    await prisma.activityLog.create({
      data: {
        user_id: admin.id,
        user_email: admin.email,
        islem: 'system.init',
        tablo: 'users',
        kayit_id: admin.id,
        aciklama: 'Production database initialized with admin user',
      },
    });

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

createAdmin();
"
echo ""
echo "🎉 Production database hazır!"
echo ""
echo "📌 Sonraki adımlar:"
echo "   1. npm run build (production build)"
echo "   2. npm start (production server)"
echo "   3. https://test.fokusistatistik.com/kongreai adresinden giriş yapın"
echo "   4. admin@kongreai.com / admin123 ile giriş yapın"
echo "   5. ⚠️  ÖNEMLİ: İlk girişte şifrenizi değiştirin!"
echo ""
