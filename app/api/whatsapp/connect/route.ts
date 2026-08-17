import { NextResponse } from 'next/server';
import { initializeWhatsApp, disconnectWhatsApp } from '@/lib/whatsapp-manager';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
    if (gatewayUrl) {
      const res = await fetch(`${gatewayUrl}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === 'disconnect') {
      await disconnectWhatsApp();
      return NextResponse.json({ success: true, message: 'Disconnected' });
    }

    initializeWhatsApp();
    return NextResponse.json({ success: true, message: 'Initialization started' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
    if (gatewayUrl) {
      const res = await fetch(`${gatewayUrl}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' })
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    await disconnectWhatsApp();
    return NextResponse.json({ success: true, message: 'Disconnected' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
