import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('yetki.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const yetkiler = await prisma.yetki.findMany({
      include: {
        roller: {
          include: {
            rol: true
          }
        }
      },
      orderBy: [{ kategori: 'asc' }, { kod: 'asc' }]
    });

    return NextResponse.json({ success: true, data: yetkiler });
  } catch (error) {
    console.error('Yetki GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await hasPermission('yetki.ekle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const yetki = await prisma.yetki.create({ data: body });

    return NextResponse.json({ success: true, data: yetki }, { status: 201 });
  } catch (error) {
    console.error('Yetki POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
