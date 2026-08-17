import { NextResponse } from 'next/server';
import { getWhatsAppStatus } from '@/lib/whatsapp-manager';

export async function GET() {
  try {
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
    if (gatewayUrl) {
      const res = await fetch(`${gatewayUrl}/status`, { cache: 'no-store' });
      const data = await res.json();
      return NextResponse.json(data);
    }

    const status = getWhatsAppStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
