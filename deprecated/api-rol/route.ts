import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('rol.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const roller = await prisma.rol.findMany({
      include: {
        yetkiler: {
          include: {
            yetki: true
          }
        },
        _count: {
          select: { personeller: true }
        }
      },
      orderBy: { seviye: 'desc' }
    })

    return NextResponse.json({ success: true, data: roller })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('rol.ekle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const rol = await prisma.rol.create({ data: body })

    return NextResponse.json({ success: true, data: rol }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
