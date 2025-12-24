import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions'
import { prisma } from '@/lib/prisma'
import { logAktivite } from '@/lib/log'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Validation schema
const personelSchema = z.object({
  tc_kimlik_no: z.string().length(11, 'TC Kimlik No 11 karakter olmalıdır'),
  ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır').max(50),
  soyad: z.string().min(2, 'Soyad en az 2 karakter olmalıdır').max(50),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır').optional(),
  telefon: z.string().min(10, 'Telefon numarası geçersiz'),
  rol_id: z.string().uuid('Geçerli bir rol seçiniz'),
  birim_id: z.string().uuid('Geçerli bir birim seçiniz'),
  yonetici_id: z.string().uuid().optional().nullable(),
  unvan: z.string().max(100).optional().nullable(),
  sicil_no: z.string().max(50).optional().nullable(),
  dogum_tarihi: z.string().optional().nullable(),
  cinsiyet: z.enum(['ERKEK', 'KADIN', 'BELIRTMEK_ISTEMIYORUM']).optional().nullable(),
  adres: z.string().optional().nullable(),
  il: z.string().max(50).optional().nullable(),
  ilce: z.string().max(50).optional().nullable(),
  ise_baslama_tarihi: z.string().optional().nullable(),
  sozlesme_turu: z.enum(['KADROLU', 'SOZLESMELI', 'GECICI', 'STAJYER']).optional().nullable(),
  acil_durum_kisi: z.string().max(100).optional().nullable(),
  acil_durum_telefon: z.string().max(15).optional().nullable(),
  aktif: z.boolean().optional(),
  notlar: z.string().optional().nullable(),
})

/**
 * GET /api/personel
 * List all personel with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Yetki kontrolü
    if (!(await hasPermission('personel.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Query parameters
    const { searchParams } = new URL(request.url)
    const birimId = searchParams.get('birim_id')
    const rolId = searchParams.get('rol_id')
    const aktif = searchParams.get('aktif')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      birim_id?: string;
      rol_id?: string;
      aktif?: boolean;
      OR?: any[];
    } = {}

    // Birim yöneticisi sadece kendi birimini görebilir
    if (user.rol.kod === 'BIRIM_YONETICISI') {
      where.birim_id = user.birim_id
    } else if (birimId) {
      where.birim_id = birimId
    }

    if (rolId) {
      where.rol_id = rolId
    }

    if (aktif !== null) {
      where.aktif = aktif === 'true'
    }

    if (search) {
      where.OR = [
        { ad: { contains: search, mode: 'insensitive' } },
        { soyad: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tc_kimlik_no: { contains: search } },
      ]
    }

    // Get total count
    const total = await prisma.personel.count({ where })

    // Get paginated data
    const personeller = await prisma.personel.findMany({
      where,
      include: {
        rol: true,
        birim: true,
        yonetici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
      },
      orderBy: [{ soyad: 'asc' }, { ad: 'asc' }],
      skip,
      take: limit,
    })

    // Remove passwords
    const safePersoneller = personeller.map((p) => {
      const { password: _password, ...rest } = p
      return rest
    })

    return NextResponse.json({
      success: true,
      data: safePersoneller,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Personel listesi hatası:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

/**
 * POST /api/personel
 * Create new personel
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Yetki kontrolü
    if (!(await hasPermission('personel.ekle'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Veri temizleme: Boş stringleri temizle veya null yap
    const cleanedBody = { ...body };
    Object.keys(cleanedBody).forEach(key => {
      if (cleanedBody[key] === '' && key !== 'password') {
        delete cleanedBody[key];
      }
    });

    // Eğer şifre boşsa tamamen sil (Zod optional olduğu için sorun çıkarmaz)
    if (cleanedBody.password === '') {
      delete cleanedBody.password;
    }

    // Validation
    const validatedData = personelSchema.parse(cleanedBody)

    // TC Kimlik kontrolü
    const mevcutTC = await prisma.personel.findUnique({
      where: { tc_kimlik_no: validatedData.tc_kimlik_no },
    })
    if (mevcutTC) {
      return NextResponse.json(
        { error: 'Bu TC Kimlik No zaten kayıtlı' },
        { status: 400 }
      )
    }

    // Email kontrolü
    const mevcutEmail = await prisma.personel.findUnique({
      where: { email: validatedData.email },
    })
    if (mevcutEmail) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const password = validatedData.password || `temp${Date.now()}`
    const hashedPassword = await bcrypt.hash(password, 10)

    // Personel oluştur
    const yeniPersonel = await prisma.personel.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        dogum_tarihi: validatedData.dogum_tarihi
          ? new Date(validatedData.dogum_tarihi)
          : null,
        ise_baslama_tarihi: validatedData.ise_baslama_tarihi
          ? new Date(validatedData.ise_baslama_tarihi)
          : null,
        created_by_id: user.id,
      },
      include: {
        rol: true,
        birim: true,
      },
    })

    // Aktivite logla
    await logAktivite({
      personel_id: user.id,
      personel_email: user.email,
      islem: 'personel.ekle',
      tablo: 'personel',
      kayit_id: yeniPersonel.id,
      aciklama: `Yeni personel eklendi: ${yeniPersonel.ad} ${yeniPersonel.soyad}`,
    })

    // Şifreyi çıkar
    const { password: _, ...safePersonel } = yeniPersonel

    return NextResponse.json(
      {
        success: true,
        message: 'Personel başarıyla eklendi',
        data: safePersonel,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => {
        return `${err.path.join('.')}: ${err.message}`;
      }).join(', ');

      return NextResponse.json(
        { error: `Doğrulama Hatası: ${messages}`, details: error.errors },
        { status: 400 }
      )
    }

    console.error('Personel ekleme hatası:', error)
    const err = error as Error;
    return NextResponse.json({ error: 'Sistem Hatası: ' + err.message }, { status: 500 })
  }
}
