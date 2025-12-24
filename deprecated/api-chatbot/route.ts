import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Session kontrolü
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { message, userId, userName, userEmail, userRole, userRoleCode, userUnit, permissions } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mesaj boş olamaz' },
        { status: 400 }
      );
    }

    // n8n webhook'a gönder
    const webhookUrl = process.env.CHATBOT_WEBHOOK_URL || 'https://n8n.fokusistatistik.com/webhook/saha-chatbot';

    const webhookPayload = {
      message: message.trim(),
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        roleCode: userRoleCode,
        unit: userUnit,
        permissions: permissions || [],
        authenticated: !!session
      },
      system: {
        name: 'SAHA',
        version: '1.0.0-beta',
        environment: process.env.NODE_ENV || 'development'
      },
      timestamp: new Date().toISOString()
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-System': 'SAHA',
        'X-User-ID': userId
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      throw new Error('Webhook yanıt vermedi');
    }

    const webhookData = await webhookResponse.json();

    return NextResponse.json({
      success: true,
      reply: webhookData.reply || webhookData.message || 'Yanıt alınamadı'
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Bir hata oluştu',
        reply: 'Üzgünüm, şu anda size yardımcı olamıyorum. Lütfen daha sonra tekrar deneyin.'
      },
      { status: 500 }
    );
  }
}
