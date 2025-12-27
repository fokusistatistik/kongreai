import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { randomUUID } from 'crypto';

// GET - List all documents for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    // Get all documents for this event
    const documents = await prisma.congressDocument.findMany({
      where: { event_id: eventId },
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

// POST - Create a new document
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId } = params;
    const body = await request.json();

    const {
      baslik,
      aciklama,
      dosya_url,
      dosya_tipi,
      dosya_boyut,
      kategori,
      yayinlandi,
      sira,
    } = body;

    // Validation
    if (!baslik || !dosya_url || !dosya_tipi) {
      return NextResponse.json(
        { error: 'Başlık, dosya URL ve dosya tipi zorunludur' },
        { status: 400 }
      );
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Etkinlik bulunamadı' }, { status: 404 });
    }

    // Create document
    const document = await prisma.congressDocument.create({
      data: {
        id: randomUUID(),
        event_id: eventId,
        baslik,
        aciklama: aciklama || null,
        dosya_url,
        dosya_tipi,
        dosya_boyut: dosya_boyut || null,
        kategori: kategori || 'GENEL',
        yayinlandi: yayinlandi !== undefined ? yayinlandi : true,
        sira: sira || 0,
        created_by_email: session.user.email,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: 'Döküman oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
