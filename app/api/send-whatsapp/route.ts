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
    const { guestId, guestIds, method } = body; // method: 'manual' | 'twilio'

    if ((!guestId && !guestIds) || !method) {
      return NextResponse.json({ error: 'Guest ID(s) and sending method are required' }, { status: 400 });
    }

    const ids = guestIds ? guestIds : [guestId];
    const results = [];
    const weddingDetails = await getWeddingDetails();
    const baseUrl = getRequestBaseUrl(request);

    for (const id of ids) {
      const guest = await getGuest(id);
      if (!guest) {
        results.push({ id, success: false, error: 'Guest not found' });
        continue;
      }

      if (!guest.phone) {
        results.push({ id, success: false, error: 'Guest does not have a phone number configured' });
        continue;
      }

      if (method === 'twilio') {
        const response = await sendWhatsAppInviteViaTwilio(guest.phone, guest.name, guest.invite_token, weddingDetails, baseUrl);
        if (response.success) {
          await logInviteSent(guest.id, 'whatsapp');
          results.push({ id, success: true, sid: response.sid });
        } else {
          results.push({ id, success: false, error: response.error || 'Failed to send via Twilio' });
        }
      } else {
        // Manual wa.me link
        const link = buildWhatsAppLink(guest.phone, guest.name, guest.invite_token, weddingDetails, baseUrl);
        await logInviteSent(guest.id, 'whatsapp');
        results.push({ id, success: true, url: link });
      }
    }

    if (guestIds) {
      return NextResponse.json({ success: true, results });
    } else {
      const res = results[0];
      if (res.success) {
        return NextResponse.json({ success: true, url: res.url, sid: res.sid });
      } else {
        return NextResponse.json({ error: res.error }, { status: 500 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

