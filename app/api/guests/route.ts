import { NextResponse } from 'next/server';
import { getGuests, addGuest } from '@/lib/db';
import { normalizePhoneNumber } from '@/lib/whatsapp';

export async function GET() {
  try {
    const guests = await getGuests();
    return NextResponse.json(guests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        if (!item.name) continue;
        const normalizedPhone = item.phone ? normalizePhoneNumber(String(item.phone)) : '';
        const guest = await addGuest({
          name: item.name,
          phone: normalizedPhone,
          email: item.email || '',
          side: item.side || null,
          category_id: item.category_id || null,
          notes: item.notes || ''
        });
        results.push(guest);
      }
      return NextResponse.json(results);
    } else {
      if (!body.name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      const normalizedPhone = body.phone ? normalizePhoneNumber(String(body.phone)) : '';
      const guest = await addGuest({
        name: body.name,
        phone: normalizedPhone,
        email: body.email || '',
        side: body.side || null,
        category_id: body.category_id || null,
        notes: body.notes || ''
      });
      return NextResponse.json(guest);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
