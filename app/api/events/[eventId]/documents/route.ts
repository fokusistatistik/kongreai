import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET - List all published documents for an event (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, durum: true },
    });

    if (!event || event.durum === 'TASLAK') {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    // Build query
    const where: any = {
      event_id: eventId,
      yayinlandi: true,
    };

    if (kategori) {
      where.kategori = kategori;
    }

    // Get published documents
    const documents = await prisma.congressDocument.findMany({
      where,
      select: {
        id: true,
        baslik: true,
        aciklama: true,
        dosya_url: true,
        dosya_tipi: true,
        dosya_boyut: true,
        kategori: true,
        sira: true,
        created_at: true,
      },
      orderBy: [{ sira: 'asc' }, { created_at: 'desc' }],
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json(
      { error: 'Dokümanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
