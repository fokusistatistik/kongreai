import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';
import { randomUUID } from 'crypto';

// GET - List all gallery items for an event
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

    const galleryItems = await prisma.congressGallery.findMany({
      where: { event_id: eventId },
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

// POST - Create a new gallery item
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
      medya_url,
      medya_tipi,
      thumbnail_url,
      kategori,
      yayinlandi,
      sira,
    } = body;

    if (!medya_url || !medya_tipi) {
      return NextResponse.json(
        { error: 'Medya URL ve medya tipi zorunludur' },
        { status: 400 }
      );
    }

    const galleryItem = await prisma.congressGallery.create({
      data: {
        id: randomUUID(),
        event_id: eventId,
        baslik: baslik || null,
        aciklama: aciklama || null,
        medya_url,
        medya_tipi,
        thumbnail_url: thumbnail_url || null,
        kategori: kategori || 'GENEL',
        yayinlandi: yayinlandi !== undefined ? yayinlandi : true,
        sira: sira || 0,
        uploaded_by_email: session.user.email,
      },
    });

    return NextResponse.json({ galleryItem }, { status: 201 });
  } catch (error) {
    console.error('Gallery item creation error:', error);
    return NextResponse.json(
      { error: 'Galeri öğesi oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
