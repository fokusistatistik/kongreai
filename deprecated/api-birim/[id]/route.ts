import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('birim.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const birim = await prisma.birim.findUnique({
      where: { id: params.id },
      include: {
        ust_birim: true,
        alt_birimler: true,
        _count: {
          select: { personeller: true }
        }
      }
    })

    if (!birim) {
      return NextResponse.json({ error: 'Birim bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: birim })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('birim.duzenle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const birim = await prisma.birim.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json({ success: true, data: birim })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('birim.sil'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if birim has personnel
    const personelCount = await prisma.personel.count({
      where: { birim_id: params.id }
    })

    if (personelCount > 0) {
      return NextResponse.json(
        { error: 'Bu birimde personel bulunmaktadır. Önce personelleri başka birime aktarın.' },
        { status: 400 }
      )
    }

    await prisma.birim.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Birim silindi' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
