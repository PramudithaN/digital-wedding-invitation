import { NextResponse } from 'next/server';
import { startBulkSend } from '@/lib/whatsapp-manager';
import { getGuests, getWeddingDetails } from '@/lib/db';
import { DEFAULT_WHATSAPP_TEMPLATE } from '@/lib/constants';

function getRequestBaseUrl(request: Request): string | undefined {
  if (process.env.NEXT_PUBLIC_HOSTED_URL) {
    return process.env.NEXT_PUBLIC_HOSTED_URL;
  }
  const host = request.headers.get('host');
  if (!host) return undefined;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { filter, session } = body; // 'pending' | 'all', 'bride' | 'groom'

    if (!filter || (filter !== 'pending' && filter !== 'all')) {
      return NextResponse.json({ error: 'Invalid filter option. Must be pending or all.' }, { status: 400 });
    }

    const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;
    if (gatewayUrl) {
      // Fetch data and build payload
      const guests = await getGuests();
      const weddingDetails = await getWeddingDetails();
      
      const targets = guests.filter(g => {
        if (!g.phone) return false;
        if (session) {
          if (session === 'bride') {
            if (g.side !== 'bride' || g.relationship === 'relative') return false;
          } else if (session === 'groom') {
            if (g.side !== 'groom' || g.relationship === 'relative') return false;
          } else if (session === 'bride_relative') {
            if (g.side !== 'bride' || g.relationship !== 'relative') return false;
          } else if (session === 'groom_relative') {
            if (g.side !== 'groom' || g.relationship !== 'relative') return false;
          } else if (session === 'groom_mother') {
            if (g.side !== 'groom_mother') return false;
          } else if (session === 'groom_father') {
            if (g.side !== 'groom_father') return false;
          }
        }
        if (filter === 'pending') {
          return !g.rsvp?.status || g.rsvp.status === 'pending';
        }
        return true;
      });

      const baseUrl = getRequestBaseUrl(request) || 'https://digital-wedding-invitation-beige.vercel.app';
      const payload = targets.map(g => {
        let phoneClean = g.phone.replace(/[^\d]/g, '');
        if (phoneClean.startsWith('0')) {
          phoneClean = '94' + phoneClean.slice(1);
        }
        const whatsappId = `${phoneClean}@c.us`;
        const inviteUrl = `${baseUrl}/invite/${g.invite_token}`;
        
        const message = DEFAULT_WHATSAPP_TEMPLATE
          .replace('{name}', g.name)
          .replace('{bride}', weddingDetails.bride_name)
          .replace('{groom}', weddingDetails.groom_name)
          .replace('{date}', weddingDetails.date)
          .replace('{venue}', weddingDetails.venue)
          .replace('{city}', weddingDetails.city)
          .replace('{url}', inviteUrl);

        return {
          guestId: g.id,
          phone: whatsappId,
          message
        };
      });

      // Send payload to gateway
      const res = await fetch(`${gatewayUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: payload, session })
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Trigger in the background locally
    startBulkSend(filter);

    return NextResponse.json({ success: true, message: 'Bulk sending started' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
