#!/bin/bash

# Production Build Script
# test.fokusistatistik.com/kongreai için build oluşturur

set -e

echo "🏗️  Kongre Yönetim Sistemi - Production Build"
echo "==========================================="
echo ""

# Load production environment
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Production environment yüklendi"
else
    echo "⚠️  .env.production bulunamadı, varsayılan ayarlar kullanılacak"
fi

echo "📍 Base Path: ${NEXT_PUBLIC_BASE_PATH:-/}"
echo "🌐 URL: ${NEXT_PUBLIC_APP_URL:-N/A}"
echo ""

# Clean previous build
echo "🧹 Önceki build temizleniyor..."
rm -rf .next
echo "✅ Temizlendi"
echo ""

# Install dependencies
echo "📦 Dependencies kontrol ediliyor..."
npm install
echo "✅ Dependencies hazır"
echo ""

# Generate Prisma Client
echo "🔧 Prisma Client generate ediliyor..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
echo "✅ Prisma Client hazır"
echo ""

# Build Next.js application
echo "⚡ Next.js build başlıyor..."
npm run build
echo "✅ Build tamamlandı"
echo ""

echo "🎉 Production build başarıyla oluşturuldu!"
echo ""
echo "📦 Build çıktıları:"
echo "   - .next/ (Next.js build)"
echo "   - .next/standalone/ (standalone server)"
echo ""
echo "📌 Deployment adımları:"
echo "   1. .next/standalone/ klasörünü sunucuya kopyalayın"
echo "   2. .env.production dosyasını kopyalayın"
echo "   3. prisma/ klasörünü kopyalayın (production.db ile)"
echo "   4. node .next/standalone/server.js ile başlatın"
echo ""
echo "   VEYA"
echo ""
echo "   - npm start ile local'de test edin"
echo ""
