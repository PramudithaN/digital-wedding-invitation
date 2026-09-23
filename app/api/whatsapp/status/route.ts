import { NextResponse } from 'next/server';
import { getWhatsAppStatus } from '@/lib/whatsapp-manager';
import { checkIsAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAuthenticated = await checkIsAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
