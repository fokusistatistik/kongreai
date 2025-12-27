import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

// PUT - Update a gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; galleryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, galleryId } = params;
    const body = await request.json();

    const existingItem = await prisma.congressGallery.findUnique({
      where: { id: galleryId },
    });

    if (!existingItem || existingItem.event_id !== eventId) {
      return NextResponse.json({ error: 'Galeri öğesi bulunamadı' }, { status: 404 });
    }

    const galleryItem = await prisma.congressGallery.update({
      where: { id: galleryId },
      data: {
        baslik: body.baslik,
        aciklama: body.aciklama,
        medya_url: body.medya_url,
        medya_tipi: body.medya_tipi,
        thumbnail_url: body.thumbnail_url,
        kategori: body.kategori,
        yayinlandi: body.yayinlandi,
        sira: body.sira,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ galleryItem });
  } catch (error) {
    console.error('Gallery item update error:', error);
    return NextResponse.json(
      { error: 'Galeri öğesi güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; galleryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, galleryId } = params;

    const existingItem = await prisma.congressGallery.findUnique({
      where: { id: galleryId },
    });

    if (!existingItem || existingItem.event_id !== eventId) {
      return NextResponse.json({ error: 'Galeri öğesi bulunamadı' }, { status: 404 });
    }

    await prisma.congressGallery.delete({
      where: { id: galleryId },
    });

    return NextResponse.json({ message: 'Galeri öğesi başarıyla silindi' });
  } catch (error) {
    console.error('Gallery item deletion error:', error);
    return NextResponse.json(
      { error: 'Galeri öğesi silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
