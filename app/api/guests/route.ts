import { NextResponse } from 'next/server';
import { getGuests, addGuest, clearAllGuests } from '@/lib/db';
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
          relationship: item.relationship || 'friend',
          notes: item.notes || '',
          plus_one: item.plus_one
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
        relationship: body.relationship || 'friend',
        notes: body.notes || '',
        plus_one: body.plus_one
      });
      return NextResponse.json(guest);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAllGuests();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
