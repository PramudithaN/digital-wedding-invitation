import { NextResponse } from 'next/server';
import { getWhatsAppStatus } from '@/lib/whatsapp-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session') || 'bride';
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
    if (gatewayUrl) {
      const res = await fetch(`${gatewayUrl}/status?session=${session}`, { cache: 'no-store' });
      const data = await res.json();
      return NextResponse.json(data);
    }

    const status = getWhatsAppStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
