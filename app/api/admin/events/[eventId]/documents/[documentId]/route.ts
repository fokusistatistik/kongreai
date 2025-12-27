import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import prisma from '@/app/lib/prisma';

// PUT - Update a document
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, documentId } = params;
    const body = await request.json();

    // Check if document exists and belongs to this event
    const existingDocument = await prisma.congressDocument.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument || existingDocument.event_id !== eventId) {
      return NextResponse.json({ error: 'Döküman bulunamadı' }, { status: 404 });
    }

    // Update document
    const document = await prisma.congressDocument.update({
      where: { id: documentId },
      data: {
        baslik: body.baslik,
        aciklama: body.aciklama,
        dosya_url: body.dosya_url,
        dosya_tipi: body.dosya_tipi,
        dosya_boyut: body.dosya_boyut,
        kategori: body.kategori,
        yayinlandi: body.yayinlandi,
        sira: body.sira,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json(
      { error: 'Döküman güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string; documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['SUPER_ADMIN', 'ADMIN', 'ORGANIZATOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { eventId, documentId } = params;

    // Check if document exists and belongs to this event
    const existingDocument = await prisma.congressDocument.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument || existingDocument.event_id !== eventId) {
      return NextResponse.json({ error: 'Döküman bulunamadı' }, { status: 404 });
    }

    // Delete document
    await prisma.congressDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: 'Döküman başarıyla silindi' });
  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'Döküman silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
