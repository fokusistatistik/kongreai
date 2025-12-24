import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, canManagePersonel } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'
import { logAktivite } from '@/lib/log'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const personel = await prisma.personel.findUnique({
      where: { id },
      include: { rol: true, birim: true, yonetici: true },
    })

    if (!personel) {
      return NextResponse.json({ error: 'Personel bulunamadı' }, { status: 404 })
    }

    const { password: _password, ...safePersonel } = personel
    return NextResponse.json({ success: true, data: safePersonel })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await canManagePersonel(id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { password, ...updateData } = body

    // Temizleme: Boş string olan (ama zorunlu olmayan) alanları null yap
    // Veya rol_id, birim_id gibi alanlar boş gelirse hata vermesini önlemek için sil
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '') {
        delete updateData[key];
      }
    });

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const updatedPersonel = await prisma.personel.update({
      where: { id },
      data: { ...updateData, updated_by_id: user.id },
      include: { rol: true, birim: true },
    })

    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'personel.guncelle',
      tablo: 'personel',
      kayit_id: id,
      aciklama: `Personel güncellendi: ${updatedPersonel.ad} ${updatedPersonel.soyad}`,
    })

    const { password: _, ...safe } = updatedPersonel
    return NextResponse.json({ success: true, data: safe })
  } catch (error: any) {
    console.error('Personel güncelleme hatası:', error)

    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return NextResponse.json({ error: `Doğrulama Hatası: ${messages}` }, { status: 400 })
    }

    // Prisma Unique Constraint Error (P2002)
    if (error.code === 'P2002') {
      const target = error.meta?.target || []
      const fieldName = Array.isArray(target) ? target.join(', ') : String(target)

      let message = 'Bu kayıt zaten mevcut'
      if (fieldName.includes('tc_kimlik_no')) message = 'Bu TC Kimlik No zaten kayıtlı'
      if (fieldName.includes('email')) message = 'Bu email adresi zaten kullanılıyor'

      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: error.message
    }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await canManagePersonel(id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.personel.delete({ where: { id } })

    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'personel.sil',
      tablo: 'personel',
      kayit_id: id,
      aciklama: `Personel silindi`,
    })

    return NextResponse.json({ success: true, message: 'Personel silindi' })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
