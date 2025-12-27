import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - List all published gallery items for an event (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    const medya_tipi = searchParams.get('medya_tipi');

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, durum: true },
    });

    if (!event || event.durum === 'TASLAK') {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    const where: any = {
      event_id: eventId,
      yayinlandi: true,
    };

    if (kategori) {
      where.kategori = kategori;
    }

    if (medya_tipi) {
      where.medya_tipi = medya_tipi;
    }

    const galleryItems = await prisma.congressGallery.findMany({
      where,
      select: {
        id: true,
        baslik: true,
        aciklama: true,
        medya_url: true,
        medya_tipi: true,
        thumbnail_url: true,
        kategori: true,
        sira: true,
        created_at: true,
      },
      orderBy: [{ sira: 'asc' }, { created_at: 'desc' }],
    });

    return NextResponse.json({ galleryItems });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json(
      { error: 'Galeri öğeleri getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
