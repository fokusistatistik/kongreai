import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Auth kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Paralel olarak tüm istatistikleri çek
    const [
      toplamKullanici,
      aktifKullanici,
      toplamBirim,
      aktifBirim,
      toplamRol,
      aktifRol,
      sonKayitlar
    ] = await Promise.all([
      prisma.personel.count(),
      prisma.personel.count({ where: { aktif: true } }),
      prisma.birim.count(),
      prisma.birim.count({ where: { aktif: true } }),
      prisma.rol.count(),
      prisma.rol.count({ where: { aktif: true } }),
      prisma.personel.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          ad: true,
          soyad: true,
          created_at: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        kullanicilar: {
          toplam: toplamKullanici,
          aktif: aktifKullanici,
          pasif: toplamKullanici - aktifKullanici
        },
        birimler: {
          toplam: toplamBirim,
          aktif: aktifBirim,
          pasif: toplamBirim - aktifBirim
        },
        roller: {
          toplam: toplamRol,
          aktif: aktifRol,
          pasif: toplamRol - aktifRol
        },
        sistem: {
          durum: 'aktif',
          sonKayitlar: sonKayitlar.length
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'İstatistikler yüklenemedi',
        data: {
          kullanicilar: { toplam: 0, aktif: 0, pasif: 0 },
          birimler: { toplam: 0, aktif: 0, pasif: 0 },
          roller: { toplam: 0, aktif: 0, pasif: 0 },
          sistem: { durum: 'hata', sonKayitlar: 0 }
        }
      },
      { status: 500 }
    );
  }
}
