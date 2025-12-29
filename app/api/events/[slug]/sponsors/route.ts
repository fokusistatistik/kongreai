import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Fetch sponsors from n8n webhook
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.fokusistatistik.com';

    const webhookResponse = await fetch(`${webhookUrl}/webhook-test/event-sponsors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.WEBHOOK_API_KEY && {
          'X-Webhook-Key': process.env.WEBHOOK_API_KEY,
        }),
      },
      body: JSON.stringify({
        metadata: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          source: 'sponsors-fetch',
          environment: process.env.NODE_ENV || 'development',
        },
        event: {
          eventSlug: params.slug,
        },
      }),
    });

    if (!webhookResponse.ok) {
      console.warn('Webhook sponsors fetch failed:', await webhookResponse.text());
      return NextResponse.json({ success: true, sponsors: [] });
    }

    const webhookData = await webhookResponse.json();

    return NextResponse.json({
      success: true,
      sponsors: webhookData.data?.sponsors || [],
    });
  } catch (error: any) {
    console.error('Sponsors fetch error:', error);
    return NextResponse.json({
      success: true,
      sponsors: [],
    });
  }
}
