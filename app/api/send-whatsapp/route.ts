import { NextResponse } from 'next/server';
import { getGuest, logInviteSent, getWeddingDetails } from '@/lib/db';
import { buildWhatsAppLink, sendWhatsAppInviteViaTwilio } from '@/lib/whatsapp';

function getRequestBaseUrl(request: Request): string | undefined {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');
  if (!host) {
    return undefined;
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const proto = forwardedProto || (host.includes('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestId, method } = body; // method: 'manual' | 'twilio'

    if (!guestId || !method) {
      return NextResponse.json({ error: 'Guest ID and sending method are required' }, { status: 400 });
    }

    const guest = await getGuest(guestId);
    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    if (!guest.phone) {
      return NextResponse.json({ error: 'Guest does not have a phone number configured' }, { status: 400 });
    }

    const weddingDetails = await getWeddingDetails();
    const baseUrl = getRequestBaseUrl(request);

    if (method === 'twilio') {
      const response = await sendWhatsAppInviteViaTwilio(guest.phone, guest.name, guest.invite_token, weddingDetails, baseUrl);
      if (response.success) {
        await logInviteSent(guest.id, 'whatsapp');
        return NextResponse.json({ success: true, sid: response.sid });
      } else {
        return NextResponse.json({ error: response.error || 'Failed to send via Twilio' }, { status: 500 });
      }
    } else {
      // Manual wa.me link
      const link = buildWhatsAppLink(guest.phone, guest.name, guest.invite_token, weddingDetails, baseUrl);
      await logInviteSent(guest.id, 'whatsapp');
      return NextResponse.json({ success: true, url: link });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

