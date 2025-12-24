import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('rol.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rol = await prisma.rol.findUnique({
      where: { id: params.id },
      include: {
        yetkiler: {
          include: {
            yetki: true
          }
        },
        _count: {
          select: { personeller: true }
        }
      }
    });

    if (!rol) {
      return NextResponse.json({ error: 'Rol not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rol });
  } catch (error) {
    console.error('Rol GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('rol.duzenle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { yetkiIds, ...rolData } = body;

    // Rol bilgilerini güncelle
    const rol = await prisma.rol.update({
      where: { id: params.id },
      data: rolData,
      include: {
        yetkiler: {
          include: {
            yetki: true
          }
        }
      }
    });

    // Eğer yetki listesi gönderildiyse, yetkileri güncelle
    if (yetkiIds !== undefined) {
      // Mevcut yetkileri sil
      await prisma.rolYetki.deleteMany({
        where: { rol_id: params.id }
      });

      // Yeni yetkileri ekle
      if (yetkiIds.length > 0) {
        await prisma.rolYetki.createMany({
          data: yetkiIds.map((yetkiId: string) => ({
            rol_id: params.id,
            yetki_id: yetkiId
          }))
        });
      }
    }

    // Güncellenmiş rolü döndür
    const updatedRol = await prisma.rol.findUnique({
      where: { id: params.id },
      include: {
        yetkiler: {
          include: {
            yetki: true
          }
        },
        _count: {
          select: { personeller: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: updatedRol });
  } catch (error) {
    console.error('Rol PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('rol.sil'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rol kullanımda mı kontrol et
    const personelCount = await prisma.personel.count({
      where: { rol_id: params.id }
    });

    if (personelCount > 0) {
      return NextResponse.json(
        { error: `Bu rol ${personelCount} kullanıcı tarafından kullanılıyor, silinemez` },
        { status: 400 }
      );
    }

    await prisma.rol.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true, message: 'Rol silindi' });
  } catch (error) {
    console.error('Rol DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
