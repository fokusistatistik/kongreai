import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Auth kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // package.json'dan versiyon bilgisi al
    let version = '1.0.0-beta';
    try {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
      );
      version = packageJson.version || version;
    } catch {
      // package.json okunamazsa default değer kullan
    }

    // Database istatistikleri
    const [
      toplamKullanici,
      toplamBirim,
      toplamRol,
      toplamYetki,
      sonAktiviteler
    ] = await Promise.all([
      prisma.personel.count(),
      prisma.birim.count(),
      prisma.rol.count(),
      prisma.yetki.count(),
      prisma.aktiviteLog.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          islem: true,
          tablo: true,
          personel_email: true,
          aciklama: true,
          created_at: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sistem: {
          versiyon: version,
          ortam: process.env.NODE_ENV || 'development',
          database: 'SQLite',
          nodeVersion: process.version,
          platform: process.platform
        },
        istatistikler: {
          toplamKullanici,
          toplamBirim,
          toplamRol,
          toplamYetki
        },
        sonAktiviteler
      }
    });
  } catch (error) {
    console.error('Sistem bilgi error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sistem bilgileri yüklenemedi'
      },
      { status: 500 }
    );
  }
}
