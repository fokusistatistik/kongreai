import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('birim.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const birimler = await prisma.birim.findMany({
      include: {
        ust_birim: true,
        alt_birimler: true,
        _count: {
          select: { personeller: true }
        }
      },
      orderBy: { ad: 'asc' }
    })

    return NextResponse.json({ success: true, data: birimler })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('birim.ekle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const birim = await prisma.birim.create({ data: body })

    return NextResponse.json({ success: true, data: birim }, { status: 201 })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
