import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, hasPermission } from '@/lib/auth/permissions'

const N8N_WEBHOOK_BASE = process.env.NEXT_PUBLIC_WEBHOOK_BASE_URL
const N8N_API_KEY = process.env.WEBHOOK_API_KEY

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('gorev.olustur'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const webhookData = {
      ...body,
      olusturan_personel_id: user.id,
      olusturan_ad_soyad: `${user.ad} ${user.soyad}`,
      olusturan_email: user.email,
      olusturan_birim_id: user.birim_id,
      olusturan_rol: user.rol.kod,
      islem_zamani: new Date().toISOString()
    }

    const response = await fetch(`${N8N_WEBHOOK_BASE}/gorev-olustur`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': N8N_API_KEY || '',
      },
      body: JSON.stringify(webhookData)
    })

    const result = await response.json()
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !(await hasPermission('gorev.goruntule'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const response = await fetch(
      `${N8N_WEBHOOK_BASE}/gorev-listele?${searchParams.toString()}`,
      {
        headers: {
          'X-API-Key': N8N_API_KEY || '',
          'X-User-Id': user.id,
          'X-User-Role': user.rol.kod,
        }
      }
    )

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
